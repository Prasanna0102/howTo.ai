import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareUrl: string;
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, shareUrl }) => {
  const { toast } = useToast();
  
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Success",
        description: "Link copied to clipboard!",
        variant: "default"
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive"
      });
    }
  };
  
  const shareOnSocial = (platform: string) => {
    let shareLink = "";
    
    switch (platform) {
      case "twitter":
        shareLink = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent("Check out this helpful guide from HowTo.AI!")}`;
        break;
      case "facebook":
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case "linkedin":
        shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
        break;
      case "whatsapp":
        shareLink = `https://wa.me/?text=${encodeURIComponent(`Check out this helpful guide from HowTo.AI: ${shareUrl}`)}`;
        break;
    }
    
    if (shareLink) {
      window.open(shareLink, "_blank");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-secondary sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share this guide</DialogTitle>
          <DialogClose />
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Share link</label>
            <div className="flex">
              <Input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-grow bg-background border border-gray-700 rounded-l-lg pr-3 py-2 text-sm"
              />
              <Button
                onClick={copyToClipboard}
                className="bg-primary hover:bg-primary/80 px-3 py-2 rounded-r-lg"
              >
                <i className="fas fa-copy"></i>
              </Button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-3">Share on social media</label>
            <div className="flex space-x-4">
              <Button 
                onClick={() => shareOnSocial("twitter")}
                className="flex-1 bg-[#1DA1F2] hover:bg-[#1DA1F2]/80 py-2 rounded-lg transition-colors"
              >
                <i className="fab fa-twitter"></i>
              </Button>
              <Button
                onClick={() => shareOnSocial("facebook")}
                className="flex-1 bg-[#4267B2] hover:bg-[#4267B2]/80 py-2 rounded-lg transition-colors"
              >
                <i className="fab fa-facebook-f"></i>
              </Button>
              <Button
                onClick={() => shareOnSocial("linkedin")}
                className="flex-1 bg-[#0A66C2] hover:bg-[#0A66C2]/80 py-2 rounded-lg transition-colors"
              >
                <i className="fab fa-linkedin-in"></i>
              </Button>
              <Button
                onClick={() => shareOnSocial("whatsapp")}
                className="flex-1 bg-[#25D366] hover:bg-[#25D366]/80 py-2 rounded-lg transition-colors"
              >
                <i className="fab fa-whatsapp"></i>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareModal;
