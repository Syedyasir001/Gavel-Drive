import React from 'react';

// Helper to compute pagination items with ellipsis
const getPageRange = (currentPage, totalPages) => {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  // Exact 7-step layout behavior matching: 1, 2, 3, ..., 7 when near start
  if (currentPage <= 3) {
    return [1, 2, 3, '...', totalPages];
  }

  // When near the end
  if (currentPage >= totalPages - 2) {
    return [1, '...', totalPages - 2, totalPages - 1, totalPages];
  }

  // In the middle: 1, ..., (cur-1), cur, (cur+1), ..., total
  return [1, '...left', currentPage - 1, currentPage, currentPage + 1, '...right', totalPages];
};

/**
 * Standalone Pagination controls element matching the user's HTML structure
 * with full interactivity, smooth animations, and accessibility.
 */
export const PaginationControl = ({
  currentPage = 1,
  totalPages = 7,
  onPageChange = () => {},
  showPrev = true,
  showNext = true,
  className = '',
}) => {
  const pages = getPageRange(currentPage, totalPages);

  const handlePageClick = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  const handleEllipsisJump = (isLeft) => {
    if (isLeft) {
      // Jump back by 2 pages
      const target = Math.max(1, currentPage - 2);
      onPageChange(target);
    } else {
      // Jump forward by 2 pages
      const target = Math.min(totalPages, currentPage + 2);
      onPageChange(target);
    }
  };

  return (
    <div className={`flex items-center gap-1.5 select-none ${className}`}>
      {/* Previous Page Button */}
      {showPrev && (
        <button
          type="button"
          onClick={() => handlePageClick(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Previous Page"
          className="group px-2.5 sm:px-3 h-8 rounded border border-slate-200 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-600 hover:text-slate-900 text-xs font-bold flex items-center gap-1 transition-all duration-200 mr-0.5 shadow-xs hover:shadow-sm hover:-translate-y-0.5 active:scale-95 cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed disabled:pointer-events-none disabled:transform-none disabled:shadow-none"
        >
          <svg
            className="w-3 h-3 text-slate-400 group-hover:text-slate-700 transition-transform duration-200 group-hover:-translate-x-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          <span className="hidden xs:inline sm:inline">Prev</span>
        </button>
      )}

      {/* Page Numbers & Ellipsis */}
      {pages.map((item, index) => {
        if (typeof item === 'string') {
          const isLeft = item === '...left';
          return (
            <button
              key={`ellipsis-${index}`}
              type="button"
              onClick={() => handleEllipsisJump(isLeft)}
              title={isLeft ? 'Jump back 2 pages' : 'Jump ahead 2 pages'}
              className="w-8 h-8 rounded flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100/70 text-xs tracking-widest transition-all duration-200 group cursor-pointer active:scale-90"
              aria-label={isLeft ? 'Jump back' : 'Jump forward'}
            >
              <span className="group-hover:tracking-[0.25em] transition-all duration-200">...</span>
            </button>
          );
        }

        const isActive = item === currentPage;

        return (
          <button
            key={item}
            type="button"
            onClick={() => handlePageClick(item)}
            aria-current={isActive ? 'page' : undefined}
            aria-label={`Page ${item}`}
            className={`w-8 h-8 rounded text-xs font-bold flex items-center justify-center transition-all duration-200 cursor-pointer ${
              isActive
                ? 'bg-[#1a273b] text-white shadow-md shadow-[#1a273b]/25 ring-2 ring-[#1a273b]/15 scale-105 animate-page-pop font-extrabold'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 hover:-translate-y-0.5 hover:shadow-xs active:scale-95'
            }`}
          >
            {item}
          </button>
        );
      })}

      {/* Next Page Button */}
      {showNext && (
        <button
          type="button"
          onClick={() => handlePageClick(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Next Page"
          className="group px-3 h-8 rounded border border-slate-200 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-600 hover:text-slate-900 text-xs font-bold flex items-center gap-1 transition-all duration-200 ml-1 shadow-xs hover:shadow-sm hover:-translate-y-0.5 active:scale-95 cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed disabled:pointer-events-none disabled:transform-none disabled:shadow-none"
        >
          <span>Next Page</span>
          <svg
            className="w-3 h-3 text-slate-400 group-hover:text-slate-700 transition-transform duration-200 group-hover:translate-x-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}
    </div>
  );
};

/**
 * Complete responsive pagination card with summary counter
 */
const Pagination = ({
  currentPage = 1,
  totalPages = 7,
  totalItems = 148,
  pageSize = 24,
  itemLabel = 'vehicles',
  onPageChange = () => {},
  showPrev = true,
  showNext = true,
  className = '',
}) => {
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div
      className={`mt-12 mb-8 bg-white border border-slate-200 rounded-lg p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm transition-all duration-200 ${className}`}
    >
      <div className="text-sm text-slate-500 font-medium">
        Showing <span className="font-bold text-slate-700">{startItem}</span> -{' '}
        <span className="font-bold text-slate-700">{endItem}</span> of{' '}
        <span className="font-bold text-slate-700">{totalItems}</span> {itemLabel}
      </div>

      <PaginationControl
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        showPrev={showPrev}
        showNext={showNext}
      />
    </div>
  );
};

export default Pagination;
