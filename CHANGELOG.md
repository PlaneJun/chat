

# [1.4.0](https://github.com/msgbyte/tailchat/compare/v1.3.1...v1.4.0) (2023-01-07)


### Bug Fixes

* 为setLastMessageMap增加数组类型校验 ([f622d6a](https://github.com/msgbyte/tailchat/commit/f622d6a37b9a3f87b26f5903504a73bc39d031d4))
* 修复挂断通话后仍然会显示正在使用摄像头/麦克风小红点的bug ([98af149](https://github.com/msgbyte/tailchat/commit/98af14969a7ff9f826e1bf015b5d88688eb81576))
* 修复迁移(升级)gateway api导致的静态文件服务返回错误的bug ([066eb96](https://github.com/msgbyte/tailchat/commit/066eb963694ea18a70b8af99e99b46076e7f8687))
* 修复声网控制器逻辑操作写反的问题 ([b515623](https://github.com/msgbyte/tailchat/commit/b515623cbfd48d3944904ac220764b8c69dd6fb7))
* 修复推送在mac os 13 以下 safari 不支持registration.showNotification的问题 ([960f6e6](https://github.com/msgbyte/tailchat/commit/960f6e6c23081585a1698f28176bd5fc3482e7f8))
* 修复消息会话点击后会卡死的问题 ([345e315](https://github.com/msgbyte/tailchat/commit/345e31553a34e18dca9b66badb60d28c44b597a5))
* 修复新加入成员不会更新群组列表的bug ([df3da7e](https://github.com/msgbyte/tailchat/commit/df3da7edba9a7949b84017c050470aa682a1369c))
* 修复在某些场景下计算高度会少1px导致无法 ([7644924](https://github.com/msgbyte/tailchat/commit/7644924ae93d2e1d4e4b4057ed56308f60840994))
* 修复在某些时候跳转引用过时导致无法跳转的bug ([5c230ca](https://github.com/msgbyte/tailchat/commit/5c230caef33378c4c0a896d2b55204a03cf74e84))
* 修复agora插件展开 收起的热区异常并顺便增加了分割线以优化显示 ([35e557f](https://github.com/msgbyte/tailchat/commit/35e557f2869725f8b2ef41af2791bb3c12ea1af1))
* 修复t参数如果是带参数的调用的话无法覆盖语言的bug ([eb3b5f9](https://github.com/msgbyte/tailchat/commit/eb3b5f9c00cdef22b02d5d724f02b566d61306d6))
* 修复workbox匹配规则问题 ([5624b92](https://github.com/msgbyte/tailchat/commit/5624b92933ada7425301c847202bf70d5431989a))
* 增加前置的beforeinstallprompt以修复加载过晚无法监听到pwa安装事件的问题 ([94fcbb7](https://github.com/msgbyte/tailchat/commit/94fcbb7445e92a0e2ea29c66e0746b18bbd0ed6d))
* resolve Promise.allSettled compatibility in android version(which 4.4 kernel) ([e4ff18a](https://github.com/msgbyte/tailchat/commit/e4ff18aebeeb76d9f5801bf43948bf07dce92160))
* **server:** 修复不恰当时机的logger调用 ([dd358ac](https://github.com/msgbyte/tailchat/commit/dd358ac79ba339e710ed2ebcd8e4048907494c9f))


### Features

* 服务端插件增加打包静态资源的支持,并为声网插件增加icon ([0cf8bdb](https://github.com/msgbyte/tailchat/commit/0cf8bdb4fba29c50d4e979d5baa26a95f5d2f13a))
* 获取指定消息附近的消息 ([8e4908f](https://github.com/msgbyte/tailchat/commit/8e4908fcedd61c2b5539b602a2f7a5a25de34afc))
* 接口加白与联通性校验特殊处理 ([f8a73d1](https://github.com/msgbyte/tailchat/commit/f8a73d1a7761525b69779fbb618c332d5c10ab76))
* 默认无背景色导致穿透的问题 ([504060e](https://github.com/msgbyte/tailchat/commit/504060e0167f2a9ab4d8418fcf4924ef85b4bb40))
* 声网插件 正在发言指示器 ([076c907](https://github.com/msgbyte/tailchat/commit/076c907a05de6a84e123bcb0728d98a2bfdb817e))
* 声网插件网络质量检测与双流功能与头像 ([141db8f](https://github.com/msgbyte/tailchat/commit/141db8f1cffc1f06425ecacf9e7519c71f2d399d))
* 声网插件增加国际化支持 ([b7feabb](https://github.com/msgbyte/tailchat/commit/b7feabbbd38d6504bba7fcd28b7a8cc3ceb93c41))
* 声网插件增加ahooks并优化初始化逻辑 ([928f1a2](https://github.com/msgbyte/tailchat/commit/928f1a25b212e382beee948792b8a0381625a358))
* 声网插件自由控制媒体流推送 ([356e7ed](https://github.com/msgbyte/tailchat/commit/356e7edd58a017ad7be787b79ecc54b26b2b9782))
* 声网插件webhhok处理与消息通知方式 ([bd3f2e1](https://github.com/msgbyte/tailchat/commit/bd3f2e129c389e40271b3d9ead10f278d5275aff))
* 声网服务增加查询频道状态的接口 ([f444fb5](https://github.com/msgbyte/tailchat/commit/f444fb51435e47e9a9421af295ab6c5255db297e))
* 声网鉴权函数完成 ([1e67c62](https://github.com/msgbyte/tailchat/commit/1e67c62626a4393281a83565dcbe812fe40da0f5))
* 使用邀请码加入群组提示增加邀请码创建人，并增加国际化翻译 ([0cb2a82](https://github.com/msgbyte/tailchat/commit/0cb2a8200f11eb33f4e6467d2cc29764423fc514))
* 输入框addon增加打开动画，并移除表情面板的内边距 ([c6ac1a8](https://github.com/msgbyte/tailchat/commit/c6ac1a800de63b9ff37a5b0053c6c71ca00e4eca))
* 提及tag增加用户名fallback ([5c07367](https://github.com/msgbyte/tailchat/commit/5c0736732fa44a7286158d5a5cdfb5ae62be046c))
* 为每个action增加了一个after hook回调 ([13134ce](https://github.com/msgbyte/tailchat/commit/13134ce4e3914b94da410a62e6f9c33a6e0591c1))
* 文件传输插件增加文叔叔与filesend ([d9acf3b](https://github.com/msgbyte/tailchat/commit/d9acf3b679db58063fe60b8e09d882ae4eca2490))
* 引导插件增加国际化支持 ([0ee2855](https://github.com/msgbyte/tailchat/commit/0ee28554c2dd03f603cf18562add43a9a9b51f2e))
* 优化pluginUserExtraInfo渲染方式，增加自定义渲染组件自定义范围 ([bc8abe5](https://github.com/msgbyte/tailchat/commit/bc8abe54b7a1051d6b9e4ab5ebc629b6e065d776))
* 优化reaction用户名显示，显示前两个用户名以强化reaction信息量 ([3f76b9e](https://github.com/msgbyte/tailchat/commit/3f76b9ee1b940e907ef9401b1bd85daf5728aff7))
* 优化workbox匹配规则，增加对跨域资源的sw管理 ([1f04b0c](https://github.com/msgbyte/tailchat/commit/1f04b0c47ca5e1427afe04074b439fd67c4d96e3))
* 增加安装应用按钮 ([dcbc148](https://github.com/msgbyte/tailchat/commit/dcbc148eebbb7956cb690801d3a6581e13224aa7))
* 增加服务端与agora后台的数据通信处理 ([f9e53d2](https://github.com/msgbyte/tailchat/commit/f9e53d205e8f5b1997b634b97a4c9e6b1e006372))
* 增加加载到主组件时上报加载耗时 ([8b80824](https://github.com/msgbyte/tailchat/commit/8b808242df95a805411f44a27ffdaa20190613b5))
* 增加了声网插件用户布局与基于用户维度的视图渲染 ([feab2c2](https://github.com/msgbyte/tailchat/commit/feab2c240c510ad95b0ef2b4208bc865858d14db))
* 增加聊天列表滚动到底部按钮 ([7f1b475](https://github.com/msgbyte/tailchat/commit/7f1b475f69352f349503676e13bdf82ec3f37c79))
* 增加群组配置权限，增加群组成员隐私控制选项 ([9b331e7](https://github.com/msgbyte/tailchat/commit/9b331e7707bc9ea9a8060e9a396190ea56e7ca6c))
* 增加删除群组角色的接口 ([49ca9ca](https://github.com/msgbyte/tailchat/commit/49ca9ca3aef0e61b1a2402adc945167fa2353ea9))
* 增加声网插件基本功能集成 ([63ee943](https://github.com/msgbyte/tailchat/commit/63ee943eecbb1fe834e4aea3efbd8c5eee9e128d))
* 增加移出群组的前端操作 ([070a762](https://github.com/msgbyte/tailchat/commit/070a762e4df78ee6e680eeb5d7add498753b7b65))
* 增加用户管理权限点 ([8e24571](https://github.com/msgbyte/tailchat/commit/8e24571462ed09ca3255802452cc4c136e5fa28d))
* 增加alpha模式，并将虚拟列表丢到alpha模式中 ([a202419](https://github.com/msgbyte/tailchat/commit/a20241966934d68f6242413b98889acc2bebfca4))
* 增加wormhole插件用于文件传输 ([f8765d1](https://github.com/msgbyte/tailchat/commit/f8765d18c1c0ba76eadcb6418de5a7f07f625641))
* add {BACKEND} support for user info avatar ([9fa420e](https://github.com/msgbyte/tailchat/commit/9fa420e79d272d4934d11716da7d3524bd150cfe))
* add w2a project ([67960ac](https://github.com/msgbyte/tailchat/commit/67960ac877101b193a13f2bc80ff81e4b832a1d3))
* markdown渲染的图片允许被放大预览 ([c15a1a7](https://github.com/msgbyte/tailchat/commit/c15a1a7dc7bbd79cd037067fb2f309bd73ad17d8))
* registerAuthWhitelist 强制增加插件名前缀 ([5638737](https://github.com/msgbyte/tailchat/commit/56387371ab4e40310a5915ca5d6ceee91d8ff1e9))
* sentry增加replay集成 ([eec05c7](https://github.com/msgbyte/tailchat/commit/eec05c708969ffaab780e0b3c1c82b5b57e25380))


### Performance Improvements

* 优化登录逻辑 ([e623aa3](https://github.com/msgbyte/tailchat/commit/e623aa312bdfc033dfb24c02d47442cb2f059cb0))
* 优化结构与导出方式 ([58dba49](https://github.com/msgbyte/tailchat/commit/58dba494a0450e09a104116e1c69a2281c908e74))
* 优化控制器的配色方案, 增强控制器状态辨识度 ([5f5b50f](https://github.com/msgbyte/tailchat/commit/5f5b50f86e15a92293368514728319b81f7dadf5))
* 优化在用户信息没有获取到前界面的表现 ([7ea7069](https://github.com/msgbyte/tailchat/commit/7ea706936e743d862b6fd0fd8df8683429042678))
* 优化fetchConverseLastMessages查询语句，防止数据量过大导致请求超时 ([91fe01f](https://github.com/msgbyte/tailchat/commit/91fe01f2476a94d30026749927aafcc9f524ea53))
* 优化notify插件代码 ([1f53781](https://github.com/msgbyte/tailchat/commit/1f537816c277ada199b2b5597f396acc4f5e7699))
* 优化tour插件的引导，增加箭头以增强显示 ([183b777](https://github.com/msgbyte/tailchat/commit/183b777c2b049003841e3dc87682366b580f6102))
* 增加预加载, 优化主要加载代码加载耗时 ([3cdcc0e](https://github.com/msgbyte/tailchat/commit/3cdcc0e9ecfd67144aba9b99507693b94034db13))
* add webpack-retry-chunk-load-plugin to fix chunk load failed error ([4dc9e0b](https://github.com/msgbyte/tailchat/commit/4dc9e0ba6c2685675364923c257e88ba81802016))
* sentry和posthog增加try...catch保护 ([1d924f1](https://github.com/msgbyte/tailchat/commit/1d924f1692b048b69aac0ad0a8cae0075a08acff))

## [1.3.1](https://github.com/msgbyte/tailchat/compare/v1.3.0...v1.3.1) (2022-12-18)


### Bug Fixes

* 修复Markdown 引用没有样式的bug ([4e21735](https://github.com/msgbyte/tailchat/commit/4e21735d7b11906808c9010a06c45bfe9179fc94))
* 修复markdown引用样式问题 ([1326b9d](https://github.com/msgbyte/tailchat/commit/1326b9dd055ee19719cc90bfc86ebc0e087b6079))
* 优化withKeepAliveOverlay的参数依赖管理，修复不强制渲染时无法取消挂载的情况 ([42e004c](https://github.com/msgbyte/tailchat/commit/42e004ce206afd98f4cba5c04d28f14fd630a2fa))

# [1.3.0](https://github.com/msgbyte/tailchat/compare/v1.2.0...v1.3.0) (2022-12-18)


### Bug Fixes

* 修复markdown组件 ul ol 样式缺失的问题 ([bcfd1db](https://github.com/msgbyte/tailchat/commit/bcfd1db90f56c029b8d438f4038392c3646a7d6f))


### Features

* 用户增加extra字段用于存储额外信息 ([b5cc18f](https://github.com/msgbyte/tailchat/commit/b5cc18fbe1dff57ecfd2c33f87c1ddad122908c5))
* 增加成员面板数量统计 ([cca3e26](https://github.com/msgbyte/tailchat/commit/cca3e2633a5691905cc2dcee1e08b8406c6fd1b0))
* 增加新组件 CopyableText ([6424199](https://github.com/msgbyte/tailchat/commit/6424199be2291133ef53d6d1823c476309eef190))
* 增加自定义用户信息 ([1ad880b](https://github.com/msgbyte/tailchat/commit/1ad880b9485526b80180f9565546ad24252658cd))
* 增加github项目可交互按钮并增加全局code样式 ([5e4ee9b](https://github.com/msgbyte/tailchat/commit/5e4ee9bd421902c9f00d07da8552858ba5758772))
* 增加KeepAliveOverlay组件用于缓存iframe ([373e424](https://github.com/msgbyte/tailchat/commit/373e424e6ad5d56ce478f5952b9b698997c889f9))
* 增加webview组件封装，统一webview渲染方式 ([fcc2684](https://github.com/msgbyte/tailchat/commit/fcc2684a34a5909c27bd49af5a30a331e83120c3))


### Performance Improvements

* 修改dropdown的overlay到menu, 这是因为会被逐渐弃用 ([922f0ad](https://github.com/msgbyte/tailchat/commit/922f0ad229e12d0f3cd4bf25bd7c1171cc6c459e))
* 优化逻辑，并在常用请求增加索引以加速查找 ([0426c2b](https://github.com/msgbyte/tailchat/commit/0426c2bbeff3f1370bbb5edc1b11aa3e8cf26fde))
* 增加更多的性能埋点与报告 ([ed06245](https://github.com/msgbyte/tailchat/commit/ed06245a6416a244efa8cc5c4b5dfed8f24e158d))