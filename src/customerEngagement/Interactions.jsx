import React from 'react'
import { 
  Card, 
  Row, 
  Col, 
  Typography, 
  Space, 
  Button,
  Statistic,
  Badge
} from 'antd'
import { Link } from 'react-router-dom'
import { 
  ExclamationCircleOutlined, 
  FileTextOutlined, 
  InteractionOutlined,
  PlusOutlined,
  ArrowRightOutlined
} from '@ant-design/icons'
import MainLayout from '../layouts/MainLayout'

const { Title, Text } = Typography

const Interactions = () => {
  return (
    <MainLayout selectedKey="interactions">
      <div className="page-wrapper">
        {/* Header Section */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ marginBottom: 16 }}>
            <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
              <InteractionOutlined style={{ marginRight: 8 }} />
              Bank Interactions
            </Title>
          </div>
          <Text type="secondary" style={{ fontSize: '16px' }}>
            Create and manage bank interactions including payment requests
          </Text>
        </div>

        {/* Main Interaction Cards */}
        <Row gutter={24}>
          <Col xs={24} sm={12} lg={12}>
            <Card
              hoverable
              style={{ 
                height: '280px',
                borderRadius: 12, 
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                border: '1px solid #e8e8e8',
                background: 'linear-gradient(135deg, #f6ffed 0%, #ffffff 100%)'
              }}
              styles={{ body: { padding: '32px' } }}
            >
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  width: 80, 
                  height: 80, 
                  borderRadius: '50%', 
                  background: '#f6ffed', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  margin: '0 auto 24px',
                  border: '2px solid #b7eb8f'
                }}>
                  <FileTextOutlined style={{ fontSize: 36, color: '#52c41a' }} />
                </div>
                
                <Title level={3} style={{ margin: '0 0 12px 0', color: '#52c41a' }}>
                  Payment Request
                </Title>
                
                <Text type="secondary" style={{ fontSize: '14px', lineHeight: '1.6', display: 'block', marginBottom: 24 }}>
                  Create payment requests for different materials, track items, and manage the approval workflow efficiently.
                </Text>
                
                <Link to="/interactions/performa">
                  <Button 
                    type="primary" 
                    size="large"
                    icon={<PlusOutlined />}
                    style={{ 
                      background: '#52c41a', 
                      borderColor: '#52c41a',
                      borderRadius: 8,
                      height: 44,
                      minWidth: 160
                    }}
                  >
                    Create Request
                  </Button>
                </Link>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Quick Navigation */}
        <Card 
          style={{ 
            marginTop: 32,
            borderRadius: 12, 
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            border: '1px solid #e8e8e8'
          }}
          title={
            <Space>
              <ArrowRightOutlined style={{ color: '#1890ff' }} />
              <Text strong>Quick Navigation</Text>
            </Space>
          }
        >
          <Row gutter={16}>
            <Col xs={24} sm={12} md={8}>
              <Link to="/payments">
                <Card 
                  size="small" 
                  hoverable
                  style={{ textAlign: 'center', background: '#fafafa' }}
                >
                  <FileTextOutlined style={{ fontSize: 24, color: '#1890ff', marginBottom: 8 }} />
                  <div><Text strong>View Payments</Text></div>
                  <div><Text type="secondary" style={{ fontSize: '12px' }}>Track payment requests</Text></div>
                </Card>
              </Link>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Link to="/dashboard">
                <Card 
                  size="small" 
                  hoverable
                  style={{ textAlign: 'center', background: '#fafafa' }}
                >
                  <InteractionOutlined style={{ fontSize: 24, color: '#52c41a', marginBottom: 8 }} />
                  <div><Text strong>Dashboard</Text></div>
                  <div><Text type="secondary" style={{ fontSize: '12px' }}>Overview and analytics</Text></div>
                </Card>
              </Link>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Link to="/settings">
                <Card 
                  size="small" 
                  hoverable
                  style={{ textAlign: 'center', background: '#fafafa' }}
                >
                  <Badge status="default" />
                  <div><Text strong>Settings</Text></div>
                  <div><Text type="secondary" style={{ fontSize: '12px' }}>System configuration</Text></div>
                </Card>
              </Link>
            </Col>
          </Row>
        </Card>
      </div>
    </MainLayout>
  )
}

export default Interactions
