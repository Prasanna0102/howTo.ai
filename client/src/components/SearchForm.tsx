import { useState, FormEvent, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useGuide } from "@/services/GuideContext";
import { motion, AnimatePresence } from "framer-motion";

interface SearchFormProps {
  onSubmit: (query: string) => void;
  isLoading: boolean;
}

const popularQueries = [
  "How to make homemade pasta from scratch",
  "How to train for a 5k run as a beginner",
  "How to grow herbs indoors"
];

// Animated placeholder text that cycles through suggestions
const placeholders = [
  "How to make sourdough bread",
  "How to fix a leaking faucet",
  "How to plant a vegetable garden",
  "How to start meditation",
  "How to learn basic photography"
];

const SearchForm: React.FC<SearchFormProps> = ({ onSubmit, isLoading }) => {
  const [query, setQuery] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const { toast } = useToast();
  
  // Cycle through placeholder suggestions for the input field
  useEffect(() => {
    if (isTyping) return; // Don't change placeholder while user is typing
    
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }, 3000);
    
    return () => clearInterval(interval);
  }, [isTyping]);
  
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid query",
        variant: "destructive"
      });
      return;
    }
    
    onSubmit(query);
  };
  
  const handlePopularQuery = (popularQuery: string) => {
    setQuery(popularQuery);
    // Auto-scroll to input field for better UX
    document.querySelector('input')?.focus();
  };
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative max-w-2xl mx-auto"
    >
      <form onSubmit={handleSubmit} className="relative">
        <motion.div
          whileTap={{ scale: 0.995 }}
          className="relative"
        >
          <Input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsTyping(true);
            }}
            onBlur={() => setIsTyping(false)}
            placeholder={`E.g., ${placeholders[placeholderIndex]}`}
            className="w-full px-6 py-7 bg-secondary/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            disabled={isLoading}
          />
          <AnimatePresence>
            {query.length > 0 && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                type="button"
                className="absolute right-[100px] top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white p-2"
                onClick={() => setQuery("")}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12"></path>
                </svg>
              </motion.button>
            )}
          </AnimatePresence>
          <Button
            type="submit"
            disabled={isLoading}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary hover:bg-primary/80 text-white px-6 py-2 rounded-lg transition-all"
          >
            {isLoading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center"
              >
                <div className="relative h-5 w-5 mr-2">
                  {/* More modern animated dots */}
                  <div className="flex space-x-1">
                    <motion.div
                      className="h-1.5 w-1.5 bg-white rounded-full"
                      animate={{ 
                        y: [0, -3, 0],
                        opacity: [1, 0.8, 1]
                      }}
                      transition={{ 
                        duration: 0.6, 
                        repeat: Infinity, 
                        ease: "easeInOut",
                        repeatDelay: 0.1
                      }}
                    />
                    <motion.div
                      className="h-1.5 w-1.5 bg-white rounded-full"
                      animate={{ 
                        y: [0, -3, 0],
                        opacity: [1, 0.8, 1]
                      }}
                      transition={{ 
                        duration: 0.6, 
                        repeat: Infinity, 
                        ease: "easeInOut",
                        delay: 0.15,
                        repeatDelay: 0.1
                      }}
                    />
                    <motion.div
                      className="h-1.5 w-1.5 bg-white rounded-full"
                      animate={{ 
                        y: [0, -3, 0],
                        opacity: [1, 0.8, 1]
                      }}
                      transition={{ 
                        duration: 0.6, 
                        repeat: Infinity, 
                        ease: "easeInOut",
                        delay: 0.3,
                        repeatDelay: 0.1
                      }}
                    />
                  </div>
                </div>
                <motion.span
                  animate={{ opacity: [0.8, 1, 0.8] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  Generating
                </motion.span>
              </motion.div>
            ) : (
              <motion.span
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Generate
              </motion.span>
            )}
          </Button>
        </motion.div>
      </form>
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mt-3 text-sm text-gray-400"
      >
        Powered by Anthropic Claude AI
      </motion.p>
      
      {/* Popular Queries */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="max-w-4xl mx-auto mt-8"
      >
        <div className="text-center mb-4">
          <h3 className="text-lg font-medium text-gray-300">Popular guides</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {popularQueries.map((popularQuery, index) => (
            <motion.button
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.1)" }}
              whileTap={{ scale: 0.98 }}
              className="bg-secondary/30 border border-gray-700 rounded-lg px-4 py-3 text-sm text-left transition-all"
              onClick={() => handlePopularQuery(popularQuery)}
            >
              {popularQuery}
            </motion.button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SearchForm;
