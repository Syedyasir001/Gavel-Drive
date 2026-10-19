import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

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
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-md bg-gd-cta flex items-center justify-center shadow-none group-hover:bg-gd-ctaHover transition-colors duration-200">
            <span className="text-xl font-black text-gd-inverse">G</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-gd-ink group-hover:text-gd-ctaHover transition-colors">
              Gavel Drive
            </span>
            <span className="text-eyebrow font-medium text-gd-muted uppercase tracking-widest">
              Live Car Auctions
            </span>
          </div>
        </Link>

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
                className="text-xs font-semibold px-3.5 py-2 rounded-md bg-gd-surface hover:bg-gd-error hover:text-gd-inverse text-gd-ink border border-gd-line hover:border-gd-error transition-all cursor-pointer"
              >
                Logout
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
