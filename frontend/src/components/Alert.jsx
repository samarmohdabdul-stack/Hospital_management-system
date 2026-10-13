import React from 'react';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

export default function Alert({ type = 'info', message, onClose }) {
  if (!message) return null;

  const styles = {
    info: { bg: 'var(--info-bg)', color: '#1d4ed8', border: '#bfdbfe', Icon: Info },
    success: { bg: 'var(--success-bg)', color: '#065f46', border: '#a7f3d0', Icon: CheckCircle },
    error: { bg: 'var(--danger-bg)', color: '#991b1b', border: '#fecaca', Icon: AlertCircle },
  };

  const current = styles[type] || styles.info;
  const Icon = current.Icon;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: current.bg,
        color: current.color,
        border: `1px solid ${current.border}`,
        borderRadius: 'var(--radius-md)',
        padding: '0.85rem 1.25rem',
        marginBottom: '1.25rem',
        fontSize: '0.9rem',
        fontWeight: 500,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Icon size={18} />
        <span>{message}</span>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0 }}
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
