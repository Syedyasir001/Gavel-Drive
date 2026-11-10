import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const HowItWorksModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('bidding');
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleAction = (path) => {
    onClose();
    navigate(path);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="bg-gd-sidebar border border-gd-line rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="how-it-works-title"
      >
        {/* Header */}
        <div className="px-6 py-5 bg-gd-surface border-b border-gd-line flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gd-cta text-gd-inverse flex items-center justify-center shadow-sm">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="how-it-works-title" className="text-lg font-bold text-gd-ink tracking-tight">
                  How GavelDrive Works
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gd-cta/10 text-gd-cta uppercase tracking-wider">
                  Guide
                </span>
              </div>
              <p className="text-xs text-gd-muted mt-0.5">
                Transparent bidding, verified provenance, and escrow-backed security
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-gd-muted hover:text-gd-ink hover:bg-gd-line/60 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gd-line bg-gd-surface/50 px-6 pt-3 gap-2">
          {[
            { id: 'bidding', label: 'Bidding & Buying', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
            { id: 'selling', label: 'Selling a Car', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
            { id: 'escrow', label: 'Escrow & Guarantee', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'border-gd-cta text-gd-cta'
                  : 'border-transparent text-gd-muted hover:text-gd-ink'
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d={tab.icon} />
              </svg>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-sm text-gd-ink leading-relaxed flex-1">
          {activeTab === 'bidding' && (
            <div className="space-y-4">
              <div className="flex gap-4 p-4 rounded-xl bg-gd-surface border border-gd-line">
                <div className="w-8 h-8 rounded-full bg-gd-cta text-gd-inverse text-xs font-bold flex items-center justify-center shrink-0">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-gd-ink text-sm">Discover Curated Vehicles</h3>
                  <p className="text-xs text-gd-muted mt-1 leading-normal">
                    Explore thoroughly documented collector, performance, and enthusiast cars. Every listing features comprehensive condition notes, verified VIN provenance, high-resolution photography, and inspection records.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 p-4 rounded-xl bg-gd-surface border border-gd-line">
                <div className="w-8 h-8 rounded-full bg-gd-cta text-gd-inverse text-xs font-bold flex items-center justify-center shrink-0">
                  2
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gd-ink text-sm">₹10,000 Refundable Bidding Escrow</h3>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-gd-success/10 text-gd-success uppercase">
                      100% Refundable
                    </span>
                  </div>
                  <p className="text-xs text-gd-muted mt-1 leading-normal">
                    To maintain an authentic marketplace and prevent frivolous offers, bidders authorize a temporary ₹10,000 deposit hold. If you do not win the vehicle, this hold is automatically released and 100% refunded the moment the auction ends.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 p-4 rounded-xl bg-gd-surface border border-gd-line">
                <div className="w-8 h-8 rounded-full bg-gd-cta text-gd-inverse text-xs font-bold flex items-center justify-center shrink-0">
                  3
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gd-ink text-sm">Live Synchronized Bidding &amp; Anti-Sniping</h3>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-gd-warning/15 text-gd-endingSoon uppercase">
                      Soft-Close
                    </span>
                  </div>
                  <p className="text-xs text-gd-muted mt-1 leading-normal">
                    Place real-time bids with calibrated dynamic increments. Any bid submitted within the final 2 minutes automatically extends the auction countdown by an additional 2 minutes, ensuring a fair, transparent outcome without last-second bot sniping.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 p-4 rounded-xl bg-gd-surface border border-gd-line">
                <div className="w-8 h-8 rounded-full bg-gd-cta text-gd-inverse text-xs font-bold flex items-center justify-center shrink-0">
                  4
                </div>
                <div>
                  <h3 className="font-semibold text-gd-ink text-sm">Winning &amp; Secure Handover</h3>
                  <p className="text-xs text-gd-muted mt-1 leading-normal">
                    When the timer expires with reserve met, the winning bidder is connected directly with the seller to coordinate payment settlement, title transfer, and vehicle transport.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'selling' && (
            <div className="space-y-4">
              <div className="flex gap-4 p-4 rounded-xl bg-gd-surface border border-gd-line">
                <div className="w-8 h-8 rounded-full bg-gd-cta text-gd-inverse text-xs font-bold flex items-center justify-center shrink-0">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-gd-ink text-sm">Submit Your Car Details</h3>
                  <p className="text-xs text-gd-muted mt-1 leading-normal">
                    Fill out our streamlined consignment submission form with make, model, odometer, mechanical modifications, and service history.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 p-4 rounded-xl bg-gd-surface border border-gd-line">
                <div className="w-8 h-8 rounded-full bg-gd-cta text-gd-inverse text-xs font-bold flex items-center justify-center shrink-0">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-gd-ink text-sm">Curated Review &amp; Reserve Strategy</h3>
                  <p className="text-xs text-gd-muted mt-1 leading-normal">
                    Our automotive curation specialists review your documentation and photography. You decide whether to list with a confidential Reserve Price or run at No Reserve to maximize bidding interest.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 p-4 rounded-xl bg-gd-surface border border-gd-line">
                <div className="w-8 h-8 rounded-full bg-gd-cta text-gd-inverse text-xs font-bold flex items-center justify-center shrink-0">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-gd-ink text-sm">7-Day Live Auction Window</h3>
                  <p className="text-xs text-gd-muted mt-1 leading-normal">
                    Your vehicle is featured in front of verified, high-intent collector automotive buyers across India. Answer prospective buyers' questions directly in real time.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 p-4 rounded-xl bg-gd-surface border border-gd-line">
                <div className="w-8 h-8 rounded-full bg-gd-cta text-gd-inverse text-xs font-bold flex items-center justify-center shrink-0">
                  4
                </div>
                <div>
                  <h3 className="font-semibold text-gd-ink text-sm">Seamless Closing &amp; Payout</h3>
                  <p className="text-xs text-gd-muted mt-1 leading-normal">
                    Once the auction ends, we facilitate direct buyer-seller handover. 100% of the winning hammer price goes to the seller.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'escrow' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-gd-surface border border-gd-line">
                <div className="flex items-center gap-2 text-gd-success font-semibold text-sm">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Automated Escrow Refund Guarantee
                </div>
                <p className="text-xs text-gd-muted mt-1.5 leading-normal">
                  All ₹10,000 deposits are held in a secure pre-authorization escrow. If you are outbid or don't win the vehicle, our system triggers an instant 100% refund with an immutable transaction receipt (<code className="bg-gd-sidebar px-1 py-0.5 rounded text-[11px] text-gd-ink">REF_...</code>).
                </p>
              </div>

              <div className="p-4 rounded-xl bg-gd-surface border border-gd-line">
                <div className="flex items-center gap-2 text-gd-cta font-semibold text-sm">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                  </svg>
                  DigiLocker &amp; Government ID Verification
                </div>
                <p className="text-xs text-gd-muted mt-1.5 leading-normal">
                  Members complete official digital verification (Aadhaar / PAN / Voter ID) via DigiLocker. Verified members receive the green shield badge, ensuring transparent and authenticated counterparties for every transaction.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-gd-surface border border-gd-line">
                <div className="flex items-center gap-2 text-gd-cta font-semibold text-sm">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  All Scheduled Indian Banks Supported
                </div>
                <p className="text-xs text-gd-muted mt-1.5 leading-normal">
                  Our payment infrastructure seamlessly supports RuPay, Visa, Mastercard, American Express, and Diners Club across SBI, HDFC, ICICI, Axis, and all major Indian banking partners.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-gd-surface border-t border-gd-line flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleAction('/browse')}
              className="px-4 py-2 rounded-md bg-gd-cta hover:bg-gd-ctaHover text-gd-inverse text-xs font-semibold transition-colors cursor-pointer"
            >
              Explore Vehicles
            </button>
            <button
              onClick={() => handleAction('/sell')}
              className="px-4 py-2 rounded-md border border-gd-line bg-gd-sidebar hover:bg-gd-surface text-gd-ink text-xs font-semibold transition-colors cursor-pointer"
            >
              Sell a Car
            </button>
          </div>
          <button
            onClick={onClose}
            className="text-xs font-medium text-gd-muted hover:text-gd-ink transition-colors cursor-pointer px-3 py-1.5"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};

export default HowItWorksModal;

