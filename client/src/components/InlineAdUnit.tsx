import React from "react";

interface InlineAdUnitProps {
  className?: string;
}

const InlineAdUnit: React.FC<InlineAdUnitProps> = ({ className = "" }) => {
  return (
    <div className={`my-8 rounded-lg overflow-hidden ${className}`}>
      <div 
        id="ad-inline-content"
        className="ad-placeholder ad-unit-inline h-24 sm:h-32 w-full flex items-center justify-center bg-gradient-to-r from-gray-800 to-gray-900 border border-gray-700"
        data-ad-slot="inline-content"
        data-ad-unit="true"
        data-ad-format="horizontal"
        data-ad-container="true"
      >
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