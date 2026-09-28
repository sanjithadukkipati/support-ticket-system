import React, { useState, useEffect } from 'react';
import { Send, MessageSquare, Clock, ShieldCheck } from 'lucide-react';
import api from '../api';

export default function CommentSection({ ticketId, currentUser }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchComments = async () => {
    try {
      const res = await api.get(`/tickets/${ticketId}/comments`);
      setComments(res.data);
    } catch (err) {
      console.error('Failed to load comments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [ticketId]);

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);
    setError('');
    try {
      await api.post(`/tickets/${ticketId}/comments`, { comment: newComment.trim() });
      setNewComment('');
      await fetchComments();
    } catch (err) {
      console.error('Failed to post comment:', err);
      setError('Could not post comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <MessageSquare className="text-gradient" size={22} />
        <h3 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Activity Thread ({comments.length})</h3>
      </div>

      {/* Comment Stream */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {loading ? (
          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-dim)' }}>Loading conversation...</div>
        ) : comments.length === 0 ? (
          <div style={{
            padding: '28px',
            textAlign: 'center',
            background: 'rgba(255, 255, 255, 0.02)',
            borderRadius: '12px',
            border: '1px dashed var(--border-glass)',
            color: 'var(--text-dim)',
            fontSize: '0.9rem'
          }}>
            No activity posted yet. Send a response below to update the ticket timeline.
          </div>
        ) : (
          comments.map((item) => {
            const isAgent = item.user_role === 'agent';
            const isMe = currentUser && item.user_id === currentUser.id;
            const timeStr = new Date(item.created_at).toLocaleString(undefined, {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });

            return (
              <div
                key={item.id}
                style={{
                  padding: '18px',
                  borderRadius: '14px',
                  background: isAgent ? 'rgba(6, 182, 212, 0.06)' : 'rgba(255, 255, 255, 0.03)',
                  border: isAgent ? '1px solid rgba(6, 182, 212, 0.25)' : '1px solid var(--border-glass)',
                  display: 'flex',
                  gap: '14px'
                }}
              >
                {/* Avatar */}
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: isAgent ? 'linear-gradient(135deg, #06b6d4, #3b82f6)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '700',
                  fontSize: '0.9rem',
                  flexShrink: 0,
                  boxShadow: isAgent ? 'var(--glow-cyan)' : 'var(--glow-indigo)'
                }}>
                  {item.user_name ? item.user_name.charAt(0).toUpperCase() : 'U'}
                </div>

                <div style={{ flex: 1 }}>
                  {/* Author Header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: '700', fontSize: '0.92rem', color: 'var(--text-main)' }}>
                        {item.user_name}
                      </span>
                      {isAgent ? (
                        <span className="badge badge-in_progress" style={{ fontSize: '0.6875rem' }}>
                          <ShieldCheck size={12} /> Support Specialist
                        </span>
                      ) : (
                        <span className="badge badge-priority-low" style={{ fontSize: '0.6875rem' }}>
                          Customer
                        </span>
                      )}
                      {isMe && <span style={{ fontSize: '0.75rem', color: 'var(--accent-indigo)', fontWeight: '700' }}>(You)</span>}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={12} />
                      {timeStr}
                    </span>
                  </div>

                  {/* Body Text */}
                  <p style={{ fontSize: '0.93rem', color: 'var(--text-main)', whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>
                    {item.comment}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Post Comment Input Form */}
      {error && <div style={{ color: '#fb7185', fontSize: '0.85rem' }}>{error}</div>}
      <form onSubmit={handlePostComment} style={{ marginTop: '8px' }}>
        <div className="form-group" style={{ marginBottom: '12px' }}>
          <textarea
            className="textarea-field"
            rows={3}
            placeholder="Type your response or status update..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" className="btn-primary" disabled={submitting || !newComment.trim()}>
            <Send size={15} />
            {submitting ? 'Posting...' : 'Post Response'}
          </button>
        </div>
      </form>
    </div>
  );
}
