import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const FAQ_DATA = [
  {
    category: 'Bidding & Deposits',
    items: [
      {
        question: 'How does the ₹10,000 bidding entry deposit work?',
        answer:
          'Before placing bids on any live auction, bidders authorize a temporary ₹10,000 security hold. This acts as an escrow pre-authorization to prevent frivolous bids. If you do not win the vehicle, this hold is automatically released and 100% refunded to your source payment card the moment the auction timer expires. You receive an immutable refund transaction ID (e.g., REF_...) on your Collector Dashboard.',
      },
      {
        question: 'What are the bidding increments on GavelDrive?',
        answer:
          'To ensure balanced and structured bidding, bids advance in calibrated tiers based on the current standing offer: ₹5,000 for vehicles up to ₹5,00,000; ₹10,000 between ₹5,00,001 and ₹15,00,000; ₹25,000 between ₹15,00,001 and ₹50,00,000; and ₹50,000 for vehicles exceeding ₹50,00,000. You can also type any custom numeric bid above the minimum required next bid.',
      },
      {
        question: 'What is the Soft-Close / Anti-Sniping rule?',
        answer:
          'Any valid bid submitted during the final 2 minutes of an auction will automatically extend the countdown timer by an additional 2 minutes. This soft-close mechanism prevents automated sniping bots and gives all genuine collectors adequate time to submit their final offers.',
      },
      {
        question: 'Can I cancel or retract a bid once placed?',
        answer:
          'No. All bids placed on GavelDrive are binding, legal offers. Please review the vehicle specifications, mechanical inspection report, and seller commentary thoroughly before confirming your bid.',
      },
    ],
  },
  {
    category: 'Identity & Security',
    items: [
      {
        question: 'Why do I need to complete DigiLocker KYC verification?',
        answer:
          'Under Indian automotive auction regulations and AML compliance, all active bidders and consignors must complete digital verification using DigiLocker (Aadhaar, PAN, or Passport). Once verified, your profile displays the green shield Verified Bidder badge, ensuring counterfeit bidders cannot disrupt legitimate auctions.',
      },
      {
        question: 'Is my credit or debit card data safe?',
        answer:
          'Yes. GavelDrive strictly complies with Reserve Bank of India (RBI) tokenization guidelines. We never store raw card numbers, expiry dates, or CVVs. All card transactions are routed through NPCI-regulated payment gateway partners with 256-bit TLS encryption.',
      },
    ],
  },
  {
    category: 'Selling & Consignment',
    items: [
      {
        question: 'How do I list and consign a vehicle on GavelDrive?',
        answer:
          'Navigate to "Sell a Car" from the top navigation bar. Complete our standardized 4-step wizard with your vehicle details, make, model, odometer reading, and reserve price. Our automotive curation specialists review your submission within 24 hours.',
      },
      {
        question: 'What is the difference between Reserve and No Reserve?',
        answer:
          'A Reserve auction requires bidding to reach a confidential minimum threshold set by the seller before the vehicle is awarded. If bidding ends below this mark, the seller is not obligated to sell. In a No Reserve auction, the vehicle is awarded to the highest bidder regardless of the final hammer price, which often stimulates intense bidding excitement.',
      },
      {
        question: 'What fees are charged to sellers?',
        answer:
          'Listing and consignment on GavelDrive is transparent. Standard consignments carry zero upfront listing charges. Full hammer settlement proceeds are transferred directly to the consignor following post-auction handover.',
      },
    ],
  },
  {
    category: 'Inspection & Handover',
    items: [
      {
        question: 'How are vehicles inspected before listing?',
        answer:
          'Every vehicle featured on GavelDrive undergoes a comprehensive 20-point mechanical inspection checklist covering Engine & Powertrain, Brakes & Safety, Suspension, Electrical Systems, and Exterior/Interior condition. Each listing also displays verified ownership, insurance validity, hypothecation status, and verified odometer history.',
      },
      {
        question: 'How does vehicle settlement and title transfer take place?',
        answer:
          'When an auction concludes with the reserve met, both the winning buyer and seller receive an introduction dossier with direct contact details. The buyer transfers the hammer price via secure banking channels (RTGS/NEFT/Escrow), and the seller coordinates RTO Form 29/30 transfer, NOC, and vehicle logistics.',
      },
    ],
  },
];

const Faq = () => {
  const [openItems, setOpenItems] = useState({ 'Bidding & Deposits-0': true });
  const [activeCategory, setActiveCategory] = useState('All');

  const toggleItem = (key) => {
    setOpenItems((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const categories = ['All', ...FAQ_DATA.map((c) => c.category)];

  const filteredData =
    activeCategory === 'All'
      ? FAQ_DATA
      : FAQ_DATA.filter((c) => c.category === activeCategory);

  return (
    <div className="min-h-screen bg-gd-bg py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-xs font-medium text-gd-muted">
          <Link to="/" className="hover:text-gd-ink transition-colors">Home</Link>
          <span>/</span>
          <span className="text-gd-ink font-semibold">FAQ</span>
        </nav>

        {/* Page Title */}
        <header className="mb-10 pb-8 border-b border-gd-line">
          <span className="text-eyebrow font-medium text-gd-muted uppercase tracking-widest block mb-2">
            Help &amp; Knowledge Base
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold text-gd-ink tracking-tight">
            Frequently Asked Questions
          </h1>
          <p className="mt-3 text-base text-gd-muted max-w-2xl leading-relaxed">
            Everything you need to know about transparent bidding, refundable escrow deposits, vehicle inspections, and safe ownership transfer.
          </p>
        </header>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 flex-wrap mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-1.5 rounded-pill text-xs font-semibold transition-all cursor-pointer ${
                activeCategory === cat
                  ? 'bg-gd-cta text-gd-inverse shadow-sm'
                  : 'bg-gd-surface text-gd-muted hover:text-gd-ink border border-gd-line hover:border-gd-ghost'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* FAQ Accordion Groups */}
        <div className="space-y-8">
          {filteredData.map((group) => (
            <div key={group.category} className="space-y-3">
              <h2 className="text-xs font-bold text-gd-ghost uppercase tracking-widest px-1">
                {group.category}
              </h2>
              <div className="space-y-2.5">
                {group.items.map((item, idx) => {
                  const key = `${group.category}-${idx}`;
                  const isOpen = Boolean(openItems[key]);

                  return (
                    <div
                      key={key}
                      className="bg-gd-sidebar border border-gd-line rounded-xl overflow-hidden transition-all shadow-sm"
                    >
                      <button
                        type="button"
                        onClick={() => toggleItem(key)}
                        className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-gd-surface/50 transition-colors focus:outline-none"
                        aria-expanded={isOpen}
                      >
                        <span className="text-sm font-semibold text-gd-ink">
                          {item.question}
                        </span>
                        <span
                          className={`w-6 h-6 rounded-full border border-gd-line flex items-center justify-center text-gd-muted transition-transform shrink-0 ${
                            isOpen ? 'rotate-180 bg-gd-surface text-gd-ink' : ''
                          }`}
                        >
                          <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                          </svg>
                        </span>
                      </button>

                      {isOpen && (
                        <div className="px-5 pb-5 pt-1 text-xs text-gd-muted leading-relaxed border-t border-gd-line/60 animate-fade-in">
                          {item.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Still Have Questions Box */}
        <div className="mt-12 p-6 sm:p-8 bg-gd-surface border border-gd-line rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <h3 className="text-base font-bold text-gd-ink">Have more questions about GavelDrive?</h3>
            <p className="text-xs text-gd-muted mt-1 leading-normal max-w-md">
              Our collector concierges are available 7 days a week to assist with bidding authorizations, consignments, or escrow questions.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/browse"
              className="px-4 py-2.5 rounded-md bg-gd-cta hover:bg-gd-ctaHover text-gd-inverse text-xs font-bold transition-colors cursor-pointer"
            >
              Browse Live Auctions
            </Link>
            <Link
              to="/sell"
              className="px-4 py-2.5 rounded-md border border-gd-line bg-gd-sidebar hover:bg-gd-surface text-gd-ink text-xs font-bold transition-colors cursor-pointer"
            >
              Consign a Car
            </Link>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="mt-8 pt-6 border-t border-gd-line flex flex-wrap items-center justify-between gap-4 text-xs font-medium text-gd-muted">
          <Link to="/terms" className="hover:text-gd-ink transition-colors">Terms of Service</Link>
          <span>·</span>
          <Link to="/privacy" className="hover:text-gd-ink transition-colors">Privacy Policy</Link>
          <span>·</span>
          <span>© {new Date().getFullYear()} GavelDrive Inc.</span>
        </div>
      </div>
    </div>
  );
};

export default Faq;

