import React from "react";

interface BottomAdContainerProps {
  className?: string;
}

const BottomAdContainer: React.FC<BottomAdContainerProps> = ({ className = "" }) => {
  return (
    <div className={`w-full mt-10 ${className}`}>
      <div className="text-center mb-3">
        <p className="text-xs text-gray-400 uppercase tracking-wider">Sponsored Content</p>
      </div>
      <div className="ad-placeholder h-40 w-full rounded-lg flex items-center justify-center bg-gradient-to-r from-gray-800 to-gray-900 border border-gray-700">
        <div className="text-center">
          <div className="text-primary mb-2">
            <i className="fas fa-ad text-2xl"></i>
          </div>
          <p className="text-gray-400 text-sm">Full Width Advertisement</p>
        </div>
      </div>
    </div>
  );
};

export default BottomAdContainer;