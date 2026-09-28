import React from 'react';
import { AlertCircle, Clock, CheckCircle2, AlertTriangle, Shield, ArrowDown } from 'lucide-react';

export function StatusBadge({ status }) {
  switch (status) {
    case 'open':
      return (
        <span className="badge badge-open">
          <span className="status-dot status-dot-open"></span>
          Open
        </span>
      );
    case 'in_progress':
      return (
        <span className="badge badge-in_progress">
          <span className="status-dot status-dot-in_progress"></span>
          In Progress
        </span>
      );
    case 'closed':
      return (
        <span className="badge badge-closed">
          <span className="status-dot status-dot-closed"></span>
          Resolved
        </span>
      );
    default:
      return <span className="badge">{status}</span>;
  }
}

export function PriorityBadge({ priority }) {
  switch (priority) {
    case 'high':
      return (
        <span className="badge badge-priority-high">
          <AlertTriangle size={13} />
          High
        </span>
      );
    case 'medium':
      return (
        <span className="badge badge-priority-medium">
          <Shield size={13} />
          Medium
        </span>
      );
    case 'low':
      return (
        <span className="badge badge-priority-low">
          <ArrowDown size={13} />
          Low
        </span>
      );
    default:
      return <span className="badge">{priority}</span>;
  }
}
