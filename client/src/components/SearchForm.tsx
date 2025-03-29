import { useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useGuide } from "@/services/GuideContext";

interface SearchFormProps {
  onSubmit: (query: string) => void;
  isLoading: boolean;
}

const popularQueries = [
  "How to make homemade pasta from scratch",
  "How to train for a 5k run as a beginner",
  "How to grow herbs indoors"
];

const SearchForm: React.FC<SearchFormProps> = ({ onSubmit, isLoading }) => {
  const [query, setQuery] = useState("");
  const { toast } = useToast();
  
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
  };
  
  return (
    <div className="relative max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="E.g., How to make sourdough bread"
          className="w-full px-6 py-7 bg-secondary/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
        <Button
          type="submit"
          disabled={isLoading}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary hover:bg-primary/80 text-white px-6 py-2 rounded-lg transition-colors"
        >
          {isLoading ? (
            <div className="flex items-center">
              <div className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-white rounded-full"></div>
              <span>Generating...</span>
            </div>
          ) : (
            <span>Generate</span>
          )}
        </Button>
      </form>
      <p className="mt-3 text-sm text-gray-400">Powered by Anthropic Claude AI</p>
      
      {/* Popular Queries */}
      <div className="max-w-4xl mx-auto mt-8">
        <div className="text-center mb-4">
          <h3 className="text-lg font-medium text-gray-300">Popular guides</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {popularQueries.map((popularQuery, index) => (
            <button
              key={index}
              className="bg-secondary/30 hover:bg-secondary/50 border border-gray-700 rounded-lg px-4 py-3 text-sm text-left transition-colors"
              onClick={() => handlePopularQuery(popularQuery)}
            >
              {popularQuery}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchForm;
