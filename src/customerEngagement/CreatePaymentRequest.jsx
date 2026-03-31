import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Form,
  Input,
  InputNumber,
  Button,
  Upload,
  message,
  Select,
  Space,
  DatePicker,
  Card,
  Typography,
  Row,
  Col,
  Steps,
  Divider,
  Alert,
  List,
  Tag,
  Modal,
  Result
} from 'antd'
import {
  InboxOutlined,
  PlusOutlined,
  DeleteOutlined,
  FileTextOutlined,
  UserOutlined,
  ShopOutlined,
  CalendarOutlined,
  DollarOutlined,
  PaperClipOutlined,
  CheckCircleOutlined,
  ArrowLeftOutlined,
  MinusCircleOutlined
} from '@ant-design/icons'
import MainLayout from '../layouts/MainLayout'
import { usePaymentRecords } from '../api/usePaymentRecords'
import { useFileUpload } from '../api/useFileUpload'
import { useAuth } from '../auth/AuthProvider'
import { useMaterials } from '../api/useMaterials'
import { Link } from 'react-router-dom'

const { TextArea } = Input
const { Option } = Select
const { List: FormList } = Form
const { Title, Text } = Typography

const PerformaRequisition = () => {
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [materialSearch, setMaterialSearch] = useState('')
  const [currentStep, setCurrentStep] = useState(0)
  const { content: materials, loading: materialsLoading } = useMaterials({ keyword: materialSearch })
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false)
  const [vatFile, setVatFile] = useState(null)
  const [licenseFile, setLicenseFile] = useState(null)
  const [requisitionFile, setRequisitionFile] = useState(null)

  const beforeUploadVat = (file) => { setVatFile(file); return false }
  const beforeUploadLicense = (file) => { setLicenseFile(file); return false }
  const beforeUploadRequisition = (file) => { setRequisitionFile(file); return false }
  const { user, token } = useAuth()
  const { addRecord, isLoading: postLoading } = usePaymentRecords()
  const { uploadFile, loading: uploadLoading } = useFileUpload()

  const loading = postLoading || uploadLoading
  const handleFinish = async (values) => {
    try {
      // Upload files if they exist
      const uploadPromises = [
        vatFile ? uploadFile(vatFile, values.customerEmail) : Promise.resolve(null),
        licenseFile ? uploadFile(licenseFile, values.customerEmail) : Promise.resolve(null),
        requisitionFile ? uploadFile(requisitionFile, values.customerEmail) : Promise.resolve(null)
      ]

      const uploadResults = await Promise.all(uploadPromises)

      const attachmentNames = uploadResults
        .map((result, index) => {
          if (!result) return null;
          const originalFile = [vatFile, licenseFile, requisitionFile][index];
          return typeof result === 'string' ? result : (result?.fileName || originalFile?.name);
        })
        .filter(Boolean)

      // Map form fields to API fields
      const payload = {
        customerName: values.customerName,
        customerEmail: values.customerEmail,
        tinNumber: values.tinNumber,
        description: values.description,
        attachments: attachmentNames,
        status: 'PENDING',
        createdDate: new Date().toISOString(),
        materials: values.materials?.map(m => ({
          materialId: m.materialId,
          quantity: m.quantity || 0
        })) || []
      }
      await addRecord(payload)
      setIsSuccessModalVisible(true)
      form.resetFields()
      setVatFile(null)
      setLicenseFile(null)
      setRequisitionFile(null)
    } catch (e) {
      message.error(e.message || 'Failed to submit payment request')
    }  
  }

  return (
    <MainLayout selectedKey="payments">
      <div className="page-wrapper">
        {/* Header Section */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
            {token && (
              <Link to="/interactions">
                <Button
                  type="text"
                  icon={<ArrowLeftOutlined />}
                  style={{ marginRight: 16 }}
                >
                  Back to Interactions
                </Button>
              </Link> 
            )}
            <Title level={2} style={{ margin: 0, color: '#52c41a' }}>
              <FileTextOutlined style={{ marginRight: 8 }} />
              Create Payment Request
            </Title>
          </div>
          <Text type="secondary" style={{ fontSize: '16px' }}>
            Create a detailed payment request for materials with customer information and requirements
          </Text>
        </div>

        {/* Progress Steps */}
        <Card style={{ marginBottom: 24, borderRadius: 12 }}>
          <Steps
            current={currentStep}
            items={[
              {
                title: 'Customer Info',
                description: 'Basic customer details',
                icon: <UserOutlined />
              },
              {
                title: 'Materials',
                description: 'Select materials and quantities',
                icon: <DollarOutlined />
              },
              {
                title: 'Documents',
                description: 'Upload required documents',
                icon: <PaperClipOutlined />
              }
            ]}
          />
        </Card>

        {/* Alert */}
        <Alert
          message="Payment Request Requirements"
          description="Please ensure all customer information is accurate and upload all required documents including VAT registration, business license, and formal requisition letter."
          type="success"
          showIcon
          style={{ marginBottom: 24, borderRadius: 8 }}
        />

        {/* Main Form Card */}
        <Card
          style={{
            borderRadius: 12,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            border: '1px solid #e8e8e8'
          }}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleFinish}
            onValuesChange={() => {
              const values = form.getFieldsValue()
              if (values.customerName && values.customerEmail && values.tinNumber) {
                setCurrentStep(1)
                if (values.materials && values.materials.length > 0) {
                  setCurrentStep(2)
                }
              } else {
                setCurrentStep(0)
              }
            }}
          >
            {/* Customer Information Section */}
            <div style={{ marginBottom: 32 }}>
              <Title level={4} style={{ color: '#1890ff', marginBottom: 16 }}>
                <UserOutlined style={{ marginRight: 8 }} />
                Customer Information
              </Title>

              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="customerName"
                    label={<Text strong>Customer Name *</Text>}
                    rules={[{ required: true, message: 'Please enter customer name' }]}
                  >
                    <Input
                      size="large"
                      prefix={<UserOutlined style={{ color: '#bfbfbf' }} />}
                      placeholder="Enter customer full name"
                      style={{ borderRadius: 8 }}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="customerEmail"
                    label={<Text strong>Email Address *</Text>}
                    rules={[
                      { required: true, message: 'Please enter email address' },
                      { type: 'email', message: 'Please enter a valid email address' }
                    ]}
                  >
                    <Input
                      size="large"
                      prefix={<UserOutlined style={{ color: '#bfbfbf' }} />}
                      placeholder="customer@example.com"
                      style={{ borderRadius: 8 }}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="tinNumber"
                label={<Text strong>TIN Number *</Text>}
                rules={[{ required: true, message: 'Please enter TIN number' }]}
              >
                <Input
                  size="large"
                  prefix={<ShopOutlined style={{ color: '#bfbfbf' }} />}
                  placeholder="Enter Tax Identification Number"
                  style={{ borderRadius: 8 }}
                />
              </Form.Item>
            </div>

            <Divider />

            {/* Materials Section */}
            <div style={{ marginBottom: 32 }}>
              <Title level={4} style={{ color: '#1890ff', marginBottom: 16 }}>
                <DollarOutlined style={{ marginRight: 8 }} />
                Materials & Quantities
              </Title>

              <FormList name="materials" initialValue={[{}]}>
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }) => (
                      <Card
                        key={key}
                        size="small"
                        style={{
                          marginBottom: 16,
                          background: '#fafafa',
                          border: '1px solid #e8e8e8'
                        }}
                        title={`Material ${name + 1}`}
                        extra={
                          fields.length > 1 && (
                            <Button
                              type="text"
                              danger
                              icon={<MinusCircleOutlined />}
                              onClick={() => remove(name)}
                            >
                              Remove
                            </Button>
                          )
                        }
                      >
                        <Row gutter={16}>
                          <Col xs={24} md={12}>
                            <Form.Item
                              {...restField}
                              name={[name, 'materialId']}
                              label={<Text strong>Material *</Text>}
                              rules={[{ required: true, message: 'Please select material' }]}
                            >
                              <Select
                                size="large"
                                placeholder="Select material"
                                showSearch
                                filterOption={false}
                                onSearch={setMaterialSearch}
                                notFoundContent={materialsLoading ? 'Loading...' : 'No materials found'}
                                style={{ borderRadius: 8 }}
                              >
                                {materials.map((mat) => (
                                  <Option key={mat.materialId} value={mat.materialId}>
                                    <div>
                                      <Text strong>{mat.materialName}</Text>
                                      <br />
                                      <Text type="secondary" style={{ fontSize: '12px' }}>
                                        ID: {mat.materialId}
                                      </Text>
                                    </div>
                                  </Option>
                                ))}
                              </Select>
                            </Form.Item>
                          </Col>
                          <Col xs={24} md={12}>
                            <Form.Item
                              {...restField}
                              name={[name, 'quantity']}
                              label={<Text strong>Quantity *</Text>}
                              rules={[{ required: true, message: 'Please enter quantity' }]}
                            >
                              <InputNumber
                                size="large"
                                min={1}
                                placeholder="Enter quantity"
                                style={{ width: '100%', borderRadius: 8 }}
                                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                              />
                            </Form.Item>
                          </Col>
                        </Row>
                      </Card>
                    ))}
                    <Button
                      type="dashed"
                      onClick={() => add()}
                      block
                      icon={<PlusOutlined />}
                      size="large"
                      style={{ borderRadius: 8, marginBottom: 16 }}
                    >
                      Add Another Material
                    </Button>
                  </>
                )}
              </FormList>

              <Form.Item
                name="description"
                label={<Text strong>Additional Requirements *</Text>}
                rules={[{ required: true, message: 'Please provide description' }]}
              >
                <TextArea
                  rows={4}
                  placeholder="Describe any specific requirements, delivery instructions, or additional details..."
                  style={{ borderRadius: 8 }}
                  showCount
                  maxLength={500}
                />
              </Form.Item>
            </div>

            <Divider />

            {/* Documents Section */}
            <div style={{ marginBottom: 32 }}>
              <Title level={4} style={{ color: '#1890ff', marginBottom: 16 }}>
                <PaperClipOutlined style={{ marginRight: 8 }} />
                Required Documents
              </Title>

              <Row gutter={16}>
                <Col xs={24} md={8}>
                  <Card size="small" style={{ marginBottom: 16 }}>
                    <Form.Item label={<Text strong>VAT Registration</Text>}>
                      <Upload
                        beforeUpload={beforeUploadVat}
                        fileList={vatFile ? [vatFile] : []}
                        onRemove={() => setVatFile(null)}
                        accept=".pdf,.jpg,.jpeg,.png"
                      >
                        <Button
                          icon={<PaperClipOutlined />}
                          style={{ borderRadius: 6 }}
                        >
                          Upload VAT Registration
                        </Button>
                      </Upload>
                    </Form.Item>
                  </Card>
                </Col>
                <Col xs={24} md={8}>
                  <Card size="small" style={{ marginBottom: 16 }}>
                    <Form.Item label={<Text strong>Business License</Text>}>
                      <Upload
                        beforeUpload={beforeUploadLicense}
                        fileList={licenseFile ? [licenseFile] : []}
                        onRemove={() => setLicenseFile(null)}
                        accept=".pdf,.jpg,.jpeg,.png"
                      >
                        <Button
                          icon={<PaperClipOutlined />}
                          style={{ borderRadius: 6 }}
                        >
                          Upload Business License
                        </Button>
                      </Upload>
                    </Form.Item>
                  </Card>
                </Col>
                <Col xs={24} md={8}>
                  <Card size="small" style={{ marginBottom: 16 }}>
                    <Form.Item label={<Text strong>Requisition Letter</Text>}>
                      <Upload
                        beforeUpload={beforeUploadRequisition}
                        fileList={requisitionFile ? [requisitionFile] : []}
                        onRemove={() => setRequisitionFile(null)}
                        accept=".pdf,.jpg,.jpeg,.png"
                      >
                        <Button
                          icon={<PaperClipOutlined />}
                          style={{ borderRadius: 6 }}
                        >
                          Upload Requisition Letter
                        </Button>
                      </Upload>
                    </Form.Item>
                  </Card>
                </Col>
              </Row>
            </div>

            {/* Submit Section */}
            <div style={{
              textAlign: 'center',
              padding: '24px 0',
              background: '#fafafa',
              borderRadius: 8,
              border: '1px solid #f0f0f0'
            }}>
              <Space size="large">
                <Button
                  size="large"
                  onClick={() => {
                    form.resetFields();
                    setVatFile(null);
                    setLicenseFile(null);
                    setRequisitionFile(null);
                    setCurrentStep(0);
                  }}
                  disabled={loading}
                  style={{ minWidth: 120, borderRadius: 8 }}
                >
                  Reset Form
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  size="large"
                  icon={<CheckCircleOutlined />}
                  style={{
                    minWidth: 180,
                    borderRadius: 8,
                    background: '#52c41a',
                    borderColor: '#52c41a'
                  }}
                >
                  Submit Payment Request
                </Button>
              </Space>
            </div>
          </Form>
        </Card>
      </div>

      <Modal
        open={isSuccessModalVisible}
        onCancel={() => setIsSuccessModalVisible(false)}
        footer={[
          <Button key="close" type="primary" onClick={() => setIsSuccessModalVisible(false)}>
            Close
          </Button>,
          token && (
            <Button key="view" onClick={() => {
              setIsSuccessModalVisible(false);
              navigate('/interactions');
            }}>
              View Interactions
            </Button>
          )
        ].filter(Boolean)}
        centered
        width={500}
      >
        <Result
          status="success"
          title="Payment Request Submitted!"
          subTitle="Your payment request has been successfully submitted. Our team will review the details and get back to you soon."
        />
      </Modal>
    </MainLayout>
  )
}

export default PerformaRequisition
