import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

const Breadcrumbs = ({ items = [] }) => {
  return (
    <div className="breadcrumbs">
      <Home size={14} style={{ marginRight: '2px' }} />
      <a href="#dashboard" onClick={(e) => {
        e.preventDefault();
        window.location.hash = 'dashboard';
      }}>Home</a>
      
      {items.map((item, idx) => (
        <React.Fragment key={idx}>
          <ChevronRight size={12} style={{ color: 'hsl(var(--text-muted))' }} />
          {item.hash ? (
            <a href={item.hash} onClick={(e) => {
              e.preventDefault();
              window.location.hash = item.hash.replace('#', '');
            }}>{item.label}</a>
          ) : (
            <span style={{ color: 'hsl(var(--text-primary))', fontWeight: '500' }}>{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default Breadcrumbs;
