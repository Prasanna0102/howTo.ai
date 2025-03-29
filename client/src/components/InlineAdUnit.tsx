import React, { useEffect } from "react";
import { refreshAds } from "@/services/adService";

interface InlineAdUnitProps {
  className?: string;
}

const InlineAdUnit: React.FC<InlineAdUnitProps> = ({ className = "" }) => {
  useEffect(() => {
    // Refresh ads when component mounts
    refreshAds();
  }, []);

  return (
    <div className={`my-8 rounded-lg overflow-hidden ${className}`}>
      <div 
        className="ad-placeholder flex items-center justify-center bg-gradient-to-r from-gray-800 to-gray-900 border border-gray-700"
        style={{ minHeight: "280px" }}
      >
        {/* Hilltopads Ad Container */}
        <div 
          id="inline-1"
          className="ad-unit"
          style={{ width: "336px", maxWidth: "100%", height: "280px", margin: "0 auto" }}
        >
          <div className="text-center">
            <p className="text-gray-400 text-xs sm:text-sm">Inline Advertisement</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InlineAdUnit;