import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

// Dashboard Subcomponents
import TabNavigation from '../components/dashboard/TabNavigation';
import KycBadge from '../components/dashboard/KycBadge';
import KycModal from '../components/dashboard/KycModal';
import AddPaymentModal from '../components/dashboard/AddPaymentModal';
import OverviewTab from '../components/dashboard/OverviewTab';
import AuctionHistoryLedger from '../components/dashboard/AuctionHistoryLedger';
import MyListingsTab from '../components/dashboard/MyListingsTab';
import SavedVehiclesTab from '../components/dashboard/SavedVehiclesTab';
import SettingsTab from '../components/dashboard/SettingsTab';

// Fallback mock data
import {
  DEFAULT_SAVED_VEHICLES,
  DEFAULT_WON_AUCTIONS,
  DEFAULT_LOST_AUCTIONS,
  DEFAULT_PAYMENT_METHODS,
} from '../data/mockDashboardData';

const Dashboard = () => {
  const { user, isAuthenticated, loading, updateUser } = useAuth();

  // Active Tab State: 'overview' | 'bids' | 'listings' | 'saved' | 'settings'
  const [activeTab, setActiveTab] = useState('overview');

  // Modals
  const [isKycModalOpen, setIsKycModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // Data states
  const [activeBids, setActiveBids] = useState([]);
  const [wonAuctions, setWonAuctions] = useState(DEFAULT_WON_AUCTIONS);
  const [lostAuctions, setLostAuctions] = useState(DEFAULT_LOST_AUCTIONS);
  const [soldVehicles, setSoldVehicles] = useState([]);
  const [myListings, setMyListings] = useState([]);
  const [savedVehicles, setSavedVehicles] = useState(DEFAULT_SAVED_VEHICLES);
  const [deposits, setDeposits] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState(
    user?.paymentMethods?.length ? user.paymentMethods : DEFAULT_PAYMENT_METHODS
  );
  const [summary, setSummary] = useState({
    activeBidsCount: 0,
    wonAuctionsCount: DEFAULT_WON_AUCTIONS.length,
    lostAuctionsCount: DEFAULT_LOST_AUCTIONS.length,
    soldVehiclesCount: 0,
    myListingsCount: 0,
    savedVehiclesCount: DEFAULT_SAVED_VEHICLES.length,
    depositsCount: 0,
    depositsHeldCount: 0,
    depositsRefundedCount: 0,
  });

  // Fetch Dashboard Data
  useEffect(() => {
    let isMounted = true;

    const fetchDashboardData = async () => {
      if (!isAuthenticated) return;

      try {
        // Fetch full history and ledger
        const [historyRes, watchlistRes, paymentRes] = await Promise.allSettled([
          api.get('/auth/history'),
          api.get('/auth/watchlist'),
          api.get('/auth/payment-methods'),
        ]);

        if (isMounted) {
          if (historyRes.status === 'fulfilled' && historyRes.value.data?.success) {
            const hData = historyRes.value.data.data;
            const hSummary = historyRes.value.data.summary;

            if (hData.activeBids?.length > 0) setActiveBids(hData.activeBids);
            if (hData.wonAuctions?.length > 0) setWonAuctions(hData.wonAuctions);
            if (hData.lostAuctions?.length > 0) setLostAuctions(hData.lostAuctions);
            if (hData.soldVehicles?.length > 0) setSoldVehicles(hData.soldVehicles);
            if (hData.myListings?.length > 0) setMyListings(hData.myListings);

            // Collect local sample auction deposits from localStorage
            const localDeposits = [];
            for (let i = 0; i < localStorage.length; i++) {
              const k = localStorage.key(i);
              if (k && k.startsWith('gd_deposit_')) {
                try {
                  const item = JSON.parse(localStorage.getItem(k));
                  if (item && item.amount) {
                    localDeposits.push(item);
                  }
                } catch (_e) {}
              }
            }

            const apiDeposits = hData.deposits || [];
            const combinedDeposits = [...apiDeposits];
            localDeposits.forEach((ld) => {
              const exists = combinedDeposits.some((d) => (d.auction?._id || d.auction) === ld.auction);
              if (!exists) {
                combinedDeposits.push(ld);
              }
            });
            setDeposits(combinedDeposits);

            setSummary((prev) => ({
              ...prev,
              activeBidsCount: hSummary?.activeBidsCount ?? hData.activeBids?.length ?? 0,
              wonAuctionsCount: hSummary?.wonAuctionsCount ?? (hData.wonAuctions?.length || DEFAULT_WON_AUCTIONS.length),
              lostAuctionsCount: hSummary?.lostAuctionsCount ?? (hData.lostAuctions?.length || DEFAULT_LOST_AUCTIONS.length),
              soldVehiclesCount: hSummary?.soldVehiclesCount ?? hData.soldVehicles?.length ?? 0,
              myListingsCount: hSummary?.myListingsCount ?? hData.myListings?.length ?? 0,
              depositsCount: combinedDeposits.length,
              depositsHeldCount: combinedDeposits.filter((d) => d.status === 'held').length,
              depositsRefundedCount: combinedDeposits.filter((d) => d.status === 'refunded').length,
            }));
          }

          if (watchlistRes.status === 'fulfilled' && watchlistRes.value.data?.success) {
            const wData = watchlistRes.value.data.data;
            if (wData && wData.length > 0) {
              setSavedVehicles(wData);
              setSummary((s) => ({ ...s, savedVehiclesCount: wData.length }));
            }
          }

          if (paymentRes.status === 'fulfilled' && paymentRes.value.data?.success) {
            const pData = paymentRes.value.data.data;
            if (pData && pData.length > 0) {
              setPaymentMethods(pData);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      }
    };

    fetchDashboardData();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated]);

  // Remove saved vehicle handler
  const handleRemoveSaved = async (auctionId) => {
    try {
      await api.post(`/auth/watchlist/${auctionId}`);
    } catch (_err) {
      // Handled gracefully
    }
    setSavedVehicles((prev) => prev.filter((item) => item._id !== auctionId));
    setSummary((s) => ({ ...s, savedVehiclesCount: Math.max(0, s.savedVehiclesCount - 1) }));
  };

  // Payment method handlers
  const handlePaymentAdded = (newCards) => {
    setPaymentMethods(newCards);
    updateUser({ paymentMethods: newCards });
  };

  const handleRemovePayment = async (cardId) => {
    try {
      const res = await api.delete(`/auth/payment-methods/${cardId}`);
      if (res.data?.success) {
        setPaymentMethods(res.data.data);
        updateUser({ paymentMethods: res.data.data });
      }
    } catch (_err) {
      const remaining = paymentMethods.filter((c) => c.id !== cardId);
      setPaymentMethods(remaining);
      updateUser({ paymentMethods: remaining });
    }
  };

  const handleSetDefaultPayment = async (cardId) => {
    try {
      const res = await api.patch(`/auth/payment-methods/${cardId}/default`);
      if (res.data?.success) {
        setPaymentMethods(res.data.data);
        updateUser({ paymentMethods: res.data.data });
      }
    } catch (_err) {
      const updated = paymentMethods.map((c) => ({
        ...c,
        isDefault: c.id === cardId,
      }));
      setPaymentMethods(updated);
      updateUser({ paymentMethods: updated });
    }
  };

  const handleKycVerified = (data) => {
    updateUser({
      verificationStatus: data.verificationStatus || 'verified',
      verificationDetails: data.verificationDetails,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gd-bg flex items-center justify-center">
        <p className="text-sm font-medium text-gd-muted uppercase tracking-widest animate-pulse">
          Loading Collector Command Center...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const historyData = {
    activeBids,
    wonAuctions,
    lostAuctions,
    soldVehicles,
    deposits,
  };

  const tabCounts = {
    activeBids: activeBids.length,
    wonAuctions: wonAuctions.length,
    myListings: myListings.length,
    savedVehicles: savedVehicles.length,
  };

  return (
    <div className="min-h-screen bg-gd-bg pb-20">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        
        {/* Header (Cleaned up redundant CTA as specified) */}
        <header className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-eyebrow font-medium text-gd-muted uppercase tracking-widest block">
                Account Command Center
              </span>
              <span className="text-gd-line">/</span>
              <span className="text-eyebrow font-semibold text-gd-primary uppercase tracking-widest">
                Unified Collector
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gd-ink tracking-tight">
              Welcome, {user?.name || 'Collector'}
            </h1>
          </div>

          {/* User Status Pills (Replacing redundant +Create Listing button) */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <KycBadge
              status={user?.verificationStatus}
              onClick={() => setIsKycModalOpen(true)}
              interactive
            />
            <div className="px-3 py-1 rounded-pill bg-gd-surface border border-gd-line text-xs font-medium text-gd-muted flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-gd-reserveMet" />
              <span>Unified Member</span>
            </div>
            <div className="px-3 py-1 rounded-pill bg-gd-surface border border-gd-line text-xs font-medium text-gd-muted">
              Member Since 2026
            </div>
          </div>
        </header>

        {/* Tabbed Navigation Bar */}
        <TabNavigation
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          counts={tabCounts}
        />

        {/* Tab Contents */}
        <main>
          {activeTab === 'overview' && (
            <OverviewTab
              user={user}
              summary={summary}
              activeBids={activeBids}
              recentLedger={[...wonAuctions, ...lostAuctions]}
              paymentMethods={paymentMethods}
              onSelectTab={setActiveTab}
              onOpenKycModal={() => setIsKycModalOpen(true)}
              onOpenAddPayment={() => setIsPaymentModalOpen(true)}
            />
          )}

          {activeTab === 'bids' && (
            <AuctionHistoryLedger
              historyData={historyData}
            />
          )}

          {activeTab === 'listings' && (
            <MyListingsTab
              listings={myListings}
            />
          )}

          {activeTab === 'saved' && (
            <SavedVehiclesTab
              savedVehicles={savedVehicles}
              onRemoveSaved={handleRemoveSaved}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsTab
              paymentMethods={paymentMethods}
              onOpenKycModal={() => setIsKycModalOpen(true)}
              onOpenAddPayment={() => setIsPaymentModalOpen(true)}
              onRemovePayment={handleRemovePayment}
              onSetDefaultPayment={handleSetDefaultPayment}
            />
          )}
        </main>
      </div>

      {/* KYC Verification Modal */}
      <KycModal
        isOpen={isKycModalOpen}
        onClose={() => setIsKycModalOpen(false)}
        onVerified={handleKycVerified}
      />

      {/* Add Payment Method Modal */}
      <AddPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onAdded={handlePaymentAdded}
      />
    </div>
  );
};

export default Dashboard;
