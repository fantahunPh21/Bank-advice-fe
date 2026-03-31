import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const MainLayout = ({ children, selectedKey }) => {
  const [collapsed, setCollapsed] = useState(false);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  // Sidebar visibility is managed by the Sidebar component itself based on auth token
  const showSidebar = true;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f5f7fa' }}>
      {showSidebar && <Sidebar collapsed={collapsed} selected={selectedKey} />}
      <div 
        style={{ 
          flex: 1, 
          // Apply margin-left only if the sidebar is shown
          marginLeft: showSidebar ? (collapsed ? 80 : 220) : 0, 
          transition: 'margin-left 0.3s ease',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {showSidebar && <Header onToggleSidebar={toggleSidebar} collapsed={collapsed} />}
        <main className="page-content" style={{ flex: 1, padding: '24px' }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
