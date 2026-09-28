import React from 'react';
import { Link } from 'react-router-dom';
import { StatusBadge, PriorityBadge } from './StatusBadge';
import { Calendar, User, UserCheck, ArrowRight } from 'lucide-react';

export default function TicketCard({ ticket, isAgent }) {
  const formattedDate = new Date(ticket.created_at).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="glass-card-interactive" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Header Badges & ID */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
        <span className="ticket-id" style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--accent-indigo)', letterSpacing: '0.04em' }}>
          #TICK-{ticket.id}
        </span>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <StatusBadge status={ticket.status} />
          <PriorityBadge priority={ticket.priority} />
        </div>
      </div>

      {/* Subject */}
      <Link to={`/tickets/${ticket.id}`} style={{ textDecoration: 'none' }}>
        <h3 style={{
          fontSize: '1.08rem',
          fontWeight: '700',
          color: 'var(--text-main)',
          lineHeight: '1.4',
          transition: 'color 0.15s ease'
        }}>
          {ticket.subject}
        </h3>
      </Link>

      {/* Description Snippet */}
      <p style={{
        fontSize: '0.88rem',
        color: 'var(--text-muted)',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
        lineHeight: '1.5'
      }}>
        {ticket.description || 'No description provided.'}
      </p>

      {/* Footer Info */}
      <div style={{
        paddingTop: '14px',
        borderTop: '1px solid var(--border-glass)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.8rem',
        color: 'var(--text-dim)',
        marginTop: 'auto'
      }}>
        <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
          {isAgent && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: 'var(--text-muted)', fontWeight: '600' }}>
              <User size={13} color="var(--accent-indigo)" />
              {ticket.customer_name || 'Customer'}
            </span>
          )}
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            <Calendar size={13} />
            {formattedDate}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {ticket.assignee_name ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--accent-cyan)', fontWeight: '600' }}>
              <UserCheck size={13} />
              {ticket.assignee_name}
            </span>
          ) : (
            <span style={{ fontStyle: 'italic', color: 'var(--text-dim)' }}>Unassigned</span>
          )}

          <Link to={`/tickets/${ticket.id}`} className="btn-secondary" style={{ padding: '5px 12px', fontSize: '0.78rem' }}>
            View
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </div>
  );
}
