import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import GroceryBill from './components/GroceryBill';
import Analytics from './components/Analytics';
import ShoppingList from './components/ShoppingList';
import ReceiptScanner from './components/ReceiptScanner';
import Login from './components/Login';
import Register from './components/Register';
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Dashboard Component
function Dashboard() {
  const [activeTab, setActiveTab] = useState('bill');
  const { user, logout } = useAuth();
  const userId = user?.id || 'user_123';

  const handleLogout = () => {
    logout();
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'bill':
        return <GroceryBill />;
      case 'analytics':
        return <Analytics userId={userId} />;
      case 'shopping-list':
        return <ShoppingList userId={userId} />;
      case 'scanner':
        return <ReceiptScanner onItemsExtracted={(items) => {
          console.log('Extracted items:', items);
        }} />;
      default:
        return <GroceryBill />;
    }
  };

  return (
    <div className="dashboard">
      <nav className="app-nav">
        <div className="nav-left">
          <button 
            className={activeTab === 'bill' ? 'active' : ''}
            onClick={() => setActiveTab('bill')}
          >
            🧾 New Bill
          </button>
          <button 
            className={activeTab === 'analytics' ? 'active' : ''}
            onClick={() => setActiveTab('analytics')}
          >
            📊 Analytics
          </button>
          <button 
            className={activeTab === 'shopping-list' ? 'active' : ''}
            onClick={() => setActiveTab('shopping-list')}
          >
            🛒 Shopping List
          </button>
          <button 
            className={activeTab === 'scanner' ? 'active' : ''}
            onClick={() => setActiveTab('scanner')}
          >
            📄 Receipt Scanner
          </button>
        </div>
        <div className="nav-right">
          <span className="user-info">👤 {user?.username}</span>
          <button className="btn-logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>
      
      <main className="app-content">
        {renderContent()}
      </main>
    </div>
  );
}

// Admin Dashboard Component
function AdminDashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="admin-dashboard">
      <nav className="app-nav">
        <div className="nav-left">
          <h2>Admin Dashboard</h2>
        </div>
        <div className="nav-right">
          <span className="user-info">👤 {user?.username} (Admin)</span>
          <button className="btn-logout" onClick={logout}>
            Logout
          </button>
        </div>
      </nav>
      
      <main className="app-content">
        <h1>Welcome to Admin Dashboard</h1>
        <p>Manage users, view all bills, and analytics here.</p>
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/admin/dashboard" 
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;