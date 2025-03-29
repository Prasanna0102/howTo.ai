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
      
      <main className="flex-grow px-4 py-6 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section with Input */}
          <section className="py-10 sm:py-16">
            <div className="max-w-3xl mx-auto text-center mb-10">
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                Get instant expert guides on anything
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Simply tell us what you want to learn, and our AI will create a personalized step-by-step guide.
              </p>
              
              {/* Hero Background */}
              <div className="absolute inset-0 -z-10 overflow-hidden opacity-10">
                <img 
                  src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2000&q=80" 
                  alt="Tech background"
                  className="w-full h-full object-cover" 
                />
              </div>
              
              {/* Search Form */}
              <SearchForm 
                onSubmit={handleSubmit} 
                isLoading={generateGuideMutation.isPending} 
              />
            </div>
          </section>
          
          {/* Initial Ad Container (shown before generating a guide) */}
          {showInitialAds && !showResults && (
            <AdContainer type="initial" />
          )}
          
          {/* Results Section (shown after generating a guide) */}
          {showResults && guide && (
            <section className="py-8">
              {/* Loading State */}
              {generateGuideMutation.isPending && (
                <div className="text-center py-10">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
                  <p className="text-xl">Generating your expert guide...</p>
                </div>
              )}
              
              {/* Results Layout */}
              {!generateGuideMutation.isPending && (
                <div className="flex flex-col lg:flex-row gap-8">
                  {/* Guide Content */}
                  <GuideContent 
                    guide={guide}
                    onShare={handleShare}
                    onPrint={handlePrint}
                    onDownload={handleDownload}
                  />
                  
                  {/* Side Ad Container */}
                  <SideAdPanel />
                </div>
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
