import React, { useCallback, useState } from 'react';
import { Avatar, Button, Input, UserName } from '@capital/component';
import styled from 'styled-components';
import type { OpenAppInfo } from 'types';
import {
  useAsyncRequest,
  postRequest,
  showErrorToasts,
  useGroupIdContext,
  showSuccessToasts,
} from '@capital/common';

const Tip = styled.div`
  color: #999;
  margin-bottom: 10px;
`;

const Row = styled.div`
  display: flex;
`;

const AppInfoCard = styled.div({
  backgroundColor: 'rgba(0, 0, 0, 0.1)',
  borderRadius: 3,
  padding: 10,
  marginTop: 10,

  '.app-info': {
    flex: 1,
    marginLeft: 10,

    '.title': {
      fontSize: 18,
      fontWeight: 'bold',
    },

    '.action': {
      marginTop: 10,
    },
  },
});

const IntegrationPanel: React.FC = React.memo(() => {
  const [appId, setAppId] = useState('');
  const [openAppInfo, setOpenAppInfo] = useState<OpenAppInfo | null>(null);
  const groupId = useGroupIdContext();

  const [{ loading }, handleQueryApp] = useAsyncRequest(async () => {
    const { data } = await postRequest('/openapi/app/get', {
      appId,
    });

    if (!data) {
      showErrorToasts('没找到该应用');
      return;
    }

    setOpenAppInfo(data);
  }, [appId]);

  const [{ loading: addBotLoading }, handleAddBotIntoGroup] =
    useAsyncRequest(async () => {
      await postRequest('/openapi/integration/addBotUser', {
        appId,
        groupId,
      });
      showSuccessToasts();
    }, [appId]);

  return (
    <div>
      <Tip>目前仅支持通过应用ID手动添加</Tip>

      <Row>
        <Input
          placeholder={'应用ID'}
          value={appId}
          onChange={(e) => setAppId(e.target.value)}
        />
        <Button
          type="primary"
          disabled={!appId}
          loading={loading}
          onClick={handleQueryApp}
        >
          查询
        </Button>
      </Row>

      {openAppInfo && (
        <div>
          <AppInfoCard>
            <Row>
              <Avatar
                size={56}
                src={openAppInfo.appIcon}
                name={openAppInfo.appName}
              />

              <div className="app-info">
                <div>{openAppInfo.appName}</div>
                <div>{openAppInfo.appDesc}</div>
                <Row>
                  <div>开发者:</div>
                  <UserName userId={openAppInfo.owner} />
                </Row>

                <div className="action">
                  {openAppInfo.capability.includes('bot') && (
                    <Button
                      type="primary"
                      size="small"
                      loading={addBotLoading}
                      onClick={handleAddBotIntoGroup}
                    >
                      添加应用机器人到群组
                    </Button>
                  )}
                </div>
              </div>
            </Row>
          </AppInfoCard>
        </div>
      )}
    </div>
  );
});
IntegrationPanel.displayName = 'IntegrationPanel';

export default IntegrationPanel;
