import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Space, 
  Input, 
  Modal, 
  Form, 
  Typography, 
  Card, 
  Divider, 
  Upload, 
  message, 
  Row, 
  Col,
  Tag
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  SearchOutlined, 
  UploadOutlined,
  BankOutlined,
  EnvironmentOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { useCompanies } from '../api/useCompanies';
import { useFileUpload } from '../api/useFileUpload';
import { useAuth } from '../auth/AuthProvider';
import MainLayout from '../layouts/MainLayout';
import SecureImage from '../components/SecureImage';
import CompanyViewModal from './CompanyViewModal';

const { Title, Text } = Typography;

const Companies = () => {
  const {
    companies,
    isLoading,
    totalItems,
    currentPage,
    pageSize,
    searchQuery,
    setSearchQuery,
    handleTableChange,
    addCompany,
    updateCompany,
    deleteCompany,
    updateAccount,
    updateSingleAccount
  } = useCompanies();

  const { uploadFile, loading: uploading } = useFileUpload();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [viewingCompany, setViewingCompany] = useState(null);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);

  const showModal = (company = null) => {
    setEditingCompany(company);
    if (company) {
      // Format bank accounts for the form
      const bankAccounts = Array.isArray(company.bankAccount) && company.bankAccount.length > 0
        ? company.bankAccount.map(acc => ({
            bankAccountId: acc.bankAccountId,
            bankName: acc.bankName,
            accountNumber: acc.accountNumber,
            accountHolder: acc.accountHolder
          }))
        : [{ bankName: '', accountNumber: '', accountHolder: '' }];

      form.setFieldsValue({
        companyName: company.companyName,
        companyEmail: company.companyEmail,
        companyPhone: company.companyPhone,
        location: company.location || '',
        tinNumber: company.tinNumber || company.tin || '',
        bankAccount: bankAccounts
      });
      
      // Set file list if logo exists
      if (company.logo) {
        setFileList([{
          uid: '-1',
          name: company.logo,
          status: 'done',
          url: company.logo 
        }]);
      } else {
        setFileList([]);
      }
    } else {
      form.resetFields();
      form.setFieldsValue({ bankAccount: [{ bankName: '', accountNumber: '', accountHolder: '' }] });
      setFileList([]);
    }
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingCompany(null);
    form.resetFields();
    setFileList([]);
  };

  const onFinish = async (values) => {
    try {
      let logoUrl = editingCompany?.logo || '';
      
      // 1. Handle Logo Upload if a new file is selected
      if (fileList.length > 0 && fileList[0].originFileObj) {
        const uploadResult = await uploadFile(fileList[0].originFileObj, values.companyEmail);
        logoUrl = typeof uploadResult === 'string' ? uploadResult : (uploadResult?.fileName || uploadResult?.id || logoUrl);
      }

      const payload = {
        companyName: values.companyName,
        companyEmail: values.companyEmail,
        companyPhone: values.companyPhone,
        location: values.location,
        tinNumber: values.tinNumber,
        logo: logoUrl,
        bankAccount: values.bankAccount || []
      };

      // Check if ONLY accounts changed (when editing)
      const isOnlyAccountChange = editingCompany && 
        editingCompany.companyName === payload.companyName &&
        editingCompany.companyEmail === payload.companyEmail &&
        editingCompany.companyPhone === payload.companyPhone &&
        (editingCompany.location || '') === (payload.location || '') &&
        (editingCompany.tinNumber || editingCompany.tin || '') === (payload.tinNumber || '') &&
        editingCompany.logo === payload.logo;

      let result;
      if (editingCompany) {
        if (isOnlyAccountChange) {
          const originalAccounts = editingCompany.bankAccount || [];
          const currentAccounts = payload.bankAccount;

          // If count changed (addition or deletion), use the full update endpoint
          if (originalAccounts.length !== currentAccounts.length) {
            const success = await updateAccount(editingCompany.companyId, currentAccounts);
            if (success) {
              message.success("Bank accounts updated successfully");
              setIsModalVisible(false);
              form.resetFields();
              return;
            }
            result = success;
          } else {
            // Count is same, check for individual edits
            let allSuccess = true;
            let anyChange = false;

            for (const acc of currentAccounts) {
              if (acc.bankAccountId) {
                const original = originalAccounts.find(oa => oa.bankAccountId === acc.bankAccountId);
                const hasChanged = !original || 
                  original.bankName !== acc.bankName ||
                  original.accountNumber !== acc.accountNumber ||
                  original.accountHolder !== acc.accountHolder;

                if (hasChanged) {
                  anyChange = true;
                  const success = await updateSingleAccount(editingCompany.companyId, acc);
                  if (!success) allSuccess = false;
                }
              } else {
                anyChange = true;
                const success = await updateAccount(editingCompany.companyId, currentAccounts);
                if (!success) allSuccess = false;
                break; 
              }
            }

            if (!anyChange) {
              setIsModalVisible(false);
              form.resetFields();
              return;
            }

            if (allSuccess) {
              message.success("Bank accounts updated successfully");
              setIsModalVisible(false);
              form.resetFields();
              return;
            }
            result = allSuccess;
          }
        } else {
          // Full update if company details changed
          payload.companyId = editingCompany.companyId;
          result = await updateCompany(payload);
          
          if (result && payload.bankAccount.length > 0) {
            await updateAccount(editingCompany.companyId, payload.bankAccount);
          }
        }
      } else {
        console.log("New Company Create Path");
        result = await addCompany(payload);
      }

      if (result) {
        handleCancel();
      }
    } catch (e) {
      console.error("Submit Error:", e);
      message.error("An error occurred while saving the company");
    }
  };

  const columns = [
    {
      title: 'Company Name',
      dataIndex: 'companyName',
      key: 'companyName',
      render: (text, record) => (
        <Space>
          {record.logo && (
            <SecureImage 
              imageName={record.logo} 
              style={{ width: 32, height: 32, borderRadius: 4 }} 
              alt="logo" 
            />
          )}
          <Text strong>{text}</Text>
        </Space>
      )
    },
    {
      title: 'Contact Information',
      key: 'contact',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text type="secondary" size="small">{record.companyEmail}</Text>
          <Text type="secondary" size="small">{record.companyPhone}</Text>
        </Space>
      )
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
      render: (text) => text || <Text type="secondary">N/A</Text>
    },
    {
      title: 'TIN',
      dataIndex: 'tinNumber',
      key: 'tinNumber',
      render: (text, record) => text || record.tin || <Text type="secondary">N/A</Text>
    },
    {
      title: 'Bank Accounts',
      dataIndex: 'bankAccount',
      key: 'bankAccount',
      render: (accounts) => (
        <Space wrap>
          {Array.isArray(accounts) && accounts.map((acc, idx) => (
            <Tag color="cyan" key={idx} icon={<BankOutlined />}>
              {acc.bankName}
            </Tag>
          ))}
          {(!accounts || accounts.length === 0) && <Text type="secondary">-</Text>}
        </Space>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="text" 
            icon={<EyeOutlined />} 
            onClick={() => {
              setViewingCompany(record);
              setIsViewModalVisible(true);
            }} 
          />
          <Button type="text" color="primary" variant="subtle" icon={<EditOutlined />} onClick={() => showModal(record)} />
          <Button type="text" danger icon={<DeleteOutlined />} onClick={() => {
            Modal.confirm({
              title: 'Delete Company',
              content: `Are you sure you want to delete ${record.companyName}?`,
              okText: 'Yes, Delete',
              okType: 'danger',
              onOk: () => deleteCompany(record.companyId),
            });
          }} />
        </Space>
      ),
    },
  ];

  return (
    <MainLayout selectedKey="companies">
      <Space orientation="vertical" size="large" style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title level={2} style={{ margin: 0 }}>Company Management</Title>
            <Text type="secondary">View and manage system sub-companies and their bank accounts.</Text>
          </div>
          <Button type="primary" size="large" icon={<PlusOutlined />} onClick={() => showModal()} style={{ borderRadius: 8 }}>
            Add Company
          </Button>
        </div>

        <Card style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: 'none' }}>
          <div style={{ marginBottom: 20 }}>
            <Input
              placeholder="Search companies by name, email or TIN..."
              prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ maxWidth: 400, borderRadius: 8, height: 40 }}
              allowClear
            />
          </div>
          
          <Table
            columns={columns}
            dataSource={companies}
            loading={isLoading}
            rowKey="companyId"
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
        title={<Title level={4} style={{ margin: 0 }}>{editingCompany ? "Edit Company Details" : "Register New Company"}</Title>}
        open={isModalVisible}
        onCancel={handleCancel}
        width={700}
        footer={null}
        destroyOnHidden
      >
        <Form 
          form={form} 
          layout="vertical" 
          onFinish={onFinish}
          initialValues={{ bankAccount: [{ bankName: '', accountNumber: '', accountHolder: '' }] }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="companyName" label="Company Name" rules={[{ required: !editingCompany, message: 'Required' }]}>
                <Input placeholder="e.g. Acme Corp" style={{ borderRadius: 6 }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="tinNumber" label="TIN Number" rules={[{ required: !editingCompany, message: 'Required' }]}>
                <Input placeholder="Tax Identification Number" style={{ borderRadius: 6 }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="companyEmail" label="Business Email" rules={[{ required: !editingCompany, type: 'email', message: 'Valid email required' }]}>
                <Input placeholder="contact@company.com" style={{ borderRadius: 6 }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="companyPhone" label="Phone Number" rules={[{ required: !editingCompany, message: 'Required' }]}>
                <Input placeholder="+251..." style={{ borderRadius: 6 }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={14}>
              <Form.Item name="location" label="Physical Location" rules={[{ required: !editingCompany, message: 'Required' }]}>
                <Input prefix={<EnvironmentOutlined />} placeholder="Address, City" style={{ borderRadius: 6 }} />
              </Form.Item>
            </Col>
            <Col span={10}>
              <Form.Item label="Company Logo">
                <Upload
                  listType="picture"
                  maxCount={1}
                  fileList={fileList}
                  onChange={({ fileList }) => setFileList(fileList)}
                  beforeUpload={() => false}
                >
                  <Button icon={<UploadOutlined />} style={{ width: '100%', borderRadius: 6 }}>Select Image</Button>
                </Upload>
              </Form.Item>
            </Col>
          </Row>

          <Divider titlePlacement="left"><BankOutlined /> Bank Accounts</Divider>

          <Form.List name="bankAccount">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Card 
                    key={key} 
                    size="small" 
                    style={{ marginBottom: 12, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}
                  >
                    <Row gutter={12}>
                      <Form.Item name={[name, 'bankAccountId']} hidden>
                        <Input />
                      </Form.Item>
                      <Col span={8}>
                        <Form.Item
                          {...restField}
                          name={[name, 'bankName']}
                          label="Bank Name"
                          rules={[{ required: true, message: 'Required' }]}
                        >
                          <Input placeholder="Bank Name" style={{ borderRadius: 4 }} />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item
                          {...restField}
                          name={[name, 'accountNumber']}
                          label="Account Number"
                          rules={[{ required: true, message: 'Required' }]}
                        >
                          <Input placeholder="Acc No" style={{ borderRadius: 4 }} />
                        </Form.Item>
                      </Col>
                      <Col span={7}>
                        <Form.Item
                          {...restField}
                          name={[name, 'accountHolder']}
                          label="Branch/Holder"
                          rules={[{ required: true, message: 'Required' }]}
                        >
                          <Input placeholder="Holder Name" style={{ borderRadius: 4 }} />
                        </Form.Item>
                      </Col>
                      <Col span={1}>
                        <div style={{ paddingTop: 32 }}>
                          {fields.length > 1 && (
                            <Button type="text" danger icon={<DeleteOutlined />} onClick={() => remove(name)} />
                          )}
                        </div>
                      </Col>
                    </Row>
                  </Card>
                ))}
                <Button 
                  type="dashed" 
                  onClick={() => add()} 
                  block 
                  icon={<PlusOutlined />} 
                  style={{ marginBottom: 20, borderRadius: 8, height: 40 }}
                >
                  Add Another Bank Account
                </Button>
              </>
            )}
          </Form.List>

          <div style={{ textAlign: 'right', marginTop: 24 }}>
            <Space>
              <Button onClick={handleCancel} style={{ borderRadius: 6, minWidth: 100 }}>Cancel</Button>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={isLoading || uploading}
                style={{ borderRadius: 6, minWidth: 150, background: '#1e40af' }}
              >
                {editingCompany ? "Update Company" : "Register Company"}
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>

      <CompanyViewModal 
        open={isViewModalVisible} 
        onCancel={() => setIsViewModalVisible(false)} 
        company={viewingCompany} 
      />
    </MainLayout>
  );
};

export default Companies;
