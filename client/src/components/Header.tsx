import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [location] = useLocation();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-primary text-3xl">
                <i className="fas fa-toilet"></i>
              </span>
              <span className="font-bold text-xl md:text-2xl text-gray-800">Toilette Guilt</span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-6">
            <Link href="/find-restrooms">
              <a className={`text-gray-600 hover:text-primary font-medium ${location === '/find-restrooms' ? 'text-primary' : ''}`}>
                Find Restrooms
              </a>
            </Link>
            <Link href="/articles">
              <a className={`text-gray-600 hover:text-primary font-medium ${location === '/articles' ? 'text-primary' : ''}`}>
                Articles
              </a>
            </Link>
            <Link href="/submit-listing">
              <a className={`text-gray-600 hover:text-primary font-medium ${location === '/submit-listing' ? 'text-primary' : ''}`}>
                Submit Listing
              </a>
            </Link>
            <Link href="/about">
              <a className={`text-gray-600 hover:text-primary font-medium ${location === '/about' ? 'text-primary' : ''}`}>
                About
              </a>
            </Link>
          </nav>
          
          <div className="flex items-center space-x-4">
            <a 
              href="https://injoy.bio" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hidden md:block bg-primary text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 transition"
            >
              Visit Injoy
            </a>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleMobileMenu} 
              className="md:hidden text-gray-500 hover:text-gray-700"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden pb-4">
            <nav className="flex flex-col space-y-3">
              <Link href="/find-restrooms">
                <a 
                  className={`text-gray-600 hover:text-primary font-medium px-2 py-1 ${location === '/find-restrooms' ? 'text-primary' : ''}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Find Restrooms
                </a>
              </Link>
              <Link href="/articles">
                <a 
                  className={`text-gray-600 hover:text-primary font-medium px-2 py-1 ${location === '/articles' ? 'text-primary' : ''}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Articles
                </a>
              </Link>
              <Link href="/submit-listing">
                <a 
                  className={`text-gray-600 hover:text-primary font-medium px-2 py-1 ${location === '/submit-listing' ? 'text-primary' : ''}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Submit Listing
                </a>
              </Link>
              <Link href="/about">
                <a 
                  className={`text-gray-600 hover:text-primary font-medium px-2 py-1 ${location === '/about' ? 'text-primary' : ''}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  About
                </a>
              </Link>
              <a 
                href="https://injoy.bio" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="bg-primary text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 transition text-center mt-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Visit Injoy
              </a>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
