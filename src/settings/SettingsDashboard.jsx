import React from 'react'
import { Card, Button, Typography } from 'antd'
import { Link } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'

const { Title } = Typography

const SettingsDashboard = () => {
  return (
    <MainLayout selectedKey="settings">
      <div className="page-wrapper">
        <Title level={2}>Settings</Title>
        <Card style={{ borderRadius: 10, boxShadow: '0 6px 18px rgba(0,0,0,0.06)' }}>
          <Link to="/settings/materials">
            <Button type="primary" size="large">Material Management</Button>
          </Link>
        </Card>
      </div>
    </MainLayout>
  )
}

export default SettingsDashboard
