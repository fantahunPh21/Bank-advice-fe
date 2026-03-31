"use client"

import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  BellOutlined,
  ExpandOutlined,
  MenuOutlined,
  SearchOutlined,
  LogoutOutlined,
  UserOutlined,
  SettingOutlined,
  DownOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined
} from '@ant-design/icons'
import {
  Input,
  Badge,
  Avatar,
  Dropdown,
  Space,
  Typography,
  Button,
  Breadcrumb,
  Divider
} from 'antd'
import { useAuth } from '../auth/AuthProvider'
import { useLocation } from 'react-router-dom'

const { Text } = Typography
const { Search } = Input

const Header = ({ onToggleSidebar, collapsed }) => {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const auth = useAuth()
  const navigate = useNavigate()
  const location = useLocation()


  const handleLogout = async () => {
    try {
      auth.logout()
      navigate('/login')
    } catch (err) {
      console.error('Logout failed', err)
    }
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen?.()
      setIsFullscreen(false)
    }
  }

  // Get current page title based on route
  const getPageTitle = () => {
    const path = location.pathname
    if (path.startsWith('/dashboard')) return 'Dashboard'
    if (path.startsWith('/payments')) return 'Bank Advices'
    if (path.startsWith('/companies')) return 'Companies'
    if (path.startsWith('/users')) return 'User Management'
    if (path.startsWith('/roles')) return 'Role Management'
    if (path.startsWith('/settings')) return 'Settings'
    return 'Bank Advice'
  }

  // User dropdown menu
  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
      onClick: () => navigate('/profile')
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
      onClick: () => navigate('/settings'),
      hidden: auth?.user?.role === 'SALESMAN' || auth?.user?.role === 'SALESPERSON'
    },
    {
      type: 'divider'
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: handleLogout,
      danger: true
    }
  ].filter(item => !item.hidden)

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  return (
    <div style={{
      height: '64px',
      background: 'white',
      borderBottom: '1px solid #f0f0f0',
      padding: '0 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      position: 'sticky',
      top: 0,
      zIndex: 999
    }}>
      {/* Left Section - Toggle & Page Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={onToggleSidebar}
          style={{
            fontSize: '18px',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '8px',
            background: '#f5f5f5'
          }}
        />
        <div>
          <Text strong style={{ fontSize: '18px', color: '#262626' }}>
            {getPageTitle()}
          </Text>
          {auth?.token && (
            <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: '2px' }}>
              Welcome back, {auth?.user?.name || 'User'}
            </div>
          )}
        </div>
      </div>

      {/* Center Section - Empty spacer */}
      <div style={{ flex: 1 }} />

      {/* Right Section - Actions & User */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {auth?.token && (
          <>


            {/* Fullscreen Toggle */}
            <Button
              type="text"
              icon={<ExpandOutlined />}
              size="middle"
              onClick={toggleFullscreen}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            />

            <Divider orientation="vertical" style={{ height: '24px' }} />

            {/* User Profile Dropdown */}
            <Dropdown
              menu={{ items: userMenuItems }}
              trigger={['click']}
              placement="bottomRight"
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                ':hover': {
                  backgroundColor: '#f5f5f5'
                }
              }}>
                <Avatar
                  size={32}
                  style={{
                    background: 'linear-gradient(135deg, #1890ff 0%, #52c41a 100%)',
                    border: '2px solid #f0f0f0'
                  }}
                  icon={<UserOutlined />}
                />
                <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.2' }}>
                  <Text strong style={{ fontSize: '14px' }}>
                    {auth?.user?.name || 'User'}
                  </Text>
                  <Text style={{ fontSize: '12px', color: '#8c8c8c' }}>
                    {auth?.user?.role || 'User'}
                  </Text>
                </div>
                <DownOutlined style={{ fontSize: '12px', color: '#8c8c8c' }} />
              </div>
            </Dropdown>
          </>
        )}
      </div>
    </div>
  )
}

export default Header
