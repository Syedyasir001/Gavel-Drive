import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { findSampleAuction } from '../data/sampleAuctions';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1200&q=80';

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
    cells.push({ value: String(days).padStart(2, '0'), label: 'Days' });
  cells.push({ value: pad2(hours), label: 'Hours' });
  cells.push({ value: pad2(mins), label: 'Mins' });
  cells.push({ value: pad2(secs), label: 'Secs' });

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
            key={cell.label}
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

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [id]);

  const remaining = useCountdown(auction);

  const images = auction?.car?.images?.length
    ? auction.car.images
    : [FALLBACK_IMAGE];
  const specs = useMemo(() => (auction ? buildSpecs(auction) : []), [auction]);
  const conditionChips = useMemo(
    () => (auction ? buildConditionChips(auction) : []),
    [auction]
  );
  const currentBid = Number(auction?.currentBid) || 0;
  const startPrice = Number(auction?.startPrice) || 0;
  const bidHistory = auction?.bidHistory || [];

  const suggestedBid = Math.max(
    Math.ceil((currentBid + 1) / 50000) * 50000,
    currentBid + 50000
  );

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
    setBidAmount(String(suggestedBid));
    setBidOpen(true);
  };

  const placeBid = (e) => {
    e.preventDefault();
    const amount = Number(bidAmount);
    if (!amount || amount <= currentBid) {
      setBidMsg('Enter an amount above the current bid.');
      return;
    }
    setBusy(true);
    setBidMsg('');
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
      setBidOpen(false);
      setBidAmount('');
      setBusy(false);
      setBidMsg('Your bid is now the leading bid.');
    }, 700);
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
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
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

        {/* Title row */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-gd-ink tracking-tight break-words">
              {auction.car?.title || 'Featured Vehicle'}
            </h1>
            <p className="mt-2 text-label font-medium text-gd-muted uppercase">
              {auction.make || auction.car?.make || 'Auction'} · {auction.location}
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

          <button
            onClick={handleWatchToggle}
            className={`shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-md border text-sm font-medium transition-all duration-150 cursor-pointer self-start ${
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

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] gap-8 items-start">
          {/* Left column */}
          <div className="space-y-10 min-w-0">
            {/* Gallery */}
            <section>
              <div className="relative bg-gd-card rounded-md overflow-hidden">
                <div className="aspect-[16/10] relative">
                  <img
                    src={images[activeImage] || FALLBACK_IMAGE}
                    alt={auction.car?.title || 'Vehicle'}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/15 pointer-events-none" />
                  <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-pill text-eyebrow font-bold uppercase tracking-wide ${badgeCls}`}>
                    {auction.badge}
                  </span>
                  <span className="absolute top-3 right-3 px-2.5 py-1 rounded-pill bg-black/50 text-gd-inverse text-eyebrow font-bold uppercase tracking-wide backdrop-blur-sm">
                    {activeImage + 1} / {images.length}
                  </span>
                  <div className="absolute bottom-3 left-3 flex flex-wrap gap-2">
                    {conditionChips.slice(0, 2).map((chip) => (
                      <span key={chip} className="px-2.5 py-1 rounded-pill bg-black/55 text-gd-inverse text-eyebrow font-medium uppercase tracking-wide backdrop-blur-sm">
                        {chip}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {images.length > 1 && (
                <div className="mt-3 grid grid-cols-6 gap-3">
                  {images.map((img, i) => (
                    <button
                      key={`${img}-${i}`}
                      onClick={() => setActiveImage(i)}
                      className={`aspect-[16/10] rounded-md overflow-hidden border-2 transition-all duration-150 cursor-pointer ${
                        i === activeImage
                          ? 'border-gd-cta'
                          : 'border-transparent hover:border-gd-line'
                      }`}
                      aria-label={`View image ${i + 1}`}
                    >
                      <img
                        src={img}
                        alt=""
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </button>
                  ))}
                </div>
              )}
            </section>

            {/* Specifications */}
            <section>
              <SectionHeading eyebrow="Details" title="Key Specifications" />
              <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-px bg-gd-line rounded-md overflow-hidden border border-gd-line">
                {specs.map((spec) => (
                  <div key={spec.label} className="bg-gd-sidebar px-4 py-4">
                    <p className="text-eyebrow font-medium text-gd-ghost uppercase">
                      {spec.label}
                    </p>
                    <p className="mt-1.5 text-sm font-semi text-gd-ink break-words">
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
                      const leading = i === 0 && auction.status !== 'ended';
                      const won = bid.winner || (i === 0 && auction.status === 'ended');
                      return (
                        <li
                          key={`${bid.bidder}-${i}`}
                          className="px-5 py-3.5 flex items-center justify-between gap-4"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-md bg-gd-cta/5 text-gd-cta font-bold text-xs flex items-center justify-center uppercase shrink-0">
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
                            <p className="text-sm font-bold text-gd-ink">
                              ₹{formatINR(bid.amount)}
                            </p>
                            {leading && (
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

          {/* Right column — bid panel */}
          <aside className="lg:sticky lg:top-24 space-y-4">
            {/* Dark auction summary */}
            <div className="bg-gd-card rounded-md p-5 space-y-5">
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
            </div>

            {/* Bid / CTA panel */}
            <div className="bg-gd-sidebar border border-gd-line rounded-md p-5 shadow-card">
              {buttonActive ? (
                bidOpen ? (
                  <form onSubmit={placeBid} className="space-y-3">
                    <label className="block">
                      <span className="text-eyebrow font-medium text-gd-ghost uppercase">
                        Your bid (₹)
                      </span>
                      <input
                        type="number"
                        min={suggestedBid}
                        step={50000}
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        className="mt-1.5 w-full rounded-md border border-gd-line bg-gd-surface px-4 py-2.5 text-base font-medium text-gd-ink focus:outline-none focus:border-gd-cta focus:ring-1 focus:ring-gd-cta tabular-nums"
                        placeholder={String(suggestedBid)}
                      />
                    </label>
                    <p className="text-xs text-gd-muted">
                      Minimum next bid ₹{formatINR(suggestedBid)}
                    </p>
                    {bidMsg && (
                      <p className="text-xs font-medium text-gd-success">{bidMsg}</p>
                    )}
                    <button
                      type="submit"
                      disabled={busy}
                      className="w-full bg-gd-cta hover:bg-gd-ctaHover text-gd-inverse text-sm font-bold px-4 py-3 rounded-md transition-colors duration-150 disabled:opacity-60 cursor-pointer"
                    >
                      {busy ? 'Placing bid…' : 'Confirm Bid'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setBidOpen(false)}
                      disabled={busy}
                      className="w-full text-xs font-medium text-gd-muted hover:text-gd-ink py-1 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  </form>
                ) : (
                  <div className="space-y-3">
                    <button
                      onClick={openBid}
                      className="w-full bg-gd-cta hover:bg-gd-ctaHover text-gd-inverse text-sm font-bold px-4 py-3 rounded-md transition-colors duration-150 inline-flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Place Bid · ₹{formatINR(suggestedBid)}
                    </button>
                    <p className="text-center text-eyebrow font-medium text-gd-ghost uppercase">
                      Bid increments of ₹50,000
                    </p>
                  </div>
                )
              ) : (
                <div>
                  <p className="text-eyebrow font-bold text-gd-muted uppercase">
                    {auction.status === 'upcoming' ? 'Bidding opens soon' : 'Bidding closed'}
                  </p>
                  <p className="mt-1 text-sm text-gd-muted">
                    {auction.status === 'upcoming'
                      ? 'Register now to be ready when the gavel drops.'
                      : 'This vehicle has been awarded to the winning bidder.'}
                  </p>
                </div>
              )}
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
    </div>
  );
};

export default VehicleDetail;