import React from 'react';
import { Link } from 'react-router-dom';
import EmptyState from './EmptyState';

const formatCurrency = (val) => {
  if (!val && val !== 0) return '0';
  return Number(val).toLocaleString('en-IN');
};

const MyListingsTab = ({ listings = [] }) => {
  const count = listings.length;

  return (
    <div className="space-y-6">
      <section className="bg-gd-sidebar border border-gd-line rounded-md overflow-hidden">
        {/* Standardized Header */}
        <div className="px-5 py-4 border-b border-gd-line bg-gd-surface flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semi text-gd-ink">My Listings</h2>
            <span className="text-xs text-gd-muted hidden sm:inline">
              Vehicles you have consigned for live auction
            </span>
          </div>
          <span className="text-eyebrow font-medium text-gd-muted uppercase">
            {count} {count === 1 ? 'Listing' : 'Listings'}
          </span>
        </div>

        {/* Content */}
        {count === 0 ? (
          <EmptyState
            icon={
              <svg className="w-6 h-6 text-gd-ghost" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            }
            title="No Vehicles Listed"
            description="You haven't submitted any vehicles for auction yet. Our curation team reviews your vehicle submission, specs, and photos within 24 hours."
            actionText="Sell a Car"
            actionLink="/sell"
            actionIcon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            }
          />
        ) : (
          <div className="divide-y divide-gd-line">
            {listings.map((item) => {
              const car = item.car || {};
              const image = car.images?.[0] || 'https://upload.wikimedia.org/wikipedia/commons/b/ba/2021_Mahindra_XUV700_2.2_AX7_%28India%29_front_view.png';
              const currentBid = item.currentBid || item.startPrice || 0;

              return (
                <div key={item._id} className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gd-surface/40 transition-colors">
                  <div className="flex items-center gap-4">
                    <img
                      src={image}
                      alt={car.title || 'Vehicle'}
                      className="w-20 h-16 sm:w-24 sm:h-20 object-cover rounded-md border border-gd-line shrink-0 bg-gd-card"
                    />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded-pill text-eyebrow font-semi uppercase bg-gd-surface border border-gd-line text-gd-ink">
                          {item.status || 'live'}
                        </span>
                        {item.reserveMet && (
                          <span className="px-2 py-0.5 rounded-pill text-eyebrow font-semi uppercase bg-gd-reserveMet/10 text-gd-reserveMet border border-gd-reserveMet/30">
                            Reserve Met
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-semi text-gd-ink">
                        <Link to={`/auctions/${item._id}`} className="hover:text-gd-primary transition-colors">
                          {car.title || 'Curated Vehicle'}
                        </Link>
                      </h3>
                      {car.specs && (
                        <p className="text-label text-gd-muted uppercase truncate max-w-md">
                          {car.specs.replace(/•/g, '·')}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-6 pt-3 md:pt-0 border-t md:border-t-0 border-gd-line">
                    <div>
                      <span className="block text-eyebrow text-gd-ghost uppercase">High Bid</span>
                      <span className="block text-base font-bold text-gd-ink">
                        ₹{formatCurrency(currentBid)}
                      </span>
                    </div>
                    <Link
                      to={`/auctions/${item._id}`}
                      className="px-3.5 py-1.5 rounded-md bg-gd-primary hover:bg-gd-primaryHover text-gd-inverse text-xs font-bold transition-colors shadow-sm"
                    >
                      Manage Listing
                    </Link>
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

export default MyListingsTab;
