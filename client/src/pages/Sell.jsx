import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import api from '../services/api';

const Sell = () => {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    make: '',
    model: '',
    year: '',
    mileage: '',
    description: '',
    startPrice: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    
    try {
      // Create Car
      const carRes = await api.post('/cars', {
        title: formData.title,
        make: formData.make,
        model: formData.model,
        year: Number(formData.year),
        mileage: Number(formData.mileage),
        description: formData.description,
      });

      const carId = carRes.data.data._id;

      // Create Auction (Start time now, end time 7 days from now)
      const endTime = new Date();
      endTime.setDate(endTime.getDate() + 7);

      await api.post('/auctions', {
        car: carId,
        startPrice: Number(formData.startPrice),
        endTime: endTime.toISOString(),
      });

      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred while creating the listing.');
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] bg-gd-bg py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <header className="mb-8 text-center">
          <span className="text-eyebrow font-medium text-gd-muted uppercase tracking-widest block mb-2">
            Create Listing
          </span>
          <h1 className="text-3xl font-bold text-gd-ink tracking-tight">
            Sell your vehicle
          </h1>
          <p className="mt-2 text-base text-gd-muted">
            Provide the details of your car to start an auction.
          </p>
        </header>

        <div className="bg-gd-sidebar border border-gd-line rounded-md p-6 sm:p-8 shadow-card">
          {error && (
            <div className="mb-6 bg-gd-error/10 border border-gd-error/30 text-gd-error px-4 py-3 rounded-md text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {step === 1 && (
              <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-lg font-bold text-gd-ink border-b border-gd-line pb-2 mb-4">
                  Basic Details
                </h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <label className="block sm:col-span-2">
                    <span className="text-eyebrow font-medium text-gd-ghost uppercase">Listing Title</span>
                    <input
                      type="text"
                      name="title"
                      required
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="e.g. 2021 Porsche 911 Carrera S"
                      className="mt-1.5 w-full rounded-md border border-gd-line bg-gd-surface px-4 py-2.5 text-base font-medium text-gd-ink focus:border-gd-cta focus:ring-1 focus:ring-gd-cta outline-none transition-colors"
                    />
                  </label>

                  <label className="block">
                    <span className="text-eyebrow font-medium text-gd-ghost uppercase">Make</span>
                    <input
                      type="text"
                      name="make"
                      required
                      value={formData.make}
                      onChange={handleChange}
                      placeholder="e.g. Porsche"
                      className="mt-1.5 w-full rounded-md border border-gd-line bg-gd-surface px-4 py-2.5 text-base font-medium text-gd-ink focus:border-gd-cta focus:ring-1 focus:ring-gd-cta outline-none transition-colors"
                    />
                  </label>

                  <label className="block">
                    <span className="text-eyebrow font-medium text-gd-ghost uppercase">Model</span>
                    <input
                      type="text"
                      name="model"
                      required
                      value={formData.model}
                      onChange={handleChange}
                      placeholder="e.g. 911 Carrera S"
                      className="mt-1.5 w-full rounded-md border border-gd-line bg-gd-surface px-4 py-2.5 text-base font-medium text-gd-ink focus:border-gd-cta focus:ring-1 focus:ring-gd-cta outline-none transition-colors"
                    />
                  </label>

                  <label className="block">
                    <span className="text-eyebrow font-medium text-gd-ghost uppercase">Year</span>
                    <input
                      type="number"
                      name="year"
                      required
                      min="1900"
                      max="2030"
                      value={formData.year}
                      onChange={handleChange}
                      placeholder="e.g. 2021"
                      className="mt-1.5 w-full rounded-md border border-gd-line bg-gd-surface px-4 py-2.5 text-base font-medium text-gd-ink focus:border-gd-cta focus:ring-1 focus:ring-gd-cta outline-none transition-colors"
                    />
                  </label>

                  <label className="block">
                    <span className="text-eyebrow font-medium text-gd-ghost uppercase">Mileage (km)</span>
                    <input
                      type="number"
                      name="mileage"
                      required
                      min="0"
                      value={formData.mileage}
                      onChange={handleChange}
                      placeholder="e.g. 15000"
                      className="mt-1.5 w-full rounded-md border border-gd-line bg-gd-surface px-4 py-2.5 text-base font-medium text-gd-ink focus:border-gd-cta focus:ring-1 focus:ring-gd-cta outline-none transition-colors"
                    />
                  </label>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    disabled={!formData.title || !formData.make || !formData.model || !formData.year || !formData.mileage}
                    className="bg-gd-cta hover:bg-gd-ctaHover text-gd-inverse text-sm font-bold px-6 py-2.5 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next Step →
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
                <h2 className="text-lg font-bold text-gd-ink border-b border-gd-line pb-2 mb-4">
                  Auction & Description
                </h2>

                <label className="block">
                  <span className="text-eyebrow font-medium text-gd-ghost uppercase">Description</span>
                  <textarea
                    name="description"
                    rows={4}
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe your vehicle's condition, history, and notable features..."
                    className="mt-1.5 w-full rounded-md border border-gd-line bg-gd-surface px-4 py-2.5 text-base font-medium text-gd-ink focus:border-gd-cta focus:ring-1 focus:ring-gd-cta outline-none transition-colors resize-none"
                  />
                </label>

                <label className="block">
                  <span className="text-eyebrow font-medium text-gd-ghost uppercase">Starting Price (₹)</span>
                  <input
                    type="number"
                    name="startPrice"
                    required
                    min="0"
                    value={formData.startPrice}
                    onChange={handleChange}
                    placeholder="e.g. 500000"
                    className="mt-1.5 w-full rounded-md border border-gd-line bg-gd-surface px-4 py-2.5 text-base font-medium text-gd-ink focus:border-gd-cta focus:ring-1 focus:ring-gd-cta outline-none transition-colors"
                  />
                </label>

                <div className="pt-4 flex justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-sm font-semibold px-4 py-2.5 rounded-md text-gd-muted hover:text-gd-ink hover:bg-gd-surface transition-all"
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !formData.startPrice}
                    className="bg-gd-success hover:opacity-90 text-gd-inverse text-sm font-bold px-6 py-2.5 rounded-md transition-opacity disabled:opacity-50 flex items-center gap-2"
                  >
                    {submitting && (
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )}
                    {submitting ? 'Creating...' : 'Submit Listing'}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Sell;
