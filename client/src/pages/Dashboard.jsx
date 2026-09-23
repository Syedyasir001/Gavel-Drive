import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, Navigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gd-bg flex items-center justify-center">
        <p className="text-sm font-medium text-gd-muted uppercase tracking-widest">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gd-bg pb-16">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Header */}
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gd-line pb-6">
          <div>
            <span className="text-eyebrow font-medium text-gd-muted uppercase tracking-widest block mb-1">
              Account Overview
            </span>
            <h1 className="text-3xl font-bold text-gd-ink tracking-tight">
              Welcome, {user?.name || 'User'}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/sell"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-gd-cta hover:bg-gd-ctaHover text-gd-inverse text-xs font-bold transition-colors duration-150"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Create Listing
            </Link>
          </div>
        </header>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column (Main content) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Active Bids Section */}
            <section className="bg-gd-sidebar border border-gd-line rounded-md overflow-hidden">
              <div className="px-5 py-4 border-b border-gd-line bg-gd-surface flex justify-between items-center">
                <h2 className="text-base font-semi text-gd-ink">Active Bids</h2>
                <span className="text-eyebrow font-medium text-gd-muted uppercase">0 Bids</span>
              </div>
              <div className="p-8 text-center">
                <div className="w-12 h-12 mx-auto rounded-md bg-gd-bg border border-gd-line flex items-center justify-center mb-3">
                  <svg className="w-5 h-5 text-gd-ghost" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-gd-ink">No active bids</p>
                <p className="mt-1 text-xs text-gd-muted">You are not currently bidding on any vehicles.</p>
                <Link to="/browse" className="mt-4 inline-block text-xs font-bold text-gd-cta hover:underline">
                  Browse Auctions →
                </Link>
              </div>
            </section>

            {/* My Listings Section */}
            <section className="bg-gd-sidebar border border-gd-line rounded-md overflow-hidden">
              <div className="px-5 py-4 border-b border-gd-line bg-gd-surface flex justify-between items-center">
                <h2 className="text-base font-semi text-gd-ink">My Listings</h2>
                <span className="text-eyebrow font-medium text-gd-muted uppercase">0 Listings</span>
              </div>
              <div className="p-8 text-center">
                <div className="w-12 h-12 mx-auto rounded-md bg-gd-bg border border-gd-line flex items-center justify-center mb-3">
                  <svg className="w-5 h-5 text-gd-ghost" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-gd-ink">No vehicles listed</p>
                <p className="mt-1 text-xs text-gd-muted">You haven't listed any vehicles for auction yet.</p>
                <Link to="/sell" className="mt-4 inline-block text-xs font-bold text-gd-cta hover:underline">
                  Create a Listing →
                </Link>
              </div>
            </section>
          </div>

          {/* Right Column (Sidebar) */}
          <aside className="space-y-6">
            
            {/* Profile Info */}
            <div className="bg-gd-sidebar border border-gd-line rounded-md p-5">
              <span className="text-eyebrow font-medium text-gd-muted uppercase tracking-widest block mb-4">
                Profile Information
              </span>
              <div className="flex items-center gap-4 mb-5">
                <div className="w-14 h-14 rounded-md bg-gd-cta/10 text-gd-cta font-bold text-xl flex items-center justify-center uppercase shrink-0">
                  {user?.name ? user.name[0] : 'U'}
                </div>
                <div>
                  <p className="text-base font-semi text-gd-ink">{user?.name}</p>
                  <p className="text-xs text-gd-muted">{user?.email}</p>
                </div>
              </div>
              
              <div className="space-y-3 pt-4 border-t border-gd-line">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gd-ghost">Account Type</span>
                  <span className="font-medium text-gd-ink capitalize">{user?.role || 'Bidder'}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gd-ghost">Member Since</span>
                  <span className="font-medium text-gd-ink">2026</span>
                </div>
              </div>
            </div>

            {/* Saved Vehicles */}
            <div className="bg-gd-sidebar border border-gd-line rounded-md p-5">
              <div className="flex justify-between items-center mb-4">
                <span className="text-eyebrow font-medium text-gd-muted uppercase tracking-widest block">
                  Saved Vehicles
                </span>
                <span className="text-xs font-medium text-gd-ghost">0</span>
              </div>
              <p className="text-sm text-gd-muted text-center py-6">
                You haven't saved any vehicles yet.
              </p>
            </div>
            
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
