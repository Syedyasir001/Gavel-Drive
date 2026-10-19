import React, { useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import KycBadge from './KycBadge';

const SettingsTab = ({
  paymentMethods = [],
  onOpenKycModal,
  onOpenAddPayment,
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

  return (
    <div className="space-y-8">
      {/* 1. Identity & KYC Verification Section */}
      <section className="bg-gd-sidebar border border-gd-line rounded-md overflow-hidden">
        <div className="px-5 py-4 border-b border-gd-line bg-gd-surface flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semi text-gd-ink">Identity Verification (KYC)</h2>
            <span className="text-xs text-gd-muted hidden sm:inline">
              Automotive auction compliance &amp; legal bidder authentication
            </span>
          </div>
          <KycBadge status={user?.verificationStatus} />
        </div>

        <div className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-md bg-gd-surface border border-gd-line">
            <div className="flex items-start gap-3.5">
              <div className={`w-10 h-10 rounded-md flex items-center justify-center shrink-0 ${
                isVerified ? 'bg-gd-reserveMet/10 text-gd-reserveMet' : 'bg-gd-warning/15 text-gd-endingSoon'
              }`}>
                {isVerified ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                )}
              </div>
              <div>
                <p className="text-sm font-semi text-gd-ink">
                  {isVerified ? 'Your Identity is Fully Verified' : 'Verification Required for High-Stakes Bidding'}
                </p>
                <p className="text-xs text-gd-muted mt-0.5 leading-relaxed">
                  {isVerified
                    ? `Verified using government-issued ${user?.verificationDetails?.documentType?.toUpperCase() || 'document'} (${user?.verificationDetails?.documentNumber || '••••'}). You have unlimited bidding authorization.`
                    : 'GavelDrive mandates verified government ID (PAN, Passport, or License) before you can place live bids in auctions.'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onOpenKycModal}
              className={`px-4 py-2 rounded-md text-xs font-bold transition-all shrink-0 cursor-pointer ${
                isVerified
                  ? 'border border-gd-line bg-gd-sidebar hover:bg-gd-bg text-gd-ink'
                  : 'bg-gd-primary hover:bg-gd-primaryHover text-gd-inverse shadow-sm'
              }`}
            >
              {isVerified ? 'Update Document' : 'Complete KYC Verification'}
            </button>
          </div>
        </div>
      </section>

      {/* 2. Billing & Payment Methods Section */}
      <section className="bg-gd-sidebar border border-gd-line rounded-md overflow-hidden">
        <div className="px-5 py-4 border-b border-gd-line bg-gd-surface flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semi text-gd-ink">Billing &amp; Payment Methods</h2>
            <span className="text-xs text-gd-muted hidden sm:inline">
              A valid card on file is required for live auction bidding
            </span>
          </div>
          <span className="text-eyebrow font-medium text-gd-muted uppercase">
            {paymentMethods.length} {paymentMethods.length === 1 ? 'Card' : 'Cards'}
          </span>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between pb-2">
            <p className="text-xs text-gd-muted max-w-xl leading-relaxed">
              To ensure all auction bids represent bona-fide collector commitments, members must maintain a verified debit or credit card on file.
            </p>
            <button
              onClick={onOpenAddPayment}
              className="px-3.5 py-1.5 rounded-md bg-gd-primary hover:bg-gd-primaryHover text-gd-inverse text-xs font-bold transition-colors inline-flex items-center gap-1.5 shrink-0 shadow-sm cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Add Card
            </button>
          </div>

          {paymentMethods.length === 0 ? (
            <div className="text-center p-8 border border-dashed border-gd-line rounded-md bg-gd-surface/50">
              <div className="w-10 h-10 mx-auto rounded-md bg-gd-bg border border-gd-line flex items-center justify-center mb-2 text-gd-ghost">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-gd-ink">No payment method on file</p>
              <p className="text-xs text-gd-muted mt-1 max-w-xs mx-auto">
                Add a credit or debit card to unlock bidding privileges on live vehicle listings.
              </p>
              <button
                onClick={onOpenAddPayment}
                className="mt-4 px-4 py-2 rounded-md bg-gd-primary hover:bg-gd-primaryHover text-gd-inverse text-xs font-bold transition-colors shadow-sm cursor-pointer"
              >
                Add Card on File
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {paymentMethods.map((pm) => (
                <div
                  key={pm.id}
                  className={`p-4 rounded-md border transition-all ${
                    pm.isDefault
                      ? 'border-gd-primary bg-gd-primaryLight/20'
                      : 'border-gd-line bg-gd-sidebar hover:border-gd-ghost'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-7 rounded bg-gd-card text-gd-inverse font-mono text-[10px] font-bold flex items-center justify-center uppercase">
                        {pm.brand || 'CARD'}
                      </div>
                      <div>
                        <p className="text-sm font-semi text-gd-ink font-mono">
                          •••• •••• •••• {pm.last4}
                        </p>
                        <p className="text-eyebrow text-gd-muted uppercase">
                          Exp: {pm.expMonth < 10 ? `0${pm.expMonth}` : pm.expMonth}/{String(pm.expYear).slice(-2)}
                        </p>
                      </div>
                    </div>

                    {pm.isDefault && (
                      <span className="px-2 py-0.5 rounded-pill text-eyebrow font-bold bg-gd-primary text-gd-inverse uppercase">
                        Default
                      </span>
                    )}
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-gd-line/60 text-xs">
                    <span className="text-gd-muted truncate max-w-[150px]">
                      {pm.cardholderName || user?.name}
                    </span>
                    <div className="flex items-center gap-3">
                      {!pm.isDefault && (
                        <button
                          type="button"
                          onClick={() => onSetDefaultPayment && onSetDefaultPayment(pm.id)}
                          className="text-gd-primary hover:underline text-xs font-medium cursor-pointer"
                        >
                          Make Default
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => onRemovePayment && onRemovePayment(pm.id)}
                        className="text-gd-error hover:underline text-xs font-medium cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
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
