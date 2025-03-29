import React, { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
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

const Home = () => {
  const [match, params] = useRoute("/guide/:slug");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { guide, setGuide } = useGuide();
  
  const [showInitialAds, setShowInitialAds] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  
  // Mutation for generating a guide
  const generateGuideMutation = useMutation({
    mutationFn: async (query: string) => {
      const response = await apiRequest("POST", "/api/guides/generate", { query });
      const data = await response.json();
      return data.guide as Guide;
    },
    onSuccess: (data) => {
      setGuide(data);
      setShowResults(true);
      setShowInitialAds(false);
      
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
          
          {/* Results Section (shown after generating a guide) */}
          {showResults && guide && (
            <section className="py-8 print:py-0">
              {/* Loading State */}
              {generateGuideMutation.isPending && (
                <div className="text-center py-10">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
                  <p className="text-xl">Generating your expert guide...</p>
                </div>
              )}
              
              {/* Results Layout */}
              {!generateGuideMutation.isPending && (
                <>
                  {/* Simplified search when guide is shown */}
                  {match && params?.slug && (
                    <div className="mb-8 max-w-3xl mx-auto md:mx-0 print:hidden">
                      <SearchForm 
                        onSubmit={handleSubmit} 
                        isLoading={generateGuideMutation.isPending} 
                      />
                    </div>
                  )}
                  
                  <div className="flex flex-col lg:flex-row gap-8">
                    {/* Guide Content */}
                    <GuideContent 
                      guide={guide}
                      onShare={handleShare}
                      onPrint={handlePrint}
                      onDownload={handleDownload}
                    />
                    
                    {/* Side Ad Container */}
                    <div className="lg:w-1/4 print:hidden">
                      <SideAdPanel />
                    </div>
                  </div>
                  
                  {/* Bottom Ad Container */}
                  <div className="print:hidden">
                    <BottomAdContainer />
                  </div>
                  
                  {/* Popular Guides - Moved below the main content */}
                  <div className="print:hidden">
                    <PopularGuides />
                  </div>
                </>
              )}
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
