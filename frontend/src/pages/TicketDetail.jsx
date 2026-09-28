import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, User, Calendar, ShieldCheck, CheckCircle2, AlertCircle, Save } from 'lucide-react';
import { StatusBadge, PriorityBadge } from '../components/StatusBadge';
import CommentSection from '../components/CommentSection';
import api from '../api';

export default function TicketDetail({ currentUser }) {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Agent Edit Controls
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const isAgent = currentUser?.role === 'agent';

  const fetchTicketDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/tickets/${id}`);
      setTicket(res.data);
      setStatus(res.data.status);
      setPriority(res.data.priority);
      setAssignedTo(res.data.assigned_to || '');

      if (isAgent) {
        const usersRes = await api.get('/users');
        setAgents(usersRes.data.filter(u => u.role === 'agent'));
      }
    } catch (err) {
      console.error('Error fetching ticket detail:', err);
      if (err.response?.status === 403) {
        setError('403 Forbidden: You do not have permission to view this ticket.');
      } else if (err.response?.status === 404) {
        setError('404 Not Found: The requested support ticket does not exist.');
      } else {
        setError('Failed to load ticket details.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicketDetails();
  }, [id]);

  const handleUpdateTicket = async (e) => {
    e.preventDefault();
    if (!isAgent) return;

    setSaving(true);
    setSaveSuccess(false);
    try {
      await api.put(`/tickets/${id}`, {
        status,
        priority,
        assigned_to: assignedTo ? parseInt(assignedTo, 10) : null
      });
      setSaveSuccess(true);
      await fetchTicketDetails();
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update ticket:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '60px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
        Syncing ticket details...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: '560px', margin: '60px auto', padding: '0 24px' }}>
        <div className="glass-panel" style={{ padding: '36px', textAlign: 'center' }}>
          <AlertCircle size={48} color="#f43f5e" style={{ marginBottom: '16px' }} />
          <h2 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>Access Error</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>{error}</p>
          <Link to="/" className="btn-primary">
            <ArrowLeft size={16} />
            Back to Queue
          </Link>
        </div>
      </div>
    );
  }

  const createdDate = new Date(ticket.created_at).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short'
  });

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '36px 24px' }}>
      {/* Top Navigation */}
      <div style={{ marginBottom: '24px' }}>
        <Link to={isAgent ? '/agent-dashboard' : '/customer-dashboard'} className="btn-secondary" style={{ display: 'inline-flex', padding: '8px 16px' }}>
          <ArrowLeft size={16} />
          Back to Dashboard Queue
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px' }}>
        {/* Main Content Area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Ticket Header & Description */}
          <div className="glass-panel" style={{ padding: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <span className="ticket-id" style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--accent-indigo)', letterSpacing: '0.05em' }}>
                #TICK-{ticket.id}
              </span>
              <div style={{ display: 'flex', gap: '10px' }}>
                <StatusBadge status={ticket.status} />
                <PriorityBadge priority={ticket.priority} />
              </div>
            </div>

            <h1 style={{ fontSize: '1.8rem', lineHeight: '1.3', marginBottom: '20px' }}>
              {ticket.subject}
            </h1>

            {/* Author Info */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '18px',
              paddingBottom: '20px',
              marginBottom: '20px',
              borderBottom: '1px solid var(--border-glass)',
              fontSize: '0.88rem',
              color: 'var(--text-muted)',
              flexWrap: 'wrap'
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <User size={15} color="var(--accent-indigo)" />
                <strong>Customer:</strong> {ticket.customer_name} ({ticket.customer_email})
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={15} />
                Opened {createdDate}
              </span>
            </div>

            {/* Description Box */}
            <div style={{ background: 'rgba(10, 15, 26, 0.6)', padding: '22px', borderRadius: '14px', border: '1px solid var(--border-glass)' }}>
              <h4 style={{ fontSize: '0.78rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
                Issue Description
              </h4>
              <p style={{ fontSize: '1rem', lineHeight: '1.6', whiteSpace: 'pre-wrap', color: 'var(--text-main)' }}>
                {ticket.description || 'No detailed description provided.'}
              </p>
            </div>
          </div>

          {/* Comment Thread */}
          <CommentSection ticketId={id} currentUser={currentUser} />
        </div>

        {/* Sidebar Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-panel" style={{ padding: '26px' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={19} color="var(--accent-cyan)" />
              Ticket SLA Controls
            </h3>

            {isAgent ? (
              <form onSubmit={handleUpdateTicket} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {saveSuccess && (
                  <div style={{
                    background: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    color: '#34d399',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <CheckCircle2 size={16} /> Saved changes successfully!
                  </div>
                )}

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Resolution Status</label>
                  <select className="select-field" value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="closed">Closed / Resolved</option>
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Priority Level</label>
                  <select className="select-field" value={priority} onChange={(e) => setPriority(e.target.value)}>
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Assigned Specialist</label>
                  <select className="select-field" value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)}>
                    <option value="">-- Unassigned --</option>
                    {agents.map(ag => (
                      <option key={ag.id} value={ag.id}>
                        {ag.name}
                      </option>
                    ))}
                  </select>
                </div>

                <button type="submit" className="btn-primary" disabled={saving} style={{ marginTop: '8px', justifyContent: 'center' }}>
                  <Save size={16} />
                  {saving ? 'Updating...' : 'Save Ticket Changes'}
                </button>
              </form>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', fontSize: '0.92rem' }}>
                <div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Current Status</div>
                  <div style={{ marginTop: '6px' }}>
                    <StatusBadge status={ticket.status} />
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Priority Level</div>
                  <div style={{ marginTop: '6px' }}>
                    <PriorityBadge priority={ticket.priority} />
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Assigned Support Specialist</div>
                  <div style={{ marginTop: '6px', fontWeight: '700', color: ticket.assignee_name ? 'var(--accent-cyan)' : 'var(--text-dim)' }}>
                    {ticket.assignee_name ? `⚡ ${ticket.assignee_name}` : 'Unassigned'}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
