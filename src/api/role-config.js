/**
 * Centralized role-based access configuration.
 * Defines which roles have access to specific features and navigation.
 */
export const ROLES = {
  ADMIN: 'ADMIN',
  FINANCE: 'FINANCE',
  SALESMAN: 'SALESMAN',
};

export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: {
    canManageUsers: true,
    canManageRoles: true,
    canManageCompanies: true,
    canViewPayments: true,
    canConfirmPayments: true,
    canViewDashboard: true,
  },
  [ROLES.FINANCE]: {
    canManageUsers: true,
    canManageRoles: true,
    canManageCompanies: true,
    canViewPayments: true,
    canConfirmPayments: true,
    canViewDashboard: true,
  },
  [ROLES.SALESMAN]: {
    canManageUsers: false,
    canManageRoles: false,
    canManageCompanies: false,
    canViewPayments: false, // Salesman only creates, doesn't manage list
    canConfirmPayments: false,
    canViewDashboard: true,
  },
};

/**
 * Checks if a user has at least one of the required roles.
 * @param {string|string[]} userRoles 
 * @param {string|string[]} requiredRoles 
 */
export const hasRequiredRole = (userRoles, requiredRoles) => {
  const uRoles = Array.isArray(userRoles) ? userRoles : [userRoles];
  const rRoles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
  
  if (!uRoles || uRoles.length === 0) return false;
  return rRoles.some(role => uRoles.includes(role));
};
