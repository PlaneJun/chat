import {
  regCustomPanel,
  Loadable,
  regInspectService,
  regPluginPermission,
} from '@capital/common';
import { Translate } from './translate';

regCustomPanel({
  position: 'groupdetail',
  name: 'com.msgbyte.github/groupSubscribe',
  label: Translate.groupSubscribe,
  render: Loadable(() => import('./GroupSubscribePanel')),
});

regInspectService({
  name: 'plugin:com.msgbyte.github.subscribe',
  label: Translate.githubService,
});

regPluginPermission({
  key: 'plugin.com.msgbyte.github.subscribe.manage',
  title: Translate.permissionTitle,
  desc: Translate.permissionDesc,
  default: false,
});
