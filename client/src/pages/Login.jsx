import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
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
      const res = await api.post('/auth/login', formData);
      if (res.data?.success) {
        login(res.data.token, res.data.user);
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
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
          <h2 className="text-3xl font-bold text-gd-ink">Sign In to Gavel Drive</h2>
          <p className="text-sm text-gd-muted mt-1">Access your bids and car auctions</p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-sm bg-gd-error/10 border border-gd-error/20 text-gd-error text-xs font-medium text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
              placeholder="you@example.com"
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
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-sm bg-gd-bg border border-gd-line text-gd-ink placeholder-gd-ghost focus:outline-none focus:border-gd-cta focus:ring-1 focus:ring-gd-cta text-sm transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 rounded-md bg-gd-cta hover:bg-gd-ctaHover text-gd-inverse font-bold text-sm shadow-none transition-all disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-xs text-gd-muted mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-gd-ink hover:text-gd-cta font-semibold transition-colors">
            Create an account
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

export default Login;
