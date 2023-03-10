import _ from 'lodash';
import { Types } from 'mongoose';
import { isValidStr } from '../../../lib/utils';
import type {
  Group,
  GroupDocument,
  GroupModel,
  GroupPanel,
} from '../../../models/group/group';
import {
  TcService,
  GroupBaseInfo,
  TcContext,
  TcDbService,
  PureContext,
  call,
  DataNotFoundError,
  EntityError,
  NoPermissionError,
  PERMISSION,
  GroupPanelType,
} from 'tailchat-server-sdk';
import moment from 'moment';



interface GroupService
  extends TcService,
    TcDbService<GroupDocument, GroupModel> {}
class GroupService extends TcService {
  get serviceName(): string {
    return 'group';
  }

  onInit(): void {
    this.registerLocalDb(require('../../../models/group/group').default);

    this.registerAction('createGroup', this.createGroup, {
      params: {
        name: 'string',
        panels: 'array',
      },
    });
    this.registerAction('getUserGroups', this.getUserGroups);
    this.registerAction(
      'getJoinedGroupAndPanelIds',
      this.getJoinedGroupAndPanelIds
    );
    this.registerAction('getGroupBasicInfo', this.getGroupBasicInfo, {
      params: {
        groupId: 'string',
      },
    });
    this.registerAction('getGroupInfo', this.getGroupInfo, {
      params: {
        groupId: 'string',
      },
      cache: {
        keys: ['groupId'],
        ttl: 60 * 60, // 1 hour
      },
      visibility: 'public',
    });
    this.registerAction('updateGroupField', this.updateGroupField, {
      params: {
        groupId: 'string',
        fieldName: 'string',
        fieldValue: 'any',
      },
    });
    this.registerAction('updateGroupConfig', this.updateGroupConfig, {
      params: {
        groupId: 'string',
        configName: 'string',
        configValue: 'any',
      },
    });
    this.registerAction('isGroupOwner', this.isGroupOwner, {
      params: {
        groupId: 'string',
      },
    });
    this.registerAction('joinGroup', this.joinGroup, {
      params: {
        groupId: 'string',
      },
      visibility: 'public',
    });
    this.registerAction('quitGroup', this.quitGroup, {
      params: {
        groupId: 'string',
      },
    });
    this.registerAction('appendGroupMemberRoles', this.appendGroupMemberRoles, {
      params: {
        groupId: 'string',
        memberIds: { type: 'array', items: 'string' },
        roles: { type: 'array', items: 'string' },
      },
    });
    this.registerAction('removeGroupMemberRoles', this.removeGroupMemberRoles, {
      params: {
        groupId: 'string',
        memberIds: { type: 'array', items: 'string' },
        roles: { type: 'array', items: 'string' },
      },
    });
    this.registerAction('createGroupPanel', this.createGroupPanel, {
      params: {
        groupId: 'string',
        name: 'string',
        type: 'number',
        parentId: { type: 'string', optional: true },
        provider: { type: 'string', optional: true },
        pluginPanelName: { type: 'string', optional: true },
        meta: { type: 'object', optional: true },
      },
    });
    this.registerAction('modifyGroupPanel', this.modifyGroupPanel, {
      params: {
        groupId: 'string',
        panelId: 'string',
        name: 'string',
        type: 'number',
        provider: { type: 'string', optional: true },
        pluginPanelName: { type: 'string', optional: true },
        meta: { type: 'object', optional: true },
      },
    });
    this.registerAction('deleteGroupPanel', this.deleteGroupPanel, {
      params: {
        groupId: 'string',
        panelId: 'string',
      },
    });
    this.registerAction(
      'getGroupLobbyConverseId',
      this.getGroupLobbyConverseId,
      {
        params: {
          groupId: 'string',
        },
      }
    );
    this.registerAction('createGroupRole', this.createGroupRole, {
      params: {
        groupId: 'string',
        roleName: 'string',
        permissions: { type: 'array', items: 'string' },
      },
    });
    this.registerAction('deleteGroupRole', this.deleteGroupRole, {
      params: {
        groupId: 'string',
        roleId: 'string',
      },
    });
    this.registerAction('updateGroupRoleName', this.updateGroupRoleName, {
      params: {
        groupId: 'string',
        roleId: 'string',
        roleName: 'string',
      },
    });
    this.registerAction(
      'updateGroupRolePermission',
      this.updateGroupRolePermission,
      {
        params: {
          groupId: 'string',
          roleId: 'string',
          permissions: {
            type: 'array',
            items: 'string',
          },
        },
      }
    );
    this.registerAction('getPermissions', this.getPermissions, {
      params: {
        groupId: 'string',
      },
    });
    this.registerAction('getUserAllPermissions', this.getUserAllPermissions, {
      params: {
        groupId: 'string',
        userId: 'string',
      },
      visibility: 'public',
      cache: {
        keys: ['groupId', 'userId'],
        ttl: 60 * 60, // 1 hour
      },
    });
    this.registerAction('muteGroupMember', this.muteGroupMember, {
      params: {
        groupId: 'string',
        memberId: 'string',
        muteMs: 'number',
      },
    });
    this.registerAction('deleteGroupMember', this.deleteGroupMember, {
      params: {
        groupId: 'string',
        memberId: 'string',
      },
    });
  }

  /**
   * ?????????????????????????????????id??????
   * ??????????????????
   */
  private getGroupTextPanelIds(group: Group): string[] {
    // TODO: ???????????????, ??????????????????????????????
    const textPanelIds = group.panels
      .filter((p) => p.type === GroupPanelType.TEXT)
      .map((p) => p.id);
    return textPanelIds;
  }

  /**
   * ????????????
   */
  async createGroup(
    ctx: TcContext<{
      name: string;
      panels: GroupPanel[];
    }>
  ) {
    const name = ctx.params.name;
    const panels = ctx.params.panels;
    const userId = ctx.meta.userId;

    const group = await this.adapter.model.createGroup({
      name,
      panels,
      owner: userId,
    });

    const textPanelIds = this.getGroupTextPanelIds(group);

    await call(ctx).joinSocketIORoom(
      [String(group._id), ...textPanelIds],
      userId
    );

    return this.transformDocuments(ctx, {}, group);
  }

  async getUserGroups(ctx: TcContext): Promise<Group[]> {
    const userId = ctx.meta.userId;

    const groups = await this.adapter.model.getUserGroups(userId);

    return this.transformDocuments(ctx, {}, groups);
  }

  /**
   * ???????????????????????????????????????id?????????????????????id??????
   */
  async getJoinedGroupAndPanelIds(ctx: TcContext): Promise<{
    groupIds: string[];
    panelIds: string[];
  }> {
    const groups = await this.getUserGroups(ctx); // TODO: ????????????call????????????????????????????????????tracer???caching???????????????moleculer????????????????????????????????????localCall????????????????????????????????????
    const panelIds = _.flatten(groups.map((g) => this.getGroupTextPanelIds(g)));

    return {
      groupIds: groups.map((g) => String(g._id)),
      panelIds,
    };
  }

  /**
   * ????????????????????????
   */
  async getGroupBasicInfo(
    ctx: PureContext<{
      groupId: string;
    }>
  ): Promise<GroupBaseInfo> {
    const group = await this.adapter.model
      .findById(ctx.params.groupId, {
        name: 1,
        avatar: 1,
        owner: 1,
        members: 1,
      })
      .exec();

    if (group === null) {
      return null;
    }

    const groupMemberCount = group.members.length;

    return {
      name: group.name,
      avatar: group.avatar,
      owner: String(group.owner),
      memberCount: groupMemberCount,
    };
  }

  /**
   * ????????????????????????
   * ?????????????????????
   */
  async getGroupInfo(ctx: TcContext<{ groupId: string }>): Promise<Group> {
    const groupInfo = await this.adapter.model.findById(ctx.params.groupId);

    return await this.transformDocuments(ctx, {}, groupInfo);
  }

  /**
   * ??????????????????
   */
  async updateGroupField(
    ctx: TcContext<{
      groupId: string;
      fieldName: string;
      fieldValue: unknown;
    }>
  ) {
    const { groupId, fieldName, fieldValue } = ctx.params;
    const userId = ctx.meta.userId;
    const t = ctx.meta.t;
    if (
      !['name', 'avatar', 'panels', 'roles','lock', 'fallbackPermissions'].includes(
        fieldName
      )
    ) {
      throw new EntityError(t('????????????????????????'));
    }

    const [isGroupOwner, hasRolePermission] = await call(
      ctx
    ).checkUserPermissions(groupId, userId, [
      PERMISSION.core.owner,
      PERMISSION.core.manageRoles,
    ]);

    if (fieldName === 'fallbackPermissions') {
      if (!hasRolePermission) {
        throw new NoPermissionError(t('??????????????????'));
      }
    } else if (!isGroupOwner) {
      throw new NoPermissionError(t('?????????????????????????????????'));
    }

    const group = await this.adapter.model.findById(groupId).exec();

    group[fieldName] = fieldValue;
    await group.save();

    if (fieldName === 'fallbackPermissions') {
      await this.cleanGroupAllUserPermissionCache(groupId);
    }

    this.notifyGroupInfoUpdate(ctx, group);
  }

  /**
   * ??????????????????
   */
  async updateGroupConfig(
    ctx: TcContext<{
      groupId: string;
      configName: string;
      configValue: unknown;
    }>
  ) {
    const { groupId, configName, configValue } = ctx.params;
    const userId = ctx.meta.userId;
    const t = ctx.meta.t;

    const [hasPermission] = await call(ctx).checkUserPermissions(
      groupId,
      userId,
      [PERMISSION.core.groupConfig]
    );

    if (!hasPermission) {
      throw new NoPermissionError(t('??????????????????'));
    }

    const group = await this.adapter.model.findById(groupId).exec();
    group.config[configName] = configValue;
    await group.save();

    this.notifyGroupInfoUpdate(ctx, group);
  }

  /**
   * ????????????????????????????????????
   */
  async isGroupOwner(
    ctx: TcContext<{
      groupId: string;
    }>
  ): Promise<boolean> {
    const t = ctx.meta.t;
    const group = await this.adapter.model.findById(ctx.params.groupId);
    if (!group) {
      throw new DataNotFoundError(t('??????????????????'));
    }

    return String(group.owner) === ctx.meta.userId;
  }

  /**
   * ????????????
   */
  async joinGroup(
    ctx: TcContext<{
      groupId: string;
    }>
  ) {
    const groupId = ctx.params.groupId;
    const userId = ctx.meta.userId;

    if (!isValidStr(userId)) {
      throw new EntityError('??????id??????');
    }

    if (!isValidStr(groupId)) {
      throw new EntityError('??????id??????');
    }

    const { members } = await this.adapter.model.findById(groupId, {
      members: 1,
    });
    if (members.findIndex((m) => String(m.userId) === userId) >= 0) {
      throw new Error('??????????????????');
    }

    //??????
    const { lock } = await this.adapter.model.findById(groupId, {
      lock: 1,
    });
    if(lock===true)
    {
      throw new Error('??????????????????,????????????.??????????????????!');
    }


    const doc = await this.adapter.model
      .findByIdAndUpdate(
        groupId,
        {
          $addToSet: {
            members: {
              userId: new Types.ObjectId(userId),
            },
          },
        },
        {
          new: true,
        }
      )
      .exec();

    const group: Group = await this.transformDocuments(ctx, {}, doc);

    this.notifyGroupInfoUpdate(ctx, group); // ????????????
    this.unicastNotify(ctx, userId, 'add', group);

    const textPanelIds = this.getGroupTextPanelIds(group);

    await call(ctx).joinSocketIORoom(
      [String(group._id), ...textPanelIds],
      userId
    );

    return group;
  }

  /**
   * ????????????
   */
  async quitGroup(
    ctx: TcContext<{
      groupId: string;
    }>
  ) {
    const groupId = ctx.params.groupId;
    const userId = ctx.meta.userId;

    const group = await this.adapter.findById(groupId);
    if (String(group.owner) === userId) {
      // ??????????????????
      await this.adapter.removeById(groupId); // TODO: ?????????????????????????????????
      await this.roomcastNotify(ctx, groupId, 'remove', { groupId });
      await ctx.call('gateway.leaveRoom', {
        roomIds: [groupId],
      });



    } else {
      // ?????????????????????
      const doc = await this.adapter.model
        .findByIdAndUpdate(
          groupId,
          {
            $pull: {
              members: {
                userId: new Types.ObjectId(userId),
              },
            },
          },
          {
            new: true,
          }
        )
        .exec();

      const group: Group = await this.transformDocuments(ctx, {}, doc);

      await this.memberLeaveGroup(ctx, group, userId);
    }
  }

  /**
   * ???????????????????????????
   */
  async appendGroupMemberRoles(
    ctx: TcContext<{
      groupId: string;
      memberIds: string[];
      roles: string[];
    }>
  ) {
    const { groupId, memberIds, roles } = ctx.params;
    const { userId } = ctx.meta;

    await Promise.all(
      memberIds.map((memberId) =>
        this.adapter.model.updateGroupMemberField(
          ctx,
          groupId,
          memberId,
          'roles',
          (member) =>
            (member['roles'] = _.uniq([...member['roles'], ...roles])),
          userId
        )
      )
    );

    const group = await this.adapter.model.findById(groupId);

    await this.notifyGroupInfoUpdate(ctx, group);
    await Promise.all(
      memberIds.map((memberId) =>
        this.cleanGroupUserPermission(groupId, memberId)
      )
    );
  }

  /**
   * ???????????????????????????
   */
  async removeGroupMemberRoles(
    ctx: TcContext<{
      groupId: string;
      memberIds: string[];
      roles: string[];
    }>
  ) {
    const { groupId, memberIds, roles } = ctx.params;
    const { userId } = ctx.meta;

    await Promise.all(
      memberIds.map((memberId) =>
        this.adapter.model.updateGroupMemberField(
          ctx,
          groupId,
          memberId,
          'roles',
          (member) => (member['roles'] = _.without(member['roles'], ...roles)),
          userId
        )
      )
    );

    const group = await this.adapter.model.findById(groupId);

    await this.notifyGroupInfoUpdate(ctx, group);
    await Promise.all(
      memberIds.map((memberId) =>
        this.cleanGroupUserPermission(groupId, memberId)
      )
    );
  }

  /**
   * ??????????????????
   */
  async createGroupPanel(
    ctx: TcContext<{
      groupId: string;
      name: string;
      type: number;
      parentId?: string;
      provider?: string;
      pluginPanelName?: string;
      meta?: object;
    }>
  ) {
    const { groupId, name, type, parentId, provider, pluginPanelName, meta } =
      ctx.params;
    const { t, userId } = ctx.meta;

    const [hasPermission] = await call(ctx).checkUserPermissions(
      groupId,
      userId,
      [PERMISSION.core.managePanel]
    );

    if (!hasPermission) {
      throw new NoPermissionError(t('??????????????????'));
    }

    const panelId = String(new Types.ObjectId());

    const group = await this.adapter.model
      .findOneAndUpdate(
        {
          _id: new Types.ObjectId(groupId),
        },
        {
          $push: {
            panels: {
              id: panelId,
              name,
              type,
              parentId,
              provider,
              pluginPanelName,
              meta,
            },
          },
        },
        {
          new: true,
        }
      )
      .exec();

    if (type === 0) {
      /**
       * ?????????????????????
       * ?????????????????????????????????
       */
      const groupInfo = await call(ctx).getGroupInfo(groupId);
      (groupInfo?.members ?? []).map((m) =>
        call(ctx).joinSocketIORoom([panelId], m.userId)
      );
    }

    this.notifyGroupInfoUpdate(ctx, group);
  }

  /**
   * ??????????????????
   */
  async modifyGroupPanel(
    ctx: TcContext<{
      groupId: string;
      panelId: string;
      name: string;
      type: number;
      provider?: string;
      pluginPanelName?: string;
      meta?: object;
    }>
  ) {
    const { groupId, panelId, name, type, provider, pluginPanelName, meta } =
      ctx.params;
    const { t, userId } = ctx.meta;

    const [hasPermission] = await call(ctx).checkUserPermissions(
      groupId,
      userId,
      [PERMISSION.core.managePanel]
    );
    if (!hasPermission) {
      throw new NoPermissionError(t('??????????????????'));
    }

    const res = await this.adapter.model
      .updateOne(
        {
          _id: new Types.ObjectId(groupId),
        },
        {
          $set: {
            'panels.$[element].name': name,
            'panels.$[element].type': type,
            'panels.$[element].provider': provider,
            'panels.$[element].pluginPanelName': pluginPanelName,
            'panels.$[element].meta': meta,
          },
        },
        {
          new: true,
          arrayFilters: [{ 'element.id': panelId }],
        }
      )
      .exec();

    if (res.modifiedCount === 0) {
      throw new Error(t('?????????????????????'));
    }

    const group = await this.adapter.model.findById(String(groupId));

    const json = await this.notifyGroupInfoUpdate(ctx, group);
    return json;
  }

  /**
   * ??????????????????
   */
  async deleteGroupPanel(ctx: TcContext<{ groupId: string; panelId: string }>) {
    const { groupId, panelId } = ctx.params;
    const { t, userId } = ctx.meta;

    const [hasPermission] = await call(ctx).checkUserPermissions(
      groupId,
      userId,
      [PERMISSION.core.managePanel]
    );
    if (!hasPermission) {
      throw new NoPermissionError(t('??????????????????'));
    }

    const group = await this.adapter.model
      .findOneAndUpdate(
        {
          _id: new Types.ObjectId(groupId),
        },
        {
          $pull: {
            panels: {
              $or: [
                {
                  id: new Types.ObjectId(panelId),
                },
                {
                  parentId: new Types.ObjectId(panelId),
                },
              ],
            } as any,
          },
        },
        {
          new: true,
        }
      )
      .exec();

    const json = await this.notifyGroupInfoUpdate(ctx, group);
    return json;
  }

  /**
   * ???????????????????????????ID()
   */
  async getGroupLobbyConverseId(ctx: TcContext<{ groupId: string }>) {
    const groupId = ctx.params.groupId;
    const t = ctx.meta.t;

    const group = await this.adapter.model.findById(groupId);
    if (!group) {
      throw new DataNotFoundError(t('???????????????'));
    }

    const firstTextPanel = group.panels.find(
      (panel) => panel.type === GroupPanelType.TEXT
    );

    if (!firstTextPanel) {
      return null;
    }

    return firstTextPanel.id;
  }

  /**
   * ??????????????????
   */
  async createGroupRole(
    ctx: TcContext<{ groupId: string; roleName: string; permissions: string[] }>
  ) {
    const { groupId, roleName, permissions } = ctx.params;
    const { userId, t } = ctx.meta;

    const [hasPermission] = await call(ctx).checkUserPermissions(
      groupId,
      userId,
      [PERMISSION.core.managePanel]
    );
    if (!hasPermission) {
      throw new NoPermissionError(t('??????????????????'));
    }

    const group = await this.adapter.model
      .findOneAndUpdate(
        {
          _id: new Types.ObjectId(groupId),
        },
        {
          $push: {
            roles: {
              name: roleName,
              permissions,
            },
          },
        },
        {
          new: true,
        }
      )
      .exec();

    const json = await this.notifyGroupInfoUpdate(ctx, group);
    return json;
  }

  /**
   * ??????????????????
   */
  async deleteGroupRole(ctx: TcContext<{ groupId: string; roleId: string }>) {
    const { groupId, roleId } = ctx.params;
    const { userId, t } = ctx.meta;

    const [hasPermission] = await call(ctx).checkUserPermissions(
      groupId,
      userId,
      [PERMISSION.core.manageRoles]
    );
    if (!hasPermission) {
      throw new NoPermissionError(t('??????????????????'));
    }

    const group = await this.adapter.model
      .findOneAndUpdate(
        {
          _id: new Types.ObjectId(groupId),
        },
        {
          $pull: {
            roles: {
              _id: roleId,
            }, // ????????????
            'members.$[].roles': roleId, // ??????????????????
          },
        },
        {
          new: true,
        }
      )
      .exec();

    const json = await this.notifyGroupInfoUpdate(ctx, group);
    return json;
  }

  /**
   * ????????????????????????
   */
  async updateGroupRoleName(
    ctx: TcContext<{
      groupId: string;
      roleId: string;
      roleName: string;
    }>
  ) {
    const { groupId, roleId, roleName } = ctx.params;
    const { userId, t } = ctx.meta;

    const [hasPermission] = await call(ctx).checkUserPermissions(
      groupId,
      userId,
      [PERMISSION.core.managePanel]
    );
    if (!hasPermission) {
      throw new NoPermissionError(t('??????????????????'));
    }

    const group = await this.adapter.model.updateGroupRoleName(
      groupId,
      roleId,
      roleName
    );

    const json = await this.notifyGroupInfoUpdate(ctx, group);
    return json;
  }

  /**
   * ????????????????????????
   */
  async updateGroupRolePermission(
    ctx: TcContext<{
      groupId: string;
      roleId: string;
      permissions: string[];
    }>
  ) {
    const { groupId, roleId, permissions } = ctx.params;
    const { userId, t } = ctx.meta;

    const [hasPermission] = await call(ctx).checkUserPermissions(
      groupId,
      userId,
      [PERMISSION.core.managePanel]
    );
    if (!hasPermission) {
      throw new NoPermissionError(t('??????????????????'));
    }

    const group = await this.adapter.model.updateGroupRolePermission(
      groupId,
      roleId,
      permissions
    );

    const json = await this.notifyGroupInfoUpdate(ctx, group);
    return json;
  }

  /**
   * ????????????????????????(??????)
   */
  async getPermissions(
    ctx: TcContext<{
      groupId: string;
    }>
  ): Promise<string[]> {
    const { groupId } = ctx.params;
    const userId = ctx.meta.userId;

    const permissions = await this.localCall('getUserAllPermissions', {
      groupId,
      userId,
    });

    return permissions;
  }

  /**
   * ????????????????????????(??????)
   * ??????groupId???userId?????????
   */
  async getUserAllPermissions(
    ctx: TcContext<{
      groupId: string;
      userId: string;
    }>
  ): Promise<string[]> {
    const { groupId, userId } = ctx.params;
    const permissions = await this.adapter.model.getGroupUserPermission(
      groupId,
      userId
    );

    return permissions;
  }

  /**
   * ??????????????????
   */
  async muteGroupMember(
    ctx: TcContext<{
      groupId: string;
      memberId: string;
      muteMs: number; // ????????????????????????. ?????????ms, ????????????0?????????????????????
    }>
  ) {
    const { groupId, memberId, muteMs } = ctx.params;
    const userId = ctx.meta.userId;
    const language = ctx.meta.language;
    const isUnmute = muteMs < 0;

    const group = await this.adapter.model.updateGroupMemberField(
      ctx,
      groupId,
      memberId,
      'muteUntil',
      isUnmute ? undefined : new Date(new Date().valueOf() + muteMs),
      userId
    );

    this.notifyGroupInfoUpdate(ctx, group);

    const memberInfo = await call(ctx).getUserInfo(memberId);
    if (isUnmute) {
      await call(ctx).addGroupSystemMessage(
        groupId,
        `${ctx.meta.user.nickname} ????????? ${memberInfo.nickname} ?????????`
      );
    } else {
      await call(ctx).addGroupSystemMessage(
        groupId,
        `${ctx.meta.user.nickname} ????????? ${memberInfo.nickname} ${moment
          .duration(muteMs, 'ms')
          .locale(language)
          .humanize()}`
      );
    }
  }

  async deleteGroupMember(
    ctx: TcContext<{
      groupId: string;
      memberId: string;
    }>
  ) {
    const { groupId, memberId } = ctx.params;
    const userId = ctx.meta.userId;
    const t = ctx.meta.t;

    // ????????????????????????
    if (String(memberId) === String(userId)) {
      throw new Error(t('?????????????????????'));
    }

    // ?????????????????????
    const [hasPermission] = await call(ctx).checkUserPermissions(
      groupId,
      userId,
      [PERMISSION.core.manageUser]
    );
    if (!hasPermission) {
      throw new NoPermissionError(t('??????????????????'));
    }

    // ???????????????????????????????????????
    const groupInfo = await call(ctx).getGroupInfo(groupId);
    if (String(memberId) === String(groupInfo.owner)) {
      throw new Error(t('?????????????????????OP'));
    }

    const group = await this.adapter.model.findByIdAndUpdate(
      groupId,
      {
        $pull: {
          members: {
            userId: String(memberId),
          },
        },
      },
      { new: true }
    );

    await this.memberLeaveGroup(ctx, group, memberId);

    const memberInfo = await call(ctx).getUserInfo(memberId);
    await call(ctx).addGroupSystemMessage(
      groupId,
      `${ctx.meta.user.nickname} ??? ${memberInfo.nickname} ??????????????????`
    );
  }

  /**
   * ??????????????????
   * ?????????????????????????????????????????????
   *
   * ??????????????????????????? ?????????????????????????????????
   */
  private async memberLeaveGroup(
    ctx: TcContext,
    group: Group,
    memberId: string
  ) {
    const groupId = String(group._id);

    await ctx.call('gateway.leaveRoom', {
      roomIds: [
        groupId,
        ...group.panels
          .filter((p) => p.type === GroupPanelType.TEXT)
          .map((p) => p.id),
      ], // ?????????????????????????????????
      memberId,
    });
    await Promise.all([
      this.unicastNotify(ctx, memberId, 'remove', { groupId }),
      this.notifyGroupInfoUpdate(ctx, group),
    ]);
  }

  /**
   * ????????????????????????????????????
   *
   * ????????????????????????????????????????????????
   */
  private async notifyGroupInfoUpdate(
    ctx: TcContext,
    group: Group
  ): Promise<Group> {
    const groupId = String(group._id);
    let json = group;
    if (_.isPlainObject(group) === false) {
      // ?????????????????????group doc???
      json = await this.transformDocuments(ctx, {}, group);
    }

    this.cleanGroupInfoCache(groupId);
    await this.roomcastNotify(ctx, groupId, 'updateInfo', json);

    return json;
  }

  /**
   * ??????????????????
   * @param groupId ??????id
   */
  private cleanGroupInfoCache(groupId: string) {
    this.cleanActionCache('getGroupInfo', [groupId]);
  }

  /**
   * ????????????????????????
   * @param groupId ??????id
   * @param userId ??????id
   */
  private cleanGroupUserPermission(groupId: string, userId: string) {
    this.cleanActionCache('getUserAllPermissions', [groupId, userId]);
  }

  /**
   * ??????????????????????????????
   * @param groupId ??????id
   */
  private cleanGroupAllUserPermissionCache(groupId: string) {
    this.cleanActionCache('getUserAllPermissions', [groupId]);
  }
}

export default GroupService;
