import React from 'react';
import { Link } from 'react-router-dom';
import EmptyState from './EmptyState';

const formatCurrency = (val) => {
  if (!val && val !== 0) return '0';
  return Number(val).toLocaleString('en-IN');
};

const SavedVehiclesTab = ({ savedVehicles = [], onRemoveSaved }) => {
  const count = savedVehicles.length;

  return (
    <div className="space-y-6">
      {/* Standardized Section Container */}
      <section className="bg-gd-sidebar border border-gd-line rounded-md overflow-hidden">
        {/* Standardized Header */}
        <div className="px-5 py-4 border-b border-gd-line bg-gd-surface flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <h2 className="text-base font-semi text-gd-ink">Saved Vehicles</h2>
            <span className="text-xs text-gd-muted hidden sm:inline">
              Track auctions you are monitoring before placing bids
            </span>
          </div>
          <span className="text-eyebrow font-medium text-gd-muted uppercase">
            {count} {count === 1 ? 'Vehicle' : 'Vehicles'}
          </span>
        </div>

        {/* Content */}
        {count === 0 ? (
          <EmptyState
            icon={
              <svg className="w-6 h-6 text-gd-ghost" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            }
            title="Your Watchlist is Empty"
            description="You haven't saved any vehicles to monitor yet. Browse our curated digital auctions and click the heart icon on any listing to track it here."
            actionText="Browse Live Auctions"
            actionLink="/browse"
          />
        ) : (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedVehicles.map((auction) => {
                const car = auction.car || {};
                const image =
                  car.images?.[0] ||
                  'https://upload.wikimedia.org/wikipedia/commons/b/ba/2021_Mahindra_XUV700_2.2_AX7_%28India%29_front_view.png';
                const currentBid = auction.currentBid || auction.startPrice || 0;

                return (
                  <div
                    key={auction._id}
                    className="group border border-gd-line rounded-md bg-gd-sidebar overflow-hidden hover:border-gd-primary/50 transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Image Container with Badge & Remove Button */}
                      <div className="relative aspect-[16/10] bg-gd-card overflow-hidden">
                        <img
                          src={image}
                          alt={car.title || 'Vehicle'}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

                        {/* Status Badge */}
                        <div className="absolute top-2.5 left-2.5">
                          <span className="px-2 py-0.5 rounded-pill text-eyebrow font-semi bg-black/60 text-white backdrop-blur-sm uppercase">
                            {auction.badge || (auction.status === 'live' ? 'LIVE AUCTION' : 'UPCOMING')}
                          </span>
                        </div>

                        {/* Remove from Watchlist Button */}
                        <button
                          onClick={() => onRemoveSaved && onRemoveSaved(auction._id)}
                          title="Remove from saved vehicles"
                          className="absolute top-2.5 right-2.5 w-7 h-7 rounded-pill bg-black/60 text-gd-inverse hover:text-gd-error hover:bg-black/80 flex items-center justify-center transition-colors cursor-pointer backdrop-blur-sm"
                        >
                          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                          </svg>
                        </button>

                        {/* Bottom Info Bar */}
                        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex justify-between items-center text-xs text-white/90">
                          {auction.timeLeft && (
                            <span className="inline-flex items-center gap-1 bg-black/60 px-2 py-0.5 rounded-pill backdrop-blur-sm font-medium">
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {auction.timeLeft}
                            </span>
                          )}
                          {auction.bidCount !== undefined && (
                            <span className="bg-black/60 px-2 py-0.5 rounded-pill backdrop-blur-sm font-medium">
                              {auction.bidCount} Bids
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Details */}
                      <div className="p-4">
                        {car.specs && (
                          <p className="text-label font-medium text-gd-muted uppercase mb-1 truncate">
                            {car.specs.replace(/•/g, '·')}
                          </p>
                        )}
                        <h3 className="text-base font-semi text-gd-ink mb-1 line-clamp-1 group-hover:text-gd-primary transition-colors">
                          {car.title}
                        </h3>
                        {car.details && (
                          <p className="text-xs text-gd-muted truncate mb-3">
                            {car.details}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="p-4 pt-3 border-t border-gd-line bg-gd-surface/40 flex items-center justify-between">
                      <div>
                        <span className="block text-eyebrow text-gd-ghost uppercase">Current Bid</span>
                        <span className="block text-base font-bold text-gd-ink">
                          ₹{formatCurrency(currentBid)}
                        </span>
                      </div>
                      <Link
                        to={`/auctions/${auction._id}`}
                        className="px-3.5 py-1.5 rounded-md bg-gd-primary hover:bg-gd-primaryHover text-gd-inverse text-xs font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
                      >
                        Bid Now
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default SavedVehiclesTab;
