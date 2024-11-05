import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, App as AntApp } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import MainLayout from './components/MainLayout';
import Dashboard from './components/Dashboard';
import TransactionList from './components/TransactionList';
import TransactionForm from './components/TransactionForm';
import UserManagement from './components/UserManagement';
import Login from './components/Login';
import { useAuthStore } from './stores/authStore';

const ProtectedRoute = ({ children, adminOnly = false }: { children: React.ReactNode, adminOnly?: boolean }) => {
  const { isAuthenticated, user } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const App: React.FC = () => {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#1677ff',
        },
      }}
    >
      <AntApp>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={
              isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
            } />
            <Route path="/" element={
              <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
            } />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="expense" element={
                <ProtectedRoute adminOnly>
                  <TransactionList type="expense" />
                </ProtectedRoute>
              } />
              <Route path="income" element={
                <ProtectedRoute adminOnly>
                  <TransactionList type="income" />
                </ProtectedRoute>
              } />
              <Route path="add-transaction" element={
                <ProtectedRoute adminOnly>
                  <TransactionForm />
                </ProtectedRoute>
              } />
              <Route path="users" element={
                <ProtectedRoute adminOnly>
                  <UserManagement />
                </ProtectedRoute>
              } />
            </Route>
          </Routes>
        </BrowserRouter>
      </AntApp>
    </ConfigProvider>
  );
};

export default App;