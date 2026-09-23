import React, { useEffect, useState } from 'react';
import api from '../services/api';
import AuctionCard from '../components/auction/AuctionCard';

const SAMPLE_AUCTIONS = [
  {
    _id: 'sample-1',
    status: 'live',
    make: 'Mahindra',
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
    make: 'Tata',
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
    make: 'Toyota',
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
    status: 'upcoming',
    make: 'Hyundai',
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
    make: 'Kia',
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
    status: 'ended',
    make: 'Volkswagen',
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

const MAKES = ['Mahindra', 'Tata', 'Toyota', 'Hyundai', 'Kia', 'Volkswagen'];
const STATUSES = ['live', 'upcoming', 'ended'];

const Browse = () => {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [selectedMakes, setSelectedMakes] = useState([]);
  const [selectedStatuses, setSelectedStatuses] = useState([]);

  useEffect(() => {
    const fetchAuctions = async () => {
      setLoading(true);
      try {
        const res = await api.get('/auctions');
        if (res.data?.success && res.data?.data?.length > 0) {
          // Attempt to extract make from title if not explicitly provided by backend
          const auctionsWithMake = res.data.data.map(a => {
             const makeMatch = MAKES.find(m => a.car?.title?.includes(m));
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
    setSelectedMakes(prev => 
      prev.includes(make) ? prev.filter(m => m !== make) : [...prev, make]
    );
  };

  const handleStatusChange = (status) => {
    setSelectedStatuses(prev => 
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    );
  };

  const removeFilter = (type, value) => {
    if (type === 'make') {
      setSelectedMakes(prev => prev.filter(m => m !== value));
    } else if (type === 'status') {
      setSelectedStatuses(prev => prev.filter(s => s !== value));
    }
  };

  const resetAll = () => {
    setSelectedMakes([]);
    setSelectedStatuses([]);
  };

  // Derived filtered auctions
  const filteredAuctions = auctions.filter(a => {
    const makeMatch = selectedMakes.length === 0 || selectedMakes.includes(a.make);
    const statusMatch = selectedStatuses.length === 0 || selectedStatuses.includes(a.status);
    return makeMatch && statusMatch;
  });

  return (
    <div className="min-h-screen bg-gd-bg py-10">
      <div className="max-w-screen-xl mx-auto px-6">
        
        {/* Header Section */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gd-ink">Browse Auctions</h1>
          <p className="mt-1 text-sm text-gd-muted">Find your next vehicle from our curated selection.</p>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6 items-start">
          
          {/* Sidebar */}
          <aside className="w-full md:w-60 bg-gd-sidebar border border-gd-line rounded-md overflow-hidden shadow-card p-4">
            
            {/* Status Section */}
            <div className="py-2">
              <h3 className="text-xs font-bold text-gd-ink uppercase tracking-wide flex justify-between items-center py-3 cursor-pointer">
                Status
              </h3>
              <div className="flex flex-col gap-1">
                {STATUSES.map(status => (
                  <label key={status} className="flex items-center justify-between py-1.5 text-sm text-gd-ink cursor-pointer group">
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
              <h3 className="text-xs font-bold text-gd-ink uppercase tracking-wide flex justify-between items-center py-3 cursor-pointer">
                Make
              </h3>
              <div className="flex flex-col gap-1">
                {MAKES.map(make => (
                  <label key={make} className="flex items-center justify-between py-1.5 text-sm text-gd-ink cursor-pointer group">
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
          <div>
            
            {/* Active Filters Row */}
            {(selectedMakes.length > 0 || selectedStatuses.length > 0) && (
              <div className="flex flex-wrap items-center gap-2 mb-6">
                {selectedStatuses.map(status => (
                  <span key={status} className="flex items-center gap-1 px-3 py-1 rounded-pill bg-gd-line text-xs font-medium text-gd-ink capitalize">
                    {status}
                    <button onClick={() => removeFilter('status', status)} className="ml-1 text-gd-ghost hover:text-gd-ink focus:outline-none">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))}
                {selectedMakes.map(make => (
                  <span key={make} className="flex items-center gap-1 px-3 py-1 rounded-pill bg-gd-line text-xs font-medium text-gd-ink">
                    {make}
                    <button onClick={() => removeFilter('make', make)} className="ml-1 text-gd-ghost hover:text-gd-ink focus:outline-none">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))}
                <button onClick={resetAll} className="text-xs text-gd-muted underline underline-offset-2 hover:text-gd-ink ml-2 focus:outline-none">
                  Reset All
                </button>
              </div>
            )}

            {/* Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="aspect-[16/10] rounded-md bg-gd-surface border border-gd-line animate-pulse" />
                ))}
              </div>
            ) : filteredAuctions.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredAuctions.map((auction) => (
                  <AuctionCard key={auction._id} auction={auction} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 rounded-md border border-dashed border-gd-line bg-white shadow-card">
                <p className="text-gd-muted text-sm font-medium">No auctions match the selected filters.</p>
                <button onClick={resetAll} className="mt-4 border border-gd-line text-gd-ink font-medium text-xs rounded px-5 py-2.5 hover:bg-gd-bg transition-colors duration-150">
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Browse;
