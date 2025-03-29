import { Link } from "wouter";

const Footer = () => {
  return (
    <footer className="bg-secondary/30 py-8 px-6 border-t border-gray-800 print:hidden">
      <div className="max-w-7xl mx-auto">
        <div className="md:flex md:justify-between">
          <div className="mb-8 md:mb-0">
            <div className="flex items-center mb-4">
              <h2 className="text-xl font-bold text-white">HowTo.AI</h2>
            </div>
            <p className="text-gray-400 max-w-md">
              Get instant expert guides on any topic. Our platform delivers personalized, 
              step-by-step instructions whenever you need them.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Resources</h3>
              <ul className="space-y-3">
                <li>
                  <Link href="/blog">
                    <div className="text-gray-400 hover:text-white transition-colors cursor-pointer">Blog</div>
                  </Link>
                </li>
                <li>
                  <Link href="/examples">
                    <div className="text-gray-400 hover:text-white transition-colors cursor-pointer">Examples</div>
                  </Link>
                </li>
                <li>
                  <Link href="/help">
                    <div className="text-gray-400 hover:text-white transition-colors cursor-pointer">Help Center</div>
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Company</h3>
              <ul className="space-y-3">
                <li>
                  <Link href="/about">
                    <div className="text-gray-400 hover:text-white transition-colors cursor-pointer">About</div>
                  </Link>
                </li>
                <li>
                  <Link href="/careers">
                    <div className="text-gray-400 hover:text-white transition-colors cursor-pointer">Careers</div>
                  </Link>
                </li>
                <li>
                  <Link href="/contact">
                    <div className="text-gray-400 hover:text-white transition-colors cursor-pointer">Contact</div>
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Legal</h3>
              <ul className="space-y-3">
                <li>
                  <Link href="/privacy">
                    <div className="text-gray-400 hover:text-white transition-colors cursor-pointer">Privacy</div>
                  </Link>
                </li>
                <li>
                  <Link href="/terms">
                    <div className="text-gray-400 hover:text-white transition-colors cursor-pointer">Terms</div>
                  </Link>
                </li>
                <li>
                  <Link href="/cookies">
                    <div className="text-gray-400 hover:text-white transition-colors cursor-pointer">Cookies</div>
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between">
          <p className="text-gray-400 text-sm">© {new Date().getFullYear()} HowTo.AI. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a 
              href="https://twitter.com/howto_ai" 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="Twitter"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <i className="fab fa-twitter"></i>
              <span className="sr-only">Twitter</span>
            </a>
            <a 
              href="https://facebook.com/howtoai" 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <i className="fab fa-facebook"></i>
              <span className="sr-only">Facebook</span>
            </a>
            <a 
              href="https://instagram.com/howto.ai" 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <i className="fab fa-instagram"></i>
              <span className="sr-only">Instagram</span>
            </a>
            <a 
              href="https://github.com/howto-ai" 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <i className="fab fa-github"></i>
              <span className="sr-only">GitHub</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
