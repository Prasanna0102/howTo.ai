import { useState } from "react";
import { Link } from "wouter";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="border-b border-gray-800 py-4 px-6 sm:px-10">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link href="/">
          <div className="flex items-center cursor-pointer">
            <div className="mr-2 text-primary">
              <i className="fas fa-robot text-2xl"></i>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">HowTo.AI</h1>
              <p className="text-sm text-gray-400">Experts guide, Instantly</p>
            </div>
          </div>
        </Link>
        
        <nav className="hidden md:flex space-x-6">
          <Link href="/#how-it-works">
            <div className="text-gray-300 hover:text-white transition-colors duration-200 cursor-pointer">How It Works</div>
          </Link>
          <Link href="/#examples">
            <div className="text-gray-300 hover:text-white transition-colors duration-200 cursor-pointer">Examples</div>
          </Link>
          <Link href="/#about">
            <div className="text-gray-300 hover:text-white transition-colors duration-200 cursor-pointer">About</div>
          </Link>
        </nav>
        
        <button 
          className="md:hidden text-gray-300 hover:text-white"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <i className="fas fa-bars text-xl"></i>
        </button>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden pt-4 pb-2">
          <nav className="flex flex-col space-y-3 px-6">
            <Link href="/#how-it-works">
              <div className="text-gray-300 hover:text-white transition-colors duration-200 py-2 cursor-pointer">
                How It Works
              </div>
            </Link>
            <Link href="/#examples">
              <div className="text-gray-300 hover:text-white transition-colors duration-200 py-2 cursor-pointer">
                Examples
              </div>
            </Link>
            <Link href="/#about">
              <div className="text-gray-300 hover:text-white transition-colors duration-200 py-2 cursor-pointer">
                About
              </div>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
