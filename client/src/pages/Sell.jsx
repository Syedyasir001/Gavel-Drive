import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import api from '../services/api';

const MAKES = [
  'Aston Martin', 'Audi', 'BMW', 'Ford', 'Honda', 'Hyundai', 'Isuzu',
  'Jaguar', 'Jeep', 'Kia', 'Land Rover', 'Lexus', 'Mahindra', 'Maserati',
  'Mercedes-Benz', 'Mini', 'Porsche', 'Skoda', 'Tata', 'Toyota',
  'Volkswagen', 'Volvo', 'Other',
];

const MODELS_BY_MAKE = {
  'Aston Martin': ['DB11', 'DB12', 'DBS Superleggera', 'Vantage', 'DBX 707', 'Vanquish', 'Other'],
  'Audi': ['A4', 'A6', 'A8 L', 'Q3', 'Q5', 'Q7', 'Q8', 'RS5 Sportback', 'RS e-tron GT', 'RS7', 'Other'],
  'BMW': ['2 Series Gran Coupe', '330i M Sport', 'M340i xDrive', '530d M Sport', '740i', 'M2 Competition', 'M4 Competition', 'M5 Competition', 'X1', 'X3 M40i', 'X5 xDrive40i', 'X7 M60i', 'Z4 M40i', 'Other'],
  'Ford': ['Endeavour 3.2 4x4', 'Endeavour 2.0 Titanium', 'Mustang GT 5.0 V8', 'EcoSport S', 'Other'],
  'Honda': ['City ZX', 'City e:HEV Hybrid', 'Civic Type R (FL5)', 'Elevate ZX', 'Amaze', 'CR-V AWD', 'Other'],
  'Hyundai': ['Creta SX(O)', 'Creta N Line', 'Ioniq 5 AWD', 'Tucson Signature AWD', 'Verna 1.5 Turbo', 'Venue N Line', 'Alcazar Signature', 'i20 N Line', 'Other'],
  'Isuzu': ['D-Max V-Cross 4x4', 'MU-X 4x4', 'Hi-Lander', 'Other'],
  'Jaguar': ['F-Type R-Dynamic V8', 'F-Pace R-Dynamic', 'XE P250', 'XF', 'I-Pace EV400', 'Other'],
  'Jeep': ['Wrangler Rubicon Unlimited', 'Grand Cherokee Limited', 'Compass Model S 4x4', 'Meridian Overland 4x4', 'Other'],
  'Kia': ['Seltos GTX Plus', 'Seltos X-Line', 'EV6 GT-Line AWD', 'Carnival Limousine Plus', 'Sonet X-Line', 'Carens Luxury Plus', 'Other'],
  'Land Rover': ['Defender 90', 'Defender 110 SE', 'Range Rover Velar R-Dynamic', 'Range Rover Sport Dynamic SE', 'Range Rover Autobiography LWB', 'Discovery Metropolitan', 'Other'],
  'Lexus': ['RX 350h Luxury', 'ES 300h Luxury', 'NX 350h F Sport', 'LC 500h', 'LX 600 VIP', 'Other'],
  'Mahindra': ['XUV700 AX7L AWD', 'Thar Roxx AX7L 4x4', 'Thar 4x4 Hard Top', 'Scorpio-N Z8L 4x4', 'XUV400 EV', 'Scorpio Classic S11', 'Other'],
  'Maserati': ['Ghibli Trofeo V8', 'Levante Trofeo', 'MC20 Cielo', 'Grecale Trofeo', 'GranTurismo Modena', 'Other'],
  'Mercedes-Benz': ['A35 AMG 4MATIC', 'C300d AMG Line', 'E350d Exclusive', 'S450 4MATIC', 'G63 AMG BiTurbo', 'GLC 300 4MATIC', 'GLE 450d 4MATIC', 'GLS 450d 4MATIC', 'AMG SL55 Roadster', 'AMG GT Coupe', 'Other'],
  'Mini': ['Cooper S JCW Inspired', 'Cooper SE Electric', 'Countryman JCW 4ALL', 'Clubman Cooper S', 'Other'],
  'Porsche': ['911 Carrera S (992)', '911 GT3', '911 Turbo S', '718 Cayman GTS 4.0', '718 Boxster GTS', 'Taycan 4S Turbo', 'Panamera GTS', 'Macan GTS', 'Cayenne Turbo GT', 'Other'],
  'Skoda': ['Octavia vRS 245', 'Superb L&K', 'Kodiaq L&K 4x4', 'Slavia 1.5 TSI Style', 'Kushaq 1.5 TSI Monte Carlo', 'Other'],
  'Tata': ['Nexon Fearless DCA', 'Safari Accomplished+ Dark', 'Harrier Fearless+ Dark', 'Curvv EV Empowered+', 'Punch EV Empowered', 'Altroz Racer R3', 'Other'],
  'Toyota': ['Fortuner Legender 4x4', 'Land Cruiser 300 ZX', 'Innova Hycross ZX(O)', 'Hilux 4x4 AT', 'Camry Hybrid', 'Vellfire VIP Executive', 'Urban Cruiser Hyryder', 'Other'],
  'Volkswagen': ['Virtus GT Plus 1.5 TSI DSG', 'Taigun GT Plus 1.5 TSI', 'Tiguan 2.0 TSI 4MOTION', 'Golf GTI', 'Other'],
  'Volvo': ['XC90 T8 Recharge Ultimate', 'XC60 B5 Ultimate', 'C40 Recharge Twin AWD', 'XC40 Recharge Twin', 'S90 B5 Ultimate', 'Other'],
  'Other': ['Custom Collector Model', 'Vintage / Classic', 'Other'],
};

const YEARS = Array.from({ length: 27 }, (_, i) => 2026 - i);

const STEPS = [
  { id: 1, label: 'Vehicle Details' },
  { id: 2, label: 'Media Upload' },
  { id: 3, label: 'Reserve Pricing' },
  { id: 4, label: 'Seller KYC' },
];

const validate = (name, value) => {
  switch (name) {
    case 'title':
      if (!value.trim()) return 'Listing title is required.';
      if (value.trim().length < 5) return 'Title must be at least 5 characters.';
      return '';
    case 'make':
      if (!value) return 'Please select a make.';
      return '';
    case 'model':
      if (!value || !value.trim()) return 'Please select a model.';
      return '';
    case 'year':
      if (!value) return 'Please select a year.';
      return '';
    case 'mileage':
      if (value === '' || value === undefined || value === null) return 'Mileage is required.';
      if (Number(value) < 0) return 'Mileage cannot be negative.';
      return '';
    case 'startPrice':
      if (value === '' || value === undefined || value === null) return 'Starting price is required.';
      if (Number(value) < 10000) return 'Starting price must be at least ₹10,000.';
      return '';
    default:
      return '';
  }
};

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
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const availableModels = useMemo(() => {
    if (!formData.make) return [];
    return MODELS_BY_MAKE[formData.make] || ['Standard Model', 'Other'];
  }, [formData.make]);

  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: '/sell' }} replace />;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const handleMakeChange = (e) => {
    const newMake = e.target.value;
    setFormData((prev) => {
      // Auto-update title if empty or matching default pattern
      const yearPrefix = prev.year ? `${prev.year} ` : '';
      return {
        ...prev,
        make: newMake,
        model: '', // Reset model on make change
        title: prev.title || (newMake ? `${yearPrefix}${newMake}` : ''),
      };
    });
    setTouched((prev) => ({ ...prev, make: true, model: false }));
  };

  const handleModelChange = (e) => {
    const newModel = e.target.value;
    setFormData((prev) => {
      const yearPrefix = prev.year ? `${prev.year} ` : '';
      const autoTitle = prev.make && newModel ? `${yearPrefix}${prev.make} ${newModel}` : prev.title;
      return {
        ...prev,
        model: newModel,
        title: prev.title.trim().length <= 5 ? autoTitle : prev.title,
      };
    });
    setTouched((prev) => ({ ...prev, model: true }));
  };

  const handleBlur = (e) => {
    setTouched((prev) => ({ ...prev, [e.target.name]: true }));
  };

  const getError = (name) => {
    if (!touched[name]) return '';
    return validate(name, formData[name]);
  };

  const step1Valid =
    !validate('title', formData.title) &&
    !validate('make', formData.make) &&
    !validate('model', formData.model) &&
    !validate('year', formData.year) &&
    !validate('mileage', formData.mileage);

  const handleNextStep = () => {
    // Touch all step 1 fields to reveal any errors
    setTouched((prev) => ({
      ...prev,
      title: true,
      make: true,
      model: true,
      year: true,
      mileage: true,
    }));
    if (step1Valid) setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched((prev) => ({ ...prev, startPrice: true }));
    if (validate('startPrice', formData.startPrice)) return;

    setSubmitting(true);
    setError('');

    try {
      const carRes = await api.post('/cars', {
        title: formData.title,
        make: formData.make,
        model: formData.model,
        year: Number(formData.year),
        mileage: Number(formData.mileage),
        description: formData.description,
      });

      const carId = carRes.data.data._id;

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

  const inputBase =
    'mt-1.5 w-full rounded-md border bg-gd-surface px-4 py-2.5 text-base font-medium text-gd-ink focus:outline-none transition-colors';
  const inputNormal = `${inputBase} border-gd-line focus:border-gd-cta focus:ring-1 focus:ring-gd-cta`;
  const inputError = `${inputBase} border-gd-error focus:border-gd-error focus:ring-1 focus:ring-gd-error/30`;

  return (
    <div className="min-h-[85vh] bg-gd-bg py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <header className="mb-8 text-center">
          <span className="text-eyebrow font-medium text-gd-muted uppercase tracking-widest block mb-2">
            Create Listing
          </span>
          <h1 className="text-3xl font-bold text-gd-ink tracking-tight">Sell your vehicle</h1>
          <p className="mt-2 text-base text-gd-muted">
            Provide the details of your car to start an auction.
          </p>
        </header>

        {/* Multi-step Progress Bar */}
        <div className="mb-8 px-2">
          <div className="flex items-start justify-between relative">
            {/* Background connecting line */}
            <div className="absolute top-4 left-4 right-4 h-0.5 bg-gd-line z-0" />
            {/* Filled progress line */}
            <div
              className="absolute top-4 left-4 h-0.5 bg-gd-cta z-0 transition-all duration-500"
              style={{ width: `calc(${((step - 1) / (STEPS.length - 1)) * 100}% - 2rem)` }}
            />
            {STEPS.map((s) => {
              const isDone = step > s.id;
              const isActive = step === s.id;
              return (
                <div key={s.id} className="flex flex-col items-center z-10 gap-2 flex-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300 ${
                      isDone
                        ? 'bg-gd-cta border-gd-cta text-white'
                        : isActive
                        ? 'bg-white border-gd-cta text-gd-cta shadow-sm'
                        : 'bg-white border-gd-line text-gd-ghost'
                    }`}
                  >
                    {isDone ? (
                      <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      s.id
                    )}
                  </div>
                  <span
                    className={`text-eyebrow font-semibold uppercase tracking-wide text-center hidden sm:block ${
                      isActive ? 'text-gd-cta' : isDone ? 'text-gd-ink' : 'text-gd-ghost'
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

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
                  Vehicle Details
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Listing Title — full width */}
                  <label className="block sm:col-span-2">
                    <span className="text-eyebrow font-medium text-gd-ghost uppercase">
                      Listing Title <span className="text-gd-error">*</span>
                    </span>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="e.g. 2021 Porsche 911 Carrera S"
                      className={getError('title') ? inputError : inputNormal}
                    />
                    {getError('title') && (
                      <p className="mt-1 text-xs text-gd-error font-medium">{getError('title')}</p>
                    )}
                  </label>

                  {/* Make dropdown */}
                  <label className="block">
                    <span className="text-eyebrow font-medium text-gd-ghost uppercase">
                      Make <span className="text-gd-error">*</span>
                    </span>
                    <select
                      name="make"
                      value={formData.make}
                      onChange={handleMakeChange}
                      onBlur={handleBlur}
                      className={getError('make') ? inputError : inputNormal}
                    >
                      <option value="">Select Make</option>
                      {MAKES.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                    {getError('make') && (
                      <p className="mt-1 text-xs text-gd-error font-medium">{getError('make')}</p>
                    )}
                  </label>

                  {/* Dependent Model dropdown */}
                  <label className="block">
                    <span className="text-eyebrow font-medium text-gd-ghost uppercase">
                      Model <span className="text-gd-error">*</span>
                    </span>
                    <select
                      name="model"
                      value={formData.model}
                      onChange={handleModelChange}
                      onBlur={handleBlur}
                      disabled={!formData.make}
                      className={`${getError('model') ? inputError : inputNormal} ${
                        !formData.make ? 'opacity-60 cursor-not-allowed bg-gd-surface/50' : ''
                      }`}
                    >
                      <option value="">
                        {formData.make ? 'Select Model' : 'Select Make first'}
                      </option>
                      {availableModels.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                    {getError('model') && (
                      <p className="mt-1 text-xs text-gd-error font-medium">{getError('model')}</p>
                    )}
                  </label>

                  {/* Year dropdown */}
                  <label className="block">
                    <span className="text-eyebrow font-medium text-gd-ghost uppercase">
                      Year <span className="text-gd-error">*</span>
                    </span>
                    <select
                      name="year"
                      value={formData.year}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={getError('year') ? inputError : inputNormal}
                    >
                      <option value="">Select Year</option>
                      {YEARS.map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                    {getError('year') && (
                      <p className="mt-1 text-xs text-gd-error font-medium">{getError('year')}</p>
                    )}
                  </label>

                  {/* Mileage */}
                  <label className="block">
                    <span className="text-eyebrow font-medium text-gd-ghost uppercase">
                      Mileage (km) <span className="text-gd-error">*</span>
                    </span>
                    <input
                      type="number"
                      name="mileage"
                      min="0"
                      value={formData.mileage}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="e.g. 15000"
                      className={getError('mileage') ? inputError : inputNormal}
                    />
                    {getError('mileage') && (
                      <p className="mt-1 text-xs text-gd-error font-medium">{getError('mileage')}</p>
                    )}
                  </label>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className={`text-sm font-bold px-6 py-2.5 rounded-md transition-all inline-flex items-center gap-2 ${
                      step1Valid
                        ? 'bg-gd-cta hover:bg-gd-ctaHover text-gd-inverse cursor-pointer'
                        : 'bg-gd-cta/40 text-gd-inverse/60 cursor-not-allowed'
                    }`}
                  >
                    Next Step
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
                <h2 className="text-lg font-bold text-gd-ink border-b border-gd-line pb-2 mb-4">
                  Auction &amp; Description
                </h2>

                <label className="block">
                  <span className="text-eyebrow font-medium text-gd-ghost uppercase">
                    Description
                  </span>
                  <textarea
                    name="description"
                    rows={4}
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe your vehicle's condition, history, and notable features..."
                    className={`${inputNormal} resize-none`}
                  />
                </label>

                <label className="block">
                  <span className="text-eyebrow font-medium text-gd-ghost uppercase">
                    Starting Price (₹) <span className="text-gd-error">*</span>
                  </span>
                  <input
                    type="number"
                    name="startPrice"
                    min="10000"
                    value={formData.startPrice}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="e.g. 500000"
                    className={getError('startPrice') ? inputError : inputNormal}
                  />
                  {getError('startPrice') && (
                    <p className="mt-1 text-xs text-gd-error font-medium">
                      {getError('startPrice')}
                    </p>
                  )}
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
                    disabled={submitting || !!validate('startPrice', formData.startPrice)}
                    className="bg-gd-success hover:opacity-90 text-gd-inverse text-sm font-bold px-6 py-2.5 rounded-md transition-opacity disabled:opacity-50 flex items-center gap-2"
                  >
                    {submitting && (
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth={4}
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
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
