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
    <div className={`w-full mt-12 ${className}`}>
      <div className="max-w-4xl mx-auto">
        <div className="border-t border-gray-800 mb-6"></div>
        
        <div className="flex justify-center items-center">
          <div className="h-px bg-gray-800 flex-grow"></div>
          <p className="text-xs text-gray-500 font-light px-4 italic">You may also be interested in</p>
          <div className="h-px bg-gray-800 flex-grow"></div>
        </div>
        
        <div 
          className="ad-placeholder rounded-md flex items-center justify-center bg-gradient-to-r from-gray-800 to-gray-900 border border-gray-700 overflow-hidden shadow-sm mt-4"
          style={{ minHeight: "90px", opacity: 0.8 }}
        >
          {/* Ad Container with visual fallback */}
          <div 
            id="bottom-1"
            className="ad-unit w-full h-full flex items-center justify-center"
            data-htp-zone-id="4529854"
            data-htp-channel-name="howtoai-bottom"
            style={{ width: "728px", maxWidth: "100%", height: "90px", margin: "0 auto" }}
          >
            <div className="w-full flex flex-col items-center justify-center">
              <div className="animate-pulse flex space-x-4 w-5/6 items-center">
                <div className="rounded-md bg-gray-700 h-12 w-32"></div>
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-2 bg-gray-700 rounded w-5/6"></div>
                  <div className="h-2 bg-gray-700 rounded w-3/6"></div>
                </div>
              </div>
              <p className="text-gray-500 text-xs font-light opacity-70 mt-1">Related offers</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BottomAdContainer;