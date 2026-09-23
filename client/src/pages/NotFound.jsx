import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gd-bg px-6">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 mx-auto rounded-md bg-gd-surface border border-gd-line flex items-center justify-center">
          <span className="text-2xl font-black text-gd-ink">404</span>
        </div>
        <h1 className="mt-6 text-3xl font-bold text-gd-ink tracking-tight">
          Page Not Found
        </h1>
        <p className="mt-3 text-base text-gd-muted">
          We couldn't find the page you're looking for. It might have been removed or the link is incorrect.
        </p>
        <Link
          to="/"
          className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-md bg-gd-cta hover:bg-gd-ctaHover text-gd-inverse text-sm font-bold shadow-none transition-colors duration-200"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
