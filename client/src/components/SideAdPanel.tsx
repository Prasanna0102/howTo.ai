import React, { useEffect } from "react";
import AdContainer from "./AdContainer";
import { refreshAds } from "@/services/adService";

const SideAdPanel: React.FC = () => {
  useEffect(() => {
    // Refresh ads when component mounts
    refreshAds();
  }, []);
  
  return (
    <div className="sticky top-4 self-start h-full">
      <AdContainer type="side" className="mb-4 sticky-ad" />
      <div 
        className="h-full bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg border border-gray-700 p-4 text-center text-sm text-gray-400 hidden lg:block shadow-md ad-unit w-full h-full flex flex-col items-center justify-center"
        id="ad-side-additional"
        data-ad-unit="true"
        data-htp-zone-id="4529854"
        data-htp-channel-name="howtoai-side-additional"
      >
        <p className="text-xs text-gray-500 font-light tracking-wide">Curated resources</p>
        <div className="my-4 h-80 flex items-center justify-center w-full">
          <div className="animate-pulse flex flex-col items-center space-y-4 p-4 w-full">
            <div className="h-3 w-32 bg-gray-700 rounded"></div>
            <div className="h-32 w-48 bg-gray-700 rounded-md"></div>
            <div className="h-2 w-40 bg-gray-700 rounded"></div>
            <div className="h-2 w-24 bg-gray-700 rounded"></div>
            <div className="h-8 w-32 bg-gray-700 rounded-md mt-2"></div>
          </div>
        </div>
        <p className="text-gray-500 text-xs font-light opacity-70">More deals and promotions</p>
      </div>
    </div>
  );
};

export default SideAdPanel;
