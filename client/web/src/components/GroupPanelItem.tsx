import { Badge, Space, Typography } from 'antd';
import clsx from 'clsx';
import React from 'react';
import { useLocation } from 'react-router';
import { Link } from 'react-router-dom';

/**
 * 群组面板项
 * 用于侧边栏
 */
export const GroupPanelItem: React.FC<{
  name: string;
  icon: React.ReactNode;
  to: string;
  badge?: boolean;
  extraBadge?: React.ReactNode[];
}> = React.memo((props) => {
  const { icon, name, to, badge } = props;
  const location = useLocation();
  const isActive = location.pathname.startsWith(to);

  return (
    <Link className="block" to={to}>
      <div
        className={clsx(
          'w-full hover:bg-black hover:bg-opacity-20 dark:hover:bg-white dark:hover:bg-opacity-20 cursor-pointer text-gray-900 dark:text-white rounded px-1 h-8 flex items-center text-base group',
          {
            'bg-black bg-opacity-20 dark:bg-white dark:bg-opacity-20': isActive,
          }
        )}
      >
        <div className="flex items-center justify-center px-1 mr-1">{icon}</div>

        <Typography.Text
          className="flex-1 text-gray-900 dark:text-white"
          ellipsis={true}
        >
          {name}
        </Typography.Text>

        <Space>
          {badge === true ? (
            <Badge status="error" />
          ) : (
            <Badge count={Number(badge) || 0} />
          )}

          {props.extraBadge}
        </Space>
      </div>
    </Link>
  );
});
GroupPanelItem.displayName = 'GroupPanelItem';
