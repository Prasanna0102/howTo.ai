import React from "react";
import AdContainer from "./AdContainer";

const SideAdPanel: React.FC = () => {
  return (
    <div className="sticky top-4 self-start h-full">
      <AdContainer type="side" className="mb-4 sticky-ad" />
      <div 
        className="h-full bg-secondary/10 rounded-lg border border-gray-800 p-4 text-center text-sm text-gray-400 hidden lg:block"
        id="ad-side-additional"
        data-ad-unit="true"
        data-ad-format="rectangle"
        data-ad-container="true"
        data-ad-slot="side-additional"
      >
        <p>Sponsored Content</p>
        <div className="my-4 bg-secondary/20 h-80 flex items-center justify-center">
          <span>Ad Space</span>
        </div>
        <p>More deals and promotions</p>
      </div>
    </div>
  );
};

export default SideAdPanel;
