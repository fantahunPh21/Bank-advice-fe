import React from 'react'
import { Typography } from 'antd'
import { FileTextOutlined } from '@ant-design/icons'
import MainLayout from '../layouts/MainLayout'
import { PaymentRecordsTable } from './PaymentRecordsTable'

const { Title, Text } = Typography

const ProformaList = () => {
  return (
    <MainLayout selectedKey="payments">
      <div className="page-wrapper">
        {/* Header Section */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ marginBottom: 16 }}>
            <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
              <FileTextOutlined style={{ marginRight: 8 }} />
              Payment Records
            </Title>
          </div>
          <Text type="secondary">Manage and confirm bank payment records</Text>
        </div>

        <PaymentRecordsTable />
      </div>
    </MainLayout>
  )
}

export default ProformaList
