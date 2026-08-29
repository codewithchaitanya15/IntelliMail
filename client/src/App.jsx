import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { Landing } from './pages/Landing.jsx';
import { Login } from './pages/Login.jsx';
import { Register } from './pages/Register.jsx';
import { Dashboard } from './pages/Dashboard.jsx';
import { Inbox } from './pages/Inbox.jsx';
import { Starred, Sent, Archive, Trash } from './pages/MailFolders.jsx';
import { Email } from './pages/Email.jsx';
import { Search } from './pages/Search.jsx';
import { Compose } from './pages/Compose.jsx';
import { Activity } from './pages/Activity.jsx';
import { Integrations } from './pages/Integrations.jsx';
import { Settings } from './pages/Settings.jsx';

import { AppShell } from './components/AppShell/AppShell.jsx';
import { ProtectedRoute } from './components/ProtectedRoute/ProtectedRoute.jsx';
import { useAuthStore } from './store/authStore.js';
import { useUIStore } from './store/uiStore.js';

export function App() {
  const { fetchMe, token } = useAuthStore();
  const { theme } = useUIStore();

  useEffect(() => {
    // Synchronize theme on bootstrap
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    if (token) {
      fetchMe();
    }
  }, [theme, token]);

  return (
    <Router>
      <Toaster
        position="top-right"
        toastOptions={{
          className: 'text-xs font-medium rounded-2xl shadow-xl border',
          style: {
            background: theme === 'dark' ? '#0f172a' : '#ffffff',
            color: theme === 'dark' ? '#f8fafc' : '#0f172a',
            borderColor: theme === 'dark' ? '#1e293b' : '#e2e8f0',
          },
        }}
      />

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected App Routes */}
        <Route
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/inbox" element={<Inbox />} />
          <Route path="/starred" element={<Starred />} />
          <Route path="/sent" element={<Sent />} />
          <Route path="/archive" element={<Archive />} />
          <Route path="/trash" element={<Trash />} />
          <Route path="/email/:id" element={<Email />} />
          <Route path="/search" element={<Search />} />
          <Route path="/compose" element={<Compose />} />
          <Route path="/activity" element={<Activity />} />
          <Route path="/integrations" element={<Integrations />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
