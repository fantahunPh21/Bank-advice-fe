import React, { useState } from 'react'
import { Form, Input, Button, message, Space, Typography } from 'antd'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from './AuthProvider'
import { API_BASE_URL } from '../api/config'
import { LockOutlined, UserOutlined, ArrowRightOutlined, SafetyCertificateOutlined } from '@ant-design/icons'
import './auth.css'

const { Title, Text, Paragraph } = Typography

const Login = () => {
  const [loading, setLoading] = useState(false)
  const auth = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from || '/dashboard'

  // No automatic redirect to dashboard for logged-in users 
  // This ensures the user starts at the login page if they navigate to it

  const onFinish = async (vals) => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: vals.username, password: vals.password })
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Login failed. Please check your credentials.')
      }

      const data = await res.json()

      if (data.otpToken || data.otpRequired || (data.message && data.message.toLowerCase().includes('otp'))) {
        message.info('OTP has been sent to your registered email.')
        navigate('/otp-verification', { state: { username: vals.username, from } })
        return
      }

      auth.login({ token: data.token || data.content?.token, user: data.user || data.content })
      message.success('Welcome back!')
      navigate(from, { replace: true })
    } catch (e) {
      message.error(e.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-wrapper">

        {/* Left Branding Side */}
        <div className="auth-side-panel">
          <div style={{ position: 'absolute', top: -100, left: -100, width: 300, height: 300, background: 'rgba(59,130,246,0.05)', borderRadius: '50%' }}></div>
          <div style={{ position: 'absolute', bottom: -50, right: -50, width: 200, height: 200, background: 'rgba(59,130,246,0.03)', borderRadius: '50%' }}></div>

          <div className="logo-badge" style={{ width: '80px', height: '80px', borderRadius: '16px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '32px', boxShadow: '0 10px 20px rgba(0,0,0,0.05)' }}>
            <img src="/bank-advice/steely.jpg" alt="SteelyRMI Logo" style={{ width: '60px', height: '60px', objectFit: 'contain' }} />
          </div>

          <Title level={1} style={{ color: '#1e293b', margin: 0, fontSize: '36px', fontWeight: 800 }}>SteelyRMI</Title>
          <Paragraph style={{ color: '#475569', fontSize: '18px', marginTop: '16px', lineHeight: '1.6' }}>
            The bank advice management and financial confirmation.</Paragraph>

          <div style={{ marginTop: 'auto' }}>
            <Space direction="vertical" size="middle">

            </Space>
          </div>
        </div>

        {/* Right Form Side */}
        <div className="auth-form-side">
          <div style={{ marginBottom: '32px' }}>
            <Title level={2} style={{ color: '#1e293b', margin: 0 }}>Welcome Back</Title>
            <Text style={{ color: '#64748b' }}>Please enter your credentials to access your account</Text>
          </div>

          <Form layout="vertical" onFinish={onFinish} requiredMark={false} size="large">
            <Form.Item
              name="username"
              label="Username"
              rules={[{ required: true, message: 'username required' }]}
            >
              <Input
                prefix={<UserOutlined style={{ color: '#3b82f6' }} />}
                placeholder="Enter your username"
                className="premium-input"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="Password"
              rules={[{ required: true, message: 'password required' }]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: '#3b82f6' }} />}
                placeholder="••••••••"
                className="premium-input"
              />
            </Form.Item>

            <Form.Item style={{ marginTop: '16px' }}>
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={loading}
                icon={<ArrowRightOutlined />}
                style={{ height: '48px', borderRadius: '12px', background: 'linear-gradient(to right, #2563eb, #7c3aed)', border: 'none', fontWeight: 600 }}
              >
                Sign In to Dashboard
              </Button>
            </Form.Item>
          </Form>

          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <Text style={{ color: '#64748b' }}>
            </Text>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
