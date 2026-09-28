import React, { useState } from 'react';
import { X, Send, AlertCircle } from 'lucide-react';
import api from '../api';

export default function CreateTicketModal({ isOpen, onClose, onTicketCreated }) {
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!subject.trim()) {
      setError('Please enter a ticket subject.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/tickets', {
        subject: subject.trim(),
        description: description.trim(),
        priority
      });
      setSubject('');
      setDescription('');
      setPriority('medium');
      onTicketCreated();
      onClose();
    } catch (err) {
      console.error('Failed to create ticket:', err);
      setError(err.response?.data?.error || 'Failed to submit ticket. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="card-panel" style={{
        width: '100%',
        maxWidth: '520px',
        padding: '24px',
        position: 'relative',
        boxShadow: 'var(--shadow-lg)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Submit Support Ticket</h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              Fill in the details below to open a ticket with our support engineering team.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-tertiary)',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecdd3',
            color: '#991b1b',
            padding: '10px 12px',
            borderRadius: '6px',
            fontSize: '0.8125rem',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertCircle size={15} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Subject */}
          <div className="form-group">
            <label className="form-label">Subject *</label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. Database connection timeout in production environment"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
          </div>

          {/* Priority */}
          <div className="form-group">
            <label className="form-label">Priority Level</label>
            <select
              className="select-field"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="low">Low - General inquiry or request</option>
              <option value="medium">Medium - Standard operational issue</option>
              <option value="high">High - Production impact or blocker</option>
            </select>
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="textarea-field"
              rows={4}
              placeholder="Describe the issue, steps to reproduce, or relevant context..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Submitting...' : (
                <>
                  <Send size={15} />
                  Submit Ticket
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
