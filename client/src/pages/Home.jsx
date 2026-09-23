import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import AuctionCard from '../components/auction/AuctionCard';

const SAMPLE_AUCTIONS = [
  {
    _id: 'sample-1',
    status: 'live',
    startPrice: 1500000,
    currentBid: 1850000,
    bidCount: 31,
    badge: 'RESERVE MET',
    timeLeft: '03h 14m',
    car: {
      title: '2023 Mahindra XUV700 AX7',
      specs: 'MIDNIGHT BLACK • 6-SPEED AUTOMATIC • AWD',
      details: '12,500 KM • Single Owner • Mumbai',
      images: ['https://upload.wikimedia.org/wikipedia/commons/b/ba/2021_Mahindra_XUV700_2.2_AX7_%28India%29_front_view.png'],
    },
  },
  {
    _id: 'sample-2',
    status: 'live',
    startPrice: 900000,
    currentBid: 1180000,
    bidCount: 24,
    badge: 'NO RESERVE',
    timeLeft: '08h 45m',
    car: {
      title: '2023 Tata Nexon Fearless',
      specs: 'FEARLESS PURPLE • 7-SPEED DCA • FWD',
      details: '8,400 KM • Clean Title • Pune',
      images: ['https://upload.wikimedia.org/wikipedia/commons/e/e5/2023_Tata_Nexon_XZA%2B_front_view.jpg'],
    },
  },
  {
    _id: 'sample-3',
    status: 'live',
    startPrice: 3500000,
    currentBid: 4250000,
    bidCount: 52,
    badge: 'ENDING SOON',
    timeLeft: '01h 10m',
    car: {
      title: '2022 Toyota Fortuner Legender',
      specs: 'PEARL WHITE • 6-SPEED AUTOMATIC • 4X4',
      details: '18,200 KM • 1st Owner • Bangalore',
      images: ['https://upload.wikimedia.org/wikipedia/commons/2/23/2021_Toyota_Fortuner_SRZ_2.7_4x2_%28Indonesia%29_front_view_02.jpg'],
    },
  },
  {
    _id: 'sample-4',
    status: 'live',
    startPrice: 1000000,
    currentBid: 1420000,
    bidCount: 18,
    badge: 'DRIVER GRADE',
    timeLeft: '1d 04h',
    car: {
      title: '2021 Hyundai Creta SX(O)',
      specs: 'PHANTOM BLACK • IVT • FWD',
      details: '28,400 KM • Full Service History • Delhi',
      images: ['https://upload.wikimedia.org/wikipedia/commons/2/21/2024_Hyundai_Creta_1.5_MPi_SX%28O%29_%28India%29_front_view.png'],
    },
  },
  {
    _id: 'sample-5',
    status: 'live',
    startPrice: 1200000,
    currentBid: 1650000,
    bidCount: 44,
    badge: 'RESERVE MET',
    timeLeft: '05h 22m',
    car: {
      title: '2022 Kia Seltos GTX Plus',
      specs: 'INTENSE RED • 7-SPEED DCT • FWD',
      details: '22,100 KM • Extended Warranty • Chennai',
      images: ['https://thumb.wikimedia.org/wikipedia/commons/thumb/6/6c/Kia_Seltos_SP2_PE_Snow_White_Pearl_%2817%29_%28cropped%29.jpg/960px-Kia_Seltos_SP2_PE_Snow_White_Pearl_%2817%29_%28cropped%29.jpg'],
    },
  },
  {
    _id: 'sample-6',
    status: 'live',
    startPrice: 1500000,
    currentBid: 1790000,
    bidCount: 36,
    badge: 'NO RESERVE',
    timeLeft: '04h 02m',
    car: {
      title: '2023 Volkswagen Virtus GT Plus',
      specs: 'WILD CHERRY RED • 7-SPEED DSG • FWD',
      details: '9,800 KM • Enthusiast Owned • Hyderabad',
      images: ['https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9e/2022_Volkswagen_Virtus_1.5_GT_%28India%29_front_view_02.png/960px-2022_Volkswagen_Virtus_1.5_GT_%28India%29_front_view_02.png'],
    },
  },
];

const Home = () => {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

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
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-2">
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
                onClick={() => setActiveFilter(status)}
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

        {/* Grid */}
        <div className="mt-8">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-80 rounded-md bg-gd-surface border border-gd-line animate-pulse" />
            ))}
          </div>
        ) : auctions.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {auctions.map((auction) => (
              <AuctionCard key={auction._id} auction={auction} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 rounded-md border border-dashed border-gd-line bg-gd-surface/50">
            <p className="text-gd-muted text-sm">No auctions match the selected filter.</p>
          </div>
        )}
        </div>

        {/* Pagination */}
        <div className="mt-12 mb-8 bg-white border border-slate-200 rounded-lg p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="text-sm text-slate-500 font-medium">
            Showing <span className="font-bold text-slate-700">1</span> - <span className="font-bold text-slate-700">24</span> of <span className="font-bold text-slate-700">148</span> vehicles
          </div>
          <div className="flex items-center gap-1.5">
            <button className="w-8 h-8 rounded bg-[#1a273b] text-white text-xs font-bold flex items-center justify-center">1</button>
            <button className="w-8 h-8 rounded bg-slate-50 hover:bg-slate-100 text-slate-500 text-xs font-bold flex items-center justify-center transition-colors">2</button>
            <button className="w-8 h-8 rounded bg-slate-50 hover:bg-slate-100 text-slate-500 text-xs font-bold flex items-center justify-center transition-colors">3</button>
            <span className="w-8 h-8 flex items-center justify-center text-slate-400 text-xs tracking-widest">...</span>
            <button className="w-8 h-8 rounded bg-slate-50 hover:bg-slate-100 text-slate-500 text-xs font-bold flex items-center justify-center transition-colors">7</button>
            <button className="px-3 h-8 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-bold flex items-center gap-1 transition-colors ml-1">
              Next Page
              <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;
