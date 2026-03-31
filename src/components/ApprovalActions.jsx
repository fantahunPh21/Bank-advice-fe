import React, { useState } from 'react'
import { Button, Space, message, Modal, Form, Input, Radio, Typography, Card, Divider } from 'antd'
import { EyeOutlined, CheckOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import { useApproveProforma } from '../api/useApproveProforma'

const { TextArea } = Input
const { Text, Title } = Typography

const ApprovalActions = ({ record, onView, onApprovalSuccess }) => {
  const { approveMarketing, approveManager, loading } = useApproveProforma()
  const [approvalModalVisible, setApprovalModalVisible] = useState(false)
  const [form] = Form.useForm()

  // Determine if the proforma is already approved based on actual API response
  const isApproved = record?.proformaStatus === 'APPROVED' || record?.approvedBy
  const isPending = record?.proformaStatus === 'PENDING'

  // Handle view button click
  const handleView = () => {
    if (onView) {
      onView(record)
    }
  }

  // Handle approve button click
  const handleApprove = () => {
    setApprovalModalVisible(true)
  }

  // Handle modal close
  const handleModalClose = () => {
    setApprovalModalVisible(false)
    form.resetFields()
  }

  // Handle approval form submission
  const handleApprovalSubmit = async (values) => {
    try {
      const { approvalType, remark } = values
      let result
      
      // Use the customerComplaintsId from the actual API response
      const proformaId = record.customerComplaintsId
      
      if (approvalType === 'marketing') {
        result = await approveMarketing(proformaId, remark || '')
      } else if (approvalType === 'manager') {
        result = await approveManager(proformaId, remark || '')
      }

      message.success(`${approvalType} approval completed successfully`)
      handleModalClose()
      
      // Notify parent component of successful approval
      if (onApprovalSuccess) {
        onApprovalSuccess(proformaId, approvalType, result)
      }
    } catch (error) {
      message.error(`Failed to complete approval: ${error.message}`)
    }
  }

  return (
    <>
      <Space size="small">
        <Button
          type="default"
          icon={<EyeOutlined />}
          size="small"
          onClick={handleView}
          style={{ borderColor: '#1890ff', color: '#1890ff' }}
        />
        
        <Button
          type="primary"
          icon={<CheckOutlined />}
          size="small"
          onClick={handleApprove}
          disabled={isApproved || loading}
          loading={loading}
          style={{ 
            background: isApproved ? '#f5f5f5' : '#52c41a',
            borderColor: isApproved ? '#d9d9d9' : '#52c41a'
          }}
        />
      </Space>

      {/* Enhanced Approval Modal */}
      <Modal
        title={
          <Space>
            <ExclamationCircleOutlined style={{ color: '#faad14' }} />
            <Title level={4} style={{ margin: 0 }}>Approve Proforma Request</Title>
          </Space>
        }
        open={approvalModalVisible}
        onCancel={handleModalClose}
        footer={null}
        width={600}
        style={{ top: 50 }}
      >
        <Card style={{ background: '#fafafa', marginBottom: 16 }}>
          <Text type="secondary">
            You are about to approve this proforma request. Please select the approval type and add any remarks if necessary.
          </Text>
        </Card>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleApprovalSubmit}
          initialValues={{ approvalType: 'marketing' }}
        >
          <Form.Item
            name="approvalType"
            label={<Text strong style={{ fontSize: '16px' }}>Approval Type</Text>}
            rules={[{ required: true, message: 'Please select approval type' }]}
          >
            <Radio.Group size="large">
              <Card style={{ marginBottom: 8 }}>
                <Radio value="marketing" disabled={isApproved}>
                  <Space>
                    <Text strong>Marketing Approval</Text>
                    {isApproved && (
                      <Text type="success" style={{ color: '#52c41a' }}>✓ Already approved</Text>
                    )}
                  </Space>
                </Radio>
              </Card>
              <Card>
                <Radio value="manager" disabled={true}>
                  <Space>
                    <Text strong>Manager Approval</Text>
                    <Text type="secondary">(Coming soon)</Text>
                  </Space>
                </Radio>
              </Card>
            </Radio.Group>
          </Form.Item>

          <Divider />

          <Form.Item
            name="remark"
            label={<Text strong style={{ fontSize: '16px' }}>Remark (Optional)</Text>}
          >
            <TextArea
              rows={4}
              placeholder="Enter any remarks or comments for this approval..."
              maxLength={500}
              showCount
              style={{ borderRadius: 8 }}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right', marginTop: 24 }}>
            <Space size="middle">
              <Button size="large" onClick={handleModalClose}>
                Cancel
              </Button>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                icon={<CheckOutlined />}
                size="large"
                style={{ background: '#52c41a', borderColor: '#52c41a', minWidth: 120 }}
              >
                Approve
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}

export default ApprovalActions