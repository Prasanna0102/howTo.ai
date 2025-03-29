import React from "react";

interface InlineAdUnitProps {
  className?: string;
}

const InlineAdUnit: React.FC<InlineAdUnitProps> = ({ className = "" }) => {
  return (
    <div className={`my-8 rounded-lg overflow-hidden ${className}`}>
      <div className="ad-placeholder h-24 sm:h-32 w-full flex items-center justify-center bg-gradient-to-r from-gray-800 to-gray-900 border border-gray-700">
        <div className="text-center">
          <div className="text-primary mb-1">
            <i className="fas fa-ad text-xl"></i>
          </div>
          <p className="text-gray-400 text-xs sm:text-sm">Inline Advertisement</p>
        </div>
      </div>
    </div>
  );
};

export default InlineAdUnit;