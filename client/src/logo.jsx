import React from 'react';
import { Link } from 'react-router-dom';

const Logo = ({
    variant = 'full', // 'full' | 'compact' | 'icon'
    theme = 'light',  // 'light' (dark text on light bg) | 'dark' (white text on dark bg)
    className = '',
    to = '/'
}) => {
    const textColor = theme === 'dark' ? 'text-white' : 'text-slate-900';
    const subTextColor = theme === 'dark' ? 'text-slate-400' : 'text-slate-500';

    const LogoContent = (
        <div className={`inline-flex items-center gap-3 select-none group ${className}`}>
            {/* GD Monogram + Live Emerald Pulse SVG */}
            <div className="relative flex-shrink-0">
                <svg
                    width="40"
                    height="40"
                    viewBox="0 0 40 40"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="transition-transform duration-200 group-hover:scale-[1.03] shadow-sm rounded-[10px]"
                >
                    {/* Squircle Carbon Background */}
                    <rect width="40" height="40" rx="10" fill="#0F172A" />
                    <rect
                        x="0.5"
                        y="0.5"
                        width="39"
                        height="39"
                        rx="9.5"
                        stroke="white"
                        strokeOpacity="0.08"
                    />

                    {/* Continuous Racetrack 'G' Outer/Inner Loop */}
                    <path
                        d="M21.5 11.5H15.5C12.1863 11.5 9.5 14.1863 9.5 17.5V22.5C9.5 25.8137 12.1863 28.5 15.5 28.5H20.5C22.7091 28.5 24.5 26.7091 24.5 24.5V20.5H17.5"
                        stroke="#FFFFFF"
                        strokeWidth="2.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />

                    {/* Interlocking 'D' Apex Curve */}
                    <path
                        d="M21.5 15.5H25C28.0376 15.5 30.5 17.9624 30.5 21C30.5 24.0376 28.0376 26.5 25 26.5H23"
                        stroke="#94A3B8"
                        strokeWidth="2.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />

                    {/* Live Auction Emerald Pulse Dot */}
                    <circle cx="29.5" cy="11.5" r="4.5" fill="#10B981" fillOpacity="0.25" className="animate-ping" style={{ animationDuration: '2.5s' }} />
                    <circle cx="29.5" cy="11.5" r="2.75" fill="#10B981" />
                </svg>
            </div>

            {/* Brand Wordmark */}
            {variant !== 'icon' && (
                <div className="flex flex-col justify-center leading-none">
                    <span className={`text-[20px] font-bold tracking-tight font-serif ${textColor}`}>
                        Gavel Drive
                    </span>
                    {variant === 'full' && (
                        <span className={`text-[9.5px] font-semibold uppercase tracking-[0.18em] mt-1 ${subTextColor}`}>
                            Live Car Auctions
                        </span>
                    )}
                </div>
            )}
        </div>
    );

    return to ? (
        <Link to={to} className="focus:outline-none">
            {LogoContent}
        </Link>
    ) : (
        LogoContent
    );
};

export default Logo;