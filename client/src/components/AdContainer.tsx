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
  }, []);
  
  if (type === "initial") {
    return (
      <section className={`py-6 max-w-4xl mx-auto ${className}`}>
        <div className="text-center mb-4">
          <p className="text-gray-500 text-xs font-light italic">Relevant content while your guide is prepared...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((adIndex) => (
            <div 
              key={adIndex}
              className="ad-placeholder rounded-lg flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-800 shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
              style={{ minHeight: "250px", opacity: 0.9 }}
            >
              {/* Hilltopads Ad Container */}
              <div 
                id={`initial-${adIndex}`}
                className="ad-unit"
                style={{ width: "300px", height: "250px", margin: "0 auto" }}
              >
                <div className="text-center">
                  <p className="text-gray-400 text-xs font-light">Advertisement</p>
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
          <p className="text-xs text-gray-500 font-light tracking-wide">Resources</p>
        </div>
        
        <div className="space-y-4">
          {[1, 2, 3].map((adIndex) => (
            <div 
              key={adIndex}
              className="ad-placeholder rounded-lg flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-800 shadow-sm overflow-hidden opacity-90 hover:opacity-100 transition-opacity duration-300"
              style={{ minHeight: "250px" }}
            >
              {/* Hilltopads Ad Container */}
              <div 
                id={`side-${adIndex}`}
                className="ad-unit"
                style={{ width: "300px", height: "250px", margin: "0 auto" }}
              >
                <div className="text-center">
                  <p className="text-gray-400 text-xs font-light opacity-70">Advertisement</p>
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
