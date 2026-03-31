import React, { useState } from 'react';
import { Modal, Button, Space, Descriptions, Divider, List, Card, Row, Col, Typography, Tag } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import SecureImage from '../components/SecureImage';
import TransactionOtpDialog from '../components/TransactionOtpDialog';
import { useAuth } from '../auth/AuthProvider';
import { ROLES } from '../api/role-config';
import { usePaymentRecords } from '../api/usePaymentRecords';
import { ConfirmationDialog } from '../components/ConfirmationDialog';

const { Text } = Typography;

/**
 * A modal dialog that displays the details of a specific payment record,
 * including all transaction lines and their associated slips.
 */
const RecordDetailsDialog = ({ open, onCancel, record }) => {
  const { user } = useAuth();
  const { requestLineOtp, verifyLineAction } = usePaymentRecords();
  
  // OTP State
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [otpActionType, setOtpActionType] = useState("confirm"); // "confirm" | "reject"
  const [selectedLine, setSelectedLine] = useState(null);
  const [isRequestingOtp, setIsRequestingOtp] = useState(false);

  // Confirmation Alert State
  const [isConfirmAlertOpen, setIsConfirmAlertOpen] = useState(false);
  const [confirmPayload, setConfirmPayload] = useState({ title: '', description: '', type: 'selected' });

  if (!record) return null;

  const userRole = user?.role?.toUpperCase();
  const isFinanceOrAdmin = userRole === ROLES.FINANCE || userRole === ROLES.ADMIN;

  const handleAction = (line, type) => {
    setSelectedLine(line);
    setOtpActionType(type);
    
    if (type === 'confirm') {
      setConfirmPayload({
        title: 'Confirm Transaction Line',
        description: `Are you sure you want to confirm transaction line ${line.referenceId}? This will require OTP verification.`,
        type: 'selected'
      });
      setIsConfirmAlertOpen(true);
    } else {
      // Rejection still goes straight to OTP since it needs remarks anyway
      initiateOtp(line, type);
    }
  };

  const initiateOtp = async (line, type) => {
    setSelectedLine(line);
    setIsRequestingOtp(true);
    const success = await requestLineOtp(line.paymentRecordLineId, type, line.referenceId, record.paymentRecordsId);
    setIsRequestingOtp(false);
    if (success) {
      setIsOtpModalOpen(true);
    }
  };

  const handleAlertConfirm = async () => {
    setIsConfirmAlertOpen(false);
    initiateOtp(selectedLine, 'confirm');
  };

  const handleVerifyOtp = async (otpCode, remarks) => {
    const success = await verifyLineAction(selectedLine.paymentRecordLineId, otpActionType, otpCode, remarks, record.paymentRecordsId);
    if (success) {
      setIsOtpModalOpen(false);
    }
    return success;
  };

  return (
    <Modal
      title="Payment Record Details"
      open={open}
      onCancel={onCancel}
      footer={[
        <Button key="close" onClick={onCancel}>
          Close
        </Button>
      ]}
      width={700}
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Descriptions title="General Information" bordered column={2}>
          <Descriptions.Item label="Record ID">{record.paymentRecordsId}</Descriptions.Item>
          <Descriptions.Item label="Customer">{record.customerName}</Descriptions.Item>
          <Descriptions.Item label="Total Amount">Br. {Number(record.amountPaid || 0).toLocaleString()}</Descriptions.Item>
          <Descriptions.Item label="Sales Person">{record.salesPerson || 'N/A'}</Descriptions.Item>
          <Descriptions.Item label="Confirmed for Shop">{record.confirmedToShop || 'N/A'}</Descriptions.Item>
          <Descriptions.Item label="Confirmation Status">
            <Tag color={record.confirmationStatus === "CONFIRMED" ? "success" : "processing"}>
              {record.confirmationStatus || 'REQUESTED'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Description" span={2}>{record.description || 'No description provided'}</Descriptions.Item>
        </Descriptions>

        <Divider orientation="left" style={{ margin: '8px 0' }}>Transaction Details & Slips</Divider>
        
        {record.paymentRecordLine && Array.isArray(record.paymentRecordLine) && record.paymentRecordLine.length > 0 ? (
          <List
            itemLayout="horizontal"
            dataSource={record.paymentRecordLine}
            renderItem={(line, index) => (
              <Card 
                size="small" 
                title={`Line #${index + 1}: ${line.referenceId || 'N/A'}`}
                extra={
                  <Space>
                    <Tag 
                      color={
                        line.status?.toUpperCase() === "CONFIRMED" ? "success" : 
                        line.status?.toUpperCase() === "REJECTED" ? "error" : 
                        line.status?.toUpperCase() === "PENDING" ? "warning" : "processing"
                      }
                      style={{ borderRadius: '4px' }}
                    >
                      {line.status || "REQUESTED"}
                    </Tag>
                    <Text strong>Br. {Number(line.amountPaid || 0).toLocaleString()}</Text>
                  </Space>
                }
                style={{ marginBottom: 16, border: '1px solid #f0f0f0' }}
                actions={isFinanceOrAdmin ? [
                  <Button 
                    key="confirm"
                    type="primary"
                    style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                    icon={<CheckCircleOutlined />} 
                    onClick={() => handleAction(line, 'confirm')}
                    loading={isRequestingOtp && selectedLine?.paymentRecordLineId === line.paymentRecordLineId && otpActionType === 'confirm'}
                    disabled={
                      line.status?.toUpperCase() === "CONFIRMED" || 
                      line.status?.toUpperCase() === "REJECTED"
                    }
                  >
                    Confirm Transaction
                  </Button>,
                  <Button 
                    key="reject"
                    type="primary"
                    danger
                    icon={<CloseCircleOutlined />} 
                    onClick={() => handleAction(line, 'reject')}
                    loading={isRequestingOtp && selectedLine?.paymentRecordLineId === line.paymentRecordLineId && otpActionType === 'reject'}
                    disabled={line.status?.toUpperCase() === "CONFIRMED" || line.status?.toUpperCase() === "REJECTED"}
                  >
                    Reject Transaction
                  </Button>
                ] : []}
              >
                <Row gutter={16}>
                  <Col span={16}>
                    <Descriptions size="small" column={1}>
                      <Descriptions.Item label="Company">{line.companyName || 'N/A'}</Descriptions.Item>
                      <Descriptions.Item label="Bank">{line.bankAccount?.bankName || line.bankName || 'N/A'}</Descriptions.Item>
                      <Descriptions.Item label="Debit">{line.debitAccountName} ({line.debitAccountNo})</Descriptions.Item>
                      <Descriptions.Item label="Credit">{line.creditAccountName} ({line.creditAccountNo})</Descriptions.Item>
                      <Descriptions.Item label="Remark">{line.remark || 'No remark'}</Descriptions.Item>
                      <Descriptions.Item label="Date">{line.transactionDate ? new Date(line.transactionDate).toLocaleDateString() : 'N/A'}</Descriptions.Item>
                    </Descriptions>
                  </Col>
                  <Col span={8} style={{ textAlign: 'right' }}>
                    {line.images ? (() => {
                      let imageList = [];
                      try {
                        const parsed = JSON.parse(line.images);
                        imageList = Array.isArray(parsed) ? parsed : [line.images];
                      } catch (e) {
                        imageList = [line.images];
                      }

                      return (
                        <Space wrap size="small">
                          {imageList.map((img, i) => (
                            <div key={i} style={{ textAlign: 'center', marginBottom: 8 }}>
                              <SecureImage 
                                imageName={img} 
                                style={{ width: 100, height: 100, borderRadius: 8 }}
                                alt={`Slip ${i+1} for ${line.referenceId}`}
                              />
                            </div>
                          ))}
                          {imageList.length > 0 && (
                            <div style={{ width: '100%', marginTop: -4 }}>
                              <Text type="secondary" style={{ fontSize: '11px' }}>Click to preview</Text>
                            </div>
                          )}
                        </Space>
                      );
                    })() : (
                      <div style={{ 
                        height: 100, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        background: '#fafafa',
                        borderRadius: '8px',
                        border: '1px dashed #d9d9d9'
                      }}>
                        <Text type="secondary">No Image</Text>
                      </div>
                    )}
                  </Col>
                </Row>
              </Card>
            )}
          />
        ) : (
          <div style={{ textAlign: 'center', padding: '24px', background: '#fafafa', borderRadius: '8px' }}>
            <Text type="secondary">No detailed transaction lines found for this record.</Text>
          </div>
        )}
      </Space>

      <TransactionOtpDialog
        open={isOtpModalOpen}
        onOpenChange={setIsOtpModalOpen}
        onVerify={handleVerifyOtp}
        actionType={otpActionType}
        transactionInfo={{
          referenceId: selectedLine?.referenceId,
          amount: selectedLine?.amountPaid,
          customerName: record.customerName
        }}
      />

      <ConfirmationDialog
        open={isConfirmAlertOpen}
        onOpenChange={setIsConfirmAlertOpen}
        title={confirmPayload.title}
        description={confirmPayload.description}
        onConfirm={handleAlertConfirm}
        isConfirmationInProgress={isRequestingOtp}
      />
    </Modal>
  );
};

export default RecordDetailsDialog;
