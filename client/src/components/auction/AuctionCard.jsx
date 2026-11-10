import React from 'react';
import { Link } from 'react-router-dom';

const AuctionCard = ({ auction }) => {
  if (!auction) return null;

  const { car, currentBid, badge, timeLeft, bidCount } = auction;

  const formatCurrency = (val) => {
    const num = typeof val === 'number' ? val : Number(String(val).replace(/[^0-9.-]+/g, '')) || 0;
    return new Intl.NumberFormat('en-IN').format(num).trim();
  };

  // Separate condition grade from auction reserve status
  const conditionGrade = auction.conditionGrade || (badge === 'DRIVER GRADE' ? 'DRIVER GRADE' : null);
  const reserveBadge = badge === 'DRIVER GRADE'
    ? (Number(currentBid) >= Number(auction.startPrice || 0) ? 'RESERVE MET' : 'NO RESERVE')
    : badge;

  const renderReserveBadge = () => {
    if (!reserveBadge) return null;

    let bgClass = 'bg-gd-muted';
    let textClass = 'text-gd-inverse';

    if (reserveBadge === 'RESERVE MET') {
      bgClass = 'bg-gd-reserveMet';
      textClass = 'text-gd-inverse';
    } else if (reserveBadge === 'NO RESERVE') {
      bgClass = 'bg-gd-noReserve';
      textClass = 'text-gd-inverse';
    } else if (reserveBadge === 'ENDING SOON') {
      bgClass = 'bg-gd-endingSoon';
      textClass = 'text-gd-endingText';
    } else if (reserveBadge === 'NEWLY LISTED') {
      bgClass = 'bg-gd-newListing';
      textClass = 'text-gd-inverse';
    }

    return (
      <span className={`px-2 py-0.5 rounded-pill text-eyebrow font-bold uppercase tracking-wide ${bgClass} ${textClass}`}>
        {reserveBadge}
      </span>
    );
  };

  return (
    <Link
      to={`/auctions/${auction._id}`}
      aria-label={`View auction for ${car?.title || 'this vehicle'}`}
      className="bg-white rounded-md overflow-hidden shadow-card flex flex-col group focus:outline-none focus-visible:ring-2 focus-visible:ring-gd-cta"
    >
      {/* Thumbnail Container */}
      <div className="relative aspect-[16/10] overflow-hidden bg-gd-surface">
        <img
          src={car?.images?.[0] || 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80'}
          alt={car?.title || 'Featured Automobile'}
          className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
          loading="lazy"
        />
        
        {/* Gradient Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

        {/* Top Badges — reserve badge + optional condition grade on separate row */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {renderReserveBadge()}
          {conditionGrade && (
            <span className="px-2 py-0.5 rounded-pill text-eyebrow font-bold uppercase tracking-wide bg-slate-600 text-white">
              {conditionGrade}
            </span>
          )}
        </div>
        
        {/* Watchlist Heart */}
        <span className="absolute top-2 right-2 w-7 h-7 rounded-pill bg-black/40 flex items-center justify-center text-gd-inverse backdrop-blur-sm">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </span>

        {/* Bottom Overlays */}
        {timeLeft && (
          <div className="absolute bottom-2 left-2 bg-black/60 text-gd-inverse text-xs font-medium px-2 py-0.5 rounded-pill backdrop-blur-sm flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {timeLeft}
          </div>
        )}
        
        {bidCount !== undefined && (
          <div className="absolute bottom-2 right-2 bg-black/60 text-gd-inverse text-xs font-medium px-2 py-0.5 rounded-pill backdrop-blur-sm">
            {bidCount} Bids
          </div>
        )}
      </div>

      {/* Details */}
      <div className="p-3 flex flex-col flex-1 justify-between">
        <div>
          {car?.specs && (
            <p className="text-label font-medium text-slate-600 uppercase mb-1 truncate">
              {car.specs.replace(/•/g, '·')}
            </p>
          )}
          <h3 className="text-base font-semi text-gd-ink mb-1 line-clamp-1">
            {car?.title}
          </h3>
          {car?.details && (
            <p className="text-xs text-slate-600 flex items-center gap-1.5 mb-4 truncate">
              <svg className="w-3 h-3 text-slate-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {car.details}
            </p>
          )}
        </div>

        <div className="pt-3 border-t border-gd-line flex items-center justify-between">
          <div>
            <span className="block text-eyebrow text-gd-ghost uppercase mb-0.5">
              Current Bid
            </span>
            <span className="block text-lg font-bold text-gd-ink">
              ₹{formatCurrency(currentBid)}
            </span>
          </div>

          <span className="bg-gd-cta group-hover:bg-gd-ctaHover text-gd-inverse text-xs font-bold px-4 py-2 rounded inline-flex items-center justify-center whitespace-nowrap gap-1.5">
            View Details
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
};

export default AuctionCard;
