import React from 'react';
import { Link } from 'react-router-dom';
import KycBadge from './KycBadge';
import EmptyState from './EmptyState';

const formatCurrency = (val) => {
  if (!val && val !== 0) return '0';
  return Number(val).toLocaleString('en-IN');
};

const OverviewTab = ({
  user,
  summary = {},
  activeBids = [],
  wonAuctions = [],
  recentLedger = [],
  paymentMethods = [],
  onSelectTab,
  onOpenKycModal,
  onOpenAddPayment,
}) => {
  const isVerified = user?.verificationStatus === 'verified';
  const hasCardOnFile = paymentMethods.length > 0;
  const isBiddingReady = isVerified && hasCardOnFile;

  // Derive counts dynamically to prevent state drift between ledger/tabs and summary cards
  const wonCount = wonAuctions.length > 0 ? wonAuctions.length : (summary.wonAuctionsCount ?? 0);
  const activeCount = summary.activeBidsCount ?? activeBids.length;
  const listingsCount = summary.myListingsCount ?? 0;
  const savedCount = summary.savedVehiclesCount ?? 0;

  return (
    <div className="space-y-8">
      {/* 1. Metric Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Bids */}
        <button
          onClick={() => onSelectTab('bids')}
          className="p-4 bg-gd-sidebar border border-gd-line rounded-md text-left hover:border-gd-primary/50 transition-all cursor-pointer group"
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-eyebrow font-medium text-gd-muted uppercase">Active Bids</span>
            <div className="w-6 h-6 rounded-md bg-blue-500/10 text-gd-primary flex items-center justify-center group-hover:scale-110 transition-transform">
              {/* Gavel / Bid Hammer Icon */}
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-3-3m3 3V3m7 11l-3-3m3 3H3" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 9.75L16.5 12l-6 6-2.25-2.25 6-6zM8.5 7.5l2-2 3.5 3.5-2 2-3.5-3.5z" />
              </svg>
            </div>
          </div>
          <div className="text-2xl font-bold text-gd-ink">
            {activeCount}
          </div>
          <span className="text-label text-gd-primary font-medium mt-1 inline-flex items-center gap-1 hover:text-blue-600 hover:underline hover:opacity-80 transition-all group-hover:underline">
            View Live Bids →
          </span>
        </button>

        {/* Won Auctions */}
        <button
          onClick={() => onSelectTab('bids')}
          className="p-4 bg-gd-sidebar border border-gd-line rounded-md text-left hover:border-gd-reserveMet/50 transition-all cursor-pointer group"
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-eyebrow font-medium text-gd-muted uppercase">Won Auctions</span>
            <div className="w-6 h-6 rounded-md bg-emerald-500/10 text-gd-reserveMet flex items-center justify-center group-hover:scale-110 transition-transform">
              {/* Trophy / Winner Cup Icon */}
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.504-1.125-1.125-1.125h-6.75a1.125 1.125 0 01-1.125-1.125V18.75m12.75-9a4.5 4.5 0 00-4.5-4.5h-7.5a4.5 4.5 0 00-4.5 4.5v1.5a4.5 4.5 0 004.5 4.5h.75m8.25-6v6m0 0a4.5 4.5 0 01-4.5 4.5h-.75" />
              </svg>
            </div>
          </div>
          <div className="text-2xl font-bold text-gd-ink">
            {wonCount}
          </div>
          <span className="text-label text-gd-reserveMet font-medium mt-1 inline-flex items-center gap-1 hover:text-blue-600 hover:underline hover:opacity-80 transition-all group-hover:underline">
            View Ledger →
          </span>
        </button>

        {/* My Listings */}
        <button
          onClick={() => onSelectTab('listings')}
          className="p-4 bg-gd-sidebar border border-gd-line rounded-md text-left hover:border-gd-primary/50 transition-all cursor-pointer group"
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-eyebrow font-medium text-gd-muted uppercase">My Listings</span>
            <div className="w-6 h-6 rounded-md bg-amber-500/10 text-gd-cta flex items-center justify-center group-hover:scale-110 transition-transform">
              {/* Car Icon */}
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 17h.01M16 17h.01M3 13l2-5h14l2 5M5 17h14a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <div className="text-2xl font-bold text-gd-ink">
            {listingsCount}
          </div>
          <span className="text-label text-gd-muted font-medium mt-1 inline-flex items-center gap-1 hover:text-blue-600 hover:underline hover:opacity-80 transition-all group-hover:text-gd-ink">
            {listingsCount === 0 ? 'List a Vehicle →' : 'Manage Vehicles →'}
          </span>
        </button>

        {/* Saved Vehicles */}
        <button
          onClick={() => onSelectTab('saved')}
          className="p-4 bg-gd-sidebar border border-gd-line rounded-md text-left hover:border-gd-primary/50 transition-all cursor-pointer group"
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-eyebrow font-medium text-gd-muted uppercase">Watchlist</span>
            <div className="w-6 h-6 rounded-md bg-gray-500/10 text-gd-ghost flex items-center justify-center group-hover:scale-110 transition-transform">
              {/* Bookmark / Heart Icon */}
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
          </div>
          <div className="text-2xl font-bold text-gd-ink">
            {savedCount}
          </div>
          <span className="text-label text-gd-muted font-medium mt-1 inline-flex items-center gap-1 hover:text-blue-600 hover:underline hover:opacity-80 transition-all group-hover:text-gd-ink">
            View Watchlist →
          </span>
        </button>
      </div>

      {/* 2. Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Active Bids Section */}
          <section className="bg-gd-sidebar border border-gd-line rounded-md overflow-hidden">
            <div className="px-5 py-4 border-b border-gd-line bg-gd-surface flex justify-between items-center">
              <h2 className="text-base font-semi text-gd-ink">Active Bids</h2>
              <span className="text-eyebrow font-medium text-gd-muted uppercase">
                {activeBids.length} {activeBids.length === 1 ? 'Bid' : 'Bids'}
              </span>
            </div>

            {activeBids.length === 0 ? (
              <EmptyState
                icon={
                  <svg className="w-6 h-6 text-gd-ghost" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 17h.01M16 17h.01M3 13l2-5h14l2 5M5 17h14a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2z" />
                  </svg>
                }
                title="No Active Bids"
                description="You are not currently bidding on any vehicles. Explore live auctions ending soon to submit your opening offer."
                actionText="Browse Live Auctions"
                actionLink="/browse"
              />
            ) : (
              <div className="divide-y divide-gd-line">
                {activeBids.map((item, idx) => {
                  const auction = item.auction || item;
                  const car = auction.car || item.car || {};
                  const isLeading = item.isLeading;
                  const image = car.images?.[0] || 'https://upload.wikimedia.org/wikipedia/commons/b/ba/2021_Mahindra_XUV700_2.2_AX7_%28India%29_front_view.png';

                  return (
                    <div key={auction._id || idx} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gd-surface/40 transition-colors">
                      <div className="flex items-center gap-3.5">
                        <img
                          src={image}
                          alt={car.title || 'Car'}
                          className="w-16 h-14 sm:w-20 sm:h-16 object-cover rounded-md border border-gd-line shrink-0 bg-gd-card"
                        />
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-pill text-eyebrow font-bold border ${
                                isLeading
                                  ? 'bg-gd-reserveMet/10 text-gd-reserveMet border-gd-reserveMet/30'
                                  : 'bg-gd-warning/15 text-gd-endingSoon border-gd-warning/40'
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${isLeading ? 'bg-gd-reserveMet' : 'bg-gd-warning'}`} />
                              {isLeading ? 'LEADING BID' : 'OUTBID'}
                            </span>
                            {auction.timeLeft && (
                              <span className="text-eyebrow text-gd-muted uppercase">
                                {auction.timeLeft} left
                              </span>
                            )}
                          </div>
                          <h3 className="text-sm font-semi text-gd-ink line-clamp-1 hover:text-gd-primary transition-colors">
                            <Link to={`/auctions/${auction._id}`}>
                              {car.title || 'Vehicle Listing'}
                            </Link>
                          </h3>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-5 pt-2 sm:pt-0 border-t sm:border-t-0 border-gd-line">
                        <div>
                          <span className="block text-eyebrow text-gd-ghost uppercase">Standing Bid</span>
                          <span className="block text-base font-bold text-gd-ink">
                            ₹{formatCurrency(auction.currentBid || item.currentBid)}
                          </span>
                        </div>
                        <Link
                          to={`/auctions/${auction._id}`}
                          className="px-3.5 py-1.5 rounded-md bg-gd-primary hover:bg-gd-primaryHover text-gd-inverse text-xs font-bold transition-colors shadow-sm"
                        >
                          {isLeading ? 'View' : 'Bid Again'}
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Recent Ledger Activity Preview */}
          <section className="bg-gd-sidebar border border-gd-line rounded-md overflow-hidden">
            <div className="px-5 py-4 border-b border-gd-line bg-gd-surface flex justify-between items-center">
              <h2 className="text-base font-semi text-gd-ink">Recent Auction Activity</h2>
              <button
                onClick={() => onSelectTab('bids')}
                className="text-eyebrow font-medium text-gd-primary hover:underline uppercase cursor-pointer"
              >
                Full History →
              </button>
            </div>

            {recentLedger.length === 0 ? (
              <div className="p-8 text-center text-xs text-gd-muted">
                No past transactions recorded yet. Completed bids will appear here.
              </div>
            ) : (
              <div className="divide-y divide-gd-line">
                {recentLedger.slice(0, 3).map((item, idx) => {
                  const car = item.car || item.auction?.car || {};
                  return (
                    <div key={idx} className="p-4 flex items-center justify-between gap-4 text-xs">
                      <div className="flex items-center gap-3">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${
                          item.status === 'won' ? 'bg-gd-reserveMet' : 'bg-gd-ghost'
                        }`} />
                        <div>
                          <p className="font-semi text-gd-ink">{car.title || 'Vehicle Auction'}</p>
                          <p className="text-gd-muted text-label uppercase">
                            {item.status === 'won' ? 'Won Auction' : 'Auction Concluded'}
                          </p>
                        </div>
                      </div>
                      <span className="font-bold text-gd-ink">
                        ₹{formatCurrency(item.finalAmount || item.winningBid || item.currentBid)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

        </div>

        {/* Right Column (Sidebar) */}
        <aside className="space-y-6">
          
          {/* Profile Overview Card */}
          <div className="bg-gd-sidebar border border-gd-line rounded-md p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-eyebrow font-medium text-gd-muted uppercase tracking-widest block">
                Collector Profile
              </span>
              <KycBadge status={user?.verificationStatus} onClick={onOpenKycModal} interactive />
            </div>

            <div className="flex items-center gap-4 mb-5">
              <div className="w-14 h-14 rounded-md bg-gd-primaryLight border border-gd-primaryBorder text-gd-primary font-bold text-xl flex items-center justify-center uppercase shrink-0">
                {user?.name ? user.name[0] : 'U'}
              </div>
              <div>
                <p className="text-base font-semi text-gd-ink">{user?.name || 'Valued Member'}</p>
                <p className="text-xs text-gd-muted">{user?.email}</p>
                {user?.location && (
                  <p className="text-xs text-gd-ghost flex items-center gap-1 mt-0.5">
                    <svg className="w-3 h-3 text-gd-ghost" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {user.location}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-gd-line">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gd-ghost">Account Type</span>
                <span className="font-medium text-gd-ink">Bidder &amp; Seller (Unified)</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gd-ghost">Identity Status</span>
                <span className={`font-medium ${isVerified ? 'text-gd-reserveMet' : 'text-gd-endingSoon'}`}>
                  {isVerified ? 'KYC Verified' : 'Unverified'}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gd-ghost">Card on File</span>
                <span className={`font-medium ${hasCardOnFile ? 'text-gd-reserveMet' : 'text-gd-muted'}`}>
                  {hasCardOnFile ? `${paymentMethods[0].brand} •••• ${paymentMethods[0].last4}` : 'None'}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gd-ghost">Member Since</span>
                <span className="font-medium text-gd-ink">2026</span>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-gd-line">
              <button
                onClick={() => onSelectTab('settings')}
                className="w-full py-2 px-3 rounded-md border border-gd-line bg-gd-surface hover:bg-gd-bg text-xs font-semibold text-gd-ink transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <svg className="w-3.5 h-3.5 text-gd-ghost" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                </svg>
                Manage Profile &amp; Settings
              </button>
            </div>
          </div>

          {/* Bidding Readiness Card */}
          <div className="bg-gd-sidebar border border-gd-line rounded-md p-5">
            <span className="text-eyebrow font-medium text-gd-muted uppercase tracking-widest block mb-3">
              Bidding Authorization
            </span>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center ${isVerified ? 'bg-gd-reserveMet text-white' : 'bg-gd-line text-gd-muted'}`}>
                    {isVerified ? '✓' : '1'}
                  </div>
                  <span className={isVerified ? 'font-medium text-gd-ink' : 'text-gd-muted'}>
                    Identity Verified (KYC)
                  </span>
                </div>
                {!isVerified ? (
                  <button onClick={onOpenKycModal} className="text-gd-primary font-bold hover:underline cursor-pointer">
                    Verify Now
                  </button>
                ) : (
                  <span className="text-gd-reserveMet font-medium">Ready</span>
                )}
              </div>

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center ${hasCardOnFile ? 'bg-gd-reserveMet text-white' : 'bg-gd-line text-gd-muted'}`}>
                    {hasCardOnFile ? '✓' : '2'}
                  </div>
                  <span className={hasCardOnFile ? 'font-medium text-gd-ink' : 'text-gd-muted'}>
                    Bidding Guarantee Card
                  </span>
                </div>
                {!hasCardOnFile ? (
                  <button onClick={onOpenAddPayment} className="text-gd-primary font-bold hover:underline cursor-pointer">
                    Add Card
                  </button>
                ) : (
                  <span className="text-gd-reserveMet font-medium">Active</span>
                )}
              </div>

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full flex items-center justify-center bg-gd-reserveMet text-white">
                    ✓
                  </div>
                  <span className="font-medium text-gd-ink">
                    100% Refundable Entry Deposit
                  </span>
                </div>
                <span className="text-xs font-semibold text-emerald-500">Auto-Refund</span>
              </div>
            </div>

            <div className={`mt-4 p-3 rounded-md text-xs border ${
              isBiddingReady
                ? 'bg-gd-reserveMet/10 border-gd-reserveMet/20 text-gd-reserveMet'
                : 'bg-gd-surface border-gd-line text-gd-muted'
            }`}>
              {isBiddingReady
                ? 'Your account is cleared to bid. A ₹10,000 security deposit is held per auction and automatically refunded to your card upon auction close.'
                : 'Complete identity verification and add a card on file to unlock live bid placement.'}
            </div>
          </div>

        </aside>
      </div>
    </div>
  );
};

export default OverviewTab;
