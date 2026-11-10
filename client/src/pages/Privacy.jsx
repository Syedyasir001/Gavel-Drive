import React from 'react';
import { Link } from 'react-router-dom';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-gd-bg py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-xs font-medium text-gd-muted">
          <Link to="/" className="hover:text-gd-ink transition-colors">Home</Link>
          <span>/</span>
          <span className="text-gd-ink font-semibold">Privacy Policy</span>
        </nav>

        {/* Page Title */}
        <header className="mb-10 pb-8 border-b border-gd-line">
          <span className="text-eyebrow font-medium text-gd-muted uppercase tracking-widest block mb-2">
            Data Protection &amp; Security
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold text-gd-ink tracking-tight">
            Privacy Policy
          </h1>
          <p className="mt-3 text-base text-gd-muted max-w-2xl leading-relaxed">
            Learn how GavelDrive collects, uses, and safeguards your government identity verification credentials, payment cards, and collector activity.
          </p>
          <div className="mt-4 flex items-center gap-4 text-xs text-gd-ghost font-medium">
            <span>Last Updated: November 2026</span>
            <span>·</span>
            <span>Digital Personal Data Protection (DPDP) Act Compliant</span>
          </div>
        </header>

        {/* Content Body */}
        <div className="space-y-10 text-sm text-gd-ink leading-relaxed">
          {/* Section 1 */}
          <section className="bg-gd-sidebar border border-gd-line rounded-xl p-6 sm:p-8 shadow-card">
            <h2 className="text-lg font-bold text-gd-ink mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-gd-cta/10 text-gd-cta text-xs flex items-center justify-center font-bold">1</span>
              Information We Collect
            </h2>
            <p className="text-gd-muted leading-relaxed mb-4">
              We collect only the essential personal information required to maintain transparent, legally binding auctions and protect market integrity:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-gd-surface p-4 rounded-lg border border-gd-line">
                <h3 className="font-semibold text-gd-ink mb-1">Account &amp; Contact Details</h3>
                <p className="text-gd-muted">Full legal name, email address, registered mobile number, and delivery city.</p>
              </div>
              <div className="bg-gd-surface p-4 rounded-lg border border-gd-line">
                <h3 className="font-semibold text-gd-ink mb-1">DigiLocker KYC Credentials</h3>
                <p className="text-gd-muted">Government document verification tokens (Aadhaar/PAN/Passport hashes). Raw biometric data is never stored on our servers.</p>
              </div>
              <div className="bg-gd-surface p-4 rounded-lg border border-gd-line">
                <h3 className="font-semibold text-gd-ink mb-1">Tokenized Payment Cards</h3>
                <p className="text-gd-muted">RBI-compliant tokenized card references used exclusively for ₹10,000 pre-authorization holds and automated refund settlement.</p>
              </div>
              <div className="bg-gd-surface p-4 rounded-lg border border-gd-line">
                <h3 className="font-semibold text-gd-ink mb-1">Bidding &amp; Auction Logs</h3>
                <p className="text-gd-muted">Timestamped bid amounts, IP address fingerprints, and watchlist preferences for audit traceability.</p>
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section className="bg-gd-sidebar border border-gd-line rounded-xl p-6 sm:p-8 shadow-card">
            <h2 className="text-lg font-bold text-gd-ink mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-gd-cta/10 text-gd-cta text-xs flex items-center justify-center font-bold">2</span>
              How We Use Your Information
            </h2>
            <ul className="space-y-2 list-disc list-inside text-gd-muted">
              <li>To verify identity and maintain the verified bidder badge system.</li>
              <li>To authorize and automatically refund live auction entry fee deposits.</li>
              <li>To facilitate direct buyer-seller title transfer and payment settlement when an auction is won.</li>
              <li>To detect and prevent shill bidding, fraudulent registrations, and coordinated market manipulation.</li>
              <li>To comply with statutory anti-money laundering (AML) and Know Your Customer (KYC) directives in India.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="bg-gd-sidebar border border-gd-line rounded-xl p-6 sm:p-8 shadow-card">
            <h2 className="text-lg font-bold text-gd-ink mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-gd-cta/10 text-gd-cta text-xs flex items-center justify-center font-bold">3</span>
              Security &amp; Encryption Standards
            </h2>
            <p className="text-gd-muted leading-relaxed mb-3">
              All data transmitted to and from GavelDrive is encrypted using TLS 1.3 protocol with AES-256 bit military-grade cipher suites.
            </p>
            <p className="text-gd-muted leading-relaxed">
              In full compliance with Reserve Bank of India (RBI) tokenization guidelines, full credit or debit card numbers, CVVs, and banking PINs are never stored on our application databases. Pre-authorization escrow and refunds are executed through NPCI-licensed payment gateway partners.
            </p>
          </section>

          {/* Section 4 */}
          <section className="bg-gd-sidebar border border-gd-line rounded-xl p-6 sm:p-8 shadow-card">
            <h2 className="text-lg font-bold text-gd-ink mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-gd-cta/10 text-gd-cta text-xs flex items-center justify-center font-bold">4</span>
              Data Retention &amp; Your Rights
            </h2>
            <p className="text-gd-muted leading-relaxed mb-4">
              Under India's Digital Personal Data Protection Act, 2023, you retain full rights to:
            </p>
            <ul className="space-y-2 list-disc list-inside text-gd-muted">
              <li>Request an export copy of your transaction history and stored profile details.</li>
              <li>Update or rectify outdated contact details or payment methods from your Collector Dashboard.</li>
              <li>Request complete account deletion and data anonymization, subject to mandatory 5-year financial audit recordkeeping rules.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="bg-gd-sidebar border border-gd-line rounded-xl p-6 sm:p-8 shadow-card">
            <h2 className="text-lg font-bold text-gd-ink mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-gd-cta/10 text-gd-cta text-xs flex items-center justify-center font-bold">5</span>
              Grievance Officer Contact
            </h2>
            <p className="text-gd-muted leading-relaxed mb-2">
              In accordance with the Information Technology Rules, 2021, queries or concerns regarding personal data may be addressed to:
            </p>
            <div className="bg-gd-surface p-4 rounded-lg border border-gd-line text-xs space-y-1">
              <p className="font-semibold text-gd-ink">Grievance Officer, GavelDrive Inc.</p>
              <p className="text-gd-muted">Email: <span className="text-gd-ink font-medium">privacy@gaveldrive.com</span></p>
              <p className="text-gd-muted">Address: Bandra Kurla Complex, Mumbai, Maharashtra 400051, India</p>
            </div>
          </section>
        </div>

        {/* Footer Navigation */}
        <div className="mt-12 pt-8 border-t border-gd-line flex flex-wrap items-center justify-between gap-4">
          <Link
            to="/terms"
            className="text-xs font-semibold text-gd-cta hover:text-gd-ctaHover transition-colors flex items-center gap-1.5"
          >
            ← View Terms of Service
          </Link>
          <Link
            to="/faq"
            className="text-xs font-semibold text-gd-muted hover:text-gd-ink transition-colors"
          >
            Frequently Asked Questions →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Privacy;

