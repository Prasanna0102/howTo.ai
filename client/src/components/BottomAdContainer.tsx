import React, { useEffect } from "react";
import { refreshAds } from "@/services/adService";

interface BottomAdContainerProps {
  className?: string;
}

const BottomAdContainer: React.FC<BottomAdContainerProps> = ({ className = "" }) => {
  useEffect(() => {
    // Refresh ads when component mounts
    refreshAds();
  }, []);

  return (
    <div className={`w-full mt-10 ${className}`}>
      <div className="text-center mb-3">
        <p className="text-xs text-gray-400 uppercase tracking-wider">Sponsored Content</p>
      </div>
      <div 
        className="ad-placeholder rounded-lg flex items-center justify-center bg-gradient-to-r from-gray-800 to-gray-900 border border-gray-700"
        style={{ minHeight: "90px" }}
      >
        {/* Hilltopads Ad Container */}
        <div 
          id="bottom-1"
          className="ad-unit"
          style={{ width: "728px", maxWidth: "100%", height: "90px", margin: "0 auto" }}
        >
          <div className="text-center">
            <p className="text-gray-400 text-sm">Full Width Advertisement</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BottomAdContainer;