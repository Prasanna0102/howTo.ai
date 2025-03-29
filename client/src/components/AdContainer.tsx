import React from "react";

interface AdContainerProps {
  type: "initial" | "side";
  className?: string;
}

const AdContainer: React.FC<AdContainerProps> = ({ type, className = "" }) => {
  // This component displays ad containers
  // In a real implementation, this would be integrated with an ad network like Mediavine
  
  if (type === "initial") {
    return (
      <section className={`py-8 max-w-4xl mx-auto ${className}`}>
        <div className="text-center mb-6">
          <p className="text-gray-400 text-sm">While you wait for your guide...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((adIndex) => (
            <div 
              key={adIndex}
              className="ad-placeholder h-60 rounded-lg flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700"
            >
              <div className="text-center">
                <div className="text-primary mb-2"><i className="fas fa-ad text-2xl"></i></div>
                <p className="text-gray-400 text-sm">Advertisement</p>
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
          <p className="text-xs text-gray-400 uppercase tracking-wider">Sponsored</p>
        </div>
        
        <div className="space-y-6">
          {[1, 2, 3].map((adIndex) => (
            <div 
              key={adIndex}
              className="ad-placeholder h-80 rounded-lg flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700"
            >
              <div className="text-center">
                <div className="text-primary mb-2"><i className="fas fa-ad text-2xl"></i></div>
                <p className="text-gray-400 text-sm">Advertisement</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdContainer;
