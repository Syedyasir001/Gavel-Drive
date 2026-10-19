import React, { useEffect, useState, useRef } from 'react';
import api from '../services/api';
import AuctionCard from '../components/auction/AuctionCard';
import Pagination from '../components/common/Pagination';
import { SAMPLE_AUCTIONS } from '../data/sampleAuctions';

const MAKES = [
  'Mahindra',
  'Tata',
  'Toyota',
  'Hyundai',
  'Kia',
  'Volkswagen',
  'BMW',
  'Mercedes-Benz',
  'Porsche',
  'Audi',
  'Land Rover',
  'Ford',
  'Jeep',
  'Volvo',
];

const STATUSES = ['live', 'upcoming', 'ended'];

const Browse = () => {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;
  const gridTopRef = useRef(null);

  // Filters State
  const [selectedMakes, setSelectedMakes] = useState([]);
  const [selectedStatuses, setSelectedStatuses] = useState([]);

  useEffect(() => {
    const fetchAuctions = async () => {
      setLoading(true);
      try {
        const res = await api.get('/auctions');
        if (res.data?.success && res.data?.data?.length > 0) {
          const auctionsWithMake = res.data.data.map((a) => {
            const makeMatch = MAKES.find((m) => a.car?.title?.includes(m));
            return { ...a, make: a.make || makeMatch || 'Other' };
          });
          setAuctions(auctionsWithMake);
        } else {
          setAuctions(SAMPLE_AUCTIONS);
        }
      } catch (err) {
        console.warn('API offline or error fetching auctions, using sample data:', err.message);
        setAuctions(SAMPLE_AUCTIONS);
      } finally {
        setLoading(false);
      }
    };

    fetchAuctions();
  }, []);

  const handleMakeChange = (make) => {
    setSelectedMakes((prev) =>
      prev.includes(make) ? prev.filter((m) => m !== make) : [...prev, make]
    );
    setCurrentPage(1);
  };

  const handleStatusChange = (status) => {
    setSelectedStatuses((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    );
    setCurrentPage(1);
  };

  const removeFilter = (type, value) => {
    if (type === 'make') {
      setSelectedMakes((prev) => prev.filter((m) => m !== value));
    } else if (type === 'status') {
      setSelectedStatuses((prev) => prev.filter((s) => s !== value));
    }
    setCurrentPage(1);
  };

  const resetAll = () => {
    setSelectedMakes([]);
    setSelectedStatuses([]);
    setCurrentPage(1);
  };

  // Derived filtered auctions
  const filteredAuctions = auctions.filter((a) => {
    const makeMatch = selectedMakes.length === 0 || selectedMakes.includes(a.make);
    const statusMatch = selectedStatuses.length === 0 || selectedStatuses.includes(a.status);
    return makeMatch && statusMatch;
  });

  // Pagination calculations
  const totalItems = filteredAuctions.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedAuctions = filteredAuctions.slice(startIndex, startIndex + pageSize);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    if (gridTopRef.current) {
      const topOffset = gridTopRef.current.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({
        top: Math.max(0, topOffset),
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gd-bg py-10">
      <div className="max-w-screen-xl mx-auto px-6">
        {/* Header Section */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gd-ink">Browse Auctions</h1>
          <p className="mt-1 text-sm text-gd-muted">Find your next vehicle from our curated selection.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <aside className="bg-white border border-gd-line rounded-md p-5 h-fit shadow-card">
            <div className="flex items-center justify-between pb-4 border-b border-gd-line">
              <h2 className="text-base font-semi text-gd-ink">Filters</h2>
              {(selectedMakes.length > 0 || selectedStatuses.length > 0) && (
                <button
                  onClick={resetAll}
                  className="text-xs text-gd-muted hover:text-gd-ink transition-colors cursor-pointer"
                >
                  Clear all
                </button>
              )}
            </div>

            {/* Status Section */}
            <div className="py-4">
              <h3 className="text-xs font-bold text-gd-ink uppercase tracking-wide mb-3">Status</h3>
              <div className="flex flex-col gap-2">
                {STATUSES.map((status) => (
                  <label
                    key={status}
                    className="flex items-center justify-between text-sm text-gd-ink cursor-pointer hover:text-gd-primary transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedStatuses.includes(status)}
                        onChange={() => handleStatusChange(status)}
                        className="accent-gd-cta w-4 h-4 rounded-sm border-gd-line cursor-pointer"
                      />
                      <span className="capitalize">{status}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Separator */}
            <div className="border-t border-gd-line my-2"></div>

            {/* Make Section */}
            <div className="py-2">
              <h3 className="text-xs font-bold text-gd-ink uppercase tracking-wide flex justify-between items-center py-3">
                Make
              </h3>
              <div className="flex flex-col gap-1 max-h-72 overflow-y-auto pr-1">
                {MAKES.map((make) => (
                  <label
                    key={make}
                    className="flex items-center justify-between py-1.5 text-sm text-gd-ink cursor-pointer hover:text-gd-primary transition-colors group"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedMakes.includes(make)}
                        onChange={() => handleMakeChange(make)}
                        className="accent-gd-cta w-4 h-4 rounded-sm border-gd-line cursor-pointer"
                      />
                      <span>{make}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div ref={gridTopRef} className="lg:col-span-3">
            {/* Active Filters Row */}
            {(selectedMakes.length > 0 || selectedStatuses.length > 0) && (
              <div className="flex flex-wrap items-center gap-2 mb-6">
                {selectedStatuses.map((status) => (
                  <span
                    key={status}
                    className="flex items-center gap-1 px-3 py-1 rounded-pill bg-gd-line text-xs font-medium text-gd-ink capitalize"
                  >
                    {status}
                    <button
                      onClick={() => removeFilter('status', status)}
                      className="ml-1 text-gd-ghost hover:text-gd-ink focus:outline-none cursor-pointer"
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))}
                {selectedMakes.map((make) => (
                  <span
                    key={make}
                    className="flex items-center gap-1 px-3 py-1 rounded-pill bg-gd-line text-xs font-medium text-gd-ink"
                  >
                    {make}
                    <button
                      onClick={() => removeFilter('make', make)}
                      className="ml-1 text-gd-ghost hover:text-gd-ink focus:outline-none cursor-pointer"
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))}
                <button
                  onClick={resetAll}
                  className="text-xs text-gd-muted underline underline-offset-2 hover:text-gd-ink ml-2 focus:outline-none cursor-pointer"
                >
                  Reset All
                </button>
              </div>
            )}

            {/* Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="aspect-[16/10] rounded-md bg-gd-surface border border-gd-line animate-pulse"
                  />
                ))}
              </div>
            ) : paginatedAuctions.length > 0 ? (
              <div
                key={`browse-page-${currentPage}`}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 animate-fade-slide-up"
              >
                {paginatedAuctions.map((auction) => (
                  <AuctionCard key={auction._id} auction={auction} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 rounded-md border border-dashed border-gd-line bg-white shadow-card">
                <p className="text-gd-muted text-sm font-medium">No auctions match the selected filters.</p>
                <button
                  onClick={resetAll}
                  className="mt-4 border border-gd-line text-gd-ink font-medium text-xs rounded px-5 py-2.5 hover:bg-gd-bg transition-colors duration-150 cursor-pointer"
                >
                  Clear Filters
                </button>
              </div>
            )}

            {/* Working Animated Pagination Component */}
            {totalItems > pageSize && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                pageSize={pageSize}
                itemLabel="vehicles"
                onPageChange={handlePageChange}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Browse;
