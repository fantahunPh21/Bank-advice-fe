import React, { useEffect, useState } from "react"
import { useNavigate, useLocation, Navigate } from "react-router-dom"
import { useAuth, hasAnyRole } from "../auth/AuthProvider"
import { Alert, Button, Spin, Result, Space, Typography } from "antd"

const { Text } = Typography;
import { SafetyCertificateOutlined as ShieldOutlined, ArrowLeftOutlined, HomeOutlined } from "@ant-design/icons"

/**
 * EnhancedProtectedRoute component handles authentication and role-based authorization.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Protected content
 * @param {string | string[]} [props.requiredRoles] - Roles required to access
 * @param {string[]} [props.allowedRoles] - Alternative way to specify allowed roles
 * @param {string} [props.fallbackUrl="/login"] - URL to redirect if not authenticated
 * @param {boolean} [props.showUnauthorized=true] - Whether to show unauthorized UI or just redirect
 * @param {boolean} [props.restrictSalesman=true] - Special restriction for salesperson (dashboard only)
 */
export function EnhancedProtectedRoute({
  children,
  requiredRoles,
  allowedRoles,
  fallbackUrl = "/login",
  showUnauthorized = true,
  restrictSalesman = true,
}) {
  const { user, token } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const checkAuthorization = () => {
      // 1. Check Authentication
      if (!token) {
        setIsAuthorized(false)
        setIsChecking(false)
        return
      }

      const currentUser = user;
      if (!currentUser) {
        setIsAuthorized(false)
        setIsChecking(false)
        return
      }

      // 2. Check Role Assignment
      const userRoles = Array.isArray(currentUser.role) ? currentUser.role : [currentUser.role || '']
      if (userRoles.length === 0 || (userRoles.length === 1 && !userRoles[0])) {
        setIsAuthorized(false)
        setIsChecking(false)
        return
      }

      // 3. Special Salesman Restriction
      // Requirement: Salespersons can only access dashboard (/)
      if (restrictSalesman && hasAnyRole(currentUser, ["SALESPERSON", "SALESMAN"]) && !hasAnyRole(currentUser, ["ADMIN", "FINANCE"])) {
        const isDashboard = location.pathname === "/dashboard" || location.pathname === "/"
        if (!isDashboard) {
          setIsAuthorized(false)
          setIsChecking(false)
          return
        }
      }

      // 4. Check Required Roles
      if (requiredRoles) {
        const rolesArray = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles]
        const normalizedRequiredRoles = rolesArray.map(r => r.toUpperCase())

        // Normalize user roles for comparison
        const normalizedUserRoles = userRoles.map(r => r.toUpperCase())
        const hasRequiredRole = normalizedRequiredRoles.some(role => normalizedUserRoles.includes(role))

        if (!hasRequiredRole) {
          setIsAuthorized(false)
          setIsChecking(false)
          return
        }
      }

      // 5. Check Allowed Roles (Alternative approach)
      if (allowedRoles && allowedRoles.length > 0) {
        const normalizedAllowedRoles = allowedRoles.map(r => r.toUpperCase())
        const normalizedUserRoles = userRoles.map(r => r.toUpperCase())
        const hasAllowedRole = normalizedAllowedRoles.some(role => normalizedUserRoles.includes(role))

        if (!hasAllowedRole) {
          setIsAuthorized(false)
          setIsChecking(false)
          return
        }
      }

      // If all checks pass
      setIsAuthorized(true)
      setIsChecking(false)
    }

    checkAuthorization()
  }, [user, token, requiredRoles, allowedRoles, restrictSalesman, location.pathname])

  if (isChecking) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
        <Spin size="large" />
        <Text type="secondary">Verifying access...</Text>
      </div>
    )
  }

  if (!token) {
    return <Navigate to={fallbackUrl} replace state={{ from: location.pathname }} />
  }

  if (!isAuthorized) {
    if (showUnauthorized) {
      const requiredList = requiredRoles
        ? (Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles])
        : (allowedRoles || [])

      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          background: '#f0f2f5'
        }}>
          <Result
            status="403"
            title="Access Denied"
            subTitle={
              <Space direction="vertical">
                <Text>You don't have permission to access this page.</Text>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  Required roles: {requiredList.map(r => r.toUpperCase()).join(", ")}
                </Text>
              </Space>
            }
            extra={
              <Space size="middle">
                <Button
                  icon={<ArrowLeftOutlined />}
                  onClick={() => navigate(-1)}
                >
                  Go Back
                </Button>
                <Button
                  type="primary"
                  icon={<HomeOutlined />}
                  onClick={() => navigate("/dashboard")}
                >
                  Dashboard
                </Button>
              </Space>
            }
            icon={<ShieldOutlined style={{ color: '#ff4d4f', fontSize: '72px' }} />}
            style={{
              background: 'white',
              padding: '48px',
              borderRadius: '16px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}
          />
        </div>
      )
    }

    // Default fallback if not showing unauthorized UI
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

// Convenience components
export const AdminProtectedRoute = ({ children }) => (
  <EnhancedProtectedRoute requiredRoles="ADMIN">{children}</EnhancedProtectedRoute>
)

export const FinanceProtectedRoute = ({ children }) => (
  <EnhancedProtectedRoute requiredRoles={["ADMIN", "FINANCE"]}>{children}</EnhancedProtectedRoute>
)

export const SalesmanProtectedRoute = ({ children }) => (
  <EnhancedProtectedRoute requiredRoles={["ADMIN", "FINANCE", "SALESPERSON"]} restrictSalesman={true}>
    {children}
  </EnhancedProtectedRoute>
)

export default EnhancedProtectedRoute
