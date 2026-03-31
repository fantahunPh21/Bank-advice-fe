import React from 'react';
import { Tag, Alert, Typography, Space } from 'antd';
import { 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  CloseCircleOutlined, 
  WarningOutlined 
} from '@ant-design/icons';

const { Text } = Typography;

/**
 * A wrapper component that conditionally renders content based on a status.
 */
export function StatusBasedContent({
  children,
  requiredStatus, // Array of strings, e.g., ['confirmed', 'paid']
  currentStatus,
  fallback = null,
  showStatusMessage = false,
}) {
  const normalizedCurrentStatus = currentStatus?.toLowerCase();
  const allowedStatuses = (Array.isArray(requiredStatus) ? requiredStatus : [requiredStatus])
    .map((s) => s.toLowerCase());

  const hasAccess = allowedStatuses.includes(normalizedCurrentStatus);

  if (hasAccess) return <>{children}</>;
  if (fallback) return <>{fallback}</>;

  if (showStatusMessage) {
    return (
      <Alert
        type="warning"
        showIcon
        icon={<WarningOutlined />}
        message="Status Restriction"
        description={
          <Text>
            This content is only available when status is: <Text strong>{requiredStatus.join(', ')}</Text>. 
            Current status: <Text code>{currentStatus}</Text>
          </Text>
        }
        style={{ margin: '8px 0', borderRadius: '8px' }}
      />
    );
  }

  return null;
}

/**
 * A reusable status badge for payments and transactions.
 */
export function PaymentStatusBadge({ status }) {
  const getStatusConfig = (status) => {
    const s = status?.toLowerCase();

    switch (s) {
      case 'confirmed':
      case 'paid':
      case 'completed':
        return {
          icon: <CheckCircleOutlined />,
          color: 'success',
          label: 'Confirmed',
        };
      case 'pending':
      case 'requested':
        return {
          icon: <ClockCircleOutlined />,
          color: 'processing',
          label: status || 'Pending',
        };
      case 'rejected':
      case 'cancelled':
        return {
          icon: <CloseCircleOutlined />,
          color: 'error',
          label: 'Rejected',
        };
      case 'partially_confirmed':
      case 'partially-confirmed':
        return {
            icon: <ClockCircleOutlined />,
            color: 'warning',
            label: 'Partially Confirmed'
        };
      default:
        return {
          icon: <WarningOutlined />,
          color: 'default',
          label: status || 'Unknown',
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Tag 
      icon={config.icon} 
      color={config.color} 
      style={{ borderRadius: '12px', padding: '0 8px', fontWeight: 500 }}
    >
      {config.label.toUpperCase()}
    </Tag>
  );
}

/**
 * Specialized component for content only shown when a transaction is confirmed.
 */
export function ConfirmedTransactionContent({ children, status }) {
  return (
    <StatusBasedContent 
      requiredStatus={['confirmed', 'paid', 'completed']} 
      currentStatus={status} 
      showStatusMessage={true}
    >
      {children}
    </StatusBasedContent>
  );
}

/**
 * Specialized component for content only shown when a transaction is pending.
 */
export function PendingTransactionContent({ children, status }) {
  return (
    <StatusBasedContent 
      requiredStatus={['pending', 'requested']} 
      currentStatus={status} 
      showStatusMessage={true}
    >
      {children}
    </StatusBasedContent>
  );
}

export default StatusBasedContent;
