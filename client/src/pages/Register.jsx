import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Logo from '../logo';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectTarget = location.state?.from || '/';

  // If already authenticated, redirect immediately
  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectTarget, { replace: true });
    }
  }, [isAuthenticated, navigate, redirectTarget]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const cleanName = formData.name.trim();
    const cleanEmail = formData.email.trim();

    if (!cleanName || !cleanEmail || !formData.password) {
      setError('Please provide your name, email address, and password.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      const res = await api.post('/auth/register', {
        name: cleanName,
        email: cleanEmail,
        password: formData.password,
      });

      if (res.data?.success && res.data?.token) {
        login(res.data.token, res.data.user);
        navigate(redirectTarget, { replace: true });
      } else {
        setError(res.data?.message || 'Registration failed. Please check your inputs.');
      }
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.request) {
        setError('Cannot connect to authentication server. Please ensure the backend is running.');
      } else {
        setError(err.message || 'An unexpected error occurred during account creation.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md p-8 rounded-md bg-gd-surface border border-gd-line shadow-modal relative">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo variant="icon" to="/" />
          </div>
          <h2 className="text-3xl font-bold text-gd-ink">Join Gavel Drive</h2>
          <p className="text-sm text-gd-muted mt-1">Start bidding or listing exclusive vehicles</p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-sm bg-gd-error/10 border border-gd-error/20 text-gd-error text-xs font-medium text-center flex items-center justify-center gap-2">
            <svg className="w-4 h-4 shrink-0 text-gd-error" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label htmlFor="register-name" className="block text-eyebrow text-gd-muted uppercase mb-1.5">
              Full Name
            </label>
            <input
              id="register-name"
              type="text"
              name="name"
              autoComplete="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Alex Morgan"
              className="w-full px-4 py-2.5 rounded-sm bg-gd-bg border border-gd-line text-gd-ink placeholder-gd-ghost focus:outline-none focus:border-gd-cta focus:ring-1 focus:ring-gd-cta text-sm transition-colors"
            />
          </div>

          <div>
            <label htmlFor="register-email" className="block text-eyebrow text-gd-muted uppercase mb-1.5">
              Email Address
            </label>
            <input
              id="register-email"
              type="email"
              name="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="alex@example.com"
              className="w-full px-4 py-2.5 rounded-sm bg-gd-bg border border-gd-line text-gd-ink placeholder-gd-ghost focus:outline-none focus:border-gd-cta focus:ring-1 focus:ring-gd-cta text-sm transition-colors"
            />
          </div>

          <div>
            <label htmlFor="register-password" className="block text-eyebrow text-gd-muted uppercase mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                id="register-password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                autoComplete="new-password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                placeholder="At least 6 characters"
                className="w-full px-4 py-2.5 pr-10 rounded-sm bg-gd-bg border border-gd-line text-gd-ink placeholder-gd-ghost focus:outline-none focus:border-gd-cta focus:ring-1 focus:ring-gd-cta text-sm transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gd-muted hover:text-gd-ink cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="p-3 rounded-sm bg-gd-bg border border-gd-line text-xs text-gd-muted flex items-start gap-2.5">
            <svg className="w-4 h-4 text-gd-cta shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>All accounts include full capabilities to both <strong>place bids</strong> and <strong>list vehicles</strong> for auction.</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-3 rounded-md bg-gd-cta hover:bg-gd-ctaHover text-gd-inverse font-bold text-sm shadow-none transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Creating Account...</span>
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <p className="text-center text-xs text-gd-muted mt-6">
          Already have an account?{' '}
          <Link
            to="/login"
            state={{ from: redirectTarget }}
            className="text-gd-ink hover:text-gd-cta font-semibold transition-colors"
          >
            Sign In
          </Link>
        </p>

        <div className="mt-6 pt-5 border-t border-gd-line flex items-center justify-center gap-1.5 text-xs text-gd-muted">
          <svg className="w-3.5 h-3.5 text-gd-success" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 1 0-6 0V9h6Z" clipRule="evenodd" />
          </svg>
          Your account details are encrypted and never shared.
        </div>
      </div>
    </div>
  );
};

export default Register;
