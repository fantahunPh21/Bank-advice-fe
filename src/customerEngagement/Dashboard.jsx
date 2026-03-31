import React, { useState } from 'react'
import { PaymentRecordsTable } from './PaymentRecordsTable'
import AddTransactionModal from './AddTransactionModal'
import MainLayout from '../layouts/MainLayout'
import { Button, Typography, Input, Space, Row, Col, Card } from 'antd'
import { SearchOutlined, PlusOutlined } from '@ant-design/icons'
import { usePaymentRecords } from '../api/usePaymentRecords'
import { RoleBasedTransactionWrapper } from '../components/RoleBasedTransactionWrapper'

const { Title, Text } = Typography

const makeSpark = (values, width = 120, height = 32) => {
  if (!values || values.length === 0) return null
  const max = Math.max(...values, 1) // Avoid division by zero
  const points = values.map((v, i) => {
    const x = (i / (values.length - 1)) * width
    const y = height - (v / max) * height
    return `${x},${y}`
  }).join(' ')
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <polyline points={points} fill="none" stroke="#7539FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const Dashboard = () => {
  const { records: payments, isLoading, handleSearch, searchQuery, refreshRecords } = usePaymentRecords()
  const [isModalVisible, setIsModalVisible] = useState(false)

  // Calculate metrics
  const approvedCount = payments.filter(p => p.status === 'APPROVED' || p.confirmationStatus === 'CONFIRMED').length
  const paymentsTrend = [1,2,1,3,2,4,2,3,1,2]

  return (
    <MainLayout selectedKey="dashboard">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>Dashboard</Title>
        <Space size="middle">
          <Input 
            placeholder="Search records..." 
            prefix={<SearchOutlined />} 
            style={{ width: 300, borderRadius: 8 }}
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
          <RoleBasedTransactionWrapper requiredAction="add">
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={() => setIsModalVisible(true)}
              style={{ borderRadius: 8, background: '#1d4ed8', height: '40px', display: 'flex', alignItems: 'center' }}
            >
              Add Transaction
            </Button>
          </RoleBasedTransactionWrapper>
        </Space>
      </div>

      <Row gutter={16}>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: 'none' }}>
            <Space orientation="vertical" style={{ width: '100%' }}>
              <Text type="secondary">Confirmed Payments</Text>
              <Title level={3} style={{ margin: 0 }}>{approvedCount}</Title>
              <div style={{ marginTop: 8 }}>{makeSpark(paymentsTrend)}</div>
            </Space>
          </Card>
        </Col>

        <Col xs={24} style={{ marginTop: 24 }}>
          <Card 
            title={<span style={{ fontWeight: 700 }}>Payment Records</span>}
            style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: 'none' }}
            styles={{ body: { padding: '0 0' } }}
          >
            <PaymentRecordsTable />
          </Card>
        </Col>
      </Row>

      <AddTransactionModal 
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onSuccess={refreshRecords}
      />
    </MainLayout>
  )
}

export default Dashboard
