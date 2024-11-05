import React, { useState } from 'react';
import { Card, Table, Button, Modal, Form, Input, Select, Space, App } from 'antd';
import { useAuthStore } from '../stores/authStore';
import type { User } from '../types';
import { EditOutlined, DeleteOutlined, UserAddOutlined } from '@ant-design/icons';

const UserManagement: React.FC = () => {
  const { users, user: currentUser, updateUser, addUser, deleteUser } = useAuthStore();
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const { message, modal } = App.useApp();

  const columns = [
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => role === 'admin' ? '管理员' : '普通用户',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: User) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EditOutlined className="text-blue-500" />}
            onClick={() => handleEdit(record)}
          />
          <Button
            type="text"
            icon={<DeleteOutlined className="text-red-500" />}
            onClick={() => handleDelete(record)}
            disabled={record.id === '1' || record.id === '2'}
          />
        </Space>
      ),
    },
  ];

  const handleEdit = (user: User) => {
    setEditingUser(user);
    form.setFieldsValue({
      ...user,
      password: '',
    });
    setIsModalVisible(true);
  };

  const handleDelete = (user: User) => {
    if (user.id === '1') {
      message.error('不能删除管理员账号');
      return;
    }
    if (user.id === '2') {
      message.error('不能删除访客账号');
      return;
    }

    modal.confirm({
      title: '确认删除',
      content: `确定要删除用户 "${user.username}" 吗？`,
      okText: '确定',
      okButtonProps: { danger: true },
      cancelText: '取消',
      onOk: async () => {
        try {
          await deleteUser(user.id);
          message.success('用户删除成功');
        } catch (error) {
          message.error('用户删除失败');
        }
      },
    });
  };

  const handleAddUser = () => {
    setEditingUser(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingUser) {
        const updatedUser = {
          ...editingUser,
          ...values,
          // 只更新密码和用户名（如果允许）
          password: values.password || editingUser.password,
          username: editingUser.id === '1' || editingUser.id === '2' ? editingUser.username : values.username,
          // 保持原有角色
          role: editingUser.id === '1' || editingUser.id === '2' ? editingUser.role : values.role,
        };
        await updateUser(updatedUser);
        message.success('用户更新成功');
      } else {
        await addUser(values);
        message.success('用户添加成功');
      }
      setIsModalVisible(false);
    } catch (error) {
      message.error(editingUser ? '用户更新失败' : '用户添加失败');
    }
  };

  return (
    <div className="space-y-4">
      <Card className="shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium">用户管理</h2>
          <Button
            type="primary"
            icon={<UserAddOutlined />}
            onClick={handleAddUser}
          >
            添加用户
          </Button>
        </div>
        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          pagination={false}
        />
      </Card>

      <Modal
        title={editingUser ? '编辑用户' : '添加用户'}
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={() => setIsModalVisible(false)}
        okText={editingUser ? '更新' : '添加'}
        cancelText="取消"
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input 
              disabled={editingUser?.id === '1' || editingUser?.id === '2'}
              placeholder="请输入用户名"
            />
          </Form.Item>
          <Form.Item
            name="password"
            label="密码"
            rules={[{ required: !editingUser, message: '请输入密码' }]}
          >
            <Input.Password 
              placeholder={editingUser ? '不修改请留空' : '请输入密码'}
            />
          </Form.Item>
          {!(editingUser?.id === '1' || editingUser?.id === '2') && (
            <Form.Item
              name="role"
              label="角色"
              rules={[{ required: true, message: '请选择角色' }]}
            >
              <Select>
                <Select.Option value="admin">管理员</Select.Option>
                <Select.Option value="user">普通用户</Select.Option>
              </Select>
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default UserManagement;