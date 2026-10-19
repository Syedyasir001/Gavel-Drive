import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import AuctionCard from '../components/auction/AuctionCard';
import Pagination from '../components/common/Pagination';
import { SAMPLE_AUCTIONS } from '../data/sampleAuctions';

const Home = () => {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;
  const listingsRef = useRef(null);

  useEffect(() => {
    const fetchAuctions = async () => {
      setLoading(true);
      try {
        const query = activeFilter === 'all' ? '' : `?status=${activeFilter}`;
        const res = await api.get(`/auctions${query}`);
        if (res.data?.success && res.data?.data?.length > 0) {
          setAuctions(res.data.data);
        } else {
          if (activeFilter === 'all') {
            setAuctions(SAMPLE_AUCTIONS);
          } else {
            setAuctions(SAMPLE_AUCTIONS.filter((a) => a.status === activeFilter));
          }
        }
      } catch (err) {
        console.warn('API offline or error fetching auctions, using sample data:', err.message);
        if (activeFilter === 'all') {
          setAuctions(SAMPLE_AUCTIONS);
        } else {
          setAuctions(SAMPLE_AUCTIONS.filter((a) => a.status === activeFilter));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAuctions();
  }, [activeFilter]);

  // Reset to page 1 whenever filter changes
  const handleFilterChange = (status) => {
    setActiveFilter(status);
    setCurrentPage(1);
  };

  // Pagination calculation
  const totalItems = auctions.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedAuctions = auctions.slice(startIndex, startIndex + pageSize);

  // Smooth scroll handler on page switch
  const handlePageChange = (page) => {
    setCurrentPage(page);
    if (listingsRef.current) {
      const topOffset = listingsRef.current.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({
        top: Math.max(0, topOffset),
        behavior: 'smooth',
      });
    }
  };

  return (
    <main className="min-h-[calc(100vh-4rem)] pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-16 border-b border-gd-line bg-gd-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-pill bg-gd-cta/5 border border-gd-cta/10 text-gd-cta text-xs font-semibold">
            <span className="w-2 h-2 rounded-pill bg-gd-success"></span>
            Premier Automotive Bidding Platform
          </div>

          <h1 className="mt-6 text-3xl sm:text-5xl font-bold tracking-tight text-gd-ink max-w-4xl mx-auto leading-tight">
            From Daily Drivers to Dream Cars, Bid With Confidence at <span className="text-gd-cta">Gavel Drive</span>
          </h1>

          <p className="mt-5 text-base sm:text-lg text-gd-muted max-w-2xl mx-auto">
            Transparent real-time bidding, verified provenance, and curated automotive auctions with secure, binding checkout.
          </p>

          {/* Banner Auctions CTA */}
          <div className="mt-8 flex items-center justify-center">
            <Link
              to="/browse"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-md bg-gd-cta hover:bg-gd-ctaHover text-gd-inverse text-sm font-semibold transition-all duration-150 shadow-card hover:shadow-dropdown group cursor-pointer"
            >
              <span>Auctions</span>
              <svg
                className="w-4 h-4 transition-transform duration-150 group-hover:translate-x-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>

          {/* Trust strip */}
          <div className="mt-12 inline-flex flex-wrap items-center justify-center divide-x divide-gd-line rounded-md bg-gd-sidebar border border-gd-line shadow-card">
            {[
              'Verified Vehicles & Sellers',
              'Live Real-Time Bidding',
              'Secure Transactions',
            ].map((item, i) => (
              <div
                key={item}
                className={`flex items-center gap-2 px-6 py-3.5 text-sm font-medium ${
                  i === 0 ? 'text-gd-ink' : 'text-gd-muted'
                }`}
              >
                <svg className="w-4 h-4 text-gd-success shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                </svg>
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Auction Listings Section */}
      <section ref={listingsRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-2">
        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
          <div>
            <span className="text-eyebrow text-gd-muted uppercase tracking-widest">Live Inventory</span>
            <h2 className="mt-1.5 text-2xl font-bold text-gd-ink tracking-tight">Active Auctions</h2>
            <p className="mt-1.5 text-sm text-gd-muted">Browse current and upcoming vehicle lots</p>
          </div>

          <div className="flex items-center gap-1.5 p-1 rounded-md bg-gd-surface border border-gd-line shadow-card">
            {['all', 'live', 'upcoming', 'ended'].map((status) => (
              <button
                key={status}
                onClick={() => handleFilterChange(status)}
                className={`px-4 py-1.5 rounded-md text-xs font-semibold capitalize transition-all cursor-pointer ${
                  activeFilter === status
                    ? 'bg-gd-cta text-gd-inverse shadow-none'
                    : 'text-gd-muted hover:text-gd-ink hover:bg-gd-bg'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Grid with animation keyframe on page switch */}
        <div className="mt-8 min-h-[500px]">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-80 rounded-md bg-gd-surface border border-gd-line animate-pulse" />
              ))}
            </div>
          ) : paginatedAuctions.length > 0 ? (
            <div
              key={`${activeFilter}-page-${currentPage}`}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-slide-up"
            >
              {paginatedAuctions.map((auction) => (
                <AuctionCard key={auction._id} auction={auction} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 rounded-md border border-dashed border-gd-line bg-gd-surface/50">
              <p className="text-gd-muted text-sm">No auctions match the selected filter.</p>
            </div>
          )}
        </div>

        {/* Working Animated Pagination Component */}
        {totalItems > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={pageSize}
            itemLabel="vehicles"
            onPageChange={handlePageChange}
          />
        )}
      </section>
    </main>
  );
};

export default Home;
