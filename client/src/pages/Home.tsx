import React, { useState, useEffect } from "react";
import { useRoute, useLocation, Link } from "wouter";
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
      // Show loading state immediately without changing the page
      setShowResults(true);
      
      // Keep showing ads during loading
      setShowInitialAds(false);
      
      const response = await apiRequest("POST", "/api/guides/generate", { query });
      const data = await response.json();
      return data.guide as Guide;
    },
    onSuccess: (data) => {
      setGuide(data);
      
      // Instead of redirecting, just update the URL silently using history.pushState
      const newUrl = `/guide/${data.slug}`;
      window.history.pushState({ path: newUrl }, '', newUrl);
      
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
                  HowTo.AI: Expert Step-by-Step Guides on Anything
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
            <>
              <AdContainer type="initial" />
              
              {/* How It Works Section with Internal Links */}
              <section id="how-it-works" className="py-16 border-t border-gray-800 mt-10">
                <div className="max-w-4xl mx-auto">
                  <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-center">How HowTo.AI Works</h2>
                  
                  <div className="grid md:grid-cols-3 gap-8">
                    <div className="bg-secondary/20 p-6 rounded-lg border border-gray-800">
                      <div className="text-center mb-4">
                        <span className="inline-block bg-primary/20 text-primary rounded-full w-12 h-12 flex items-center justify-center text-xl mb-2">1</span>
                        <h3 className="text-xl font-semibold">Tell Us What You Need</h3>
                      </div>
                      <p className="text-gray-300">Enter any topic or question you need guidance on. Be specific for better results.</p>
                      <Link href="/#examples">
                        <div className="mt-4 text-primary hover:underline cursor-pointer">See example topics</div>
                      </Link>
                    </div>
                    
                    <div className="bg-secondary/20 p-6 rounded-lg border border-gray-800">
                      <div className="text-center mb-4">
                        <span className="inline-block bg-primary/20 text-primary rounded-full w-12 h-12 flex items-center justify-center text-xl mb-2">2</span>
                        <h3 className="text-xl font-semibold">AI Creates Your Guide</h3>
                      </div>
                      <p className="text-gray-300">Our AI analyzes your request and generates a customized step-by-step guide in seconds.</p>
                      <Link href="/#about">
                        <div className="mt-4 text-primary hover:underline cursor-pointer">Learn about our technology</div>
                      </Link>
                    </div>
                    
                    <div className="bg-secondary/20 p-6 rounded-lg border border-gray-800">
                      <div className="text-center mb-4">
                        <span className="inline-block bg-primary/20 text-primary rounded-full w-12 h-12 flex items-center justify-center text-xl mb-2">3</span>
                        <h3 className="text-xl font-semibold">Save &amp; Share</h3>
                      </div>
                      <p className="text-gray-300">Download your guide as a PDF, print it, or share it with friends and colleagues.</p>
                      <a href="https://howto-ai.netlify.app/guide/how-to-bake-a-perfect-chocolate-cake-example" className="mt-4 text-primary hover:underline block">
                        View a sample guide
                      </a>
                    </div>
                  </div>
                </div>
              </section>
              
              {/* Example Topics Section */}
              <section id="examples" className="py-16 border-t border-gray-800">
                <div className="max-w-4xl mx-auto">
                  <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-center">Example Topics</h2>
                  
                  <div className="grid sm:grid-cols-2 gap-4">
                    <a href="/#" onClick={(e) => { e.preventDefault(); handleSubmit("How to grow vegetables in a small apartment"); }} className="block bg-secondary/10 hover:bg-secondary/20 p-4 rounded-lg border border-gray-800 transition-colors">
                      <h3 className="font-semibold mb-1">How to grow vegetables in a small apartment</h3>
                      <p className="text-sm text-gray-400">Indoor gardening tips for limited spaces</p>
                    </a>
                    
                    <a href="/#" onClick={(e) => { e.preventDefault(); handleSubmit("How to create an effective workout routine"); }} className="block bg-secondary/10 hover:bg-secondary/20 p-4 rounded-lg border border-gray-800 transition-colors">
                      <h3 className="font-semibold mb-1">How to create an effective workout routine</h3>
                      <p className="text-sm text-gray-400">Exercise plans for different fitness goals</p>
                    </a>
                    
                    <a href="/#" onClick={(e) => { e.preventDefault(); handleSubmit("How to take better photos with your smartphone"); }} className="block bg-secondary/10 hover:bg-secondary/20 p-4 rounded-lg border border-gray-800 transition-colors">
                      <h3 className="font-semibold mb-1">How to take better photos with your smartphone</h3>
                      <p className="text-sm text-gray-400">Smartphone photography tips and techniques</p>
                    </a>
                    
                    <a href="/#" onClick={(e) => { e.preventDefault(); handleSubmit("How to start meditation for beginners"); }} className="block bg-secondary/10 hover:bg-secondary/20 p-4 rounded-lg border border-gray-800 transition-colors">
                      <h3 className="font-semibold mb-1">How to start meditation for beginners</h3>
                      <p className="text-sm text-gray-400">Simple techniques to begin mindfulness practice</p>
                    </a>
                  </div>
                </div>
              </section>
              
              {/* About Section */}
              <section id="about" className="py-16 border-t border-gray-800">
                <div className="max-w-3xl mx-auto">
                  <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center">About HowTo.AI</h2>
                  
                  <div className="prose prose-invert max-w-none">
                    <p>
                      HowTo.AI uses advanced artificial intelligence to generate personalized how-to guides on virtually any topic. Our platform connects to Anthropic's Claude 3.7 Sonnet, one of the world's most advanced AI assistants, to create detailed, accurate step-by-step instructions tailored to your specific needs.
                    </p>
                    <p>
                      Unlike static guides that might not address your particular situation, HowTo.AI creates guides specifically for your request. Whether you're trying to learn a new skill, troubleshoot a problem, or just curious about how something works, our AI can create an expert guide just for you.
                    </p>
                    <p>
                      <Link href="https://howto-ai.netlify.app">
                        <span className="text-primary hover:underline">Try HowTo.AI</span>
                      </Link> today to get instant expert guidance on any topic!
                    </p>
                  </div>
                </div>
              </section>
            </>
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
                        {/* Modern animated loading indicator */}
                        <div className="relative w-24 h-24 mb-8">
                          {/* Outer spinning circle */}
                          <motion.div 
                            className="absolute inset-0 border-4 border-primary/20 rounded-full"
                            animate={{ 
                              scale: [1, 1.05, 1],
                              rotate: 360 
                            }}
                            transition={{ 
                              scale: {
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut"
                              },
                              rotate: {
                                duration: 3, 
                                repeat: Infinity, 
                                ease: "linear"
                              }
                            }}
                          />
                          
                          {/* Middle spinning element */}
                          <motion.div 
                            className="absolute inset-3 border-4 border-primary/50 rounded-full"
                            animate={{ 
                              rotate: -180,
                              scale: [1, 0.95, 1]
                            }}
                            transition={{ 
                              rotate: {
                                duration: 2, 
                                repeat: Infinity, 
                                ease: "easeInOut"
                              },
                              scale: {
                                duration: 1.5,
                                repeat: Infinity,
                                ease: "easeInOut"
                              }
                            }}
                          />
                          
                          {/* Inner pulsing circle */}
                          <motion.div 
                            className="absolute inset-6 bg-primary/30 rounded-full"
                            animate={{ 
                              scale: [0.8, 1.1, 0.8],
                              opacity: [0.5, 0.8, 0.5]
                            }}
                            transition={{ 
                              duration: 2,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                          />
                          
                          {/* Center dot */}
                          <motion.div 
                            className="absolute inset-10 bg-primary rounded-full shadow-lg shadow-primary/40"
                            animate={{ 
                              scale: [1, 0.9, 1]
                            }}
                            transition={{ 
                              duration: 1.5,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                          />
                        </div>
                        
                        <motion.h3
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2, duration: 0.5 }}
                          className="text-2xl font-semibold mb-4"
                        >
                          <motion.span 
                            initial={{ opacity: 0, y: 5 }} 
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.2 }}
                          >
                            Creating
                          </motion.span>{" "}
                          <motion.span 
                            initial={{ opacity: 0, y: 5 }} 
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4, duration: 0.2 }}
                          >
                            your
                          </motion.span>{" "}
                          <motion.span 
                            initial={{ opacity: 0, y: 5 }} 
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5, duration: 0.2 }}
                          >
                            personalized
                          </motion.span>{" "}
                          <motion.span 
                            initial={{ opacity: 0, y: 5 }} 
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6, duration: 0.2 }}
                          >
                            guide
                          </motion.span>
                        </motion.h3>
                        
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.7 }}
                          className="text-center text-gray-400 max-w-md mb-8"
                        >
                          <motion.p 
                            className="mb-2"
                            initial={{ opacity: 0, x: -5 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.8 }}
                          >
                            We're assembling an expertly crafted guide just for you.
                          </motion.p>
                          <motion.p
                            initial={{ opacity: 0, x: 5 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.9 }}
                          >
                            This typically takes around 15-20 seconds.
                          </motion.p>
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
