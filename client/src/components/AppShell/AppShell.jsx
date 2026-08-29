import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../Navbar/Navbar.jsx';
import { Sidebar } from '../Sidebar/Sidebar.jsx';
import { NotificationDrawer } from '../NotificationDrawer/NotificationDrawer.jsx';
import { ComposeModal } from '../ComposeEmail/ComposeModal.jsx';
import { SmartSearchModal } from '../AITools/SmartSearchModal.jsx';
import { useSocket } from '../../hooks/useSocket.js';

export const AppShell = () => {
  // Subscribe to real-time Socket.IO events
  useSocket();

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Layout Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar />

        {/* Dynamic Route Content */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          <Outlet />
        </main>
      </div>

      {/* Global Notification Drawer */}
      <NotificationDrawer />

      {/* Global Compose Modal */}
      <ComposeModal />

      {/* Smart Search Modal */}
      <SmartSearchModal />
    </div>
  );
};
