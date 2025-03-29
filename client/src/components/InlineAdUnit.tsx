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
    <div className={`my-10 ${className}`}>
      <div className="max-w-3xl mx-auto px-4">
        <div className="border-t border-gray-800 my-2"></div>
        <div className="flex justify-center items-center py-2">
          <p className="text-xs text-gray-500 font-light tracking-wide px-3 italic">Related resources</p>
        </div>
        
        <div 
          className="ad-placeholder rounded-md flex items-center justify-center bg-gradient-to-r from-gray-800 to-gray-900 border border-gray-800 overflow-hidden shadow-md"
          style={{ minHeight: "280px", opacity: 0.85 }}
        >
          {/* Hilltopads Ad Container */}
          <div 
            id="inline-1"
            className="ad-unit"
            style={{ width: "336px", maxWidth: "100%", height: "280px", margin: "0 auto" }}
          >
            <div className="text-center">
              <p className="text-gray-400 text-xs opacity-60">Advertisement</p>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-3"></div>
      </div>
    </div>
  );
};

export default InlineAdUnit;