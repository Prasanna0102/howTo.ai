import { Link } from "wouter";

const Footer = () => {
  return (
    <footer className="bg-secondary/30 py-8 px-6 border-t border-gray-800">
      <div className="max-w-7xl mx-auto">
        <div className="md:flex md:justify-between">
          <div className="mb-8 md:mb-0">
            <div className="flex items-center mb-4">
              <div className="mr-2 text-primary">
                <i className="fas fa-robot text-xl"></i>
              </div>
              <h2 className="text-xl font-bold">HowTo.AI</h2>
            </div>
            <p className="text-gray-400 max-w-md">
              Get instant expert guides on any topic. Our AI-powered platform delivers personalized, 
              step-by-step instructions whenever you need them.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Resources</h3>
              <ul className="space-y-3">
                <li><Link href="#"><a className="text-gray-400 hover:text-white transition-colors">Blog</a></Link></li>
                <li><Link href="#"><a className="text-gray-400 hover:text-white transition-colors">Examples</a></Link></li>
                <li><Link href="#"><a className="text-gray-400 hover:text-white transition-colors">Help Center</a></Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Company</h3>
              <ul className="space-y-3">
                <li><Link href="#"><a className="text-gray-400 hover:text-white transition-colors">About</a></Link></li>
                <li><Link href="#"><a className="text-gray-400 hover:text-white transition-colors">Careers</a></Link></li>
                <li><Link href="#"><a className="text-gray-400 hover:text-white transition-colors">Contact</a></Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Legal</h3>
              <ul className="space-y-3">
                <li><Link href="#"><a className="text-gray-400 hover:text-white transition-colors">Privacy</a></Link></li>
                <li><Link href="#"><a className="text-gray-400 hover:text-white transition-colors">Terms</a></Link></li>
                <li><Link href="#"><a className="text-gray-400 hover:text-white transition-colors">Cookies</a></Link></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between">
          <p className="text-gray-400 text-sm">© {new Date().getFullYear()} HowTo.AI. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <i className="fab fa-twitter"></i>
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <i className="fab fa-facebook"></i>
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <i className="fab fa-instagram"></i>
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <i className="fab fa-github"></i>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
