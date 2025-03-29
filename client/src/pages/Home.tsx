import React, { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Guide } from "@shared/schema";
import { useGuide } from "@/services/GuideContext";
import { generatePDF } from "@/utils/pdfUtils";

// Components
import Header from "@/components/Header";
import SearchForm from "@/components/SearchForm";
import AdContainer from "@/components/AdContainer";
import GuideContent from "@/components/GuideContent";
import SideAdPanel from "@/components/SideAdPanel";
import ShareModal from "@/components/ShareModal";
import Footer from "@/components/Footer";
import BottomAdContainer from "@/components/BottomAdContainer";
import PopularGuides from "@/components/PopularGuides";

// Animation imports
import { motion, AnimatePresence } from "framer-motion";

const Home = () => {
  const [match, params] = useRoute("/guide/:slug");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { guide, setGuide } = useGuide();
  
  const [showInitialAds, setShowInitialAds] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  
  // Query for recent guides - displayed during loading
  const recentGuidesQuery = useQuery({
    queryKey: ['/api/guides/recent/list'],
    queryFn: async () => {
      const response = await fetch('/api/guides/recent/list?limit=3');
      if (!response.ok) {
        throw new Error('Failed to fetch recent guides');
      }
      const data = await response.json();
      return data.guides as Guide[];
    },
    enabled: true, // Always load recent guides for better UX during loading states
  });

  // Mutation for generating a guide with optimistic UI updates
  const generateGuideMutation = useMutation({
    mutationFn: async (query: string) => {
      // Show loading state immediately
      setShowResults(true);
      
      // Keep showing ads during loading
      setShowInitialAds(false);
      
      const response = await apiRequest("POST", "/api/guides/generate", { query });
      const data = await response.json();
      return data.guide as Guide;
    },
    onSuccess: (data) => {
      setGuide(data);
      
      // Update URL with the guide slug
      setLocation(`/guide/${data.slug}`);
      
      // Set share URL
      const url = new URL(window.location.href);
      url.pathname = `/guide/${data.slug}`;
      setShareUrl(url.toString());
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to generate guide. Please try again.",
        variant: "destructive"
      });
      console.error("Error generating guide:", error);
      
      // Reset UI state on error
      setShowResults(false);
      setShowInitialAds(true);
    }
  });
  
  // Handle form submission
  const handleSubmit = (query: string) => {
    generateGuideMutation.mutate(query);
  };
  
  // Handle share button click
  const handleShare = () => {
    setIsShareModalOpen(true);
  };
  
  // Handle print button click
  const handlePrint = () => {
    window.print();
  };
  
  // Handle download PDF button click
  const handleDownload = () => {
    if (guide) {
      generatePDF(guide);
      toast({
        title: "Success",
        description: "PDF downloaded successfully!"
      });
    }
  };
  
  // Fetch guide by slug if accessing directly via URL
  useEffect(() => {
    const fetchGuideBySlug = async (slug: string) => {
      try {
        const response = await fetch(`/api/guides/${slug}`);
        if (response.ok) {
          const data = await response.json();
          setGuide(data.guide);
          setShowResults(true);
          setShowInitialAds(false);
          
          // Set share URL
          const url = new URL(window.location.href);
          setShareUrl(url.toString());
        } else {
          throw new Error("Guide not found");
        }
      } catch (error) {
        console.error("Error fetching guide:", error);
        // If guide not found, redirect to home
        setLocation("/");
      }
    };
    
    if (match && params?.slug && !guide) {
      fetchGuideBySlug(params.slug);
    }
  }, [match, params?.slug, setGuide, guide, setLocation]);
  
  return (
    <div className="flex flex-col min-h-screen bg-background text-white">
      <Header />
      
      <main className="flex-grow px-4 py-6 sm:px-6 lg:px-8 print:px-0">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section with Input */}
          {!showResults && (
            <section className="py-10 sm:py-16">
              <div className="max-w-3xl mx-auto text-center mb-10">
                <h1 className="text-3xl sm:text-4xl font-bold mb-6">
                  Get instant expert guides on anything
                </h1>
                <p className="text-xl text-gray-300 mb-8">
                  Simply tell us what you want to learn, and our AI will create a personalized step-by-step guide.
                </p>
                
                {/* Search Form */}
                <SearchForm 
                  onSubmit={handleSubmit} 
                  isLoading={generateGuideMutation.isPending} 
                />
              </div>
            </section>
          )}
          
          {/* Initial Ad Container (shown below input) */}
          {showInitialAds && !showResults && (
            <AdContainer type="initial" />
          )}
          
          {/* Results Section */}
          {showResults && (
            <section className="py-8 print:py-0">
              {/* Always show search form at top when in results mode */}
              <AnimatePresence>
                {match && params?.slug && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 max-w-3xl mx-auto md:mx-0 print:hidden"
                  >
                    <SearchForm 
                      onSubmit={handleSubmit} 
                      isLoading={generateGuideMutation.isPending} 
                    />
                  </motion.div>
                )}
              </AnimatePresence>
                  
              <div className="flex flex-col lg:flex-row gap-8 min-h-[80vh]">
                {/* Main Content Area - Show loading animation or guide content */}
                <div className="lg:w-3/4">
                  {generateGuideMutation.isPending ? (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="bg-secondary/20 border border-gray-800 rounded-lg p-6 h-full"
                    >
                      <div className="flex flex-col items-center justify-center py-16">
                        {/* Animated loading indicator */}
                        <div className="relative w-20 h-20 mb-8">
                          <motion.div 
                            className="absolute inset-0 border-4 border-primary/30 rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ 
                              duration: 1.5, 
                              repeat: Infinity, 
                              ease: "linear" 
                            }}
                          />
                          <motion.div 
                            className="absolute inset-2 border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full"
                            animate={{ rotate: 180 }}
                            transition={{ 
                              duration: 1.8, 
                              repeat: Infinity, 
                              ease: "linear",
                              repeatType: "reverse" 
                            }}
                          />
                        </div>
                        
                        <motion.h3
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.2 }}
                          className="text-2xl font-semibold mb-4"
                        >
                          Creating your personalized guide
                        </motion.h3>
                        
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.4 }}
                          className="text-center text-gray-400 max-w-md mb-8"
                        >
                          <p className="mb-2">We're assembling an expertly crafted guide just for you.</p>
                          <p>This typically takes around 15-20 seconds.</p>
                        </motion.div>
                        
                        {/* Show mini preview of what's coming */}
                        {recentGuidesQuery.data && recentGuidesQuery.data.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="w-full max-w-md mt-4"
                          >
                            <h4 className="text-lg font-medium mb-3 text-gray-300">While you wait, check out:</h4>
                            <div className="space-y-2">
                              {recentGuidesQuery.data.map((recentGuide, index) => (
                                <motion.div
                                  key={recentGuide.id}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.7 + index * 0.1 }}
                                  className="p-2 bg-secondary/30 rounded"
                                >
                                  {recentGuide.title}
                                </motion.div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  ) : guide ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <GuideContent 
                        guide={guide}
                        onShare={handleShare}
                        onPrint={handlePrint}
                        onDownload={handleDownload}
                      />
                    </motion.div>
                  ) : null}
                </div>
                
                {/* Side Ad Container - Always visible during loading and results */}
                <motion.div 
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                  className="lg:w-1/4 print:hidden h-full sticky top-4"
                >
                  <SideAdPanel />
                </motion.div>
              </div>
              
              {/* Bottom Ad Container - Always visible */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="print:hidden mt-8"
              >
                <BottomAdContainer />
              </motion.div>
              
              {/* Popular Guides - Always visible */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="print:hidden mt-8"
              >
                <PopularGuides />
              </motion.div>
            </section>
          )}
        </div>
      </main>
      
      <Footer />
      
      {/* Share Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        shareUrl={shareUrl}
      />
    </div>
  );
};

export default Home;
