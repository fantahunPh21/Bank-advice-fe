import React, { useState } from 'react';
import { Table, Button, Space, Input, Modal, Form, Typography, Card, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { useUserRecords } from '../api/useUserRecords';
import MainLayout from '../layouts/MainLayout';

const { Title } = Typography;

const Users = () => {
  const {
    users,
    isLoading,
    totalItems,
    currentPage,
    pageSize,
    searchQuery,
    setSearchQuery,
    handleTableChange,
    addUser,
    updateUser,
    deleteUser
  } = useUserRecords();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form] = Form.useForm();

  const showModal = (user = null) => {
    setEditingUser(user);
    if (user) {
      form.setFieldsValue(user);
    } else {
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingUser(null);
    form.resetFields();
  };

  const onFinish = (values) => {
    if (editingUser) {
      updateUser({ ...editingUser, ...values });
    } else {
      addUser(values);
    }
    handleCancel();
  };

  const columns = [
    {
      title: 'Full Name',
      dataIndex: 'fullName',
      key: 'fullName',
      render: (_, record) => `${record.firstName || ''} ${record.lastName || ''}`.trim() || record.username,
    },
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Roles',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        <Space wrap>
          {Array.isArray(role) ? role.map(r => <Tag color="blue" key={r}>{r}</Tag>) : <Tag color="blue">{role}</Tag>}
        </Space>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} onClick={() => showModal(record)}>Edit</Button>
          <Button icon={<DeleteOutlined />} danger onClick={() => {
            Modal.confirm({
              title: 'Are you sure you want to delete this user?',
              onOk: () => deleteUser(record.id),
            });
          }}>Delete</Button>
        </Space>
      ),
    },
  ];

  return (
    <MainLayout selectedKey="users">
      <Space orientation="vertical" size="large" style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={2} style={{ margin: 0 }}>Users</Title>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>
            Add User
          </Button>
        </div>

        <Card style={{ borderRadius: 10, boxShadow: '0 6px 18px rgba(0,0,0,0.06)' }}>
          <Input
            placeholder="Search users..."
            prefix={<SearchOutlined />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ marginBottom: 16, maxWidth: 300 }}
          />
          <Table
            columns={columns}
            dataSource={users}
            loading={isLoading}
            rowKey="id"
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: totalItems,
              showSizeChanger: true,
            }}
            onChange={handleTableChange}
          />
        </Card>
      </Space>

      <Modal
        title={editingUser ? "Edit User" : "Add User"}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="username" label="Username" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="firstName" label="First Name">
            <Input />
          </Form.Item>
          <Form.Item name="lastName" label="Last Name">
            <Input />
          </Form.Item>
          <Form.Item name="role" label="Role">
            <Input placeholder="e.g. USER, FINANCE" />
          </Form.Item>
          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={handleCancel}>Cancel</Button>
              <Button type="primary" htmlType="submit">
                {editingUser ? "Update" : "Create"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </MainLayout>
  );
};

export default Users;
