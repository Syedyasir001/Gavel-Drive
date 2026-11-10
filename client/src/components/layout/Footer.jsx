import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../../logo';
import HowItWorksModal from '../common/HowItWorksModal';

const Footer = () => {
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);

  useEffect(() => {
    const handleOpenModal = () => setIsHowItWorksOpen(true);
    window.addEventListener('open-how-it-works', handleOpenModal);
    return () => window.removeEventListener('open-how-it-works', handleOpenModal);
  }, []);

  return (
    <>
      <footer className="bg-gd-surface border-t border-gd-line mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-gd-line">
            <div className="max-w-md">
              <Logo variant="full" />
              <p className="mt-3 text-xs text-gd-muted leading-relaxed">
                The premier curated digital auction house for rare collector, performance, and modern enthusiast automobiles. Real-time transparent bidding and verified provenance.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-6 text-xs font-semibold text-gd-muted">
              <button
                type="button"
                onClick={() => setIsHowItWorksOpen(true)}
                className="hover:text-gd-ink transition-colors cursor-pointer text-left"
              >
                How It Works
              </button>
              <Link to="/terms" className="hover:text-gd-ink transition-colors">
                Terms of Service
              </Link>
              <Link to="/privacy" className="hover:text-gd-ink transition-colors">
                Privacy Policy
              </Link>
              <Link to="/faq" className="hover:text-gd-ink transition-colors">
                FAQ
              </Link>
            </div>
          </div>
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-eyebrow text-gd-ghost uppercase tracking-wider">
            <span>© {new Date().getFullYear()} Gavel Drive Inc. All rights reserved.</span>
            <span>Unified Collector &amp; Live Auction System</span>
          </div>
        </div>
      </footer>

      {/* Interactive Guide Modal */}
      <HowItWorksModal
        isOpen={isHowItWorksOpen}
        onClose={() => setIsHowItWorksOpen(false)}
      />
    </>
  );
};

export default Footer;
