import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import 'antd/dist/reset.css'
import './_components/antd.css'
import Payments from './customerEngagement/Payments'
import Dashboard from './customerEngagement/Dashboard'
import { AuthProvider, RequireAuth } from './auth/AuthProvider'
import { 
  AdminProtectedRoute, 
  FinanceProtectedRoute, 
  SalesmanProtectedRoute 
} from './components/EnhancedProtectedRoute'
import Login from './auth/Login'
import OtpVerification from './auth/OtpVerification'
import MaterialManagement from './settings/MaterialManagement'
import SettingsDashboard from './settings/SettingsDashboard'
import Companies from './admin/Companies'
import Users from './admin/Users'
import Roles from './admin/Roles'

const root = createRoot(document.getElementById('root'))
root.render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter basename="/bank-advice">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/otp-verification" element={<OtpVerification />} />

          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/dashboard" element={<SalesmanProtectedRoute><Dashboard /></SalesmanProtectedRoute>} />
          
          <Route path="/companies" element={<FinanceProtectedRoute><Companies /></FinanceProtectedRoute>} />
          <Route path="/users" element={<FinanceProtectedRoute><Users /></FinanceProtectedRoute>} />
          <Route path="/roles" element={<FinanceProtectedRoute><Roles /></FinanceProtectedRoute>} />

          <Route path="/payments" element={<FinanceProtectedRoute><Payments /></FinanceProtectedRoute>} />
          <Route path="/settings" element={<AdminProtectedRoute><SettingsDashboard /></AdminProtectedRoute>} />
          <Route path="/settings/materials" element={<AdminProtectedRoute><MaterialManagement /></AdminProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
)
