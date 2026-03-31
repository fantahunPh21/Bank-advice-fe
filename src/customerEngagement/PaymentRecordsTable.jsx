import React, { useState, useEffect } from "react";
import {
  Table,
  Tag,
  Button,
  Dropdown,
  message,
  Space,
  Tooltip,
  Modal,
  Descriptions,
  Input,
  Form,
  Select,
  Typography,
  Divider,
  List,
  Card,
  Row,
  Col,
  Collapse,
  DatePicker
} from "antd";
import {
  EyeOutlined,
  MoreOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  EditOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { usePaymentRecords } from "../api/usePaymentRecords";
import { useAuth, hasAnyRole } from "../auth/AuthProvider";
import AddTransactionModal from "./AddTransactionModal";
import { RoleBasedTransactionWrapper } from "../components/RoleBasedTransactionWrapper";
import { PaymentStatusBadge } from "../components/StatusBasedContent";
import TransactionOtpDialog from "../components/TransactionOtpDialog";
import SecureImage from "../components/SecureImage";
import RecordDetailsDialog from "./RecordDetailsDialog";
import { ROLES } from "../api/role-config";
import { API_BASE_URL } from "../api/config";

const { TextArea } = Input;
const { Text } = Typography;
const { Panel } = Collapse;
const { RangePicker } = DatePicker;

export function PaymentRecordsTable() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterForm] = Form.useForm();
  const [customerSuggestions, setCustomerSuggestions] = useState([]);
  const [salesPersonSuggestions, setSalesPersonSuggestions] = useState([]);

  const handleCustomerSearch = async (value) => {
    if (!value || value.length < 2) {
      setCustomerSuggestions([]);
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/customer?keyword=${encodeURIComponent(value)}&pageNumber=0&pageSize=10`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setCustomerSuggestions((data.content || []).map(c => ({
        label: `${c.tin} - ${c.customerName}`,
        value: c.customerName,
        tin: c.tin
      })));
    } catch (e) {
      console.error(e);
    }
  };

  const handleSalesPersonSearch = async (value) => {
    if (!value || value.length < 2) {
      setSalesPersonSuggestions([]);
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/users/sales?keyword=${encodeURIComponent(value)}&pageNumber=0&pageSize=10`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setSalesPersonSuggestions((data.content || []).map(u => ({
        label: u.name || u.username || u.email,
        value: u.name || u.username || u.email
      })));
    } catch (e) {
      console.error(e);
    }
  };

  // Close Transaction State
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [recordToClose, setRecordToClose] = useState(null);
  const [isClosing, setIsClosing] = useState(false);
  const [closeForm] = Form.useForm();

  // Void Line State
  const [isVoidModalOpen, setIsVoidModalOpen] = useState(false);
  const [recordToVoid, setRecordToVoid] = useState(null);
  const [isVoiding, setIsVoiding] = useState(false);
  const [voidForm] = Form.useForm();

  // Edit State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [recordToEdit, setRecordToEdit] = useState(null);

  const {
    records,
    isLoading,
    pagination,
    goToPage,
    closePaymentRecord,
    voidLine,
    refreshRecords,
    handleFilterChange,
    resetFilters,
    filters
  } = usePaymentRecords();

  // Sync selected record when main records data changes
  useEffect(() => {
    if (isModalOpen && selectedRecord) {
      const updated = records.find(r => r.paymentRecordsId === selectedRecord.paymentRecordsId);
      if (updated) setSelectedRecord(updated);
    }
  }, [records, isModalOpen, selectedRecord]);

  const userRole = user?.role;
  const isAdmin = userRole === ROLES.ADMIN;
  const isFinance = userRole === ROLES.FINANCE;
  const isSalesman = userRole === ROLES.SALESMAN || userRole === "SALESPERSON";

  const handleClosePaymentRecord = async (values) => {
    setIsClosing(true);
    try {
      await closePaymentRecord(recordToClose.paymentRecordsId, values.finalRemark);
      setIsCloseModalOpen(false);
      closeForm.resetFields();
    } catch (e) {
      // Error is handled in the hook
    } finally {
      setIsClosing(false);
    }
  };

  const handleVoidLine = async (values) => {
    setIsVoiding(true);
    try {
      await voidLine(values.paymentRecordLineId, values.voidReason);
      setIsVoidModalOpen(false);
      voidForm.resetFields();
    } catch (e) {
      // Error is handled in the hook
    } finally {
      setIsVoiding(false);
    }
  };

  const showDetails = (record) => {
    setSelectedRecord(record);
    setIsModalOpen(true);
  };

  const openCloseModal = (record) => {
    setRecordToClose(record);
    setIsCloseModalOpen(true);
  };

  const openVoidModal = (record) => {
    setRecordToVoid(record);
    setIsVoidModalOpen(true);
  };

  const openEditModal = (record) => {
    setRecordToEdit(record);
    setIsEditModalOpen(true);
  };

  const hasRejectedLines = (record) => {
    if (!record || !record.paymentRecordLine || !Array.isArray(record.paymentRecordLine)) {
      return (record?.requestStatus?.toLowerCase() === "rejected" || record?.confirmationStatus?.toLowerCase() === "rejected");
    }
    return record.paymentRecordLine.some(
      (line) => line.status?.toLowerCase() === "rejected" || line.confirmationStatus?.toLowerCase() === "rejected"
    );
  };

  const onFilterSubmit = (values) => {
    const newFilters = { ...values };
    if (values.dateRange && values.dateRange.length === 2) {
      newFilters.fromDate = values.dateRange[0].toISOString();
      newFilters.toDate = values.dateRange[1].toISOString();
    }
    delete newFilters.dateRange;
    handleFilterChange(newFilters);
  };

  const onFilterReset = () => {
    filterForm.resetFields();
    resetFilters();
  };

  // Define Table Columns
  const columns = [
    {
      title: "ID",
      dataIndex: "paymentRecordsId",
      key: "id",
      width: 100,
    },
    {
      title: "Customer Name",
      dataIndex: "customerName",
      key: "customer",
      width: 250,
      ellipsis: true,
      render: (text) => (
        <Tooltip placement="topLeft" title={text}>
          {text}
        </Tooltip>
      ),
    },
    {
      title: "Amount Paid",
      dataIndex: "amountPaid",
      key: "amount",
      render: (amount) => (
        <span style={{ fontWeight: 600 }}>
          Br. {Number(amount || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
        </span>
      ),
    },
    {
      title: "Sales Person",
      dataIndex: "salesPerson",
      key: "salesPerson",
      render: (text) => text || "N/A"
    },
    {
      title: "Created Date",
      dataIndex: "createdDate",
      key: "date",
      render: (date) => new Date(date || Date.now()).toLocaleDateString("en-CA"),
    },
    {
      title: "Status",
      key: "status",
      render: (record) => <PaymentStatusBadge status={record.confirmationStatus || record.requestStatus} />,
    },
    {
      title: "Actions",
      key: "actions",
      fixed: 'right',
      width: 100,
      render: (record) => {
        // Filter menu items based on role
        const menuItems = [
          {
            key: "view",
            label: "View All Details",
            icon: <EyeOutlined />,
            onClick: () => showDetails(record),
          },
          // Edit: Only Salesman or Admin
          (isSalesman || isAdmin) && {
            key: "edit",
            label: "Edit Payment",
            icon: <EditOutlined />,
            onClick: () => openEditModal(record),
            disabled: record.status === "CONFIRMED" || record.confirmationStatus === "CONFIRMED",
          },
          { type: "divider" },
          // Record-level confirm/reject removed per user request (use line-level in Details)

          // Close/Void: Typically Finance/Admin
          (isFinance || isAdmin) && {
            key: "close",
            label: "Close Transaction",
            icon: <CloseCircleOutlined />,
            onClick: () => openCloseModal(record),
            disabled: record.status === "CLOSED" || record.status === "COMPLETED",
          },
          (hasAnyRole(user, ["finance", "admin", "salesman", "salesperson"])) && {
            key: "void",
            label: "Void Line",
            icon: <ExclamationCircleOutlined />,
            onClick: () => openVoidModal(record),
            disabled: !hasRejectedLines(record),
          },
        ].filter(Boolean);

        return (
          <RoleBasedTransactionWrapper requiredAction="view" fallback={<Text type="secondary">N/A</Text>}>
            <Space size="small">
              <Tooltip title="View Details">
                <Button
                  type="text"
                  icon={<EyeOutlined />}
                  onClick={() => showDetails(record)}
                />
              </Tooltip>
              <Dropdown
                menu={{ items: menuItems }}
                trigger={["click"]}
              >
                <Button type="text" icon={<MoreOutlined />} />
              </Dropdown>
            </Space>
          </RoleBasedTransactionWrapper>
        );
      },
    },
  ];

  return (
    <div style={{ padding: '0 0 20px 0', background: '#fff', borderRadius: '8px' }}>
      <Collapse style={{ marginBottom: 16 }} expandIconPosition="end">
        <Panel header={<Text strong>Advanced Filters</Text>} key="1">
          <Form form={filterForm} layout="vertical" onFinish={onFilterSubmit}>
            <Row gutter={16}>
              <Col span={6}>
                <Form.Item name="status" label="Status">
                  <Select placeholder="Filter by status" allowClear style={{ width: '100%' }}>
                    <Select.Option value="VOIDED">VOIDED</Select.Option>
                    <Select.Option value="REQUESTED">REQUESTED</Select.Option>
                    <Select.Option value="CONFIRMED">CONFIRMED</Select.Option>
                    <Select.Option value="REJECTED">REJECTED</Select.Option>
                    <Select.Option value="CLOSED">CLOSED</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name="customerName" label="Customer Name">
                  <Select
                    showSearch
                    allowClear
                    placeholder="Search customer"
                    defaultActiveFirstOption={false}
                    filterOption={false}
                    onSearch={handleCustomerSearch}
                    notFoundContent={null}
                    options={customerSuggestions}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name="salesPerson" label="Sales Person">
                  <Select
                    showSearch
                    allowClear
                    placeholder="Search sales person"
                    defaultActiveFirstOption={false}
                    filterOption={false}
                    onSearch={handleSalesPersonSearch}
                    notFoundContent={null}
                    options={salesPersonSuggestions}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name="dateRange" label="Date Range">
                  <RangePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>
            <Row justify="end">
              <Space>
                <Button onClick={onFilterReset}>Reset</Button>
                <Button type="primary" htmlType="submit">Apply Filters</Button>
              </Space>
            </Row>
          </Form>
        </Panel>
      </Collapse>

      <Table
        dataSource={records}
        columns={columns}
        rowKey="paymentRecordsId"
        loading={isLoading}
        scroll={{ x: 1000 }}
        pagination={{
          current: pagination.currentPage + 1,
          pageSize: pagination.pageSize,
          total: pagination.totalElements,
          showSizeChanger: true,
          pageSizeOptions: ['5', '10', '20', '50'],
          onChange: (page, size) => {
            if (size !== pagination.pageSize) {
              changePageSize(size);
            } else {
              goToPage(page - 1);
            }
          },
        }}
      />

      <AddTransactionModal
        visible={isEditModalOpen}
        isEditing={true}
        recordData={recordToEdit}
        onCancel={() => setIsEditModalOpen(false)}
        onSuccess={refreshRecords}
      />

      <RecordDetailsDialog
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        record={selectedRecord}
      />

      {/* Close Transaction Modal */}
      <Modal
        title="Close Transaction"
        open={isCloseModalOpen}
        onCancel={() => setIsCloseModalOpen(false)}
        onOk={() => closeForm.submit()}
        confirmLoading={isClosing}
        okText="Close Transaction"
        okButtonProps={{ danger: true }}
      >
        <Form form={closeForm} layout="vertical" onFinish={handleClosePaymentRecord}>
          <Form.Item
            name="finalRemark"
            label="Final Remark"
            rules={[{ required: true, message: 'Please enter a final remark' }]}
          >
            <TextArea rows={4} placeholder="Enter final remark for closing this transaction..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* Void Line Modal */}
      <Modal
        title="Void Rejected Line"
        open={isVoidModalOpen}
        onCancel={() => setIsVoidModalOpen(false)}
        onOk={() => voidForm.submit()}
        confirmLoading={isVoiding}
        okText="Void Line"
        okButtonProps={{ danger: true }}
      >
        <Form form={voidForm} layout="vertical" onFinish={handleVoidLine}>
          {recordToVoid?.paymentRecordLine && Array.isArray(recordToVoid.paymentRecordLine) ? (
            <Form.Item
              name="paymentRecordLineId"
              label="Select Line to Void"
              rules={[{ required: true, message: 'Please select a line' }]}
            >
              <Select placeholder="Select a line to void">
                {recordToVoid.paymentRecordLine
                  .filter(line => line.status?.toLowerCase() === "rejected" || line.confirmationStatus?.toLowerCase() === "rejected")
                  .map(line => (
                    <Select.Option key={line.paymentRecordLineId} value={line.paymentRecordLineId}>
                      {line.referenceId || `Line ID: ${line.paymentRecordLineId}`} - Br. {Number(line.amountPaid || 0).toFixed(2)}
                    </Select.Option>
                  ))}
              </Select>
            </Form.Item>
          ) : (
            recordToVoid && <div style={{ marginBottom: 16 }}>
              <Text type="secondary">Directly voiding record ID: {recordToVoid.paymentRecordsId}</Text>
              <Form.Item name="paymentRecordLineId" hidden initialValue={recordToVoid.paymentRecordsId}><Input /></Form.Item>
            </div>
          )}
          <Form.Item
            name="voidReason"
            label="Void Reason"
            rules={[{ required: true, message: 'Please enter a void reason' }]}
          >
            <TextArea rows={4} placeholder="Enter reason for voiding this rejected line..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
