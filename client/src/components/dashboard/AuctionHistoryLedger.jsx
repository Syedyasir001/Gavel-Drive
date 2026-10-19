import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import EmptyState from './EmptyState';

const formatCurrency = (val) => {
  if (!val && val !== 0) return '0';
  return Number(val).toLocaleString('en-IN');
};

const formatDate = (dateString) => {
  if (!dateString) return 'Recent';
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch (_e) {
    return 'Recent';
  }
};

const AuctionHistoryLedger = ({ historyData = {} }) => {
  const [filter, setFilter] = useState('all');

  const activeBids = historyData.activeBids || [];
  const wonAuctions = historyData.wonAuctions || [];
  const lostAuctions = historyData.lostAuctions || [];
  const soldVehicles = historyData.soldVehicles || [];
  const deposits = historyData.deposits || [];

  // Flatten items for "all" filter
  const allItems = [
    ...activeBids.map((item) => ({ ...item, type: 'active' })),
    ...wonAuctions.map((item) => ({ ...item, type: 'won' })),
    ...lostAuctions.map((item) => ({ ...item, type: 'lost' })),
    ...soldVehicles.map((item) => ({ ...item, type: 'sold' })),
    ...deposits.map((item) => ({ ...item, type: 'deposit' })),
  ];

  let displayItems = [];
  if (filter === 'all') displayItems = allItems;
  else if (filter === 'active') displayItems = activeBids.map((i) => ({ ...i, type: 'active' }));
  else if (filter === 'won') displayItems = wonAuctions.map((i) => ({ ...i, type: 'won' }));
  else if (filter === 'lost') displayItems = lostAuctions.map((i) => ({ ...i, type: 'lost' }));
  else if (filter === 'sold') displayItems = soldVehicles.map((i) => ({ ...i, type: 'sold' }));
  else if (filter === 'deposits') displayItems = deposits.map((i) => ({ ...i, type: 'deposit' }));

  const subFilters = [
    { id: 'all', label: 'All History', count: allItems.length },
    { id: 'active', label: 'Active Bids', count: activeBids.length },
    { id: 'won', label: 'Won Auctions', count: wonAuctions.length },
    { id: 'lost', label: 'Lost / Outbid', count: lostAuctions.length },
    { id: 'deposits', label: 'Bidding Deposits (Escrow)', count: deposits.length },
    { id: 'sold', label: 'Sold Vehicles', count: soldVehicles.length },
  ];

  return (
    <div className="space-y-6">
      {/* Sub-navigation Filters */}
      <div className="flex flex-wrap items-center gap-2 pb-1">
        {subFilters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-3.5 py-1.5 rounded-pill text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
              filter === f.id
                ? 'bg-gd-primary text-gd-inverse border-gd-primary shadow-sm'
                : 'bg-gd-sidebar text-gd-muted border-gd-line hover:text-gd-ink hover:border-gd-ghost'
            }`}
          >
            <span>{f.label}</span>
            <span
              className={`px-1.5 py-0.2 rounded-pill text-eyebrow ${
                filter === f.id
                  ? 'bg-white/20 text-white'
                  : 'bg-gd-surface text-gd-ghost'
              }`}
            >
              {f.count}
            </span>
          </button>
        ))}
      </div>

      {/* Main Ledger Card */}
      <section className="bg-gd-sidebar border border-gd-line rounded-md overflow-hidden">
        {/* Standardized Header */}
        <div className="px-5 py-4 border-b border-gd-line bg-gd-surface flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semi text-gd-ink">Bidding &amp; Auction Ledger</h2>
            <span className="text-xs text-gd-muted hidden sm:inline">
              Historical record of won, lost, sold, and active vehicle bids
            </span>
          </div>
          <span className="text-eyebrow font-medium text-gd-muted uppercase">
            {displayItems.length} {displayItems.length === 1 ? 'Record' : 'Records'}
          </span>
        </div>

        {/* Content */}
        {displayItems.length === 0 ? (
          <EmptyState
            icon={
              <svg className="w-6 h-6 text-gd-ghost" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            }
            title={
              filter === 'active'
                ? 'No Active Bids'
                : filter === 'won'
                ? 'No Won Auctions Yet'
                : filter === 'lost'
                ? 'No Lost Auctions'
                : filter === 'sold'
                ? 'No Sold Vehicles Yet'
                : filter === 'deposits'
                ? 'No Bidding Deposits'
                : 'No Auction Records'
            }
            description={
              filter === 'active'
                ? 'You are not actively bidding on any live auctions right now. Discover curated vehicles and place your bid.'
                : filter === 'won'
                ? 'When you win an auction as the highest bidder, your ownership transfer and escrow records will appear here.'
                : filter === 'deposits'
                ? 'Bidding deposits (₹10,000) authorized for live auctions will appear here with full escrow and automatic refund tracking.'
                : 'Start exploring active car auctions on GavelDrive to build your collection.'
            }
            actionText="Browse Live Auctions"
            actionLink="/browse"
          />
        ) : (
          <div className="divide-y divide-gd-line">
            {displayItems.map((item, idx) => {
              const auction = item.auction || item;
              const car = auction.car || item.car || {};
              const auctionId = auction._id || item.auctionId || idx;
              const image =
                car.images?.[0] ||
                'https://upload.wikimedia.org/wikipedia/commons/b/ba/2021_Mahindra_XUV700_2.2_AX7_%28India%29_front_view.png';

              // Type-specific badge and financial details
              let typeBadge = null;
              let financialDetails = null;
              let actionBtn = null;

              if (item.type === 'won') {
                typeBadge = (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-pill text-xs font-bold bg-gd-reserveMet/15 text-gd-reserveMet border border-gd-reserveMet/30">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    AUCTION WON
                  </span>
                );
                financialDetails = (
                  <div>
                    <span className="block text-eyebrow text-gd-ghost uppercase">Winning Bid</span>
                    <span className="block text-base font-bold text-gd-reserveMet">
                      ₹{formatCurrency(item.finalAmount || auction.currentBid)}
                    </span>
                  </div>
                );
                actionBtn = (
                  <Link
                    to={`/auctions/${auctionId}`}
                    className="px-3.5 py-1.5 rounded-md bg-gd-reserveMet hover:bg-gd-reserveMet/90 text-gd-inverse text-xs font-bold transition-colors inline-flex items-center gap-1.5 shadow-sm"
                  >
                    View Escrow Details
                  </Link>
                );
              } else if (item.type === 'active') {
                const isLeading = item.isLeading;
                typeBadge = (
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-pill text-xs font-bold border ${
                      isLeading
                        ? 'bg-gd-reserveMet/10 text-gd-reserveMet border-gd-reserveMet/30'
                        : 'bg-gd-warning/15 text-gd-endingSoon border-gd-warning/40'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full animate-pulse ${isLeading ? 'bg-gd-reserveMet' : 'bg-gd-warning'}`} />
                    {isLeading ? 'HIGHEST BIDDER' : 'OUTBID — INCREASE BID'}
                  </span>
                );
                financialDetails = (
                  <div className="flex gap-4">
                    <div>
                      <span className="block text-eyebrow text-gd-ghost uppercase">Current Bid</span>
                      <span className="block text-base font-bold text-gd-ink">
                        ₹{formatCurrency(item.currentBid || auction.currentBid)}
                      </span>
                    </div>
                    <div>
                      <span className="block text-eyebrow text-gd-ghost uppercase">Your Bid</span>
                      <span className="block text-sm font-semi text-gd-muted">
                        ₹{formatCurrency(item.userMaxBid)}
                      </span>
                    </div>
                  </div>
                );
                actionBtn = (
                  <Link
                    to={`/auctions/${auctionId}`}
                    className="px-3.5 py-1.5 rounded-md bg-gd-primary hover:bg-gd-primaryHover text-gd-inverse text-xs font-bold transition-colors inline-flex items-center gap-1.5 shadow-sm"
                  >
                    {isLeading ? 'View Auction' : 'Place Higher Bid'}
                  </Link>
                );
              } else if (item.type === 'lost') {
                typeBadge = (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-pill text-xs font-medium bg-gd-surface text-gd-muted border border-gd-line">
                    AUCTION ENDED
                  </span>
                );
                financialDetails = (
                  <div className="flex gap-4">
                    <div>
                      <span className="block text-eyebrow text-gd-ghost uppercase">Sold For</span>
                      <span className="block text-base font-bold text-gd-ink">
                        ₹{formatCurrency(item.winningBid || auction.currentBid)}
                      </span>
                    </div>
                    <div>
                      <span className="block text-eyebrow text-gd-ghost uppercase">Your Max Bid</span>
                      <span className="block text-sm font-medium text-gd-ghost line-through">
                        ₹{formatCurrency(item.userMaxBid)}
                      </span>
                    </div>
                  </div>
                );
                actionBtn = (
                  <Link
                    to={`/auctions/${auctionId}`}
                    className="px-3 py-1.5 rounded-md border border-gd-line bg-gd-surface hover:bg-gd-bg text-xs font-semibold text-gd-ink transition-colors"
                  >
                    View Result
                  </Link>
                );
              } else if (item.type === 'sold') {
                typeBadge = (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-pill text-xs font-bold bg-gd-newListing/15 text-gd-newListing border border-gd-newListing/30">
                    VEHICLE SOLD
                  </span>
                );
                financialDetails = (
                  <div>
                    <span className="block text-eyebrow text-gd-ghost uppercase">Final Sale Price</span>
                    <span className="block text-base font-bold text-gd-ink">
                      ₹{formatCurrency(auction.currentBid)}
                    </span>
                  </div>
                );
                actionBtn = (
                  <Link
                    to={`/auctions/${auctionId}`}
                    className="px-3.5 py-1.5 rounded-md bg-gd-primary hover:bg-gd-primaryHover text-gd-inverse text-xs font-bold transition-colors"
                  >
                    Manage Transfer
                  </Link>
                );
              } else if (item.type === 'deposit') {
                const isHeld = item.status === 'held';
                typeBadge = (
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-pill text-xs font-bold border ${
                      isHeld
                        ? 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                        : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${isHeld ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
                    {isHeld ? 'ESCROW HELD (₹10,000)' : 'REFUNDED (100%)'}
                  </span>
                );
                financialDetails = (
                  <div className="flex gap-4">
                    <div>
                      <span className="block text-eyebrow text-gd-ghost uppercase">Entry Deposit</span>
                      <span className="block text-base font-bold text-gd-ink">
                        ₹{formatCurrency(item.amount || 10000)}
                      </span>
                    </div>
                    <div>
                      <span className="block text-eyebrow text-gd-ghost uppercase">Escrow Status</span>
                      <span className={`block text-xs font-bold ${isHeld ? 'text-amber-500' : 'text-emerald-500'}`}>
                        {isHeld ? 'Held for Bidding' : `Refunded (${formatDate(item.refundedAt)})`}
                      </span>
                    </div>
                  </div>
                );
                actionBtn = (
                  <Link
                    to={`/auctions/${auctionId}`}
                    className="px-3.5 py-1.5 rounded-md border border-gd-line bg-gd-surface hover:bg-gd-bg text-xs font-semibold text-gd-ink transition-colors inline-flex items-center gap-1.5"
                  >
                    View Auction
                  </Link>
                );
              }

              return (
                <div key={item.transactionId || auctionId} className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gd-surface/40 transition-colors">
                  {/* Left: Thumbnail & Details */}
                  <div className="flex items-center gap-4">
                    <img
                      src={image}
                      alt={item.auctionTitle || car.title || 'Vehicle'}
                      className="w-20 h-16 sm:w-24 sm:h-20 object-cover rounded-md border border-gd-line shrink-0 bg-gd-card"
                    />
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        {typeBadge}
                        <span className="text-eyebrow text-gd-ghost uppercase font-mono">
                          {formatDate(item.refundedAt || item.wonDate || item.endedDate || item.latestBidTime || auction.endTime)}
                        </span>
                      </div>
                      <h3 className="text-base font-semi text-gd-ink hover:text-gd-primary transition-colors">
                        <Link to={`/auctions/${auctionId}`}>
                          {item.auctionTitle || car.title || 'Curated Vehicle Auction'}
                        </Link>
                      </h3>
                      {item.type === 'deposit' ? (
                        <p className="text-label text-gd-muted truncate max-w-md">
                          {item.status === 'held'
                            ? `Payment Method: ${item.paymentMethod?.brand || 'Card'} •••• ${item.paymentMethod?.last4 || '4092'} · Automatic refund on auction close`
                            : `Refunded to ${item.paymentMethod?.brand || 'Card'} •••• ${item.paymentMethod?.last4 || '4092'} · Ref: ${item.refundTransactionId || 'TXN-RFD'}`}
                        </p>
                      ) : (
                        car.specs && (
                          <p className="text-label text-gd-muted uppercase truncate max-w-md">
                            {car.specs.replace(/•/g, '·')}
                          </p>
                        )
                      )}
                    </div>
                  </div>

                  {/* Right: Financials & Action */}
                  <div className="flex items-center justify-between md:justify-end gap-6 pt-3 md:pt-0 border-t md:border-t-0 border-gd-line">
                    {financialDetails}
                    <div>{actionBtn}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default AuctionHistoryLedger;
