import React from 'react';
import { ClipboardList } from 'lucide-react';

const EmptyState = ({ title = 'No records found', description = 'There are no disciplinary logs matching the current criteria.', children }) => {
  return (
    <div className="empty-state">
      <div style={{ color: 'hsl(var(--text-muted))', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '50%' }}>
        <ClipboardList size={48} />
      </div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-desc">{description}</p>
      {children}
    </div>
  );
};

export default EmptyState;
