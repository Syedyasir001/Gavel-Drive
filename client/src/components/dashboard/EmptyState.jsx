import React from 'react';
import { Link } from 'react-router-dom';

const EmptyState = ({
  icon,
  title,
  description,
  actionText = 'Browse Live Auctions',
  actionLink = '/browse',
  actionIcon,
  onActionClick,
}) => {
  return (
    <div className="p-8 sm:p-12 text-center flex flex-col items-center justify-center">
      <div className="w-14 h-14 rounded-md bg-gd-surface border border-gd-line flex items-center justify-center mb-4 text-gd-muted">
        {icon || (
          <svg className="w-6 h-6 text-gd-ghost" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        )}
      </div>

      <h3 className="text-base font-semi text-gd-ink mb-1">{title}</h3>
      <p className="text-xs text-gd-muted max-w-sm mb-6 leading-relaxed">
        {description}
      </p>

      {onActionClick ? (
        <button
          onClick={onActionClick}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-gd-primary hover:bg-gd-primaryHover text-gd-inverse text-xs font-bold transition-all shadow-sm cursor-pointer"
        >
          {actionIcon || (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )}
          {actionText}
        </button>
      ) : (
        <Link
          to={actionLink}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-gd-primary hover:bg-gd-primaryHover text-gd-inverse text-xs font-bold transition-all shadow-sm cursor-pointer"
        >
          {actionIcon || (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )}
          {actionText}
        </Link>
      )}
    </div>
  );
};

export default EmptyState;
