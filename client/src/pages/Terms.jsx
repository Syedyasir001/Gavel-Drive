import React from 'react';
import { Link } from 'react-router-dom';

const Terms = () => {
  return (
    <div className="min-h-screen bg-gd-bg py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-xs font-medium text-gd-muted">
          <Link to="/" className="hover:text-gd-ink transition-colors">Home</Link>
          <span>/</span>
          <span className="text-gd-ink font-semibold">Terms of Service</span>
        </nav>

        {/* Page Title */}
        <header className="mb-10 pb-8 border-b border-gd-line">
          <span className="text-eyebrow font-medium text-gd-muted uppercase tracking-widest block mb-2">
            Legal &amp; Compliance
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold text-gd-ink tracking-tight">
            Terms of Service
          </h1>
          <p className="mt-3 text-base text-gd-muted max-w-2xl leading-relaxed">
            Please read these terms carefully before participating in auctions, submitting vehicle consignments, or authorizing bidding deposits on GavelDrive.
          </p>
          <div className="mt-4 flex items-center gap-4 text-xs text-gd-ghost font-medium">
            <span>Last Updated: November 2026</span>
            <span>·</span>
            <span>Effective for all Indian Jurisdictions</span>
          </div>
        </header>

        {/* Content Body */}
        <div className="space-y-10 text-sm text-gd-ink leading-relaxed">
          {/* Section 1 */}
          <section className="bg-gd-sidebar border border-gd-line rounded-xl p-6 sm:p-8 shadow-card">
            <h2 className="text-lg font-bold text-gd-ink mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-gd-cta/10 text-gd-cta text-xs flex items-center justify-center font-bold">1</span>
              Platform Overview &amp; Acceptance
            </h2>
            <p className="text-gd-muted leading-relaxed">
              GavelDrive Inc. ("GavelDrive", "we", "our", or "us") operates a curated digital auction platform for collector, performance, and enthusiast automobiles. By registering an account, verifying identity, or accessing our services, you enter into a legally binding agreement governed by the Information Technology Act, 2000 and the Indian Contract Act, 1872.
            </p>
          </section>

          {/* Section 2 */}
          <section className="bg-gd-sidebar border border-gd-line rounded-xl p-6 sm:p-8 shadow-card">
            <h2 className="text-lg font-bold text-gd-ink mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-gd-cta/10 text-gd-cta text-xs flex items-center justify-center font-bold">2</span>
              Identity Verification (KYC) &amp; Bidding Eligibility
            </h2>
            <p className="text-gd-muted leading-relaxed mb-4">
              To preserve authentic price discovery and eliminate fraudulent bids, all active participants must complete digital government identity verification via DigiLocker (Aadhaar, PAN, or Passport).
            </p>
            <ul className="space-y-2 list-disc list-inside text-gd-muted">
              <li>Only verified individuals aged 18 years or older holding valid Indian government documentation may place bids.</li>
              <li>Accounts found using falsified documents or third-party proxy identities will be permanently barred and reported to relevant authorities.</li>
              <li>Consignors may not bid on their own listings ("shill bidding"). Violation results in immediate auction cancellation and forfeiture of fees.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="bg-gd-sidebar border border-gd-line rounded-xl p-6 sm:p-8 shadow-card">
            <h2 className="text-lg font-bold text-gd-ink mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-gd-cta/10 text-gd-cta text-xs flex items-center justify-center font-bold">3</span>
              ₹10,000 Refundable Bidding Escrow Deposit
            </h2>
            <p className="text-gd-muted leading-relaxed mb-4">
              Prior to submitting bids on any live auction, bidders authorize a temporary, fully refundable ₹10,000 security hold.
            </p>
            <div className="p-4 rounded-lg bg-emerald-950/20 border border-emerald-500/30 text-emerald-300 text-xs space-y-2">
              <p className="font-semibold text-emerald-400">Automated 100% Refund Guarantee:</p>
              <p>
                If your bid is outbid or you do not win the vehicle, this pre-authorization is immediately and automatically reversed back to your source payment card upon auction close. An immutable transaction receipt (<code className="font-mono bg-black/40 px-1 py-0.5 rounded text-white">REF_...</code>) is generated in your Collector Dashboard.
              </p>
            </div>
          </section>

          {/* Section 4 */}
          <section className="bg-gd-sidebar border border-gd-line rounded-xl p-6 sm:p-8 shadow-card">
            <h2 className="text-lg font-bold text-gd-ink mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-gd-cta/10 text-gd-cta text-xs flex items-center justify-center font-bold">4</span>
              Live Bidding, Increments &amp; Anti-Sniping Policy
            </h2>
            <p className="text-gd-muted leading-relaxed mb-3">
              All bids placed are binding, irrevocable legal offers. Bids advance in calibrated tiers:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4 text-xs">
              <div className="bg-gd-surface p-3 rounded-md border border-gd-line">
                <span className="text-gd-ghost uppercase block text-eyebrow">Up to ₹5 Lakh</span>
                <span className="font-bold text-gd-ink">₹5,000 increment</span>
              </div>
              <div className="bg-gd-surface p-3 rounded-md border border-gd-line">
                <span className="text-gd-ghost uppercase block text-eyebrow">₹5L – ₹15 Lakh</span>
                <span className="font-bold text-gd-ink">₹10,000 increment</span>
              </div>
              <div className="bg-gd-surface p-3 rounded-md border border-gd-line">
                <span className="text-gd-ghost uppercase block text-eyebrow">₹15L – ₹50 Lakh</span>
                <span className="font-bold text-gd-ink">₹25,000 increment</span>
              </div>
              <div className="bg-gd-surface p-3 rounded-md border border-gd-line">
                <span className="text-gd-ghost uppercase block text-eyebrow">Above ₹50 Lakh</span>
                <span className="font-bold text-gd-ink">₹50,000 increment</span>
              </div>
            </div>
            <p className="text-gd-muted leading-relaxed">
              <strong>Soft-Close Rule:</strong> Any valid bid submitted in the final 2 minutes of an auction will reset the remaining countdown to 2 minutes. This transparently eliminates automated bot sniping and grants all genuine collectors equal opportunity to respond.
            </p>
          </section>

          {/* Section 5 */}
          <section className="bg-gd-sidebar border border-gd-line rounded-xl p-6 sm:p-8 shadow-card">
            <h2 className="text-lg font-bold text-gd-ink mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-gd-cta/10 text-gd-cta text-xs flex items-center justify-center font-bold">5</span>
              Settlement, Title Transfer &amp; Dispute Resolution
            </h2>
            <p className="text-gd-muted leading-relaxed mb-3">
              When an auction concludes with the reserve price met, the winning bidder and consignor enter into direct settlement obligations. Full hammer settlement must occur via verified banking channels (RTGS/NEFT/Escrow) within 5 business days.
            </p>
            <p className="text-gd-muted leading-relaxed">
              Any unresolved disputes arising under these terms shall be settled by arbitration in Mumbai, India in accordance with the Arbitration and Conciliation Act, 1996.
            </p>
          </section>
        </div>

        {/* Footer Navigation */}
        <div className="mt-12 pt-8 border-t border-gd-line flex flex-wrap items-center justify-between gap-4">
          <Link
            to="/privacy"
            className="text-xs font-semibold text-gd-cta hover:text-gd-ctaHover transition-colors flex items-center gap-1.5"
          >
            Read Privacy Policy →
          </Link>
          <Link
            to="/faq"
            className="text-xs font-semibold text-gd-muted hover:text-gd-ink transition-colors"
          >
            Frequently Asked Questions
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Terms;

