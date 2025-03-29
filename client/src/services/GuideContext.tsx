import React, { createContext, useContext, useState, ReactNode } from "react";
import { Guide } from "@shared/schema";

interface GuideContextType {
  guide: Guide | null;
  setGuide: (guide: Guide | null) => void;
}

const GuideContext = createContext<GuideContextType | undefined>(undefined);

export const GuideProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [guide, setGuide] = useState<Guide | null>(null);
  
  return (
    <GuideContext.Provider value={{ guide, setGuide }}>
      {children}
    </GuideContext.Provider>
  );
};

export const useGuide = (): GuideContextType => {
  const context = useContext(GuideContext);
  if (context === undefined) {
    throw new Error("useGuide must be used within a GuideProvider");
  }
  return context;
};
