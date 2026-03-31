import React, { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { hasRequiredRole } from '../api/role-config'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => {
    return localStorage.getItem('ce_token') || localStorage.getItem('authToken') || null
  })
  const [user, setUser] = useState(() => {
    try {
      const ce = localStorage.getItem('ce_user')
      if (ce) return JSON.parse(ce)
      const au = localStorage.getItem('authUser')
      if (au) return JSON.parse(au)
      return null
    } catch (e) { return null }
  })

  useEffect(() => {
    if (token) localStorage.setItem('ce_token', token)
    else localStorage.removeItem('ce_token')
  }, [token])

  useEffect(() => {
    if (user) localStorage.setItem('ce_user', JSON.stringify(user))
    else localStorage.removeItem('ce_user')
  }, [user])

  // Set token and user from login/otp verification
  const login = ({ token, user }) => {
    setToken(token)
    setUser(user)
  }

  const logout = () => {
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  return useContext(AuthContext)
}

export const RequireAuth = ({ children }) => {
  const auth = useAuth()
  const { pathname } = window.location
  if (!auth?.token) {
    return <Navigate to="/login" replace state={{ from: pathname }} />
  }
  return children
}

// Role-based helper functions
export const hasRole = (user, role) => {
  return hasRequiredRole(user?.role, [role]);
};

export const hasAnyRole = (user, requiredRoles) => {
  return hasRequiredRole(user?.role, requiredRoles);
};

export default AuthContext
