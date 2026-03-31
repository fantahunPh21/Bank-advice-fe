import React, { useState, useEffect, useRef } from 'react';
import { Modal, Button, Typography, Space, Input, Badge, message, Tag } from 'antd';
import { 
  SafetyCertificateOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined, 
  LoadingOutlined 
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

/**
 * A dialog component for verifying transaction actions via OTP.
 */
export function TransactionOtpDialog({
  open,
  onOpenChange,
  onVerify, // (otpCode) => Promise<boolean>
  title,
  description,
  transactionInfo,
  actionType, // 'confirm' | 'reject'
  isLoading = false,
}) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [remarks, setRemarks] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const inputRefs = useRef([]);

  // Reset OTP when dialog opens
  useEffect(() => {
    if (open) {
      setOtp(['', '', '', '', '', '']);
      setRemarks('');
      // Focus first input after modal animation
      setTimeout(() => {
        if (inputRefs.current[0]) inputRefs.current[0].focus();
      }, 300);
    }
  }, [open]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      if (inputRefs.current[index + 1]) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      if (inputRefs.current[index - 1]) {
        inputRefs.current[index - 1].focus();
      }
    }
  };

  const handlePaste = (e) => {
    const pasteData = e.clipboardData.getData('text').trim().slice(0, 6).split('');
    if (pasteData.every(char => /^\d$/.test(char))) {
      const newOtp = [...otp];
      pasteData.forEach((char, i) => {
        if (i < 6) newOtp[i] = char;
      });
      setOtp(newOtp);
      const nextIndex = Math.min(pasteData.length, 5);
      if (inputRefs.current[nextIndex]) {
        inputRefs.current[nextIndex].focus();
      }
    }
    e.preventDefault();
  };

  const handleVerify = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      message.warning('Please enter a 6-digit OTP code');
      return;
    }

    setIsVerifying(true);
    try {
      const success = await onVerify(otpCode, remarks);
      if (!success) {
        setOtp(['', '', '', '', '', '']);
        if (inputRefs.current[0]) inputRefs.current[0].focus();
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      setOtp(['', '', '', '', '', '']);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCancel = () => {
    setOtp(['', '', '', '', '', '']);
    setRemarks('');
    onOpenChange(false);
  };

  const defaultTitle = actionType === "confirm" 
    ? "Confirm Transaction" 
    : "Reject Transaction";
  
  const defaultDescription = "Enter the 6-digit code sent to your email to verify this action.";

  return (
    <Modal
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={450}
      centered
      destroyOnHidden
      title={
        <Space>
          <SafetyCertificateOutlined style={{ color: '#1d4ed8' }} />
          <span style={{ fontWeight: 600 }}>{title || defaultTitle}</span>
        </Space>
      }
    >
      <div style={{ paddingTop: 8 }}>
        <Paragraph type="secondary">
          {description || defaultDescription}
        </Paragraph>

        {/* Transaction Summary Card */}
        {transactionInfo && (
          <div style={{ 
            background: '#f8fafc', 
            borderRadius: '12px', 
            padding: '16px', 
            marginBottom: '24px',
            border: '1px solid #e2e8f0'
          }}>
            <Space direction="vertical" style={{ width: '100%' }} size="small">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text type="secondary">Action:</Text>
                <Tag 
                  color={actionType === 'confirm' ? 'success' : 'error'}
                  icon={actionType === 'confirm' ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                  style={{ borderRadius: '4px', margin: 0 }}
                >
                  {actionType === 'confirm' ? 'CONFIRM' : 'REJECT'}
                </Tag>
              </div>
              
              {transactionInfo.referenceId && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text type="secondary">Reference:</Text>
                  <Text strong>{transactionInfo.referenceId}</Text>
                </div>
              )}
              
              {transactionInfo.customerName && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text type="secondary">Customer:</Text>
                  <Text strong>{transactionInfo.customerName}</Text>
                </div>
              )}
              
              {transactionInfo.amount !== undefined && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text type="secondary">Amount:</Text>
                  <Text strong>Br. {Number(transactionInfo.amount).toFixed(2)}</Text>
                </div>
              )}
            </Space>
          </div>
        )}

        {/* OTP Inputs */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '10px', 
          margin: '32px 0' 
        }}>
          {otp.map((digit, index) => (
            <Input
              key={index}
              ref={el => inputRefs.current[index] = el}
              value={digit}
              onChange={e => handleChange(index, e.target.value)}
              onKeyDown={e => handleKeyDown(index, e)}
              onPaste={index === 0 ? handlePaste : undefined}
              style={{ 
                width: '45px', 
                height: '55px', 
                textAlign: 'center', 
                fontSize: '20px', 
                fontWeight: 'bold',
                borderRadius: '8px',
                border: digit ? '2px solid #2563eb' : '1px solid #d1d5db',
                background: digit ? '#eff6ff' : 'white'
              }}
              maxLength={1}
              disabled={isVerifying || isLoading}
            />
          ))}
        </div>

        {/* Remarks Field */}
        <div style={{ marginBottom: '24px' }}>
          <Text strong style={{ display: 'block', marginBottom: '8px' }}>
            Remarks {actionType === 'reject' ? '(Required)' : '(Optional)'}
          </Text>
          <Input.TextArea 
            placeholder={actionType === 'confirm' ? "Add any confirmation notes..." : "Please provide a reason for rejection..."}
            rows={3}
            value={remarks}
            onChange={e => setRemarks(e.target.value)}
            disabled={isVerifying || isLoading}
            style={{ borderRadius: '8px' }}
          />
        </div>

        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Text type="secondary" style={{ fontSize: '13px' }}>
            The code will expire in 10 minutes.
            <br />
            Check your email for the verification code.
          </Text>
        </div>

        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
          <Button 
            onClick={handleCancel} 
            disabled={isVerifying || isLoading}
            style={{ borderRadius: '8px', height: '40px', minWidth: '100px' }}
          >
            Cancel
          </Button>
          <Button 
            type="primary"
            danger={actionType === 'reject'}
            onClick={handleVerify}
            loading={isVerifying || isLoading}
            disabled={otp.join('').length !== 6 || (actionType === 'reject' && !remarks.trim())}
            style={{ 
                borderRadius: '8px', 
                height: '40px', 
                minWidth: '150px',
                background: actionType === 'confirm' ? '#1e40af' : undefined,
                border: 'none'
            }}
          >
            {actionType === 'confirm' ? 'Confirm Transaction' : 'Reject Transaction'}
          </Button>
        </Space>
      </div>
    </Modal>
  );
}

export default TransactionOtpDialog;
