import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './components/Dashboard'
import InventoryPage from './components/InventoryPage'
import UsagePage from './components/UsagePage'
import LedgerPage from './components/LedgerPage'
import ReportsPage from './components/ReportsPage'
import SettingsPage from './components/SettingsPage'
import LoginPage from './components/auth/LoginPage'
import SignupPage from './components/auth/SignupPage'
import ProtectedRoute from './components/auth/ProtectedRoute'
import { AuthProvider } from './contexts/AuthContext'
import { useState, useEffect } from 'react'

function App() {
  const [activeItem, setActiveItem] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const renderContent = () => {
    switch (activeItem) {
      case 'dashboard': return <Dashboard />;
      case 'inventory': return <InventoryPage searchQuery={searchQuery} />;
      case 'usage': return <UsagePage />;
      case 'ledger': return <LedgerPage searchQuery={searchQuery} />;
      case 'reports': return <ReportsPage />;
      case 'settings': return (
        <SettingsPage 
          isDarkMode={isDarkMode} 
          onToggleDarkMode={() => setIsDarkMode(!isDarkMode)} 
        />
      );
      default: return <Dashboard />;
    }
  };

  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={
            <Layout 
              activeItem={activeItem} 
              onItemSelect={(id) => {
                setActiveItem(id);
                setSearchQuery('');
              }}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            >
              {renderContent()}
            </Layout>
          } />
          <Route path="/dashboard" element={<Navigate to="/" replace />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}

export default App
