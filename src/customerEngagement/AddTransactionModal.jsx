import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  DatePicker,
  Upload,
  Space,
  Typography,
  Divider,
  Card,
  message,
  AutoComplete,
  Row,
  Col
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  UploadOutlined,
  UserOutlined,
  DollarOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import { useAuth } from '../auth/AuthProvider';
import { useCompanies } from '../api/useCompanies';
import FileUploader from '../components/FileUploader';
import { usePaymentRecords } from '../api/usePaymentRecords';
import { API_BASE_URL } from '../api/config';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;

const AddTransactionModal = ({ open: visible, onCancel, onSuccess, isEditing, recordData }) => {
  const [form] = Form.useForm();
  const { user, token } = useAuth();
  const { companies, isLoading: loadingCompanies } = useCompanies();
  const [isUploading, setIsUploading] = useState(false);
  const { addRecord, updateRecord, isLoading: submitting } = usePaymentRecords();

  const [availableShops, setAvailableShops] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [loadingBanks, setLoadingBanks] = useState(false);
  const [customerSuggestions, setCustomerSuggestions] = useState([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState(null);

  // Load existing data if editing
  useEffect(() => {
    if (visible && isEditing && recordData) {
      const companyId = String(recordData.companyId);
      setSelectedCompanyId(companyId);

      form.setFieldsValue({
        companyId,
        shopBranchId: recordData.shopBranchId ? String(recordData.shopBranchId) : undefined,
        customerTIN: recordData.tinNumber,
        customerName: recordData.customerName,
        amountPaid: recordData.amountPaid,
        remark: recordData.remark,
        lines: recordData.lines?.map(line => ({
          ...line,
          transactionDate: line.transactionDate ? dayjs(line.transactionDate) : dayjs(),
          // Images are handled via filenames in current system, we don't reload them into upload component normally
          images: undefined
        })) || [{ transactionDate: dayjs() }]
      });
    } else if (visible && !isEditing) {
      form.resetFields();
      if (user?.companyId) {
        const cid = String(user.companyId);
        form.setFieldsValue({ companyId: cid });
        setSelectedCompanyId(cid);
      }
    }
  }, [visible, isEditing, recordData, user, form]);

  // Load shops and banks when company changes
  useEffect(() => {
    if (selectedCompanyId) {
      const company = companies.find(c => String(c.companyId) === selectedCompanyId);
      if (company && company.shopBranch) {
        setAvailableShops(company.shopBranch);
      } else {
        setAvailableShops([]);
      }

      setLoadingBanks(true);
      fetch(`${API_BASE_URL}/companies/${selectedCompanyId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          const banks = data.content?.bankAccount || data.bankAccount || [];
          setBankAccounts(banks.map(b => ({
            label: `${b.accountNumber} - ${b.bankName}`,
            value: b.accountNumber,
            accountHolder: b.accountHolder,
            bankAccountId: b.bankAccountId
          })));
        })
        .catch(err => console.error("Error fetching banks:", err))
        .finally(() => setLoadingBanks(false));
    }
  }, [selectedCompanyId, companies, token]);

  const handleCompanyChange = (value) => {
    setSelectedCompanyId(value);
    form.setFieldsValue({ shopBranchId: undefined, lines: [{ transactionDate: dayjs() }] });
  };

  const handleCustomerSearch = async (value) => {
    if (!value || value.length < 2) {
      setCustomerSuggestions([]);
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/customer?keyword=${encodeURIComponent(value)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setCustomerSuggestions((data.content || []).map(c => ({
        label: `${c.tin} - ${c.customerName}`,
        value: c.tin,
        customerName: c.customerName
      })));
    } catch (e) {
      console.error(e);
    }
  };

  const onCustomerSelect = (value, option) => {
    form.setFieldsValue({ customerName: option.customerName });
  };

  const onFinish = async (values) => {
    try {
      setIsUploading(true);
      const selectedCompany = companies.find(c => String(c.companyId) === String(values.companyId));
      const companyName = selectedCompany?.companyName || 'N/A';

      const processedLines = await Promise.all(values.lines.map(async (line) => {
        let imageUrls = [];
        // Handle images if any were uploaded
        if (line.images && line.images.fileList && line.images.fileList.length > 0) {
          imageUrls = await Promise.all(line.images.fileList.map(async (fileObj) => {
            const file = fileObj.originFileObj || fileObj;
            const result = await FileUploader.uploadFile({
              endpoint: `${API_BASE_URL}/upload/file`,
              file,
              entityData: 'transaction_slip'
            });
            
            if (result.status) {
              return typeof result.content === 'string' ? result.content : result.content?.fileName || file.name;
            } else {
              throw new Error(result.content || "Upload failed");
            }
          }));
        } else if (isEditing && line.images && typeof line.images === 'string') {
          // Keep existing images if editing and no new ones provided
          imageUrls = [line.images];
        }

        const bank = bankAccounts.find(b => b.value === line.creditAccountNo);

        return {
          referenceId: line.referenceId,
          debitAccountNo: line.debitAccountNo,
          debitAccountName: line.debitAccountName,
          creditAccountNo: line.creditAccountNo,
          creditAccountName: bank?.accountHolder || line.creditAccountName,
          creditAccountId: bank?.bankAccountId,
          amountPaid: line.amountPaid,
          transactionDate: line.transactionDate ? line.transactionDate.toISOString() : new Date().toISOString(),
          images: imageUrls.filter(Boolean).join(','),
          companyName: companyName
        };
      }));

      const payload = {
        customerName: values.customerName,
        tinNumber: values.customerTIN,
        amountPaid: values.amountPaid,
        shopBranchId: Number(values.shopBranchId),
        companyId: Number(values.companyId),
        remark: values.remark,
        salesPerson: user?.fullName || user?.username || 'Unknown',
        userId: user?.userId || user?.uuid || 1,
        lines: processedLines
      };

      if (isEditing) {
        payload.paymentRecordsId = recordData.paymentRecordsId;
        await updateRecord(payload);
      } else {
        await addRecord(payload);
      }

      if (onSuccess) onSuccess();
      window.dispatchEvent(new CustomEvent('refreshData'));
      form.resetFields();
      onCancel();
    } catch (e) {
      console.error("Save Error:", e);
      message.error(e.message || "Failed to save transaction");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Modal
      open={visible}
      title={<Title level={4} style={{ margin: 0 }}>{isEditing ? "Edit Payment Transaction" : "New Payment Transaction"}</Title>}
      onCancel={onCancel}
      width={750}
      footer={null}
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ lines: [{ transactionDate: dayjs() }] }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="companyId" label="Company" rules={[{ required: true, message: 'Select company' }]}>
              <Select
                placeholder="Select Company"
                onChange={handleCompanyChange}
                disabled={!!user?.companyId && !isEditing}
                loading={loadingCompanies}
              >
                {companies.map(c => <Select.Option key={c.companyId} value={String(c.companyId)}>{c.companyName}</Select.Option>)}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="shopBranchId" label="Shop Branch" rules={[{ required: true, message: 'Select shop branch' }]}>
              <Select placeholder="Select Shop">
                {availableShops.map(s => <Select.Option key={s.shopBranchId} value={String(s.shopBranchId)}>{s.shopBranchName}</Select.Option>)}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="customerTIN" label="Customer TIN" rules={[{ required: true, message: 'Enter TIN' }]}>
              <AutoComplete
                options={customerSuggestions}
                onSearch={handleCustomerSearch}
                onSelect={onCustomerSelect}
                placeholder="Search or enter TIN"
              >
                <Input prefix={<UserOutlined style={{ color: '#bfbfbf' }} />} />
              </AutoComplete>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="customerName" label="Customer Name" rules={[{ required: true, message: 'Enter name' }]}>
              <Input placeholder="Enter Customer Name" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="amountPaid" label="Total Amount Paid" rules={[{ required: true, message: 'Enter amount' }]}>
          <InputNumber
            style={{ width: '100%' }}
            min={0.01}
            precision={2}
            placeholder="0.00"
            prefix={<DollarOutlined />}
          />
        </Form.Item>

        <Divider titlePlacement="left">Slip Details</Divider>

        <Form.List name="lines">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <Card
                  key={key}
                  size="small"
                  style={{ marginBottom: 16, background: '#f8fafc', borderRadius: 8 }}
                  title={<Text strong>Slip Information #{name + 1}</Text>}
                  extra={fields.length > 1 && <Button type="text" danger icon={<DeleteOutlined />} onClick={() => remove(name)} />}
                >
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item {...restField} name={[name, 'debitAccountNo']} label="Debited Account No" rules={[{ required: true, message: 'Required' }]}>
                        <Input placeholder="Acc Number" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item {...restField} name={[name, 'debitAccountName']} label="Debited Account Name" rules={[{ required: true, message: 'Required' }]}>
                        <Input placeholder="Acc Holder Name" />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item {...restField} name={[name, 'creditAccountNo']} label="Credited Bank Account" rules={[{ required: true, message: 'Select bank' }]}>
                        <Select placeholder="Select Bank" loading={loadingBanks} options={bankAccounts} />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item {...restField} name={[name, 'referenceId']} label="Reference / Transaction ID" rules={[{ required: true, message: 'Required' }]}>
                        <Input placeholder="Ref ID" />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item {...restField} name={[name, 'amountPaid']} label="Slip Amount" rules={[{ required: true, message: 'Required' }]}>
                        <InputNumber style={{ width: '100%' }} min={0.01} precision={2} placeholder="0.00" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item {...restField} name={[name, 'transactionDate']} label="Transaction Date" rules={[{ required: true, message: 'Required' }]}>
                        <DatePicker style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item {...restField} name={[name, 'images']} label="Upload Slip Image">
                    <Upload
                      listType="picture"
                      beforeUpload={() => false}
                      maxCount={1}
                    >
                      <Button icon={<UploadOutlined />}>Select Image</Button>
                    </Upload>
                  </Form.Item>
                </Card>
              ))}
              <Button type="dashed" onClick={() => add({ transactionDate: dayjs() })} block icon={<PlusOutlined />} style={{ marginBottom: 24, borderRadius: 8 }}>
                Add Another Slip
              </Button>
            </>
          )}
        </Form.List>

        <Form.Item name="remark" label="Remark / Note">
          <TextArea rows={3} placeholder="Additional notes about this transaction..." maxLength={500} showCount style={{ borderRadius: 8 }} />
        </Form.Item>

        <div style={{ textAlign: 'right', marginTop: 32 }}>
          <Space size="middle">
            <Button onClick={onCancel} style={{ borderRadius: 8, minWidth: 100 }}>Cancel</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={submitting || isUploading}
              style={{ borderRadius: 8, minWidth: 150, background: '#1d4ed8' }}
              icon={<FileTextOutlined />}
            >
              {isEditing ? "Update" : "Submit"} Transaction
            </Button>
          </Space>
        </div>
      </Form>
    </Modal>
  );
};

export default AddTransactionModal;
