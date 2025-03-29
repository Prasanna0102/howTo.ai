import React, { useEffect } from "react";
import { refreshAds } from "@/services/adService";

interface AdContainerProps {
  type: "initial" | "side";
  className?: string;
}

const AdContainer: React.FC<AdContainerProps> = ({ type, className = "" }) => {
  // This component displays ad containers integrated with Hilltopads
  
  useEffect(() => {
    // Refresh ads when the container mounts
    refreshAds();
    
    // Set up interval to periodically refresh ads
    const intervalId = setInterval(() => {
      refreshAds();
    }, 20000); // Every 20 seconds
    
    return () => clearInterval(intervalId);
  }, []);
  
  if (type === "initial") {
    return (
      <section className={`py-6 max-w-4xl mx-auto ${className}`}>
        <div className="text-center mb-4">
          <p className="text-gray-500 text-xs font-light italic">Related resources while your guide is prepared...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((adIndex) => (
            <div 
              key={adIndex}
              className="ad-placeholder rounded-lg flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
              style={{ minHeight: "250px", opacity: 0.9 }}
            >
              {/* Ad Container with visual fallback */}
              <div 
                id={`initial-${adIndex}`}
                className="ad-unit w-full h-full flex flex-col items-center justify-center"
                data-htp-zone-id="4529854"
                data-htp-channel-name="howtoai-initial"
                style={{ width: "300px", height: "250px", margin: "0 auto" }}
              >
                <div className="text-center">
                  <div className="animate-pulse flex flex-col items-center space-y-2 p-4">
                    <div className="h-2 w-16 bg-gray-700 rounded"></div>
                    <div className="h-20 w-32 bg-gray-700 rounded-md"></div>
                    <div className="h-2 w-24 bg-gray-700 rounded"></div>
                  </div>
                  <p className="text-gray-400 text-xs font-light mt-4">Related content</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }
  
  // Side ads panel
  return (
    <div className={`lg:w-1/4 ${className}`}>
      <div className="sticky top-6">
        <div className="mb-4 text-center">
          <p className="text-xs text-gray-500 font-light tracking-wide">Related Resources</p>
        </div>
        
        <div className="space-y-4">
          {[1, 2, 3].map((adIndex) => (
            <div 
              key={adIndex}
              className="ad-placeholder rounded-lg flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 shadow-sm overflow-hidden opacity-90 hover:opacity-100 transition-opacity duration-300"
              style={{ minHeight: "250px" }}
            >
              {/* Ad Container with visual fallback */}
              <div 
                id={`side-${adIndex}`}
                className="ad-unit w-full h-full flex flex-col items-center justify-center"
                data-htp-zone-id="4529854"
                data-htp-channel-name="howtoai-side"
                style={{ width: "300px", height: "250px", margin: "0 auto" }}
              >
                <div className="text-center">
                  <div className="animate-pulse flex flex-col items-center space-y-2 p-4">
                    <div className="h-2 w-16 bg-gray-700 rounded"></div>
                    <div className="h-20 w-32 bg-gray-700 rounded-md"></div>
                    <div className="h-2 w-24 bg-gray-700 rounded"></div>
                  </div>
                  <p className="text-gray-400 text-xs font-light mt-2">Sponsored resources</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdContainer;
