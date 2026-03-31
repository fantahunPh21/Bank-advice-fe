import React, { useState } from 'react';
import { Table, Card, Button, Form, Input, InputNumber, Select, Space, Modal, message, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useMaterials } from '../api/useMaterials';
import MainLayout from '../layouts/MainLayout';
import { API_BASE_URL } from '../api/config';

const { Option } = Select;
const { Title } = Typography;
const uomOptions = ['PIECE', 'KG', 'TON', 'LITER', 'METER'];

const MaterialManagement = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { content: materials, pageable, loading } = useMaterials({ pageNumber: page - 1, pageSize });

  const columns = [
    { title: 'ID', dataIndex: 'materialId', key: 'materialId' },
    { title: 'Material Name', dataIndex: 'materialName', key: 'materialName' },
    { title: 'Unit of Measure', dataIndex: 'uom', key: 'uom' },
    { title: 'Quantity', dataIndex: 'quantity', key: 'quantity' },
    { title: 'Price', dataIndex: 'price', key: 'price' },
    { title: 'Description', dataIndex: 'description', key: 'description' },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button 
            icon={<EditOutlined />} 
            onClick={() => {
              setEditingMaterial(record);
              setEditModalVisible(true);
              editForm.setFieldsValue(record);
            }}
          />
          <Button 
            icon={<DeleteOutlined />} 
            danger 
            onClick={() => handleDeleteMaterial(record)}
          />
        </Space>
      )
    }
  ];

  const handleAddMaterial = async (values) => {
    try {
      const res = await fetch(`${API_BASE_URL.replace(':8090', ':8089')}/customer-engagement-service/api/v1/materials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      });
      if (!res.ok) throw new Error('Failed to add material');
      message.success('Material added successfully');
      setModalVisible(false);
      form.resetFields();
      window.location.reload();
    } catch (e) {
      message.error(e.message || 'Failed to add material');
    }
  };

  const handleEditMaterial = async (values) => {
    try {
      const res = await fetch(`${API_BASE_URL.replace(':8090', ':8089')}/customer-engagement-service/api/v1/materials/${editingMaterial.materialId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      });
      if (!res.ok) throw new Error('Failed to update material');
      message.success('Material updated successfully');
      setEditModalVisible(false);
      setEditingMaterial(null);
      editForm.resetFields();
      window.location.reload();
    } catch (e) {
      message.error(e.message || 'Failed to update material');
    }
  };

  const handleDeleteMaterial = (material) => {
    Modal.confirm({
      title: 'Delete Material',
      content: `Are you sure you want to delete "${material.materialName}"?`,
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          const res = await fetch(`${API_BASE_URL.replace(':8090', ':8089')}/customer-engagement-service/api/v1/materials/${material.materialId}`, {
            method: 'DELETE'
          });
          if (!res.ok) throw new Error('Failed to delete material');
          message.success('Material deleted successfully');
          window.location.reload();
        } catch (e) {
          message.error(e.message || 'Failed to delete material');
        }
      }
    });
  };

  return (
    <MainLayout selectedKey="settings">
      <div className="page-wrapper">
        <Title level={2}>Material Management</Title>
        <Card style={{ borderRadius: 10, boxShadow: '0 6px 18px rgba(0,0,0,0.06)' }}>
          <Button type="primary" onClick={() => setModalVisible(true)} style={{ marginBottom: 16 }}>
            <PlusOutlined /> Add Material
          </Button>
          <Table
            columns={columns}
            dataSource={materials}
            rowKey="materialId"
            loading={loading}
            pagination={{
              current: page,
              pageSize,
              total: pageable?.totalElements,
              onChange: (p, ps) => { setPage(p); setPageSize(ps); },
              showSizeChanger: true,
            }}
          />
        </Card>

        <Modal
          open={modalVisible}
          title="Add Material"
          onCancel={() => setModalVisible(false)}
          footer={null}
        >
          <Form form={form} layout="vertical" onFinish={handleAddMaterial}>
            <Form.Item name="materialName" label="Material Name" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="uom" label="Unit of Measure" rules={[{ required: true }]}>
              <Select>
                {uomOptions.map(u => <Option key={u} value={u}>{u}</Option>)}
              </Select>
            </Form.Item>
            <Form.Item name="quantity" label="Quantity" rules={[{ required: true }]}>
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="description" label="Description">
              <Input />
            </Form.Item>
            <Form.Item name="price" label="Price" rules={[{ required: true }]}>
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
            <Space style={{ display: 'flex', justifyContent: 'end' }}>
              <Button onClick={() => setModalVisible(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit">Add</Button>
            </Space>
          </Form>
        </Modal>

        <Modal
          open={editModalVisible}
          title="Edit Material"
          onCancel={() => { setEditModalVisible(false); setEditingMaterial(null); }}
          footer={null}
        >
          <Form form={editForm} layout="vertical" onFinish={handleEditMaterial}>
            <Form.Item name="materialName" label="Material Name" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="uom" label="Unit of Measure" rules={[{ required: true }]}>
              <Select>
                {uomOptions.map(u => <Option key={u} value={u}>{u}</Option>)}
              </Select>
            </Form.Item>
            <Form.Item name="quantity" label="Quantity" rules={[{ required: true }]}>
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="description" label="Description">
              <Input />
            </Form.Item>
            <Form.Item name="price" label="Price" rules={[{ required: true }]}>
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
            <Space style={{ display: 'flex', justifyContent: 'end' }}>
              <Button onClick={() => { setEditModalVisible(false); setEditingMaterial(null); }}>Cancel</Button>
              <Button type="primary" htmlType="submit">Update</Button>
            </Space>
          </Form>
        </Modal>
      </div>
    </MainLayout>
  );
};

export default MaterialManagement;
