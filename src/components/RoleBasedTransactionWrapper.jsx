import React from "react";
import { useAuth, hasAnyRole } from "../auth/AuthProvider";
import { Alert, Typography, Space } from "antd";
import { 
  SafetyCertificateOutlined, 
  UserOutlined 
} from "@ant-design/icons";

const { Text, Title } = Typography;

/**
 * A wrapper component that grants access based on transaction-specific actions.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Protected content
 * @param {"add" | "edit" | "view" | "confirm"} props.requiredAction - Action type
 * @param {React.ReactNode} [props.fallback] - Custom fallback UI
 */
export function RoleBasedTransactionWrapper({ children, requiredAction, fallback }) {
  const { user } = useAuth();

  const hasPermission = () => {
    if (!user) return false;

    // Helper to check roles case-insensitively
    const check = (required) => {
      const userRoles = (Array.isArray(user.role) ? user.role : [user.role || '']).map(r => r.toLowerCase());
      return required.some(r => userRoles.includes(r.toLowerCase()));
    };

    switch (requiredAction) {
      case "add":
      case "edit":
        return check(["salesman", "salesperson", "admin"]);
      case "view":
        return check(["admin", "finance", "salesman", "salesperson"]);
      case "confirm":
        return check(["finance", "admin"]);
      default:
        return false;
    }
  };

  if (hasPermission()) {
    return <>{children}</>;
  }

  return fallback || null;
}

// Specialized convenience wrappers
export function SalesmanOnlyWrapper({ children }) {
  return (
    <RoleBasedTransactionWrapper requiredAction="add">
      <div style={{ padding: '8px 0' }}>
        <Space style={{ marginBottom: '12px' }}>
          <UserOutlined style={{ color: '#52c41a', fontSize: '18px' }} />
          <Title level={5} style={{ margin: 0, color: '#52c41a' }}>Salesperson Actions</Title>
        </Space>
        {children}
      </div>
    </RoleBasedTransactionWrapper>
  );
}

export function FinanceOnlyWrapper({ children }) {
  return (
    <RoleBasedTransactionWrapper requiredAction="confirm">
      <div style={{ padding: '8px 0' }}>
        <Space style={{ marginBottom: '12px' }}>
          <SafetyCertificateOutlined style={{ color: '#1890ff', fontSize: '18px' }} />
          <Title level={5} style={{ margin: 0, color: '#1890ff' }}>Finance Actions</Title>
        </Space>
        {children}
      </div>
    </RoleBasedTransactionWrapper>
  );
}

export function ViewOnlyWrapper({ children }) {
  return (
    <RoleBasedTransactionWrapper requiredAction="view">
      {children}
    </RoleBasedTransactionWrapper>
  );
}

export default RoleBasedTransactionWrapper;
