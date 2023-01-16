import React, { PropsWithChildren, useEffect, useMemo } from 'react';
import { t, useGroupInfo, useGroupPanelInfo,modifyGroupField} from 'tailchat-shared';
import _isNil from 'lodash/isNil';
import { MembersPanel } from './MembersPanel';
import { CommonPanelWrapper } from '../common/Wrapper';
import { usePanelWindow } from '@/hooks/usePanelWindow';
import { OpenedPanelTip } from '@/components/OpenedPanelTip';
import { IconBtn } from '@/components/IconBtn';
import {
  GroupPluginPanelActionProps,
  pluginPanelActions,
} from '@/plugin/common';
import { useUserSessionPreference } from '@/hooks/useUserPreference';
import { GroupPanelContext } from '@/context/GroupPanelContext';

/**
 * 记录下最后访问的面板id
 */
function useRecordGroupPanel(groupId: string, panelId: string) {
  const [lastVisitPanel, setLastVisitPanel] = useUserSessionPreference(
    'groupLastVisitPanel'
  );

  useEffect(() => {
    setLastVisitPanel({
      ...lastVisitPanel,
      [groupId]: panelId,
    });
  }, [groupId, panelId]);
}

/**
 * 群组面板通用包装器
 */
interface GroupPanelWrapperProps extends PropsWithChildren {
  groupId: string;
  panelId: string;
  /**
   * 是否显示面板头
   */
  showHeader: boolean;
}
export const GroupPanelWrapper: React.FC<GroupPanelWrapperProps> = React.memo(
  (props) => {
    const groupId = props.groupId;
    const panelId = props.panelId;
    const groupInfo = useGroupInfo(groupId);
    const panelInfo = useGroupPanelInfo(groupId, panelId);
    const groupMemberCount = (groupInfo?.members ?? []).length;
    useRecordGroupPanel(groupId, panelId);

    const { hasOpenedPanel, openPanelWindow, closePanelWindow } =
      usePanelWindow(`/panel/group/${groupId}/${panelId}`);

    const groupPanelContextValue = useMemo(
      () => ({
        groupId,
        panelId,
      }),
      [groupId, panelId]
    );

    if(_isNil(groupInfo)){
      return null;
    }
    if (_isNil(panelInfo)) {
      return null;
    }

    if (hasOpenedPanel) {
      return <OpenedPanelTip onClosePanelWindow={closePanelWindow} />;
    }

    if (!props.showHeader) {
      return (
        <GroupPanelContext.Provider value={groupPanelContextValue}>
          {props.children}
        </GroupPanelContext.Provider>
      );
    }

    return (
      <GroupPanelContext.Provider value={groupPanelContextValue}>
        <CommonPanelWrapper
          header={panelInfo.name}
          actions={(setRightPanel) => [
            ...pluginPanelActions
              .filter(
                (action): action is GroupPluginPanelActionProps =>
                  action.position === 'group'
              )
              .map((action) => (
                <IconBtn
                  key={action.name}
                  title={action.label}
                  shape="square"
                  icon={action.icon}
                  iconClassName="text-2xl"
                  onClick={() =>
                    action.onClick({
                      groupId: props.groupId,
                      panelId: props.panelId,
                    })
                  }
                />
              )),

            //添加锁房
            <IconBtn
              key="lock"
              title={t('锁定房间')}
              shape="square"
              icon={groupInfo.lock?"material-symbols:lock-outline":"material-symbols:lock-open-outline"}
              iconClassName="text-2xl"
              onClick={async (e) =>{
                if(groupInfo.lock===true)
                {
                  e.target.getElementsByTagName("path")[0].setAttribute('d','M6 22q-.825 0-1.412-.587Q4 20.825 4 20V10q0-.825.588-1.413Q5.175 8 6 8h1V6q0-2.075 1.463-3.538Q9.925 1 12 1t3.538 1.462Q17 3.925 17 6v2h1q.825 0 1.413.587Q20 9.175 20 10v10q0 .825-.587 1.413Q18.825 22 18 22Zm0-2h12V10H6v10Zm6-3q.825 0 1.413-.587Q14 15.825 14 15q0-.825-.587-1.413Q12.825 13 12 13q-.825 0-1.412.587Q10 14.175 10 15q0 .825.588 1.413Q11.175 17 12 17ZM9 8h6V6q0-1.25-.875-2.125T12 3q-1.25 0-2.125.875T9 6ZM6 20V10v10Z')
                  await modifyGroupField(props.groupId,'lock',false);
                }
                else{
                  e.target.getElementsByTagName("path")[0].setAttribute('d','M6 8h9V6q0-1.25-.875-2.125T12 3q-1.25 0-2.125.875T9 6H7q0-2.075 1.463-3.538Q9.925 1 12 1t3.538 1.462Q17 3.925 17 6v2h1q.825 0 1.413.587Q20 9.175 20 10v10q0 .825-.587 1.413Q18.825 22 18 22H6q-.825 0-1.412-.587Q4 20.825 4 20V10q0-.825.588-1.413Q5.175 8 6 8Zm0 12h12V10H6v10Zm6-3q.825 0 1.413-.587Q14 15.825 14 15q0-.825-.587-1.413Q12.825 13 12 13q-.825 0-1.412.587Q10 14.175 10 15q0 .825.588 1.413Q11.175 17 12 17Zm-6 3V10v10Z')
                  await modifyGroupField(props.groupId,'lock',true);
                }
              }}
            />,              
            <IconBtn
              key="open"
              title={t('在新窗口打开')}
              shape="square"
              icon="mdi:dock-window"
              iconClassName="text-2xl"
              onClick={openPanelWindow}
            />,
            <IconBtn
              key="members"
              title={t('成员列表')}
              shape="square"
              icon="mdi:account-supervisor-outline"
              iconClassName="text-2xl"
              onClick={() =>
                setRightPanel({
                  name: t('成员') + ` (${groupMemberCount})`,
                  panel: <MembersPanel groupId={props.groupId} />,
                })
              }
            />,
          ]}
        >
          {props.children}
        </CommonPanelWrapper>
      </GroupPanelContext.Provider>
    );
  }
);
GroupPanelWrapper.displayName = 'GroupPanelWrapper';
