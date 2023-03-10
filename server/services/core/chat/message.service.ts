import moment from 'moment';
import { Types } from 'mongoose';
import type {
  MessageDocument,
  MessageModel,
} from '../../../models/chat/message';
import {
  TcService,
  TcDbService,
  GroupBaseInfo,
  TcContext,
  DataNotFoundError,
  NoPermissionError,
} from 'tailchat-server-sdk';
import type { Group } from '../../../models/group/group';
import { isValidStr } from '../../../lib/utils';

interface MessageService
  extends TcService,
    TcDbService<MessageDocument, MessageModel> {}
class MessageService extends TcService {
  get serviceName(): string {
    return 'chat.message';
  }

  onInit(): void {
    this.registerLocalDb(require('../../../models/chat/message').default);

    this.registerAction('fetchConverseMessage', this.fetchConverseMessage, {
      params: {
        converseId: 'string',
        startId: { type: 'string', optional: true },
      },
    });
    this.registerAction('fetchNearbyMessage', this.fetchNearbyMessage, {
      params: {
        converseId: 'string',
        messageId: 'string',
        num: { type: 'number', optional: true },
      },
    });
    this.registerAction('sendMessage', this.sendMessage, {
      params: {
        converseId: 'string',
        groupId: [{ type: 'string', optional: true }],
        content: 'string',
        meta: { type: 'any', optional: true },
      },
    });
    this.registerAction('recallMessage', this.recallMessage, {
      params: {
        messageId: 'string',
      },
    });
    this.registerAction('deleteMessage', this.deleteMessage, {
      params: {
        messageId: 'string',
      },
    });
    this.registerAction(
      'fetchConverseLastMessages',
      this.fetchConverseLastMessages,
      {
        params: {
          converseIds: 'array',
        },
      }
    );
    this.registerAction('addReaction', this.addReaction, {
      params: {
        messageId: 'string',
        emoji: 'string',
      },
    });
    this.registerAction('removeReaction', this.removeReaction, {
      params: {
        messageId: 'string',
        emoji: 'string',
      },
    });
  }

  /**
   * ??????????????????
   */
  async fetchConverseMessage(
    ctx: TcContext<{
      converseId: string;
      startId?: string;
    }>
  ) {
    const { converseId, startId } = ctx.params;
    const docs = await this.adapter.model.fetchConverseMessage(
      converseId,
      startId ?? null
    );

    return this.transformDocuments(ctx, {}, docs);
  }

  /**
   * ?????????????????????????????????
   * ???????????????
   *
   * ????????????converseId???????????????????????????
   */
  async fetchNearbyMessage(
    ctx: TcContext<{
      converseId: string;
      messageId: string;
      num?: number;
    }>
  ) {
    const { converseId, messageId, num = 5 } = ctx.params;
    const { t } = ctx.meta;
    const message = await this.adapter.model
      .findOne({
        _id: new Types.ObjectId(messageId),
        converseId: new Types.ObjectId(converseId),
      })
      .limit(1)
      .exec();

    if (!message) {
      return new DataNotFoundError(t('??????????????????'));
    }

    const [prev, next] = await Promise.all([
      this.adapter.model
        .find({
          _id: {
            $lt: new Types.ObjectId(messageId),
          },
          converseId: new Types.ObjectId(converseId),
        })
        .limit(num)
        .exec(),
      this.adapter.model
        .find({
          _id: {
            $gt: new Types.ObjectId(messageId),
          },
          converseId: new Types.ObjectId(converseId),
        })
        .limit(num)
        .exec(),
    ]);

    return this.transformDocuments(ctx, {}, [...prev, message, ...next]);
  }

  /**
   * ??????????????????
   */
  async sendMessage(
    ctx: TcContext<{
      converseId: string;
      groupId?: string;
      content: string;
      meta?: object;
    }>
  ) {
    const { converseId, groupId, content, meta } = ctx.params;
    const userId = ctx.meta.userId;
    const t = ctx.meta.t;

    /**
     * ??????
     */
    if (isValidStr(groupId)) {
      // ???????????????
      const groupInfo: Group = await ctx.call('group.getGroupInfo', {
        groupId,
      });
      const member = groupInfo.members.find((m) => String(m.userId) === userId);
      if (member) {
        // ????????????????????????????????????????????????????????????????????????

        if (new Date(member.muteUntil).valueOf() > new Date().valueOf()) {
          throw new Error(t('????????????????????????????????????'));
        }
      }
    }

    const message = await this.adapter.insert({
      converseId: new Types.ObjectId(converseId),
      groupId:
        typeof groupId === 'string' ? new Types.ObjectId(groupId) : undefined,
      author: new Types.ObjectId(userId),
      content,
      meta,
    });

    const json = await this.transformDocuments(ctx, {}, message);

    this.roomcastNotify(ctx, converseId, 'add', json);

    ctx.emit('chat.message.updateMessage', {
      type: 'add',
      groupId: String(groupId),
      converseId: String(converseId),
      messageId: String(message._id),
      content,
      meta: meta ?? {},
    });

    return json;
  }

  /**
   * ????????????
   */
  async recallMessage(ctx: TcContext<{ messageId: string }>) {
    const { messageId } = ctx.params;
    const { t, userId } = ctx.meta;

    const message = await this.adapter.model.findById(messageId);
    if (!message) {
      throw new DataNotFoundError(t('??????????????????'));
    }

    if (message.hasRecall === true) {
      throw new Error(t('?????????????????????'));
    }

    // ??????????????????
    if (
      moment().valueOf() - moment(message.createdAt).valueOf() >
      15 * 60 * 1000
    ) {
      throw new Error(t('???????????? {{minutes}} ??????????????????', { minutes: 15 }));
    }

    let allowToRecall = false;

    //#region ??????????????????
    const groupId = message.groupId;
    if (groupId) {
      // ?????????????????????
      const group: GroupBaseInfo = await ctx.call('group.getGroupBasicInfo', {
        groupId: String(groupId),
      });
      if (String(group.owner) === userId) {
        allowToRecall = true; // ???????????? ????????????
      }
    }

    if (String(message.author) === String(userId)) {
      // ???????????????????????????
      allowToRecall = true;
    }

    if (allowToRecall === false) {
      throw new NoPermissionError(t('????????????, ????????????'));
    }
    //#endregion

    const converseId = String(message.converseId);
    message.hasRecall = true;
    await message.save();

    const json = await this.transformDocuments(ctx, {}, message);

    this.roomcastNotify(ctx, converseId, 'update', json);
    ctx.emit('chat.message.updateMessage', {
      type: 'recall',
      groupId: String(groupId),
      converseId: String(converseId),
      messageId: String(message._id),
      meta: message.meta ?? {},
    });

    return json;
  }

  /**
   * ????????????
   * ???????????????
   */
  async deleteMessage(ctx: TcContext<{ messageId: string }>) {
    const { messageId } = ctx.params;
    const { t, userId } = ctx.meta;

    const message = await this.adapter.model.findById(messageId);
    if (!message) {
      throw new DataNotFoundError(t('??????????????????'));
    }

    const groupId = message.groupId;
    if (!groupId) {
      throw new Error(t('????????????????????????'));
    }

    const group: GroupBaseInfo = await ctx.call('group.getGroupBasicInfo', {
      groupId: String(groupId),
    });
    if (String(group.owner) !== userId) {
      throw new NoPermissionError(t('??????????????????')); // ????????????????????????
    }

    const converseId = String(message.converseId);
    await this.adapter.removeById(messageId); // TODO: ??????????????????????????????

    this.roomcastNotify(ctx, converseId, 'delete', { converseId, messageId });
    ctx.emit('chat.message.updateMessage', {
      type: 'delete',
      groupId: String(groupId),
      converseId: String(converseId),
      messageId: String(message._id),
      meta: message.meta ?? {},
    });

    return true;
  }

  /**
   * ????????????id?????????????????????????????????id
   */
  async fetchConverseLastMessages(ctx: TcContext<{ converseIds: string[] }>) {
    const { converseIds } = ctx.params;

    // ??????????????????????????????????????????limit=1?????????????????????????????????
    const list = await Promise.all(
      converseIds.map((id) => {
        return this.adapter.model
          .findOne(
            {
              converseId: new Types.ObjectId(id),
            },
            {
              _id: 1,
              converseId: 1,
            }
          )
          .sort({
            _id: -1,
          })
          .limit(1)
          .exec();
      })
    );

    return list.filter(Boolean).map((item) => ({
      converseId: String(item.converseId),
      lastMessageId: String(item._id),
    }));
  }

  async addReaction(
    ctx: TcContext<{
      messageId: string;
      emoji: string;
    }>
  ) {
    const { messageId, emoji } = ctx.params;
    const userId = ctx.meta.userId;

    const message = await this.adapter.model.findById(messageId);

    const appendReaction = {
      name: emoji,
      author: new Types.ObjectId(userId),
    };

    await this.adapter.model.updateOne(
      {
        _id: messageId,
      },
      {
        $push: {
          reactions: {
            ...appendReaction,
          },
        },
      }
    );

    const converseId = String(message.converseId);
    this.roomcastNotify(ctx, converseId, 'addReaction', {
      converseId,
      messageId,
      reaction: {
        ...appendReaction,
      },
    });

    return true;
  }

  async removeReaction(
    ctx: TcContext<{
      messageId: string;
      emoji: string;
    }>
  ) {
    const { messageId, emoji } = ctx.params;
    const userId = ctx.meta.userId;

    const message = await this.adapter.model.findById(messageId);

    const removedReaction = {
      name: emoji,
      author: new Types.ObjectId(userId),
    };

    await this.adapter.model.updateOne(
      {
        _id: messageId,
      },
      {
        $pull: {
          reactions: {
            ...removedReaction,
          },
        },
      }
    );

    const converseId = String(message.converseId);
    this.roomcastNotify(ctx, converseId, 'removeReaction', {
      converseId,
      messageId,
      reaction: {
        ...removedReaction,
      },
    });

    return true;
  }
}

export default MessageService;
