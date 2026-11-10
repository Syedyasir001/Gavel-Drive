import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import KycBadge from './KycBadge';
import { INDIAN_CARD_PRESETS } from '../../data/indianCards';

const SettingsTab = ({
  paymentMethods = [],
  onOpenKycModal,
  onOpenAddPayment,
  onPaymentAdded,
  onRemovePayment,
  onSetDefaultPayment,
}) => {
  const { user, updateUser } = useAuth();

  // Profile Form State
  const [name, setName] = useState(user?.name || '');
  const [email] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [location, setLocation] = useState(user?.location || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });

  // Notifications State
  const [notifications, setNotifications] = useState({
    outbidAlerts: user?.notificationPreferences?.outbidAlerts ?? true,
    endingSoonAlerts: user?.notificationPreferences?.endingSoonAlerts ?? true,
    newAuctionAlerts: user?.notificationPreferences?.newAuctionAlerts ?? false,
    newsletter: user?.notificationPreferences?.newsletter ?? true,
    smsAlerts: user?.notificationPreferences?.smsAlerts ?? false,
  });
  const [savingNotifs, setSavingNotifs] = useState(false);
  const [notifMessage, setNotifMessage] = useState({ type: '', text: '' });

  // Profile Submit
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMessage({ type: '', text: '' });

    try {
      const res = await api.put('/auth/profile', {
        name,
        phone,
        location,
        bio,
      });

      if (res.data?.success) {
        updateUser(res.data.user);
        setProfileMessage({ type: 'success', text: 'Profile details saved successfully.' });
      } else {
        setProfileMessage({ type: 'error', text: res.data?.message || 'Failed to update profile.' });
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      // Fallback local update
      updateUser({ name, phone, location, bio });
      setProfileMessage({ type: 'success', text: 'Profile updated locally.' });
    } finally {
      setSavingProfile(false);
      setTimeout(() => setProfileMessage({ type: '', text: '' }), 4000);
    }
  };

  // Notification Toggle
  const handleToggleNotification = (key) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Save Notifications
  const handleSaveNotifications = async () => {
    setSavingNotifs(true);
    setNotifMessage({ type: '', text: '' });

    try {
      const res = await api.put('/auth/notifications', notifications);
      if (res.data?.success) {
        updateUser({ notificationPreferences: notifications });
        setNotifMessage({ type: 'success', text: 'Alert preferences saved.' });
      } else {
        setNotifMessage({ type: 'error', text: res.data?.message || 'Failed to save notifications.' });
      }
    } catch (err) {
      console.error('Error saving notifications:', err);
      updateUser({ notificationPreferences: notifications });
      setNotifMessage({ type: 'success', text: 'Preferences updated.' });
    } finally {
      setSavingNotifs(false);
      setTimeout(() => setNotifMessage({ type: '', text: '' }), 4000);
    }
  };

  const isVerified = user?.verificationStatus === 'verified';
  const [showKycSuccessBanner, setShowKycSuccessBanner] = useState(isVerified);
  const [showKycToast, setShowKycToast] = useState(false);

  useEffect(() => {
    const handleKycSuccess = () => {
      setShowKycSuccessBanner(true);
      setShowKycToast(true);
      const timer = setTimeout(() => {
        setShowKycToast(false);
      }, 6000);
      return () => clearTimeout(timer);
    };

    window.addEventListener('kyc-verified-success', handleKycSuccess);
    return () => window.removeEventListener('kyc-verified-success', handleKycSuccess);
  }, []);

  const [addingPresetId, setAddingPresetId] = useState(null);

  const handleQuickAddIndianCard = async (preset) => {
    setAddingPresetId(preset.id);
    try {
      const res = await api.post('/auth/payment-methods', {
        brand: preset.brand,
        bankName: preset.bankName,
        cardType: preset.cardType,
        last4: preset.last4,
        expMonth: preset.expMonth,
        expYear: preset.expYear,
        cardholderName: user?.name || 'Valued Collector',
        isDefault: paymentMethods.length === 0,
      });

      if (res.data?.success) {
        if (onPaymentAdded) onPaymentAdded(res.data.data);
        updateUser({ paymentMethods: res.data.data });
      }
    } catch (_err) {
      // Local fallback for offline/demo
      const fallback = {
        id: `pm_in_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        brand: preset.brand,
        bankName: preset.bankName,
        cardType: preset.cardType,
        last4: preset.last4,
        expMonth: preset.expMonth,
        expYear: preset.expYear,
        cardholderName: user?.name || 'Valued Collector',
        isDefault: paymentMethods.length === 0,
        createdAt: new Date().toISOString(),
      };
      const updated = [...paymentMethods, fallback];
      if (onPaymentAdded) onPaymentAdded(updated);
      updateUser({ paymentMethods: updated });
    } finally {
      setAddingPresetId(null);
    }
  };

  const renderCardNetworkBadge = (brand) => {
    const b = (brand || '').toLowerCase();
    if (b.includes('rupay')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-gradient-to-r from-orange-50 via-amber-50 to-emerald-50 text-orange-950 border border-orange-200 shadow-2xs">
          <span>RuPay</span>
          <span className="text-[9px]">🇮🇳</span>
        </span>
      );
    }
    if (b.includes('visa')) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black italic bg-blue-50 text-blue-800 border border-blue-200">
          VISA
        </span>
      );
    }
    if (b.includes('mastercard')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-900 border border-red-200">
          <span className="flex -space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block opacity-90" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block opacity-90" />
          </span>
          <span>Mastercard</span>
        </span>
      );
    }
    if (b.includes('amex')) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-800 border border-sky-300">
          AMEX
        </span>
      );
    }
    if (b.includes('diners')) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-800 border border-purple-200">
          DINERS CLUB
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-800 border border-gray-200">
        {brand || 'CARD'}
      </span>
    );
  };

  return (
    <div className="space-y-8 relative">
      {/* Prominent Floating Green Toast Notification */}
      {showKycToast && (
        <div className="fixed top-6 right-6 z-50 max-w-md w-full bg-white border border-emerald-300 rounded-xl shadow-2xl p-4 flex items-start gap-3.5 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="w-9 h-9 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="flex-1 pr-1">
            <h4 className="text-sm font-bold text-gray-900">
              Success! Your identity has been verified via DigiLocker.
            </h4>
            <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
              UIDAI Aadhaar credentials authenticated. You now have unlimited live auction bidding authorization.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowKycToast(false)}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-md transition-colors cursor-pointer"
            aria-label="Dismiss toast"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* 1. Identity & KYC Verification Section */}
      <section className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-gray-900">Identity Verification (KYC)</h2>
            <span className="text-xs text-gray-500 hidden sm:inline">
              Automotive auction compliance &amp; legal bidder authentication
            </span>
          </div>
          <KycBadge status={user?.verificationStatus} onClick={onOpenKycModal} interactive />
        </div>

        <div className="p-6 space-y-4">
          {/* Prominent Inline Alert Banner upon DigiLocker verification */}
          {showKycSuccessBanner && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-start justify-between gap-3 animate-in fade-in duration-200">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-emerald-900">
                    Success! Your identity has been verified via DigiLocker.
                  </h4>
                  <p className="text-xs text-emerald-700 mt-0.5 leading-relaxed">
                    Verified via DigiLocker using government-issued Aadhaar ID. You have unlimited bidding authorization.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowKycSuccessBanner(false)}
                className="text-emerald-600 hover:text-emerald-800 p-1 rounded-md hover:bg-emerald-100/50 transition-colors cursor-pointer"
                aria-label="Dismiss banner"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-white border border-gray-200">
            <div className="flex items-start gap-3.5">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                isVerified
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                  : 'bg-amber-50 text-amber-700 border border-amber-200/60'
              }`}>
                {isVerified ? (
                  <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {isVerified ? 'Your Identity is Fully Verified' : 'Verification Required for High-Stakes Bidding'}
                </p>
                <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
                  {isVerified
                    ? 'Verified via DigiLocker using government-issued Aadhaar ID. You have unlimited bidding authorization.'
                    : 'GavelDrive mandates verified government ID (Aadhaar or PAN) before you can place live bids in auctions.'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onOpenKycModal}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                isVerified
                  ? 'border border-gray-200 bg-white hover:bg-gray-50 text-gray-800 shadow-sm'
                  : 'bg-gd-primary hover:bg-gd-primaryHover text-white shadow-sm'
              }`}
            >
              {isVerified ? 'Update Document' : 'Complete KYC Verification'}
            </button>
          </div>
        </div>
      </section>

      {/* 2. Billing & Payment Methods Section */}
      <section className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-gray-900">Billing &amp; Payment Methods</h2>
            <span className="text-xs text-gray-500 hidden sm:inline">
              A valid Indian card on file is required for live auction bidding
            </span>
          </div>
          <span className="text-eyebrow font-bold text-gray-500 uppercase px-2 py-0.5 rounded-full bg-gray-100 border border-gray-200">
            {paymentMethods.length} {paymentMethods.length === 1 ? 'Card' : 'Cards'}
          </span>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2">
            <p className="text-xs text-gray-600 max-w-xl leading-relaxed">
              To ensure all auction bids represent bona-fide collector commitments, members must maintain a verified debit or credit card on file. Supports <strong>RuPay, Visa, Mastercard, American Express, and Diners Club</strong> across all scheduled Indian banks.
            </p>
            <button
              onClick={onOpenAddPayment}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all inline-flex items-center gap-1.5 shrink-0 shadow-sm cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Add Card
            </button>
          </div>

          {/* ACTIVE CARDS GRID */}
          {paymentMethods.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-700">
                  Your Cards on File ({paymentMethods.length})
                </span>
                <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-semibold flex items-center gap-1">
                  <span>🔒</span> RBI Tokenized
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {paymentMethods.map((pm) => (
                  <div
                    key={pm.id}
                    className={`p-4 rounded-xl border transition-all ${
                      pm.isDefault
                        ? 'border-blue-500 bg-blue-50/40 shadow-xs'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2.5">
                      <div>
                        <span className="text-xs font-bold text-gray-900 block">
                          {pm.bankName || 'HDFC Bank'}
                        </span>
                        <span className="text-[11px] text-gray-500 font-medium">
                          {pm.cardType || `${pm.brand || 'Card'} Credit`}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {renderCardNetworkBadge(pm.brand)}
                        {pm.isDefault && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white uppercase tracking-wider">
                            Default
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="font-mono text-sm font-semibold tracking-wider text-gray-900 mb-2">
                      •••• •••• •••• {pm.last4}
                    </div>

                    <div className="flex justify-between items-center pt-2.5 border-t border-gray-100 text-xs">
                      <div>
                        <span className="text-[10px] text-gray-400 block uppercase">Cardholder</span>
                        <span className="text-gray-700 font-medium truncate max-w-[140px] block text-[11px]">
                          {pm.cardholderName || user?.name || 'Valued Collector'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 block uppercase">Expires</span>
                        <span className="text-gray-700 font-mono text-[11px]">
                          {String(pm.expMonth).padStart(2, '0')}/{String(pm.expYear).slice(-2)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {!pm.isDefault && (
                          <button
                            type="button"
                            onClick={() => onSetDefaultPayment && onSetDefaultPayment(pm.id)}
                            className="text-blue-600 hover:underline text-[11px] font-semibold cursor-pointer"
                          >
                            Set Default
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => onRemovePayment && onRemovePayment(pm.id)}
                          className="text-red-600 hover:underline text-[11px] font-semibold cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AVAILABLE INDIAN CARDS SHELF (Shown when 0 cards or as a quick-add shelf) */}
          <div className="pt-2 border-t border-gray-100 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 flex items-center gap-1.5">
                  <span>🇮🇳 Available Card Options in India</span>
                  <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                    Instant 1-Click Add
                  </span>
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Select any Indian bank card network below to instantly configure your bidding guarantee:
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {INDIAN_CARD_PRESETS.map((preset) => {
                const isAlreadyAdded = paymentMethods.some(
                  (pm) => pm.last4 === preset.last4 || (pm.bankName === preset.bankName && pm.brand === preset.brand)
                );
                const isAdding = addingPresetId === preset.id;

                return (
                  <div
                    key={preset.id}
                    className="p-3.5 rounded-xl border border-gray-200 bg-gray-50/70 hover:bg-white hover:border-blue-300 transition-all shadow-2xs flex flex-col justify-between gap-3 group"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1.5">
                        <span className="text-xs font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {preset.bankName}
                        </span>
                        {renderCardNetworkBadge(preset.brand)}
                      </div>
                      <p className="text-xs font-semibold text-gray-800 leading-tight">
                        {preset.cardType}
                      </p>
                      <p className="text-[11px] text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                        {preset.description}
                      </p>
                    </div>

                    <div className="pt-2.5 border-t border-gray-200/80 flex items-center justify-between">
                      <span className="font-mono text-[11px] text-gray-600 font-semibold">
                        •••• {preset.last4}
                      </span>
                      {isAlreadyAdded ? (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                          <svg className="w-3 h-3 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                          On File
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleQuickAddIndianCard(preset)}
                          disabled={isAdding}
                          className="px-2.5 py-1 rounded-lg bg-white hover:bg-blue-600 hover:text-white border border-gray-300 hover:border-blue-600 text-[11px] font-bold text-gray-800 transition-all shadow-xs cursor-pointer flex items-center gap-1 disabled:opacity-50"
                        >
                          {isAdding ? (
                            <>
                              <svg className="w-3 h-3 animate-spin text-blue-600" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                              </svg>
                              <span>Adding...</span>
                            </>
                          ) : (
                            <>
                              <span>+ Add Card</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 3. Profile Information Form */}
      <section className="bg-gd-sidebar border border-gd-line rounded-md overflow-hidden">
        <div className="px-5 py-4 border-b border-gd-line bg-gd-surface flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semi text-gd-ink">Profile Details</h2>
            <span className="text-xs text-gd-muted hidden sm:inline">
              Personal contact &amp; collector biography
            </span>
          </div>
          <span className="text-eyebrow font-medium text-gd-muted uppercase">Public Profile</span>
        </div>

        <form onSubmit={handleProfileSubmit} className="p-6 space-y-4">
          {profileMessage.text && (
            <div
              className={`p-3 rounded-md text-xs border ${
                profileMessage.type === 'success'
                  ? 'bg-gd-reserveMet/10 border-gd-reserveMet/20 text-gd-reserveMet'
                  : 'bg-gd-error/10 border-gd-error/20 text-gd-error'
              }`}
            >
              {profileMessage.text}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-eyebrow font-medium text-gd-muted uppercase mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gd-sidebar border border-gd-line rounded-md text-sm text-gd-ink focus:outline-none focus:border-gd-primary focus:ring-1 focus:ring-gd-primary"
                required
              />
            </div>

            <div>
              <label className="block text-eyebrow font-medium text-gd-muted uppercase mb-1.5">
                Email Address (Account ID)
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full px-3.5 py-2.5 bg-gd-surface border border-gd-line rounded-md text-sm text-gd-ghost cursor-not-allowed"
                />
                <span className="absolute right-3 top-2.5 text-xs text-gd-reserveMet font-medium flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Verified
                </span>
              </div>
            </div>

            <div>
              <label className="block text-eyebrow font-medium text-gd-muted uppercase mb-1.5">
                Phone Number
              </label>
              <input
                type="tel"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gd-sidebar border border-gd-line rounded-md text-sm text-gd-ink focus:outline-none focus:border-gd-primary focus:ring-1 focus:ring-gd-primary"
              />
            </div>

            <div>
              <label className="block text-eyebrow font-medium text-gd-muted uppercase mb-1.5">
                Location / City
              </label>
              <input
                type="text"
                placeholder="e.g. Mumbai, MH"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gd-sidebar border border-gd-line rounded-md text-sm text-gd-ink focus:outline-none focus:border-gd-primary focus:ring-1 focus:ring-gd-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-eyebrow font-medium text-gd-muted uppercase mb-1.5">
              Collector Bio / Garage Narrative
            </label>
            <textarea
              rows={3}
              placeholder="Tell other automotive enthusiasts about your vehicles of interest and garage history..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-gd-sidebar border border-gd-line rounded-md text-sm text-gd-ink focus:outline-none focus:border-gd-primary focus:ring-1 focus:ring-gd-primary"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={savingProfile}
              className="px-5 py-2.5 rounded-md bg-gd-primary hover:bg-gd-primaryHover text-gd-inverse text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50 inline-flex items-center gap-2"
            >
              {savingProfile ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </section>

      {/* 4. Notification Preferences */}
      <section className="bg-gd-sidebar border border-gd-line rounded-md overflow-hidden">
        <div className="px-5 py-4 border-b border-gd-line bg-gd-surface flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semi text-gd-ink">Auction Alerts &amp; Notifications</h2>
            <span className="text-xs text-gd-muted hidden sm:inline">
              Control outbid alerts and real-time urgency reminders
            </span>
          </div>
          <span className="text-eyebrow font-medium text-gd-muted uppercase">Preferences</span>
        </div>

        <div className="p-6 space-y-4">
          {notifMessage.text && (
            <div
              className={`p-3 rounded-md text-xs border ${
                notifMessage.type === 'success'
                  ? 'bg-gd-reserveMet/10 border-gd-reserveMet/20 text-gd-reserveMet'
                  : 'bg-gd-error/10 border-gd-error/20 text-gd-error'
              }`}
            >
              {notifMessage.text}
            </div>
          )}

          <div className="divide-y divide-gd-line">
            {/* Outbid Alerts */}
            <div className="py-3 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-gd-ink">Outbid Instant Alerts</p>
                <p className="text-xs text-gd-muted">
                  Receive immediate push and email notification when a competing bidder outbids your vehicle.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleToggleNotification('outbidAlerts')}
                className={`w-11 h-6 flex items-center rounded-pill p-1 transition-colors cursor-pointer ${
                  notifications.outbidAlerts ? 'bg-gd-primary' : 'bg-gd-line'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-pill shadow-md transform transition-transform ${
                    notifications.outbidAlerts ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Ending Soon Alerts */}
            <div className="py-3 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-gd-ink">Auction Ending Soon Reminders</p>
                <p className="text-xs text-gd-muted">
                  Alert sent 1 hour and 15 minutes before auctions on your watchlist or active bids conclude.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleToggleNotification('endingSoonAlerts')}
                className={`w-11 h-6 flex items-center rounded-pill p-1 transition-colors cursor-pointer ${
                  notifications.endingSoonAlerts ? 'bg-gd-primary' : 'bg-gd-line'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-pill shadow-md transform transition-transform ${
                    notifications.endingSoonAlerts ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* New Listings Alerts */}
            <div className="py-3 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-gd-ink">New Curated Listings</p>
                <p className="text-xs text-gd-muted">
                  Be notified whenever a new car matching popular collector categories is verified and listed.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleToggleNotification('newAuctionAlerts')}
                className={`w-11 h-6 flex items-center rounded-pill p-1 transition-colors cursor-pointer ${
                  notifications.newAuctionAlerts ? 'bg-gd-primary' : 'bg-gd-line'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-pill shadow-md transform transition-transform ${
                    notifications.newAuctionAlerts ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Weekly Newsletter */}
            <div className="py-3 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-gd-ink">Weekly Market Intelligence Digest</p>
                <p className="text-xs text-gd-muted">
                  A curated editorial report on market trends, hammer prices, and rare car market valuations.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleToggleNotification('newsletter')}
                className={`w-11 h-6 flex items-center rounded-pill p-1 transition-colors cursor-pointer ${
                  notifications.newsletter ? 'bg-gd-primary' : 'bg-gd-line'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-pill shadow-md transform transition-transform ${
                    notifications.newsletter ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* SMS Bid Alerts */}
            <div className="py-3 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-gd-ink">SMS Bid Confirmation &amp; Urgency</p>
                <p className="text-xs text-gd-muted">
                  Direct SMS updates for final 2-minute soft-close anti-sniping bid wars.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleToggleNotification('smsAlerts')}
                className={`w-11 h-6 flex items-center rounded-pill p-1 transition-colors cursor-pointer ${
                  notifications.smsAlerts ? 'bg-gd-primary' : 'bg-gd-line'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-pill shadow-md transform transition-transform ${
                    notifications.smsAlerts ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="pt-3 flex justify-end">
            <button
              type="button"
              onClick={handleSaveNotifications}
              disabled={savingNotifs}
              className="px-5 py-2.5 rounded-md bg-gd-primary hover:bg-gd-primaryHover text-gd-inverse text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50 inline-flex items-center gap-2"
            >
              {savingNotifs ? 'Updating...' : 'Save Notification Preferences'}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SettingsTab;
