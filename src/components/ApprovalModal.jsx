import React from 'react'
import { Modal, Form, Input, Radio, Button, Space, message } from 'antd'
import { CheckOutlined } from '@ant-design/icons'

const { TextArea } = Input

const ApprovalModal = ({
  visible,
  onClose,
  onSubmit,
  loading = false,
  record = null,
  title = "Approve Proforma Request"
}) => {
  const [form] = Form.useForm()

  // Determine approval status from record
  const isMarketingApproved = record?.approvalStatus?.marketing?.approved || false
  const isManagerApproved = record?.approvalStatus?.manager?.approved || false

  // Handle modal close
  const handleClose = () => {
    form.resetFields()
    if (onClose) {
      onClose()
    }
  }

  // Handle form submission
  const handleSubmit = async (values) => {
    try {
      const { approvalType, remark } = values
      
      // Validate approval type selection
      if (!approvalType) {
        message.error('Please select an approval type')
        return
      }

      // Call the onSubmit callback with form values
      if (onSubmit) {
        await onSubmit({
          approvalType,
          remark: remark || '',
          proformaId: record?.id
        })
      }

      // Reset form and close modal on successful submission
      form.resetFields()
    } catch (error) {
      // Error handling is delegated to the parent component
      console.error('Approval submission error:', error)
    }
  }

  // Handle form validation failure
  const handleSubmitFailed = (errorInfo) => {
    message.error('Please fix the form errors before submitting')
    console.error('Form validation failed:', errorInfo)
  }

  return (
    <Modal
      title={title}
      open={visible}
      onCancel={handleClose}
      footer={null}
      width={500}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        onFinishFailed={handleSubmitFailed}
        initialValues={{ approvalType: 'marketing' }}
      >
        <Form.Item
          name="approvalType"
          label="Approval Type"
          rules={[{ required: true, message: 'Please select approval type' }]}
        >
          <Radio.Group>
            <Radio value="marketing" disabled={isMarketingApproved}>
              Marketing Approval
              {isMarketingApproved && (
                <span style={{ color: 'green', marginLeft: 8 }}>
                  ✓ Already approved
                </span>
              )}
            </Radio>
            <Radio value="manager" disabled={isManagerApproved || !isMarketingApproved}>
              Manager Approval
              {isManagerApproved && (
                <span style={{ color: 'green', marginLeft: 8 }}>
                  ✓ Already approved
                </span>
              )}
              {!isMarketingApproved && !isManagerApproved && (
                <span style={{ color: 'orange', marginLeft: 8 }}>
                  (Requires marketing approval first)
                </span>
              )}
            </Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          name="remark"
          label="Remark (Optional)"
        >
          <TextArea
            rows={3}
            placeholder="Enter any remarks or comments for this approval..."
            maxLength={500}
            showCount
            disabled={loading}
          />
        </Form.Item>

        <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
          <Space>
            <Button onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              icon={<CheckOutlined />}
            >
              Approve
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default ApprovalModal