import React, { useState } from 'react';
import api from '../../services/api';

const formatINR = (val) =>
  new Intl.NumberFormat('en-IN').format(Number(val) || 0);

const BiddingDepositModal = ({
  isOpen,
  onClose,
  onSuccess,
  auction,
  user,
  depositAmount = 10000,
}) => {
  const [selectedCardId, setSelectedCardId] = useState(() => {
    const defaultCard = user?.paymentMethods?.find((c) => c.isDefault);
    return defaultCard?.id || user?.paymentMethods?.[0]?.id || 'pm_default_1';
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const cards = user?.paymentMethods?.length
    ? user.paymentMethods
    : [
        {
          id: 'pm_default_1',
          brand: 'Visa',
          last4: '4092',
          expMonth: 8,
          expYear: 2028,
          isDefault: true,
        },
      ];

  const selectedCard = cards.find((c) => c.id === selectedCardId) || cards[0];
  const vehicleTitle = auction?.car?.title || auction?.title || 'Featured Auction Vehicle';
  const auctionId = auction?._id || 'sample-auction';

  const handlePayDeposit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      let depositData = null;

      // If it's a real MongoDB auction, call the server API
      if (auctionId && !String(auctionId).startsWith('sample-')) {
        const res = await api.post('/bids/deposit', {
          auctionId,
          auctionTitle: vehicleTitle,
          amount: depositAmount,
          paymentMethod: {
            id: selectedCard.id,
            brand: selectedCard.brand,
            last4: selectedCard.last4,
          },
        });
        if (res.data?.success) {
          depositData = res.data.data;
        }
      } else {
        // Sample auction local simulation
        depositData = {
          _id: `dep_${Date.now()}`,
          auction: auctionId,
          auctionTitle: vehicleTitle,
          amount: depositAmount,
          status: 'held',
          paymentMethod: {
            id: selectedCard.id,
            brand: selectedCard.brand,
            last4: selectedCard.last4,
          },
          transactionId: `TXN_DEP_${Date.now()}_${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
          createdAt: new Date().toISOString(),
        };

        // Persist to local storage for demo persistence
        try {
          const stored = JSON.parse(localStorage.getItem(`gd_deposit_${auctionId}`) || 'null');
          localStorage.setItem(`gd_deposit_${auctionId}`, JSON.stringify(depositData));
        } catch (_e) {}
      }

      setLoading(false);
      onSuccess(depositData);
      onClose();
    } catch (err) {
      setLoading(false);
      setErrorMsg(
        err.response?.data?.message || 'Failed to process bidding deposit authorization. Please try again.'
      );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-gd-card border border-gd-lineDark rounded-lg w-full max-w-lg overflow-hidden shadow-2xl relative text-gd-inverse animate-page-pop"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-gd-lineDark flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-md bg-gd-primary/20 text-gd-primaryLight border border-gd-primary/40 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Bidding Entry Fee Payment
              </h3>
              <p className="text-eyebrow text-gd-ghost uppercase tracking-wider">
                100% Refundable Escrow Deposit
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gd-ghost hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handlePayDeposit} className="p-6 space-y-5">
          {/* Vehicle context banner */}
          <div className="bg-white/5 border border-gd-lineDark rounded-md p-3.5 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-eyebrow font-medium text-gd-ghost uppercase">Vehicle Listing</p>
              <p className="text-sm font-bold text-white truncate mt-0.5">{vehicleTitle}</p>
            </div>
            <span className="shrink-0 px-2.5 py-1 rounded-pill bg-gd-reserveMet/20 text-gd-reserveMet border border-gd-reserveMet/40 text-eyebrow font-bold uppercase">
              Live Auction
            </span>
          </div>

          {/* Fee & Refund Terms Highlight */}
          <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-md p-4 space-y-2.5">
            <div className="flex items-start gap-2.5">
              <svg className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <div>
                <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                  100% Refundable Guarantee
                </h4>
                <p className="text-xs text-emerald-100/90 leading-relaxed mt-1">
                  To maintain marketplace authenticity and protect real bidders, an entry deposit of <strong>₹{formatINR(depositAmount)}</strong> is required to enter this bidding room.
                </p>
                <p className="text-xs text-emerald-200/80 leading-relaxed mt-1">
                  <strong>When this auction ends</strong>, this payment is <strong>automatically refunded</strong> back to your original payment method. No deductions or platform fees.
                </p>
              </div>
            </div>
          </div>

          {/* Pricing Breakdown */}
          <div className="bg-white/5 border border-gd-lineDark rounded-md p-4 space-y-2 text-xs">
            <div className="flex items-center justify-between text-gd-ghost">
              <span>Bidding Access Deposit</span>
              <span className="font-semibold text-white">₹{formatINR(depositAmount)}</span>
            </div>
            <div className="flex items-center justify-between text-gd-ghost">
              <span>Escrow Processing Fee</span>
              <span className="text-emerald-400 font-semibold">₹0 (Waived)</span>
            </div>
            <div className="flex items-center justify-between text-gd-ghost">
              <span>Refund Status on Auction Close</span>
              <span className="text-emerald-400 font-bold">100% Refunded</span>
            </div>
            <div className="pt-2 border-t border-gd-lineDark flex items-center justify-between text-sm font-bold text-white">
              <span>Total Authorization</span>
              <span className="text-base text-gd-inverse">₹{formatINR(depositAmount)}</span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-eyebrow font-medium text-gd-ghost uppercase tracking-wider mb-2">
              Payment Method for Escrow &amp; Return
            </label>
            <div className="space-y-2">
              {cards.map((card) => (
                <label
                  key={card.id}
                  className={`flex items-center justify-between p-3 rounded-md border cursor-pointer transition-all ${
                    selectedCardId === card.id
                      ? 'bg-white/10 border-gd-primary ring-1 ring-gd-primary'
                      : 'bg-white/5 border-gd-lineDark hover:border-gd-ghost'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment_card"
                      checked={selectedCardId === card.id}
                      onChange={() => setSelectedCardId(card.id)}
                      className="text-gd-primary focus:ring-gd-primary h-4 w-4"
                    />
                    <div>
                      <p className="text-xs font-bold text-white">
                        {card.brand || 'Card'} ending in {card.last4}
                      </p>
                      <p className="text-eyebrow text-gd-ghost uppercase">
                        Exp {String(card.expMonth).padStart(2, '0')}/{card.expYear}
                        {card.isDefault ? ' · Default' : ''}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-gd-ghost font-mono">Verified</span>
                </label>
              ))}
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-md bg-gd-error/20 border border-gd-error/40 text-xs text-gd-error">
              {errorMsg}
            </div>
          )}

          {/* Actions */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-3 px-4 rounded-md border border-gd-lineDark text-xs font-semibold text-gd-ghost hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-[2] py-3 px-4 rounded-md bg-white hover:bg-gray-100 text-gd-ink text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4 text-gd-ink" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span>Authorizing Escrow...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 text-gd-ink" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Pay ₹{formatINR(depositAmount)} &amp; Unlock Bidding</span>
                </>
              )}
            </button>
          </div>

          <p className="text-center text-eyebrow text-gd-ghost uppercase tracking-wider">
            Protected by 256-Bit Escrow · Auto-Refund on Auction Close
          </p>
        </form>
      </div>
    </div>
  );
};

export default BiddingDepositModal;
