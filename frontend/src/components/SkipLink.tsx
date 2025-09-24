import React from 'react';

const SkipLink: React.FC = () => {
  return (
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 bg-accent text-accent-fg px-4 py-2 rounded-md font-medium transition-all duration-200"
    >
      Skip to main content
    </a>
  );
};

export default SkipLink;
