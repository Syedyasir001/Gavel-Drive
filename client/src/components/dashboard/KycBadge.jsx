import React from 'react';

const KycBadge = ({ status = 'unverified', onClick, interactive = false }) => {
  const normalized = status?.toLowerCase() || 'unverified';

  let config = {
    label: 'Unverified',
    tooltip: 'Identity verification required to place bids',
    bg: 'bg-gd-surface',
    text: 'text-gd-muted',
    border: 'border-gd-line',
    dot: 'bg-gd-ghost',
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
  };

  if (normalized === 'verified') {
    config = {
      label: 'Verified Bidder',
      tooltip: 'Identity verified with government document',
      bg: 'bg-gd-reserveMet/10',
      text: 'text-gd-reserveMet',
      border: 'border-gd-reserveMet/30',
      dot: 'bg-gd-reserveMet',
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    };
  } else if (normalized === 'pending') {
    config = {
      label: 'KYC Pending',
      tooltip: 'Verification submitted and undergoing automated review',
      bg: 'bg-gd-warning/15',
      text: 'text-gd-endingSoon',
      border: 'border-gd-warning/40',
      dot: 'bg-gd-warning',
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    };
  }

  const Tag = interactive ? 'button' : 'span';

  return (
    <Tag
      onClick={interactive ? onClick : undefined}
      title={config.tooltip}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-pill text-xs font-semibold border ${config.bg} ${config.text} ${config.border} ${
        interactive ? 'cursor-pointer hover:opacity-85 transition-opacity' : ''
      }`}
    >
      <span className="shrink-0">{config.icon}</span>
      <span>{config.label}</span>
    </Tag>
  );
};

export default KycBadge;
