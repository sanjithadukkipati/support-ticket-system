import React, { useState, useEffect } from 'react';
import TicketCard from '../components/TicketCard';
import CreateTicketModal from '../components/CreateTicketModal';
import { PlusCircle, Search, LifeBuoy, AlertCircle, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import api from '../api';

export default function CustomerDashboard({ user, isCreateOpen, setIsCreateOpen }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await api.get('/tickets');
      setTickets(res.data);
    } catch (err) {
      console.error('Failed to load tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  // Stats
  const totalCount = tickets.length;
  const openCount = tickets.filter(t => t.status === 'open').length;
  const inProgressCount = tickets.filter(t => t.status === 'in_progress').length;
  const closedCount = tickets.filter(t => t.status === 'closed').length;

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (ticket.description && ticket.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div style={{ maxWidth: '1320px', margin: '0 auto', padding: '36px 24px' }}>
      {/* Top Hero Banner */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '36px',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
            <span className="badge badge-in_progress" style={{ padding: '4px 12px', fontSize: '0.75rem' }}>
              <Sparkles size={13} /> CUSTOMER SUPPORT DESK
            </span>
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: '800' }}>
            Welcome back, <span className="text-gradient">{user?.name || 'Customer'}</span> 👋
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.98rem' }}>
            Track active resolution updates or initiate a new priority technical support request.
          </p>
        </div>

        <button className="btn-primary" onClick={() => setIsCreateOpen(true)} style={{ padding: '12px 24px' }}>
          <PlusCircle size={19} />
          Create Support Ticket
        </button>
      </div>

      {/* Metrics Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '20px',
        marginBottom: '36px'
      }}>
        <div className="glass-card-interactive" style={{ padding: '22px', display: 'flex', alignItems: 'center', gap: '18px' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(139,92,246,0.1) 100%)',
            border: '1px solid rgba(99,102,241,0.3)',
            color: 'var(--accent-indigo)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--glow-indigo)'
          }}>
            <LifeBuoy size={26} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Total Requests
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-main)' }}>{totalCount}</div>
          </div>
        </div>

        <div className="glass-card-interactive" style={{ padding: '22px', display: 'flex', alignItems: 'center', gap: '18px' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, rgba(245,158,11,0.2) 0%, rgba(217,119,6,0.1) 100%)',
            border: '1px solid rgba(245,158,11,0.3)',
            color: '#fbbf24',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 15px rgba(245,158,11,0.2)'
          }}>
            <AlertCircle size={26} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Open Tickets
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: '#fbbf24' }}>{openCount}</div>
          </div>
        </div>

        <div className="glass-card-interactive" style={{ padding: '22px', display: 'flex', alignItems: 'center', gap: '18px' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, rgba(6,182,212,0.2) 0%, rgba(2,132,199,0.1) 100%)',
            border: '1px solid rgba(6,182,212,0.3)',
            color: '#38bdf8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--glow-cyan)'
          }}>
            <Clock size={26} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              In Progress
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: '#38bdf8' }}>{inProgressCount}</div>
          </div>
        </div>

        <div className="glass-card-interactive" style={{ padding: '22px', display: 'flex', alignItems: 'center', gap: '18px' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, rgba(16,185,129,0.2) 0%, rgba(5,150,105,0.1) 100%)',
            border: '1px solid rgba(16,185,129,0.3)',
            color: '#34d399',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 15px rgba(16,185,129,0.2)'
          }}>
            <CheckCircle2 size={26} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Resolved
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: '#34d399' }}>{closedCount}</div>
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        {/* Search */}
        <div style={{ position: 'relative', width: '340px' }}>
          <input
            type="text"
            className="input-field"
            placeholder="Search tickets by keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '40px' }}
          />
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '6px', background: 'rgba(255, 255, 255, 0.04)', padding: '5px', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
          {['all', 'open', 'in_progress', 'closed'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              style={{
                background: statusFilter === st ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'transparent',
                color: statusFilter === st ? '#ffffff' : 'var(--text-muted)',
                border: 'none',
                padding: '7px 16px',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: '700',
                cursor: 'pointer',
                textTransform: 'capitalize',
                transition: 'all 0.2s ease',
                boxShadow: statusFilter === st ? '0 2px 10px rgba(99,102,241,0.3)' : 'none'
              }}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Ticket Grid */}
      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
          Syncing support tickets...
        </div>
      ) : filteredTickets.length === 0 ? (
        <div className="glass-panel" style={{ padding: '54px', textAlign: 'center' }}>
          <LifeBuoy size={48} color="var(--text-dim)" style={{ marginBottom: '16px' }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>No Tickets Found</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginBottom: '24px' }}>
            {searchQuery || statusFilter !== 'all' 
              ? 'No support requests match your filter parameters.'
              : 'You have not submitted any support requests yet.'}
          </p>
          <button className="btn-primary" onClick={() => setIsCreateOpen(true)}>
            <PlusCircle size={18} />
            Create Your First Ticket
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '20px' }}>
          {filteredTickets.map(ticket => (
            <TicketCard key={ticket.id} ticket={ticket} isAgent={false} />
          ))}
        </div>
      )}

      {/* Modal Popup */}
      <CreateTicketModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onTicketCreated={fetchTickets}
      />
    </div>
  );
}
