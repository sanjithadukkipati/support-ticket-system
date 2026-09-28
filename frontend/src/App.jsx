import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import CustomerDashboard from './pages/CustomerDashboard';
import AgentDashboard from './pages/AgentDashboard';
import TicketDetail from './pages/TicketDetail';

export default function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <Router>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar
          user={user}
          onLogout={handleLogout}
          onOpenCreateModal={() => setIsCreateModalOpen(true)}
        />

        <main style={{ flex: 1 }}>
          <Routes>
            {/* Root Landing Redirect */}
            <Route
              path="/"
              element={
                !user ? (
                  <Navigate to="/login" replace />
                ) : user.role === 'agent' ? (
                  <Navigate to="/agent-dashboard" replace />
                ) : (
                  <Navigate to="/customer-dashboard" replace />
                )
              }
            />

            {/* Auth Routes */}
            <Route
              path="/login"
              element={user ? <Navigate to="/" replace /> : <Login onLoginSuccess={handleLoginSuccess} />}
            />
            <Route
              path="/register"
              element={user ? <Navigate to="/" replace /> : <Register onLoginSuccess={handleLoginSuccess} />}
            />

            {/* Customer Dashboard Route */}
            <Route
              path="/customer-dashboard"
              element={
                user ? (
                  user.role === 'agent' ? (
                    <Navigate to="/agent-dashboard" replace />
                  ) : (
                    <CustomerDashboard
                      user={user}
                      isCreateOpen={isCreateModalOpen}
                      setIsCreateOpen={setIsCreateModalOpen}
                    />
                  )
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />

            {/* Agent Dashboard Route */}
            <Route
              path="/agent-dashboard"
              element={
                user ? (
                  user.role === 'agent' ? (
                    <AgentDashboard user={user} />
                  ) : (
                    <Navigate to="/customer-dashboard" replace />
                  )
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />

            {/* Ticket Detail Route */}
            <Route
              path="/tickets/:id"
              element={user ? <TicketDetail currentUser={user} /> : <Navigate to="/login" replace />}
            />

            {/* 404 Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
