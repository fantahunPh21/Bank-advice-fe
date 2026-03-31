"use client"

import React from 'react'
import { useAuth } from '../auth/AuthProvider'
import { ROLES, ROLE_PERMISSIONS } from '../api/role-config'
import { useNavigate } from 'react-router-dom'
import { Menu, Typography } from 'antd'
import { Link, useLocation } from 'react-router-dom'
import {
  TeamOutlined,
  SettingOutlined,
  DashboardOutlined,
  FileTextOutlined,
  UserOutlined,
  LogoutOutlined,
  DollarOutlined
} from '@ant-design/icons'

const { Text, Title } = Typography

const Sidebar = ({ selected, collapsed }) => {
  const location = useLocation()
  const path = location.pathname || ''
  const { user, token, logout } = useAuth()
  const navigate = useNavigate()

  if (!token) return null
  
  const userRole = user?.role;
  const isAdmin = userRole === ROLES.ADMIN;
  const permissions = ROLE_PERMISSIONS[userRole] || ROLE_PERMISSIONS[ROLES.SALESMAN];

  const inferred = path.startsWith('/interactions') ? 'interactions'
    : path.startsWith('/reports') ? 'reports'
      : path.startsWith('/settings') ? 'settings'
        : path.startsWith('/dashboard') ? 'dashboard'
          : path.startsWith('/payments') ? 'payments'
            : path.startsWith('/companies') ? 'companies'
              : path.startsWith('/users') ? 'users'
                : path.startsWith('/roles') ? 'roles'
                  : 'dashboard'

  const activeKey = selected || inferred

  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined style={{ fontSize: '18px' }} />,
      label: <Link to="/dashboard" style={{ textDecoration: 'none' }}>Dashboard</Link>,
    },
    {
      key: 'companies',
      icon: <TeamOutlined style={{ fontSize: '18px' }} />,
      label: <Link to="/companies" style={{ textDecoration: 'none' }}>Companies</Link>,
    },
    {
      key: 'users',
      icon: <UserOutlined style={{ fontSize: '18px' }} />,
      label: <Link to="/users" style={{ textDecoration: 'none' }}>Users</Link>,
    },
    {
      key: 'roles',
      icon: <FileTextOutlined style={{ fontSize: '18px' }} />,
      label: <Link to="/roles" style={{ textDecoration: 'none' }}>Roles</Link>,
    },
    {
      key: 'payments',
      icon: <DollarOutlined style={{ fontSize: '18px' }} />,
      label: <Link to="/payments" style={{ textDecoration: 'none' }}>Payments</Link>,
    },
    {
      key: 'settings',
      icon: <SettingOutlined style={{ fontSize: '18px' }} />,
      label: <Link to="/settings" style={{ textDecoration: 'none' }}>Settings</Link>,
    }
  ].filter(item => {
    switch(item.key) {
      case 'dashboard': return permissions.canViewDashboard;
      case 'companies': return permissions.canManageCompanies;
      case 'users': return permissions.canManageUsers;
      case 'roles': return permissions.canManageRoles;
      case 'payments': return permissions.canViewPayments;
      case 'settings': return isAdmin; // Only admin for settings for now
      default: return false;
    }
  })

  return (
    <div style={{
      width: collapsed ? 80 : 220,
      height: '100vh',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 1000,
      overflow: 'hidden',
      background: 'white',
      borderRight: '1px solid #f0f0f0',
      boxShadow: '2px 0 8px rgba(0,0,0,0.06)',
      transition: 'width 0.3s ease',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Logo/Brand Section */}
      <div style={{
        padding: collapsed ? '24px 8px' : '24px 16px',
        textAlign: 'center',
        borderBottom: '1px solid #f0f0f0',
        transition: 'padding 0.3s ease',
        overflow: 'hidden',
        whiteSpace: 'nowrap'
      }}>
        <div style={{
          width: 40,
          height: 40,
          borderRadius: '8px',
          background: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto',
          padding: '4px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          border: '1px solid #f0f0f0'
        }}>
          <img
            src="/steely.jpg"
            alt="Logo"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain'
            }}
          />
        </div>
        {!collapsed && (
          <>
            <Title level={4} style={{
              color: '#262626',
              margin: '12px 0 0',
              fontSize: '16px',
              fontWeight: 600,
              opacity: 1,
              transition: 'opacity 0.2s'
            }}>
              Bank Advice
            </Title>
          </>
        )}
      </div>

      {/* Navigation Menu */}
      <div style={{ padding: '16px 0', flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        <Menu
          mode="inline"
          inlineCollapsed={collapsed}
          selectedKeys={[activeKey]}
          items={menuItems}
          style={{
            borderRight: 0,
            background: 'transparent',
            fontSize: '14px'
          }}
          theme="light"
        />
      </div>

      {/* Bottom Section */}
      <div style={{
        padding: '16px 0',
        borderTop: '1px solid #f0f0f0',
        background: '#fafafa'
      }}>
        <Menu
          mode="inline"
          inlineCollapsed={collapsed}
          style={{
            borderRight: 0,
            background: 'transparent'
          }}
          theme="light"
          items={[
            {
              key: 'logout',
              icon: <LogoutOutlined style={{ fontSize: '18px', color: '#ff4d4f' }} />,
              label: 'Logout',
              onClick: () => { logout(); navigate('/login') },
              style: {
                color: '#ff4d4f',
                borderRadius: '6px',
              }
            }
          ]}
        />

        {!collapsed && (
          <div style={{
            textAlign: 'center',
            marginTop: '12px',
            paddingTop: '12px',
            borderTop: '1px solid #f0f0f0'
          }}>
            <Text style={{
              color: '#8c8c8c',
              fontSize: '11px'
            }}>
              © 2026 Apollo
            </Text>
          </div>
        )}
      </div>
    </div>
  )
}

export default Sidebar
