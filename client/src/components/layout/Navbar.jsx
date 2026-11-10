import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

import Logo from '../../logo';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-gd-sidebar/90 border-b border-gd-line">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <Logo variant="full" />
          <Link
            to="/browse"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-gd-muted hover:text-gd-ink transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            Browse Auctions
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="flex items-center gap-6">
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <Link to="/sell" className="text-xs font-bold text-gd-ink hover:text-gd-ctaHover hidden sm:block mr-2">
                Sell a Car
              </Link>
              <Link to="/dashboard" className="flex items-center gap-2.5 px-3 py-1.5 rounded-pill bg-gd-surface border border-gd-line hover:border-gd-cta/30 transition-colors">
                <div className="w-6 h-6 rounded-pill bg-gd-cta/10 text-gd-cta font-bold text-xs flex items-center justify-center uppercase">
                  {user?.name ? user.name[0] : 'U'}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-semibold text-gd-ink">{user?.name}</span>
                  <span className="text-eyebrow text-gd-muted uppercase tracking-widest">
                    Member
                  </span>
                </div>
              </Link>
              <button
                onClick={handleLogout}
                className="text-xs font-semibold px-3.5 py-2 rounded-md bg-gd-surface hover:bg-gd-error hover:text-gd-inverse text-gd-ink border border-gd-line hover:border-gd-error transition-all cursor-pointer inline-flex items-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                </svg>
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="text-sm font-medium px-4 py-2 rounded-md text-gd-muted hover:text-gd-ink hover:bg-gd-surface transition-all"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="text-sm font-semibold px-4 py-2 rounded-md bg-gd-cta hover:bg-gd-ctaHover text-gd-inverse shadow-none transition-all cursor-pointer"
              >
                Register
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
