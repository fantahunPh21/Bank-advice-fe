import React, { useState, useEffect, useRef } from 'react'
import { Input, Button, Form, message, Typography, Space } from 'antd'
import { useLocation, useNavigate } from 'react-router-dom'
import { API_BASE_URL } from '../api/config'
import { useAuth } from './AuthProvider'
import { SafetyCertificateOutlined } from '@ant-design/icons'
import './auth.css'

const { Title, Text, Paragraph } = Typography

const OtpVerification = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { username, from = '/dashboard' } = location.state || {}
  const auth = useAuth()
  const inputRefs = useRef([])

  // Redirect if no username in state
  useEffect(() => {
    if (!username) {
      console.log("No username found in state, redirecting to login");
      navigate('/login')
    }
  }, [username, navigate])

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return // Only allow digits

    const newOtp = [...otp]
    newOtp[index] = value.slice(-1) // Only take the last digit
    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < 5) {
      if (inputRefs.current[index + 1]) {
        inputRefs.current[index + 1].focus()
      }
    }
  }

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      if (inputRefs.current[index - 1]) {
        inputRefs.current[index - 1].focus()
      }
    }
  }

  const handlePaste = (e) => {
    const pasteData = e.clipboardData.getData('text').slice(0, 6).split('')
    if (pasteData.every(char => /^\d$/.test(char))) {
      const newOtp = [...otp]
      pasteData.forEach((char, i) => {
        if (i < 6) newOtp[i] = char
      })
      setOtp(newOtp)
      // Focus the last filled input or the first empty one
      const nextIndex = Math.min(pasteData.length, 5)
      if (inputRefs.current[nextIndex]) {
        inputRefs.current[nextIndex].focus()
      }
    }
    e.preventDefault()
  }

  const handleVerify = async () => {
    const otpCode = otp.join('')
    if (otpCode.length !== 6) {
      message.warning('Please enter the complete 6-digit code')
      return
    }
    
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/auth/verify-login-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: username, otpCode })
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.message || 'Invalid verification code. Please try again.')
      }
      
      const token = data.token || data.content?.token
      const user = data.user || data.content || null
      
      if (token) {
        auth.login({ token, user })
        message.success('Account verified successfully!')
        navigate(from, { replace: true })
      } else {
        throw new Error('Verification successful but no access token received.')
      }
    } catch (e) {
      message.error(e.message || 'Verification failed')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setResending(true)
    try {
      const res = await fetch(`${API_BASE_URL}/auth/resend-login-otp?email=${encodeURIComponent(username)}`)
      if (!res.ok) throw new Error('Failed to resend code')
      message.success('A new verification code has been sent to your email.')
    } catch (e) {
      message.error(e.message || 'Failed to resend code')
    } finally {
      setResending(false)
    }
  }

  if (!username) return null;

  return (
    <div className="auth-container">
      <div className="auth-wrapper" style={{ width: '450px', height: 'auto', minHeight: '520px', padding: '48px', flexDirection: 'column', background: 'rgba(15, 23, 42, 0.9)' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="logo-badge" style={{ 
            width: 64, 
            height: 64, 
            borderRadius: '16px', 
            background: 'white', 
            display: 'inline-flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            marginBottom: 24,
            boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
          }}>
            <SafetyCertificateOutlined style={{ fontSize: 32, color: '#1d4ed8' }} />
          </div>
          <Title level={2} style={{ color: 'white', margin: 0, fontWeight: 700 }}>Security Verification</Title>
          <Paragraph style={{ color: '#94a3b8', marginTop: 16 }}>
            For your protection, we've sent a 6-digit code to <br/>
            <Text strong style={{ color: '#3b82f6' }}>{username}</Text>
          </Paragraph>
        </div>

        <Form onFinish={handleVerify} layout="vertical" style={{ marginTop: 24 }}>
          <div className="otp-inputs-wrapper">
            {otp.map((digit, index) => (
              <Input
                key={index}
                ref={el => inputRefs.current[index] = el}
                value={digit}
                onChange={e => handleChange(index, e.target.value)}
                onKeyDown={e => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                className="otp-digit"
                autoFocus={index === 0}
                autoComplete="one-time-code"
                maxLength={1}
              />
            ))}
          </div>
          
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={loading} 
            block 
            size="large"
            disabled={otp.join('').length !== 6}
            style={{ 
              marginTop: 32, 
              height: 48, 
              borderRadius: 12, 
              background: 'linear-gradient(to right, #2563eb, #7c3aed)', 
              border: 'none', 
              fontWeight: 600,
              boxShadow: '0 10px 20px rgba(37, 99, 235, 0.2)'
            }}
          >
            Verify & Continue
          </Button>
          
          <div style={{ textAlign: 'center', marginTop: 32 }}>
            <Text style={{ color: '#64748b' }}>Didn't receive the code? </Text>
            <Button 
              type="link" 
              onClick={handleResend} 
              loading={resending}
              style={{ padding: 0, fontWeight: 600, color: '#3b82f6' }}
            >
              Resend Now
            </Button>
          </div>
          
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <Button 
              type="text" 
              onClick={() => navigate('/login')} 
              style={{ color: '#64748b', fontSize: 13 }}
            >
              ← Back to login
            </Button>
          </div>
        </Form>
      </div>
    </div>
  )
}

export default OtpVerification
