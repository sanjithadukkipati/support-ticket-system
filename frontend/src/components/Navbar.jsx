import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LifeBuoy, LogOut, PlusCircle, ShieldCheck } from 'lucide-react';

export default function Navbar({ user, onLogout, onOpenCreateModal }) {
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <header style={{
      background: 'rgba(8, 12, 20, 0.85)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border-glass)',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      <div style={{
        maxWidth: '1320px',
        margin: '0 auto',
        padding: '14px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Brand Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #d946ef 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 4px 20px rgba(99, 102, 241, 0.45)'
          }}>
            <LifeBuoy size={22} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: '800', lineHeight: '1.2' }}>
              Ticket<span className="text-gradient">Desk</span>
            </h1>
            <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', fontWeight: '600', letterSpacing: '0.05em' }}>
              ENTERPRISE WORKSPACE
            </span>
          </div>
        </Link>

        {/* User Navigation Actions */}
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {user.role === 'customer' && onOpenCreateModal && (
              <button className="btn-primary" onClick={onOpenCreateModal}>
                <PlusCircle size={17} />
                Create Ticket
              </button>
            )}

            {/* User Profile Pill */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '6px 14px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-glass)',
              borderRadius: '24px',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: user.role === 'agent' ? 'linear-gradient(135deg, #06b6d4, #3b82f6)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.85rem',
                fontWeight: '700',
                boxShadow: user.role === 'agent' ? 'var(--glow-cyan)' : 'var(--glow-indigo)'
              }}>
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div style={{ lineHeight: '1.2' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-main)' }}>{user.name}</div>
                <div style={{ fontSize: '0.7rem', color: user.role === 'agent' ? 'var(--accent-cyan)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {user.role === 'agent' ? <><ShieldCheck size={11} /> Support Agent</> : 'Customer Portal'}
                </div>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogoutClick}
              title="Logout"
              className="btn-secondary"
              style={{ padding: '8px 14px', fontSize: '0.82rem' }}
            >
              <LogOut size={15} />
              Logout
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '12px' }}>
            <Link to="/login" className="btn-secondary">Sign In</Link>
            <Link to="/register" className="btn-primary">Register Workspace</Link>
          </div>
        )}
      </div>
    </header>
  );
}
