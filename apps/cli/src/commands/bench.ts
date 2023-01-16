import { CommandModule } from 'yargs';
import { TcBroker } from 'tailchat-server-sdk';
import defaultBrokerConfig from 'tailchat-server-sdk/dist/runner/moleculer.config';
import { config } from 'dotenv';
import _ from 'lodash';
import os from 'os';
import pAll from 'p-all';
import pSeries from 'p-series';
import ora from 'ora';
import prettyMs from 'pretty-ms';

export const benchCommand: CommandModule = {
  command: 'bench',
  describe: '压力测试',
  builder: (yargs) =>
    yargs
      .command(
        'message',
        '通过内网请求进行压力测试(适用于纯业务测试)',
        (yargs) =>
          yargs
            .positional('groupId', {
              describe: '群组ID',
              demandOption: true,
              type: 'string',
            })
            .positional('converseId', {
              describe: '会话ID',
              demandOption: true,
              type: 'string',
            })
            .positional('userId', {
              describe: '用户ID',
              demandOption: true,
              type: 'string',
            })
            .positional('num', {
              describe: '测试次数',
              type: 'number',
              default: 100,
            })
            .positional('parallel', {
              describe: '是否并发',
              type: 'boolean',
              default: false,
            }),

        async (args) => {
          config();

          const broker = new TcBroker({
            ...defaultBrokerConfig,
            transporter: process.env.TRANSPORTER,
            logger: false,
          });
          await broker.start();

          printSystemInfo();

          console.log('===============');

          await startBenchmark<number>({
            parallel: args.parallel,
            number: args.num,
            task: async (i) => {
              const start = process.hrtime();
              await broker.call(
                'chat.message.sendMessage',
                {
                  converseId: args.converseId,
                  groupId: args.groupId,
                  content: `benchmessage ${i + 1}`,
                },
                {
                  meta: {
                    userId: args.userId,
                  },
                }
              );
              const usage = calcUsage(start);

              return usage;
            },
            onCompleted: (res) => {
              console.log(`测试数量: \t${res.length}`);
              console.log(`最大用时: \t${prettyMs(Math.max(...res))}`);
              console.log(`最小用时: \t${prettyMs(Math.min(...res))}`);
              console.log(`平均用时: \t${prettyMs(_.mean(res))}`);
            },
          });

          await broker.stop();
        }
      )
      .demandCommand(),
  handler() {},
};

/**
 * 打印系统信息
 */
function printSystemInfo() {
  console.log(`主机: \t${os.hostname()}`);
  console.log(`系统: \t${os.type()} - ${os.release()}`);
  console.log(`架构: \t${os.arch()} - ${os.version()}`);
  console.log(`CPU: \t${os.cpus().length}`);
  console.log(`内存: \t${os.totalmem()}`);
}

function calcUsage(startTime: [number, number]) {
  const diff = process.hrtime(startTime);
  const usage = (diff[0] + diff[1] / 1e9) * 1000;

  return usage;
}

interface BenchmarkOptions<T> {
  parallel: boolean; // 是否并发
  parallelLimit?: number; // 并发上限, 默认不限制(Infinity)
  task: (index: number) => Promise<T>;
  number?: number;
  onCompleted: (res: T[]) => void;
}
/**
 * 开始一次基准测试
 */
async function startBenchmark<T>(options: BenchmarkOptions<T>) {
  const {
    parallel,
    parallelLimit = Infinity,
    task,
    number = 100,
    onCompleted,
  } = options;

  const spinner = ora();

  spinner.info(
    `测试方式: ${parallel ? `并行, 上限 ${parallelLimit}` : `串行`}`
  );
  spinner.info(`执行任务数: ${number}`);
  spinner.start('正在执行基准测试...');
  try {
    const startTime = process.hrtime();
    let res: T[] = [];
    if (parallel) {
      res = await pAll<T>(
        [...Array.from({ length: number }).map((_, i) => () => task(i))],
        {
          concurrency: parallelLimit,
        }
      );
    } else {
      res = await pSeries<T>([
        ...Array.from({ length: number }).map((_, i) => () => task(i)),
      ]);
    }

    spinner.succeed(`基准测试完毕, 用时 ${prettyMs(calcUsage(startTime))}`);

    onCompleted(res);
  } catch (err) {
    console.error(err);
    spinner.fail(`基准测试出现问题`).stop();
  }
}
