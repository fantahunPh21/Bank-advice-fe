import React from "react";
import { useAuth, hasAnyRole } from "../auth/AuthProvider";
import { Alert, Tag, Space, Typography } from "antd";
import { 
  ShieldOutlined, 
  UserOutlined, 
  AlertOutlined,
  SolutionOutlined,
  TeamOutlined
} from "@ant-design/icons";

const { Text } = Typography;

/**
 * A component that conditionally renders children based on user roles.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Content to show if user has required roles
 * @param {string|string[]} props.requiredRoles - Array or string of role names
 * @param {React.ReactNode} [props.fallback] - Content to show if user DOES NOT have required roles
 * @param {boolean} [props.showAccessDenied=false] - Whether to show an Ant Design Alert when access is denied
 */
export function RoleBasedContent({
  children,
  requiredRoles,
  fallback,
  showAccessDenied = false,
}) {
  const { user } = useAuth();

  const userHasAccess = () => {
    if (!user) return false;
    const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
    return hasAnyRole(user, roles);
  };

  if (userHasAccess()) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (showAccessDenied) {
    return (
      <Alert
        message="Access Denied"
        description={`You don't have permission to view this content. Required roles: ${
          Array.isArray(requiredRoles) ? requiredRoles.join(", ") : requiredRoles
        }`}
        type="error"
        showIcon
        icon={<AlertOutlined />}
        style={{ marginBottom: 16 }}
      />
    );
  }

  return null;
}

// Wrapper for Admin restricted sections
export function AdminOnlyContent({ children }) {
  return (
    <RoleBasedContent requiredRoles="ADMIN">
      <div style={{ marginBottom: 16 }}>
        <Space>
          <ShieldOutlined style={{ fontSize: '18px', color: '#ff4d4f' }} />
          <Text strong style={{ color: '#ff4d4f' }}>Admin Section</Text>
        </Space>
      </div>
      {children}
    </RoleBasedContent>
  );
}

// Wrapper for Finance restricted sections
export function FinanceOnlyContent({ children }) {
  return (
    <RoleBasedContent requiredRoles={["ADMIN", "FINANCE"]}>
      <div style={{ marginBottom: 16 }}>
        <Space>
          <SolutionOutlined style={{ fontSize: '18px', color: '#1890ff' }} />
          <Text strong style={{ color: '#1890ff' }}>Finance Section</Text>
        </Space>
      </div>
      {children}
    </RoleBasedContent>
  );
}

// Wrapper for Sales restricted sections
export function SalesmanContent({ children }) {
  return (
    <RoleBasedContent requiredRoles={["ADMIN", "FINANCE", "SALESPERSON"]}>
      <div style={{ marginBottom: 16 }}>
        <Space>
          <TeamOutlined style={{ fontSize: '18px', color: '#52c41a' }} />
          <Text strong style={{ color: '#52c41a' }}>Sales Section</Text>
        </Space>
      </div>
      {children}
    </RoleBasedContent>
  );
}

/**
 * A badge displaying the current user's name and role with role-specific colors.
 */
export function UserProfileBadge() {
  const { user } = useAuth();

  if (!user) return null;

  const roles = Array.isArray(user.role) ? user.role : [user.role];
  
  const getRoleBadge = (r) => {
    const roleUpper = r.toUpperCase();
    if (roleUpper === "ADMIN") return <Tag color="red" icon={<ShieldOutlined />}>ADMIN</Tag>;
    if (roleUpper === "FINANCE") return <Tag color="blue" icon={<SolutionOutlined />}>FINANCE</Tag>;
    if (roleUpper === "SALESPERSON") return <Tag color="green" icon={<UserOutlined />}>SALES</Tag>;
    return <Tag color="default">{roleUpper}</Tag>;
  };

  return (
    <div style={{ 
      display: 'inline-flex', 
      alignItems: 'center', 
      gap: '8px', 
      background: '#f5f5f5', 
      padding: '4px 12px', 
      borderRadius: '20px',
      border: '1px solid #e8e8e8'
    }}>
      <UserOutlined style={{ color: '#8c8c8c' }} />
      <Text strong style={{ fontSize: '14px' }}>{user.fullName || user.username}</Text>
      <Space size={2}>
        {roles.map(r => <span key={r}>{getRoleBadge(r)}</span>)}
      </Space>
    </div>
  );
}

// Simple wrappers for action-level control
export const AddButton = ({ children, requiredRoles }) => (
  <RoleBasedContent requiredRoles={requiredRoles}>{children}</RoleBasedContent>
);

export const EditButton = ({ children, requiredRoles }) => (
  <RoleBasedContent requiredRoles={requiredRoles}>{children}</RoleBasedContent>
);

export const DeleteButton = ({ children, requiredRoles }) => (
  <RoleBasedContent requiredRoles={requiredRoles}>{children}</RoleBasedContent>
);
