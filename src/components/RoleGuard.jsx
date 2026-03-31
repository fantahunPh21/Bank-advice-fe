import React from "react";
import { useAuth, hasAnyRole } from "../auth/AuthProvider";
import { Alert } from "antd";
import { ShieldOutlined } from "@ant-design/icons";

/**
 * A component that guards its children based on user roles.
 * Similar to RoleBasedContent but provides a simpler interface for blocking entire sections.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Content to show if user has access
 * @param {string[]} props.requiredRoles - Array of roles allowed to access
 * @param {React.ReactNode} [props.fallback=null] - Optional fallback content
 * @param {boolean} [props.showAlert=false] - Whether to show an alert when access is denied
 */
export function RoleGuard({ 
  children, 
  requiredRoles, 
  fallback = null, 
  showAlert = false 
}) {
  const { user } = useAuth();
  
  const hasAccess = user && hasAnyRole(user, requiredRoles);

  if (!hasAccess) {
    if (showAlert) {
      return (
        <Alert
          message="Permission Denied"
          description={`You don't have permission to access this feature. Required roles: ${requiredRoles.join(", ")}`}
          type="warning"
          showIcon
          icon={<ShieldOutlined />}
          style={{ margin: '16px 0' }}
        />
      );
    }
    return fallback;
  }

  return <>{children}</>;
}

export default RoleGuard;
