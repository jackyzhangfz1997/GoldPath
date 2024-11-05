import React from 'react';
import { Layout, Menu, Button } from 'antd';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
  HomeOutlined,
  PayCircleOutlined,
  MoneyCollectOutlined,
  UserOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { useAuthStore } from '../stores/authStore';

const { Header } = Layout;

const MainLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems: MenuProps['items'] = [
    {
      key: '/dashboard',
      icon: <HomeOutlined />,
      label: <Link to="/dashboard">总览</Link>,
    },
    ...(user?.role === 'admin' ? [
      {
        key: '/expense',
        icon: <PayCircleOutlined />,
        label: <Link to="/expense">支出管理</Link>,
      },
      {
        key: '/income',
        icon: <MoneyCollectOutlined />,
        label: <Link to="/income">收入管理</Link>,
      },
      {
        key: '/users',
        icon: <UserOutlined />,
        label: <Link to="/users">用户管理</Link>,
      },
    ] : []),
  ];

  return (
    <Layout className="min-h-screen">
      <Header className="bg-white px-4 flex items-center justify-between border-b">
        <div className="flex items-center flex-1">
          <div className="text-lg font-medium mr-8">资金进出账管理系统</div>
          <Menu
            mode="horizontal"
            selectedKeys={[location.pathname]}
            className="flex-1 border-b-0"
            items={menuItems}
          />
        </div>
        <Button
          type="text"
          icon={<LogoutOutlined />}
          onClick={handleLogout}
          className="ml-4"
        >
          退出登录
        </Button>
      </Header>
      <Layout.Content className="p-6 bg-gray-50">
        <Outlet />
      </Layout.Content>
    </Layout>
  );
};

export default MainLayout;