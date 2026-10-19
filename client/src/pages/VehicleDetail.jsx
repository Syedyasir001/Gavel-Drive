import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { findSampleAuction } from '../data/sampleAuctions';
import BiddingDepositModal from '../components/auction/BiddingDepositModal';

/**
 * Consistent vehicle asset gallery representing angles (front, rear, interior, engine, wheel)
 * of the same vehicle (2023 Tata Nexon Fearless Purple)
 */
const TATA_NEXON_GALLERY = [
  'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/2023_Tata_Nexon_XZA%2B_front_view.jpg/1280px-2023_Tata_Nexon_XZA%2B_front_view.jpg',
  'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=1200&q=80',
];

const FALLBACK_IMAGE = TATA_NEXON_GALLERY[0];

const BADGE_STYLES = {
  'RESERVE MET': 'bg-gd-reserveMet text-gd-inverse',
  'NO RESERVE': 'bg-gd-noReserve text-gd-inverse',
  'ENDING SOON': 'bg-gd-endingSoon text-gd-endingText',
  'DRIVER GRADE': 'bg-gd-newListing text-gd-inverse',
  UPCOMING: 'bg-gd-noReserve text-gd-inverse',
  'NEWLY LISTED': 'bg-gd-newListing text-gd-inverse',
  SOLD: 'bg-gd-reserveMet text-gd-inverse',
};

const formatINR = (val) =>
  new Intl.NumberFormat('en-IN').format(Number(val) || 0);

/**
 * Tiered Bid Increment System:
 * - ₹0 to ₹5,00,000: Increment is ₹5,000
 * - ₹5,00,001 to ₹15,00,000: Increment is ₹10,000
 * - ₹15,00,001 to ₹50,00,000: Increment is ₹25,000
 * - ₹50,00,001 and above: Increment is ₹50,000
 */
export const calculateBidIncrement = (currentBid) => {
  const bid = Number(currentBid) || 0;
  if (bid <= 500000) return 5000;
  if (bid <= 1500000) return 10000;
  if (bid <= 5000000) return 25000;
  return 50000;
};

const pad2 = (n) => String(n).padStart(2, '0');

const parseDuration = (str = '') => {
  const d = str.match(/(\d+)d/);
  const h = str.match(/(\d+)h/);
  const m = str.match(/(\d+)m/);
  return (
    (d ? Number(d[1]) * 86400000 : 0) +
    (h ? Number(h[1]) * 3600000 : 0) +
    (m ? Number(m[1]) * 60000 : 0)
  );
};

const useCountdown = (auction) => {
  const [ms, setMs] = useState(null);

  useEffect(() => {
    if (!auction) {
      setMs(null);
      return undefined;
    }
    const endsAt = auction.endTime
      ? new Date(auction.endTime).getTime()
      : Date.now() + parseDuration(auction.timeLeft);
    const tick = () => setMs(Math.max((endsAt || 0) - Date.now(), 0));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [auction]);

  return ms;
};

const normalizeAuction = (raw) => {
  const car = raw.car || {};
  const badge =
    raw.status === 'ended'
      ? 'SOLD'
      : raw.status === 'upcoming'
        ? 'UPCOMING'
        : Number(raw.currentBid) > Number(raw.startPrice)
          ? 'RESERVE MET'
          : 'NO RESERVE';

  return {
    ...raw,
    badge,
    timeLeft: raw.timeLeft || '05h 00m',
    location: raw.location || car.city || car.seller?.city || '—',
    car: {
      ...car,
      location: raw.location || car.city || car.seller?.city,
    },
    seller: raw.seller || car.seller || {},
  };
};

const buildSpecs = (auction) => {
  const car = auction?.car || {};
  const eng = auction?.engineering;

  if (eng) {
    return [
      { label: 'Year', value: eng.year },
      { label: 'Make', value: eng.make },
      { label: 'Model', value: eng.model },
      { label: 'Body Style', value: eng.bodyStyle },
      { label: 'Mileage', value: eng.mileage },
      { label: 'Transmission', value: eng.transmission },
      { label: 'Drive Type', value: eng.drive },
      { label: 'Fuel', value: eng.fuel },
      { label: 'Engine', value: eng.engine },
      { label: 'Power', value: eng.power },
      { label: 'Seats', value: eng.seats },
      { label: 'Colour', value: eng.color },
    ];
  }

  const rows = [];
  if (car.year) rows.push({ label: 'Year', value: car.year });
  if (car.make) rows.push({ label: 'Make', value: car.make });
  if (car.model) rows.push({ label: 'Model', value: car.model });
  if (car.mileage !== undefined) rows.push({ label: 'Mileage', value: `${car.mileage} km` });

  const specs = (car.specs || '').split('•').map((s) => s.trim());
  const details = (car.details || '').split('•').map((s) => s.trim());
  const yearMatch = (car.title || '').match(/^(19|20)\d{2}/);

  if (!car.year && yearMatch) rows.push({ label: 'Year', value: yearMatch[0] });
  if (!car.make && auction?.make) rows.push({ label: 'Make', value: auction.make });
  if (!car.model && car.title) {
    rows.push({
      label: 'Model',
      value: (car.title || '').replace(/^(19|20)\d{2}\s*/, ''),
    });
  }
  if (specs[0]) rows.push({ label: 'Colour', value: specs[0] });
  if (specs[1]) rows.push({ label: 'Transmission', value: specs[1] });
  if (specs[2]) rows.push({ label: 'Drive Type', value: specs[2] });
  if (details[0] && car.mileage === undefined) rows.push({ label: 'Mileage', value: details[0] });
  if (details[1]) rows.push({ label: 'Ownership', value: details[1] });
  if (details[2]) rows.push({ label: 'Location', value: details[2] });
  return rows;
};

const buildConditionChips = (auction) => {
  const car = auction?.car || {};
  const details = (car.details || '').split('•').map((s) => s.trim());
  const chips = [];
  if (car.mileage !== undefined) chips.push(`${car.mileage} km`);
  else if (details[0]) chips.push(details[0]);
  
  if (details[1]) chips.push(details[1]);
  if (auction?.location && auction.location !== '—') {
    chips.push(auction.location);
  }
  return chips;
};

const TimerTiles = ({ ms, label }) => {
  const clamped = Math.max(ms, 0);
  const days = Math.floor(clamped / 86400000);
  const hours = Math.floor(clamped / 3600000) % 24;
  const mins = Math.floor(clamped / 60000) % 60;
  const secs = Math.floor(clamped / 1000) % 60;

  const cells = [];
  if (days > 0)
    cells.push({
      id: 'days',
      value: String(days).padStart(2, '0'),
      label: days === 1 ? 'Day' : 'Days',
    });
  cells.push({
    id: 'hours',
    value: pad2(hours),
    label: hours === 1 ? 'Hour' : 'Hours',
  });
  cells.push({
    id: 'mins',
    value: pad2(mins),
    label: mins === 1 ? 'Min' : 'Mins',
  });
  cells.push({
    id: 'secs',
    value: pad2(secs),
    label: secs === 1 ? 'Sec' : 'Secs',
  });

  return (
    <div>
      {label && (
        <p className="text-eyebrow font-medium text-gd-ghost uppercase mb-2">
          {label}
        </p>
      )}
      <div className="grid grid-cols-4 gap-1.5">
        {cells.map((cell) => (
          <div
            key={cell.id}
            className="bg-white/5 border border-gd-lineDark rounded-md py-2 text-center"
          >
            <div className="text-lg font-bold text-gd-inverse tabular-nums leading-none">
              {cell.value}
            </div>
            <div className="mt-1 text-eyebrow font-medium text-gd-ghost uppercase">
              {cell.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const SectionHeading = ({ eyebrow, title, count }) => (
  <div className="flex items-end justify-between gap-4">
    <div>
      <span className="text-eyebrow font-medium text-gd-muted uppercase block">
        {eyebrow}
      </span>
      {title && (
        <h2 className="mt-1 text-xl font-bold text-gd-ink tracking-tight">
          {title}
        </h2>
      )}
    </div>
    {count !== undefined && (
      <span className="text-eyebrow font-medium text-gd-ghost uppercase">
        {count}
      </span>
    )}
  </div>
);

const VehicleDetail = () => {
  const { id } = useParams();
  return <VehicleDetailContent key={id} id={id} />;
};

const VehicleDetailContent = ({ id }) => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const sample = useMemo(() => findSampleAuction(id), [id]);

  const [auction, setAuction] = useState(() =>
    sample ? normalizeAuction(sample) : null
  );
  const [activeImage, setActiveImage] = useState(0);
  const [saved, setSaved] = useState(false);
  const [bidOpen, setBidOpen] = useState(false);
  const [bidAmount, setBidAmount] = useState('');
  const [busy, setBusy] = useState(false);
  const [bidMsg, setBidMsg] = useState('');

  // Refundable Bidding Entry Fee Deposit State
  const [deposit, setDeposit] = useState(() => {
    try {
      const stored = localStorage.getItem(`gd_deposit_${id}`);
      return stored ? JSON.parse(stored) : null;
    } catch (_e) {
      return null;
    }
  });
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const depositAmount = auction?.entryFee || 10000;
  const hasEntryDeposit = Boolean(deposit && deposit.status === 'held');

  useEffect(() => {
    if (!sample) return undefined;
    const call = async () => {
      try {
        const res = await api.get(`/auctions/${id}`);
        const data = res.data?.data;
        if (data?.car) {
          setAuction(normalizeAuction(data));
        }
      } catch (err) {
        if (err.response?.status === 404) {
          setAuction(null);
        }
      }
    };
    call();
    return undefined;
  }, [id, sample]);

  // Sync deposit status from API if authenticated
  useEffect(() => {
    if (!isAuthenticated || !id) return;
    const checkDeposit = async () => {
      try {
        if (!String(id).startsWith('sample-')) {
          const res = await api.get(`/bids/deposit/${id}`);
          if (res.data?.success && res.data?.deposit) {
            setDeposit(res.data.deposit);
            return;
          }
        }
      } catch (_e) {}

      // Fallback / localStorage for sample auctions
      try {
        const stored = localStorage.getItem(`gd_deposit_${id}`);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (
            (auction?.status === 'ended' ||
              (auction?.endTime && new Date(auction.endTime).getTime() <= Date.now())) &&
            parsed.status === 'held'
          ) {
            parsed.status = 'refunded';
            parsed.refundedAt = parsed.refundedAt || new Date().toISOString();
            parsed.refundTransactionId = parsed.refundTransactionId || `REF_${Date.now()}_AUTO`;
            localStorage.setItem(`gd_deposit_${id}`, JSON.stringify(parsed));
          }
          setDeposit(parsed);
        }
      } catch (_e) {}
    };
    checkDeposit();
  }, [id, isAuthenticated, auction?.status]);

  // Auto-refund held deposit when auction concludes or timer expires
  useEffect(() => {
    if (deposit && deposit.status === 'held' && auction?.status === 'ended') {
      const doRefund = async () => {
        try {
          if (!String(id).startsWith('sample-')) {
            const res = await api.post(`/bids/deposit/${id}/refund`);
            if (res.data?.success) {
              const refundedItem = res.data.data?.[0];
              setDeposit((prev) => ({
                ...prev,
                status: 'refunded',
                refundedAt: new Date().toISOString(),
                refundTransactionId: refundedItem?.refundTransactionId || `REF_${Date.now()}_AUTO`,
              }));
              return;
            }
          }
        } catch (_e) {}

        const updated = {
          ...deposit,
          status: 'refunded',
          refundedAt: new Date().toISOString(),
          refundTransactionId: `REF_${Date.now()}_AUTO`,
        };
        setDeposit(updated);
        try {
          localStorage.setItem(`gd_deposit_${id}`, JSON.stringify(updated));
        } catch (_e) {}
      };
      doRefund();
    }
  }, [auction?.status, deposit, id]);

  const handleSimulateEndAuction = async () => {
    try {
      if (!String(id).startsWith('sample-')) {
        await api.post(`/auctions/${id}/end`);
      }
    } catch (_e) {}

    setAuction((prev) => ({
      ...prev,
      status: 'ended',
      timeLeft: 'Ended',
    }));

    if (deposit) {
      const updated = {
        ...deposit,
        status: 'refunded',
        refundedAt: new Date().toISOString(),
        refundTransactionId: `REF_${Date.now()}_RELEASE`,
      };
      setDeposit(updated);
      try {
        localStorage.setItem(`gd_deposit_${id}`, JSON.stringify(updated));
      } catch (_e) {}
    }
  };

  useEffect(() => {
    setActiveImage(0);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [id]);

  const remaining = useCountdown(auction);

  const vehicle = auction?.car || {};
  const images = useMemo(() => {
    const rawImages = (vehicle.images || auction?.images || [])
      .map((img) => (typeof img === 'string' ? img : img?.url))
      .filter(Boolean);

    if (rawImages.length > 0) {
      return rawImages;
    }
    return [FALLBACK_IMAGE];
  }, [auction, vehicle.images]);

  const specs = useMemo(() => (auction ? buildSpecs(auction) : []), [auction]);
  const conditionChips = useMemo(
    () => (auction ? buildConditionChips(auction) : []),
    [auction]
  );
  const currentBid = Number(auction?.currentBid) || 0;
  const startPrice = Number(auction?.startPrice) || 0;
  const bidHistory = auction?.bidHistory || [];

  const bidIncrement = calculateBidIncrement(currentBid);
  const suggestedBid = Math.max(
    Math.ceil((currentBid + 1) / bidIncrement) * bidIncrement,
    currentBid + bidIncrement
  );
  const quickBid1 = bidIncrement;
  const quickBid3 = bidIncrement * 3;

  const handleWatchToggle = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setSaved((s) => !s);
  };

  const openBid = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!hasEntryDeposit) {
      setIsDepositModalOpen(true);
      return;
    }
    setBidAmount(suggestedBid);
    setBidOpen(true);
  };

  const handleBidInputChange = (e) => {
    const digitsOnly = e.target.value.replace(/\D/g, '');
    if (!digitsOnly) {
      setBidAmount('');
      return;
    }
    const parsed = parseInt(digitsOnly, 10);
    setBidAmount(isNaN(parsed) ? '' : parsed);
  };

  const handleQuickBid = (inc) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!hasEntryDeposit) {
      setIsDepositModalOpen(true);
      return;
    }
    const nextTarget = Math.max(currentBid + inc, suggestedBid);
    setBidAmount(nextTarget);
    setBidOpen(true);
    setBidMsg('');
  };

  const formattedBidDisplay =
    bidAmount !== '' && bidAmount !== null && !isNaN(bidAmount)
      ? new Intl.NumberFormat('en-IN').format(bidAmount)
      : '';

  const placeBid = async (e) => {
    e.preventDefault();
    if (!hasEntryDeposit) {
      setIsDepositModalOpen(true);
      return;
    }
    const amount = Number(bidAmount);
    if (!amount || amount < suggestedBid) {
      setBidMsg(
        `Minimum next bid is ₹${formatINR(suggestedBid)} (minimum increment of ₹${formatINR(bidIncrement)}).`
      );
      return;
    }
    setBusy(true);
    setBidMsg('');

    try {
      if (auction?._id && !String(auction._id).startsWith('sample-')) {
        await api.post('/bids', {
          auctionId: auction._id,
          amount,
        });
      }
    } catch (err) {
      if (err.response?.data?.code === 'ENTRY_FEE_REQUIRED') {
        setBusy(false);
        setIsDepositModalOpen(true);
        return;
      }
      const errMsg = err.response?.data?.message;
      if (errMsg) {
        setBidMsg(errMsg);
        setBusy(false);
        return;
      }
    }

    window.setTimeout(() => {
      setAuction((prev) => ({
        ...prev,
        currentBid: amount,
        bidCount: (prev.bidCount || 0) + 1,
        badge: 'RESERVE MET',
        bidHistory: [
          { bidder: user?.name || 'You', amount, time: 'Just now' },
          ...(prev.bidHistory || []),
        ],
      }));
      setBidAmount('');
      setBusy(false);
      setBidMsg('Your bid is now the leading bid.');
    }, 500);
  };

  if (!auction) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="w-12 h-12 mx-auto rounded-md bg-gd-surface border border-gd-line flex items-center justify-center">
            <span className="text-xl">G</span>
          </div>
          <h1 className="mt-5 text-2xl font-bold text-gd-ink">
            Auction not found
          </h1>
          <p className="mt-2 text-sm text-gd-muted">
            {!sample
              ? 'This listing does not exist or has been removed from the marketplace.'
              : 'We couldn’t load this vehicle. Please try again.'}
          </p>
          <Link
            to="/browse"
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-gd-cta hover:bg-gd-ctaHover text-gd-inverse text-xs font-bold transition-colors duration-150"
          >
            Back to Auctions
          </Link>
        </div>
      </div>
    );
  }

  const statusLabel =
    auction.status === 'ended'
      ? 'Auction ended'
      : auction.status === 'upcoming'
        ? 'Upcoming auction'
        : 'Live auction';

  const statusDot =
    auction.status === 'ended'
      ? 'bg-gd-ghost'
      : auction.status === 'upcoming'
        ? 'bg-gd-noReserve'
        : 'bg-gd-success animate-pulse';

  const buttonActive = auction.status === 'live';
  const badgeCls = BADGE_STYLES[auction.badge] || 'bg-gd-muted text-gd-inverse';
  const reserveMet =
    auction.badge === 'RESERVE MET' ||
    (auction.status === 'ended' && currentBid > startPrice);

  return (
    <div className="min-h-screen bg-gd-bg pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Breadcrumb */}
        <nav className="pt-8 pb-6 flex items-center justify-between gap-4">
          <Link
            to="/browse"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-gd-muted hover:text-gd-ink transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Auctions
          </Link>
          <span className="inline-flex items-center gap-2 text-eyebrow font-medium text-gd-muted uppercase">
            <span className={`w-1.5 h-1.5 rounded-pill ${statusDot}`}></span>
            {statusLabel} · ID {auction._id}
          </span>
        </nav>

        {/* Title row with anchored Save button */}
        <div className="mb-8">
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-gd-ink tracking-tight break-words">
              {auction.car?.title || 'Featured Vehicle'}
            </h1>
            <button
              onClick={handleWatchToggle}
              className={`shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-md border text-sm font-medium transition-all duration-150 cursor-pointer ${
                saved
                  ? 'bg-gd-error/5 border-gd-error/30 text-gd-error'
                  : 'bg-gd-sidebar border-gd-line text-gd-muted hover:text-gd-ink hover:border-gd-ghost'
              }`}
            >
              <svg
                className={`w-4 h-4 ${saved ? 'fill-current' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              {saved ? 'Saved' : 'Save'}
            </button>
          </div>
          <p className="mt-2 text-label font-medium text-gd-muted uppercase">
            {auction.make || auction.car?.make || 'Auction'}
          </p>
          {conditionChips.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {conditionChips.map((chip) => (
                <span
                  key={chip}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-gd-surface border border-gd-line text-xs font-medium text-gd-ink"
                >
                  <svg className="w-3.5 h-3.5 text-gd-ghost" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {chip}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] gap-8 items-start">
          {/* Left column */}
          <div className="space-y-10 min-w-0">
            {/* Gallery */}
            <section>
              <div className="relative bg-gd-card rounded-md overflow-hidden">
                <div className="aspect-[16/10] relative">
                  <img
                    src={images[activeImage] || images[0] || FALLBACK_IMAGE}
                    alt={auction.car?.title || 'Vehicle'}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/15 pointer-events-none" />
                  <span className="absolute top-3 right-3 px-2.5 py-1 rounded-pill bg-black/50 text-gd-inverse text-eyebrow font-bold uppercase tracking-wide backdrop-blur-sm">
                    {Math.min(activeImage + 1, images.length)} / {images.length}
                  </span>
                </div>
              </div>

              {/* Gallery thumbnails grid */}
              <div className="mt-3 grid grid-cols-5 gap-2.5 sm:gap-3">
                {images.map((img, i) => (
                  <button
                    key={`${img}-${i}`}
                    onClick={() => setActiveImage(i)}
                    className={`aspect-[16/10] rounded-md overflow-hidden border-2 transition-all duration-150 cursor-pointer ${
                      i === activeImage
                        ? 'border-gd-cta ring-1 ring-gd-cta'
                        : 'border-transparent opacity-75 hover:opacity-100 hover:border-gd-line'
                    }`}
                    aria-label={`View image ${i + 1}`}
                  >
                    <img
                      src={img}
                      alt={`Vehicle thumbnail ${i + 1}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            </section>

            {/* Specifications - High Contrast WCAG labels & subtle borders */}
            <section>
              <SectionHeading eyebrow="Details" title="Key Specifications" />
              <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-px bg-gray-200 rounded-md overflow-hidden border border-gray-200">
                {specs.map((spec) => (
                  <div key={spec.label} className="bg-white px-4 py-4">
                    <p className="text-eyebrow font-semibold text-gray-500 uppercase tracking-wider">
                      {spec.label}
                    </p>
                    <p className="mt-1.5 text-sm font-bold text-gd-ink break-words">
                      {spec.value}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Description */}
            <section>
              <SectionHeading eyebrow="Seller Notes" title="About This Vehicle" />
              <div className="mt-5 bg-gd-sidebar border border-gd-line rounded-md p-5">
                <p className="text-base text-gd-ink leading-relaxed">
                  {auction.car?.description ||
                    auction.car?.details ||
                    'Detailed description coming soon from the seller.'}
                </p>
                {auction.listedOn && (
                  <p className="mt-5 text-sm text-gd-muted flex items-center gap-1.5 flex-wrap">
                    <svg className="w-4 h-4 text-gd-ghost" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Listed {auction.listedOn}
                    {auction.endsOn && (
                      <>
                        <span className="text-gd-ghost">·</span>
                        Ends {auction.endsOn}
                      </>
                    )}
                  </p>
                )}
              </div>
            </section>

            {/* Bid activity */}
            <section>
              <SectionHeading
                eyebrow="Activity"
                title="Bid History"
                count={`${auction.bidCount || bidHistory.length} bids`}
              />
              <div className="mt-5 bg-gd-sidebar border border-gd-line rounded-md overflow-hidden">
                {bidHistory.length > 0 ? (
                  <ul className="divide-y divide-gd-line">
                    {bidHistory.slice(0, 8).map((bid, i) => {
                      const isLeading = i === 0 && auction.status !== 'ended';
                      const won = bid.winner || (i === 0 && auction.status === 'ended');
                      return (
                        <li
                          key={`${bid.bidder}-${i}`}
                          className={`px-5 py-3.5 flex items-center justify-between gap-4 transition-colors ${
                            isLeading
                              ? 'bg-green-50/70 border-l-4 border-l-gd-success'
                              : won
                                ? 'bg-green-50/40'
                                : ''
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`w-8 h-8 rounded-md font-bold text-xs flex items-center justify-center uppercase shrink-0 ${
                              isLeading || won
                                ? 'bg-gd-success/15 text-gd-success'
                                : 'bg-gd-cta/5 text-gd-cta'
                            }`}>
                              {bid.bidder.slice(0, 1)}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-gd-ink truncate">
                                {bid.bidder}
                                {won && (
                                  <span className="ml-2 text-eyebrow font-bold text-gd-success uppercase">
                                    Winner
                                  </span>
                                )}
                              </p>
                              <p className="text-eyebrow text-gd-ghost uppercase">
                                {bid.time}
                              </p>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <p className={`text-sm font-bold ${
                              isLeading || won ? 'text-gd-success' : 'text-gd-ink'
                            }`}>
                              ₹{formatINR(bid.amount)}
                            </p>
                            {isLeading && (
                              <p className="text-eyebrow font-bold text-gd-success uppercase">
                                Leading
                              </p>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <div className="px-5 py-10 text-center">
                    <p className="text-sm text-gd-muted">
                      No bids have been placed yet. Be the first.
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* Trust strip */}
            <section className="bg-gd-surface border border-gd-line rounded-md p-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {[
                  {
                    title: 'Verified seller & car',
                    desc: 'Identity and condition are inspected before listing.',
                  },
                  {
                    title: 'Binding, secure checkout',
                    desc: 'Winning bids move to a protected settlement process.',
                  },
                  {
                    title: 'Transparent bid history',
                    desc: 'Every bid is publicly logged with a timestamp.',
                  },
                ].map((item) => (
                  <div key={item.title} className="flex gap-3">
                    <svg className="w-5 h-5 text-gd-success shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="text-sm font-semi text-gd-ink">{item.title}</p>
                      <p className="mt-0.5 text-xs text-gd-muted leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right column — Unified Sticky Bidding Sidebar */}
          <aside className="lg:sticky lg:top-20 space-y-4 self-start">
            {/* Unified Dark auction summary & bidding card */}
            <div className="sticky top-6 lg:top-20 bg-gd-card rounded-md p-5 space-y-5 shadow-card z-10">
              <div className="flex items-center justify-between gap-4">
                <span className={`px-2.5 py-1 rounded-pill text-eyebrow font-bold uppercase tracking-wide ${badgeCls}`}>
                  {auction.badge}
                </span>
                <span className="inline-flex items-center gap-1.5 text-eyebrow font-medium text-gd-ghost uppercase">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  {auction.bidCount || 0} Bids
                </span>
              </div>

              <div>
                <p className="text-eyebrow font-medium text-gd-ghost uppercase">
                  Current Bid
                </p>
                <p className="mt-1 text-2xl font-bold text-gd-inverse tabular-nums tracking-tight">
                  ₹{formatINR(currentBid)}
                </p>
                {/* Quick bid buttons below Current Bid */}
                {buttonActive && (
                  <div className="mt-3 flex items-center gap-2 flex-wrap">
                    <span className="text-eyebrow font-medium text-gd-ghost uppercase">
                      Quick:
                    </span>
                    <button
                      type="button"
                      onClick={() => handleQuickBid(quickBid1)}
                      className="px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/20 border border-gd-lineDark text-xs font-semibold text-gd-inverse transition-colors duration-150 cursor-pointer"
                    >
                      +₹{formatINR(quickBid1)}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickBid(quickBid3)}
                      className="px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/20 border border-gd-lineDark text-xs font-semibold text-gd-inverse transition-colors duration-150 cursor-pointer"
                    >
                      +₹{formatINR(quickBid3)}
                    </button>
                  </div>
                )}
              </div>

              {remaining !== null && buttonActive ? (
                <TimerTiles ms={remaining} label="Ends in" />
              ) : remaining !== null && auction.status === 'upcoming' ? (
                <TimerTiles ms={remaining} label="Starts in" />
              ) : (
                <div className="rounded-md bg-white/5 border border-gd-lineDark px-4 py-3">
                  <p className="text-eyebrow font-bold text-gd-ghost uppercase">
                    Auction ended
                  </p>
                  <p className="mt-1 text-sm text-gd-inverse">
                    Final price ₹{formatINR(currentBid)} · winner in settlement.
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between text-sm pb-1">
                <span className="text-gd-ghost">Start price</span>
                <span className="font-medium text-gd-inverse tabular-nums">
                  ₹{formatINR(startPrice)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gd-ghost">Reserve</span>
                <span
                  className={`font-medium ${
                    reserveMet ? 'text-gd-success' : 'text-gd-endingText'
                  }`}
                >
                  {reserveMet ? 'Met' : 'Not met'}
                </span>
              </div>
              {auction.car?.aiValuation && (
                <div className="flex items-center justify-between text-sm pt-1 border-t border-gd-lineDark mt-2">
                  <span className="text-gd-ghost">AI Valuation</span>
                  <span className="font-medium text-gd-success tabular-nums">
                    ₹{formatINR(auction.car.aiValuation)}
                  </span>
                </div>
              )}

              {/* Bidding Actions unified directly inside the dark card */}
              <div className="pt-4 border-t border-gd-lineDark">
                {buttonActive ? (
                  !hasEntryDeposit ? (
                    <div className="space-y-3">
                      <div className="rounded-md bg-white/5 border border-gd-lineDark p-3.5 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-eyebrow font-bold text-amber-400 uppercase tracking-wider">
                            <svg className="w-3.5 h-3.5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            Entry Deposit Required
                          </span>
                          <span className="text-eyebrow font-bold text-emerald-400 uppercase">
                            100% Refundable
                          </span>
                        </div>
                        <p className="text-xs text-gray-300 leading-relaxed">
                          A refundable entry fee deposit of <strong className="text-white">₹{formatINR(depositAmount)}</strong> is required to enter this live bidding room.
                        </p>
                        <div className="flex items-center gap-2 text-eyebrow text-emerald-300 bg-emerald-950/40 border border-emerald-500/30 rounded px-2.5 py-1.5 font-medium">
                          <svg className="w-3.5 h-3.5 text-emerald-400 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                          </svg>
                          <span>When this auction ends, this payment is automatically refunded back to your card.</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (!isAuthenticated) {
                            navigate('/login');
                            return;
                          }
                          setIsDepositModalOpen(true);
                        }}
                        className="w-full bg-white hover:bg-gray-100 text-gd-ink text-sm font-bold px-4 py-3 rounded-md transition-colors duration-150 inline-flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                      >
                        <svg className="w-4 h-4 text-gd-ink" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        Pay ₹{formatINR(depositAmount)} Deposit &amp; Unlock Bidding
                      </button>
                      <p className="text-center text-eyebrow font-medium text-gray-400 uppercase tracking-wider">
                        Held in escrow · Auto-refunded on auction close
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Active deposit indicator */}
                      <div className="rounded-md bg-emerald-950/40 border border-emerald-500/40 px-3 py-2 flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1.5 font-bold text-emerald-400">
                          <svg className="w-4 h-4 text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                          </svg>
                          Bidder Deposit Active (₹{formatINR(deposit.amount || depositAmount)} Held)
                        </span>
                        <span className="text-eyebrow text-gray-400 uppercase font-medium">
                          Refunds on close
                        </span>
                      </div>

                      {bidOpen ? (
                        <form onSubmit={placeBid} className="space-y-3">
                          <label className="block">
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-eyebrow font-medium text-gray-400 uppercase">
                                Your bid (₹)
                              </span>
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleQuickBid(quickBid1)}
                                  className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 border border-gd-lineDark text-eyebrow font-bold text-white transition-colors cursor-pointer"
                                >
                                  +₹{formatINR(quickBid1)}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleQuickBid(quickBid3)}
                                  className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 border border-gd-lineDark text-eyebrow font-bold text-white transition-colors cursor-pointer"
                                >
                                  +₹{formatINR(quickBid3)}
                                </button>
                              </div>
                            </div>
                            <input
                              type="text"
                              inputMode="numeric"
                              value={formattedBidDisplay}
                              onChange={handleBidInputChange}
                              placeholder={formatINR(suggestedBid)}
                              className="w-full rounded-md border border-gray-300 shadow-inner bg-white px-4 py-2.5 text-base font-medium text-gd-ink focus:outline-none focus:ring-2 focus:ring-white tabular-nums"
                            />
                          </label>
                          <div className="flex items-center justify-between text-xs text-gray-400">
                            <span>Minimum next bid</span>
                            <span className="font-semibold text-white">₹{formatINR(suggestedBid)}</span>
                          </div>
                          {bidMsg && (
                            <p
                              className={`text-xs font-medium ${
                                bidMsg.includes('leading bid')
                                  ? 'text-gd-success'
                                  : 'text-gd-endingText'
                              }`}
                            >
                              {bidMsg}
                            </p>
                          )}
                          <button
                            type="submit"
                            disabled={busy}
                            className="w-full bg-white hover:bg-gray-100 text-gd-ink text-sm font-bold px-4 py-3 rounded-md transition-colors duration-150 disabled:opacity-60 cursor-pointer shadow-sm"
                          >
                            {busy ? 'Placing bid…' : 'Confirm Bid'}
                          </button>
                          <p className="text-center text-eyebrow font-medium text-gray-400 uppercase tracking-wider">
                            Bid increments of ₹{formatINR(bidIncrement)}
                          </p>
                        </form>
                      ) : (
                        <div className="space-y-3">
                          <button
                            onClick={openBid}
                            className="w-full bg-white hover:bg-gray-100 text-gd-ink text-sm font-bold px-4 py-3 rounded-md transition-colors duration-150 inline-flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                          >
                            <svg className="w-4 h-4 text-gd-ink" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            Place Bid · ₹{formatINR(suggestedBid)}
                          </button>
                          <p className="text-center text-eyebrow font-medium text-gray-400 uppercase tracking-wider">
                            Bid increments of ₹{formatINR(bidIncrement)}
                          </p>
                        </div>
                      )}

                      {/* Demo/test trigger to close auction and test automatic deposit refund */}
                      <button
                        type="button"
                        onClick={handleSimulateEndAuction}
                        className="w-full text-center text-eyebrow text-gray-400 hover:text-white py-1 transition-colors underline cursor-pointer"
                        title="Simulate auction completion to trigger immediate deposit refund"
                      >
                        Simulate Auction End &amp; Trigger Deposit Refund
                      </button>
                    </div>
                  )
                ) : (
                  <div className="space-y-3">
                    {/* Refund banner when auction is ended and deposit was placed */}
                    {deposit && (
                      <div className="rounded-md bg-emerald-950/40 border border-emerald-500/40 p-4 space-y-2">
                        <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                          <svg className="w-5 h-5 text-emerald-400 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                          </svg>
                          <span>₹{formatINR(deposit.amount || depositAmount)} Deposit Refunded</span>
                        </div>
                        <p className="text-xs text-emerald-100/90 leading-relaxed">
                          This auction has concluded. Your ₹{formatINR(deposit.amount || depositAmount)} bidding entry fee has been automatically refunded to your {deposit.paymentMethod?.brand || 'card'} ending in {deposit.paymentMethod?.last4 || '4092'}.
                        </p>
                        <div className="pt-1.5 border-t border-emerald-500/20 flex items-center justify-between text-eyebrow text-emerald-300 uppercase tracking-wider font-mono">
                          <span>Ref: {deposit.refundTransactionId || 'REF_AUTO_RELEASE'}</span>
                          <span className="text-emerald-400 font-bold">Processed</span>
                        </div>
                      </div>
                    )}

                    <div>
                      <p className="text-eyebrow font-bold text-gray-400 uppercase">
                        {auction.status === 'upcoming' ? 'Bidding opens soon' : 'Bidding closed'}
                      </p>
                      <p className="mt-1 text-sm text-gray-400">
                        {auction.status === 'upcoming'
                          ? 'Register now to be ready when the gavel drops.'
                          : 'This vehicle has been awarded to the winning bidder.'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Seller card */}
            {auction.seller?.name && (
              <div className="bg-gd-sidebar border border-gd-line rounded-md p-5 shadow-card">
                <span className="text-eyebrow font-medium text-gd-ghost uppercase block">
                  Listed by
                </span>
                <div className="mt-3 flex items-start gap-3">
                  <div className="w-11 h-11 rounded-md bg-gd-cta/10 text-gd-cta font-bold text-base flex items-center justify-center uppercase shrink-0">
                    {auction.seller.name.slice(0, 1)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semi text-gd-ink flex items-center gap-1.5">
                      {auction.seller.name}
                      <svg className="w-4 h-4 text-gd-success shrink-0" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                      </svg>
                    </p>
                    <p className="mt-0.5 text-eyebrow text-gd-muted uppercase">
                      {auction.seller.city || 'Verified seller'}
                    </p>
                    <p className="mt-2 text-xs text-gd-muted flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 text-gd-ghost" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Member since {auction.seller.memberSince || '2021'}
                    </p>
                    {auction.seller.rating && (
                      <p className="mt-1 text-xs text-gd-muted flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5 text-gd-warning" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.958a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.367 2.447a1 1 0 00-.364 1.118l1.287 3.958c.3.922-.755 1.688-1.539 1.118l-3.367-2.446a1 1 0 00-1.176 0l-3.367 2.446c-.783.57-1.838-.196-1.538-1.118l1.286-3.958a1 1 0 00-.364-1.118L2.05 9.385c-.783-.57-.38-1.81.588-1.81h4.163a1 1 0 00.95-.69l1.286-3.958z" />
                        </svg>
                        {auction.seller.rating.toFixed(1)} rating · responds {auction.seller.responseTime}
                      </p>
                    )}
                  </div>
                </div>
                <button className="mt-4 w-full border border-gd-line rounded-md text-gd-cta text-xs font-bold px-4 py-2.5 hover:bg-gd-bg transition-colors duration-150 inline-flex items-center justify-center gap-2 cursor-pointer">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  Contact Seller
                </button>
              </div>
            )}
          </aside>
        </div>
      </div>

      {/* Bidding Entry Deposit Modal */}
      <BiddingDepositModal
        isOpen={isDepositModalOpen}
        onClose={() => setIsDepositModalOpen(false)}
        onSuccess={(newDep) => {
          setDeposit(newDep);
          setBidOpen(true);
        }}
        auction={auction}
        user={user}
        depositAmount={depositAmount}
      />
    </div>
  );
};

export default VehicleDetail;