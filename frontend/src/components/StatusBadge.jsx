import React from 'react';

export default function StatusBadge({ status }) {
  if (!status) return null;
  const s = status.toLowerCase();
  let badgeClass = 'badge-pending';

  if (s === 'confirmed' || s === 'active') badgeClass = 'badge-confirmed';
  else if (s === 'completed' || s === 'paid' || s === 'success') badgeClass = 'badge-completed';
  else if (s === 'cancelled' || s === 'unpaid' || s === 'failed') badgeClass = 'badge-cancelled';
  else if (s === 'partially_paid') badgeClass = 'badge-partially_paid';

  const label = status.replace('_', ' ');

  return <span className={`badge ${badgeClass}`}>{label}</span>;
}
