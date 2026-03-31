import React from 'react';
import { Typography, Card, Table, Tag } from 'antd';
import MainLayout from '../layouts/MainLayout';

const { Title } = Typography;

const Roles = () => {
  // Placeholder data for roles since we don't have a hook yet
  const roles = [
    { id: 1, name: 'ADMIN', description: 'System Administrator with full access' },
    { id: 2, name: 'FINANCE', description: 'Finance user with access to payment records' },
    { id: 3, name: 'USER', description: 'Standard user with base permissions' },
  ];

  const columns = [
    {
      title: 'Role Name',
      dataIndex: 'name',
      key: 'name',
      render: (name) => <Tag color="purple">{name}</Tag>,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
  ];

  return (
    <MainLayout selectedKey="roles">
      <div className="page-wrapper">
        <Title level={2}>Roles</Title>
        <Card style={{ borderRadius: 10, boxShadow: '0 6px 18px rgba(0,0,0,0.06)' }}>
          <Table
            columns={columns}
            dataSource={roles}
            rowKey="id"
            pagination={false}
          />
        </Card>
      </div>
    </MainLayout>
  );
};

export default Roles;
