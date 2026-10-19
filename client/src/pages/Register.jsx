import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/register', formData);
      if (res.data?.success) {
        login(res.data.token, res.data.user);
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create account. Please check inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md p-8 rounded-md bg-gd-surface border border-gd-line shadow-modal relative">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-md bg-gd-cta flex items-center justify-center mx-auto mb-4 shadow-none">
            <span className="text-2xl font-black text-gd-inverse">G</span>
          </div>
          <h2 className="text-3xl font-bold text-gd-ink">Join Gavel Drive</h2>
          <p className="text-sm text-gd-muted mt-1">Start bidding or listing exclusive vehicles</p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-sm bg-gd-error/10 border border-gd-error/20 text-gd-error text-xs font-medium text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-eyebrow text-gd-muted uppercase mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Alex Morgan"
              className="w-full px-4 py-2.5 rounded-sm bg-gd-bg border border-gd-line text-gd-ink placeholder-gd-ghost focus:outline-none focus:border-gd-cta focus:ring-1 focus:ring-gd-cta text-sm transition-colors"
            />
          </div>

          <div>
            <label className="block text-eyebrow text-gd-muted uppercase mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="alex@example.com"
              className="w-full px-4 py-2.5 rounded-sm bg-gd-bg border border-gd-line text-gd-ink placeholder-gd-ghost focus:outline-none focus:border-gd-cta focus:ring-1 focus:ring-gd-cta text-sm transition-colors"
            />
          </div>

          <div>
            <label className="block text-eyebrow text-gd-muted uppercase mb-1.5">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              placeholder="At least 6 characters"
              className="w-full px-4 py-2.5 rounded-sm bg-gd-bg border border-gd-line text-gd-ink placeholder-gd-ghost focus:outline-none focus:border-gd-cta focus:ring-1 focus:ring-gd-cta text-sm transition-colors"
            />
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
            className="w-full mt-4 py-3 rounded-md bg-gd-cta hover:bg-gd-ctaHover text-gd-inverse font-bold text-sm shadow-none transition-all disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-xs text-gd-muted mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-gd-ink hover:text-gd-cta font-semibold transition-colors">
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
