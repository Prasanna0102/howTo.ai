import React from "react";
import { Guide, GuideSection, GuideContent as GuideContentType } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

interface GuideContentProps {
  guide: Guide;
  onShare: () => void;
  onPrint: () => void;
  onDownload: () => void;
}

const GuideContent: React.FC<GuideContentProps> = ({ 
  guide, 
  onShare, 
  onPrint, 
  onDownload 
}) => {
  const { title, content, createdAt } = guide;
  const formattedDate = new Date(createdAt).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  // Sample related guides (in a real app, these would be fetched from the backend)
  const relatedGuides = [
    {
      title: `Troubleshooting common problems with ${title.split(' ').slice(-1)}`,
      slug: '#',
      readTime: '5 min'
    },
    {
      title: `Advanced techniques for ${title.split(' ').slice(-1)}`,
      slug: '#',
      readTime: '4 min'
    }
  ];

  return (
    <div className="lg:w-3/4">
      <div className="bg-secondary/20 border border-gray-800 rounded-lg p-6 mb-6">
        {/* Guide Header */}
        <div className="mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">{title}</h2>
          <div className="flex items-center text-sm text-gray-400">
            <span>Generated on <span>{formattedDate}</span></span>
            <span className="mx-2">•</span>
            <span>By HowTo.AI</span>
          </div>
        </div>
        
        {/* Guide Content */}
        <div className="prose prose-invert max-w-none">
          {content.sections.map((section: GuideSection, index: number) => (
            <div className="mb-6" key={index}>
              <h3 className="text-xl font-semibold mb-3">{section.title}</h3>
              
              {section.type === "list" ? (
                <ul className="list-disc pl-5 space-y-2">
                  {section.items?.map((item: string, itemIndex: number) => (
                    <li key={itemIndex}>{item}</li>
                  ))}
                </ul>
              ) : (
                <>
                  {section.content?.map((paragraph: string, paragraphIndex: number) => (
                    <p key={paragraphIndex} className={paragraphIndex < section.content.length - 1 ? "mb-3" : ""}>
                      {paragraph}
                    </p>
                  ))}
                </>
              )}
            </div>
          ))}
        </div>
        
        {/* Guide Actions */}
        <div className="mt-8 flex flex-wrap gap-3">
          <Button 
            variant="secondary" 
            onClick={onShare}
            className="flex items-center gap-2"
          >
            <i className="fas fa-share-alt"></i>
            <span>Share</span>
          </Button>
          <Button 
            variant="secondary" 
            onClick={onPrint}
            className="flex items-center gap-2"
          >
            <i className="fas fa-print"></i>
            <span>Print</span>
          </Button>
          <Button 
            onClick={onDownload}
            className="flex items-center gap-2 bg-primary hover:bg-primary/80"
          >
            <i className="fas fa-file-pdf"></i>
            <span>Download PDF</span>
          </Button>
        </div>
      </div>
      
      {/* Related Guides */}
      <div className="mt-10">
        <h3 className="text-xl font-semibold mb-4">Related Guides</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {relatedGuides.map((relatedGuide, index) => (
            <Link href={relatedGuide.slug} key={index}>
              <div className="block bg-secondary/20 border border-gray-800 p-4 rounded-lg hover:bg-secondary/30 transition-colors cursor-pointer">
                <h4 className="font-medium mb-1">{relatedGuide.title}</h4>
                <p className="text-sm text-gray-400">{relatedGuide.readTime} read</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GuideContent;
