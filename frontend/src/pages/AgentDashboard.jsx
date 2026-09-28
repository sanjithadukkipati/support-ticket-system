import React, { useState, useEffect } from 'react';
import { StatusBadge, PriorityBadge } from '../components/StatusBadge';
import { Link } from 'react-router-dom';
import { ShieldCheck, Search, UserCheck, AlertCircle, Clock, CheckCircle2, RefreshCw, ArrowRight, User } from 'lucide-react';
import api from '../api';

export default function AgentDashboard({ user }) {
  const [tickets, setTickets] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ticketsRes, usersRes] = await Promise.all([
        api.get('/tickets'),
        api.get('/users')
      ]);
      setTickets(ticketsRes.data);
      setAgents(usersRes.data.filter(u => u.role === 'agent'));
    } catch (err) {
      console.error('Failed to load agent queue:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleQuickStatusChange = async (ticketId, newStatus) => {
    setUpdatingId(ticketId);
    try {
      await api.put(`/tickets/${ticketId}`, { status: newStatus });
      await fetchData();
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleQuickAssign = async (ticketId, newAssigneeId) => {
    setUpdatingId(ticketId);
    try {
      await api.put(`/tickets/${ticketId}`, { assigned_to: newAssigneeId ? parseInt(newAssigneeId, 10) : null });
      await fetchData();
    } catch (err) {
      console.error('Failed to assign ticket:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  // Stats
  const unassignedCount = tickets.filter(t => !t.assigned_to).length;
  const openCount = tickets.filter(t => t.status === 'open').length;
  const inProgressCount = tickets.filter(t => t.status === 'in_progress').length;
  const closedCount = tickets.filter(t => t.status === 'closed').length;

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (ticket.customer_name && ticket.customer_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (ticket.customer_email && ticket.customer_email.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div style={{ maxWidth: '1320px', margin: '0 auto', padding: '36px 24px' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '32px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span className="badge badge-in_progress" style={{ padding: '4px 12px', fontSize: '0.75rem' }}>
              <ShieldCheck size={13} /> AGENT WORKSPACE QUEUE
            </span>
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: '800' }}>
            Support Queue <span className="text-gradient">Control Center</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Realtime SLA oversight, ticket allocation, and resolution management.
          </p>
        </div>

        <button className="btn-secondary" onClick={fetchData} disabled={loading} style={{ padding: '10px 18px' }}>
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Sync Queue
        </button>
      </div>

      {/* Stats Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '20px',
        marginBottom: '32px'
      }}>
        {/* Unassigned Card */}
        <div className="glass-card-interactive" style={{ padding: '22px', display: 'flex', alignItems: 'center', gap: '18px' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, rgba(244,63,94,0.2) 0%, rgba(225,29,72,0.1) 100%)',
            border: '1px solid rgba(244,63,94,0.3)',
            color: '#fb7185',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 15px rgba(244,63,94,0.2)'
          }}>
            <AlertCircle size={26} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Unassigned Issues
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: '#fb7185' }}>{unassignedCount}</div>
          </div>
        </div>

        {/* Open Card */}
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
            <Clock size={26} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Active Open
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: '#fbbf24' }}>{openCount}</div>
          </div>
        </div>

        {/* In Progress Card */}
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
            <UserCheck size={26} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              In Progress
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: '#38bdf8' }}>{inProgressCount}</div>
          </div>
        </div>

        {/* Resolved Card */}
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
              Resolved Tickets
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: '#34d399' }}>{closedCount}</div>
          </div>
        </div>
      </div>

      {/* Control Bar & Filters */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        marginBottom: '24px',
        flexWrap: 'wrap'
      }}>
        {/* Search Input */}
        <div style={{ position: 'relative', width: '320px' }}>
          <input
            type="text"
            className="input-field"
            placeholder="Search by subject or customer email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '40px' }}
          />
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: '600' }}>Status:</span>
            <select
              className="select-field"
              style={{ width: '140px', padding: '9px 12px' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: '600' }}>Priority:</span>
            <select
              className="select-field"
              style={{ width: '140px', padding: '9px 12px' }}
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Translucent Enterprise Table */}
      <div className="glass-panel" style={{ overflow: 'hidden', padding: 0 }}>
        <table className="enterprise-table">
          <thead>
            <tr>
              <th>Ticket ID & Subject</th>
              <th>Customer</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Assigned Agent</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ padding: '50px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  Syncing ticket queue...
                </td>
              </tr>
            ) : filteredTickets.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '50px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No tickets match the selected filters.
                </td>
              </tr>
            ) : (
              filteredTickets.map(ticket => (
                <tr key={ticket.id}>
                  {/* Subject */}
                  <td style={{ maxWidth: '320px' }}>
                    <div className="ticket-id" style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--accent-indigo)', marginBottom: '2px' }}>
                      #TICK-{ticket.id}
                    </div>
                    <Link to={`/tickets/${ticket.id}`} style={{ fontWeight: '700', color: 'var(--text-main)', fontSize: '0.95rem' }}>
                      {ticket.subject}
                    </Link>
                  </td>

                  {/* Customer Info */}
                  <td>
                    <div style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '0.9rem' }}>
                      {ticket.customer_name || 'Customer'}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                      {ticket.customer_email}
                    </div>
                  </td>

                  {/* Status Selector */}
                  <td>
                    <select
                      className="select-field"
                      style={{ padding: '6px 10px', fontSize: '0.82rem', width: '135px' }}
                      value={ticket.status}
                      disabled={updatingId === ticket.id}
                      onChange={(e) => handleQuickStatusChange(ticket.id, e.target.value)}
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="closed">Closed</option>
                    </select>
                  </td>

                  {/* Priority Tag */}
                  <td>
                    <PriorityBadge priority={ticket.priority} />
                  </td>

                  {/* Assigned Agent Selector */}
                  <td>
                    <select
                      className="select-field"
                      style={{ padding: '6px 10px', fontSize: '0.82rem', width: '160px' }}
                      value={ticket.assigned_to || ''}
                      disabled={updatingId === ticket.id}
                      onChange={(e) => handleQuickAssign(ticket.id, e.target.value)}
                    >
                      <option value="">-- Unassigned --</option>
                      {agents.map(ag => (
                        <option key={ag.id} value={ag.id}>
                          {ag.name}
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* Action Link */}
                  <td style={{ textAlign: 'right' }}>
                    <Link to={`/tickets/${ticket.id}`} className="btn-secondary" style={{ padding: '6px 14px', fontSize: '0.8rem' }}>
                      Open Ticket
                      <ArrowRight size={14} />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
