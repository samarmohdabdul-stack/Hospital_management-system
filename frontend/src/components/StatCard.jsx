import React from 'react';

export default function StatCard({ title, value, icon: Icon, color = 'blue', subtext }) {
  return (
    <div className="stat-card">
      <div className="stat-info">
        <p>{title}</p>
        <h3>{value}</h3>
        {subtext && <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>{subtext}</span>}
      </div>
      <div className={`stat-icon icon-${color}`}>
        {Icon && <Icon size={26} />}
      </div>
    </div>
  );
}
