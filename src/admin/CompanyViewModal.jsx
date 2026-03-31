import React from 'react';
import { Modal, Button, Descriptions, Space, Tag, Typography, Divider, Table } from 'antd';
import SecureImage from '../components/SecureImage';

const { Text, Title } = Typography;

/**
 * A modal dialog that displays detailed information about a company,
 * including its logo, contact info, and linked bank accounts.
 */
const CompanyViewModal = ({ open, onCancel, company }) => {
  if (!company) return null;

  const bankColumns = [
    { title: 'Bank Name', dataIndex: 'bankName', key: 'bankName' },
    { title: 'Account Number', dataIndex: 'accountNumber', key: 'accountNumber' },
    { title: 'Account Holder', dataIndex: 'accountHolder', key: 'accountHolder' },
  ];

  return (
    <Modal
      title={null}
      open={open}
      onCancel={onCancel}
      footer={[
        <Button key="close" type="primary" onClick={onCancel}>
          Close
        </Button>
      ]}
      width={700}
      centered
    >
      <div style={{ padding: '10px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
          {company.logo ? (
            <SecureImage 
              imageName={company.logo} 
              style={{ width: 80, height: 80, borderRadius: 12, marginRight: 20 }}
              alt="Company Logo"
            />
          ) : (
            <div style={{ 
              width: 80, 
              height: 80, 
              borderRadius: 12, 
              background: '#f0f2f5', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              marginRight: 20
            }}>
              <Text type="secondary">No Logo</Text>
            </div>
          )}
          <div>
            <Title level={3} style={{ margin: 0 }}>{company.companyName}</Title>
            <Text type="secondary">{company.companyEmail}</Text>
          </div>
        </div>

        <Descriptions title="Company Details" bordered column={2} size="small">
          <Descriptions.Item label="Contact Phone">{company.companyPhoneNumber || 'N/A'}</Descriptions.Item>
          <Descriptions.Item label="TIN Number">{company.tinNumber || 'N/A'}</Descriptions.Item>
          <Descriptions.Item label="Address" span={2}>{company.companyAddress || 'N/A'}</Descriptions.Item>
        </Descriptions>

        <Divider orientation="left">Bank Accounts</Divider>
        <Table 
          dataSource={company.bankAccount || []} 
          columns={bankColumns} 
          pagination={false} 
          size="small"
          rowKey="bankAccountId"
          locale={{ emptyText: "No bank accounts registered" }}
        />
      </div>
    </Modal>
  );
};

export default CompanyViewModal;
