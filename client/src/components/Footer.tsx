import React from 'react';
import { Link } from 'wouter';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-primary text-2xl"><i className="fas fa-toilet"></i></span>
              <span className="font-bold text-xl">Toilette Guilt</span>
            </div>
            <p className="text-gray-400 mb-4">
              Destigmatizing bathroom conversations one review at a time. Find clean, accessible restrooms wherever you go.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <i className="fab fa-pinterest-p"></i>
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4">Directory</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/find-restrooms">
                  <a className="text-gray-400 hover:text-white transition">Search Restrooms</a>
                </Link>
              </li>
              <li>
                <Link href="/submit-listing">
                  <a className="text-gray-400 hover:text-white transition">Submit a Listing</a>
                </Link>
              </li>
              <li>
                <Link href="/find-restrooms?sort=most-reviewed">
                  <a className="text-gray-400 hover:text-white transition">Most Reviewed</a>
                </Link>
              </li>
              <li>
                <Link href="/find-restrooms?sort=top-rated">
                  <a className="text-gray-400 hover:text-white transition">Top Rated</a>
                </Link>
              </li>
              <li>
                <Link href="/find-restrooms?sort=recent">
                  <a className="text-gray-400 hover:text-white transition">Recently Added</a>
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/articles?category=Hygiene%20Tips">
                  <a className="text-gray-400 hover:text-white transition">Hygiene Articles</a>
                </Link>
              </li>
              <li>
                <Link href="/articles?category=Accessibility">
                  <a className="text-gray-400 hover:text-white transition">Accessibility Guide</a>
                </Link>
              </li>
              <li>
                <Link href="/articles">
                  <a className="text-gray-400 hover:text-white transition">Bathroom Etiquette</a>
                </Link>
              </li>
              <li>
                <Link href="/articles">
                  <a className="text-gray-400 hover:text-white transition">Travel Tips</a>
                </Link>
              </li>
              <li>
                <a href="https://injoy.bio" className="text-gray-400 hover:text-white transition" target="_blank" rel="noopener noreferrer">
                  Injoy Bio Products
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about">
                  <a className="text-gray-400 hover:text-white transition">About Us</a>
                </Link>
              </li>
              <li>
                <Link href="/about#mission">
                  <a className="text-gray-400 hover:text-white transition">Our Mission</a>
                </Link>
              </li>
              <li>
                <Link href="/about#contact">
                  <a className="text-gray-400 hover:text-white transition">Contact</a>
                </Link>
              </li>
              <li>
                <Link href="/privacy">
                  <a className="text-gray-400 hover:text-white transition">Privacy Policy</a>
                </Link>
              </li>
              <li>
                <Link href="/terms">
                  <a className="text-gray-400 hover:text-white transition">Terms of Service</a>
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-6 mt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm mb-4 md:mb-0">&copy; {new Date().getFullYear()} Toilette Guilt. All rights reserved.</p>
            <div className="flex items-center">
              <span className="text-gray-500 text-sm mr-2">In partnership with:</span>
              <a href="https://injoy.bio" className="text-primary hover:text-blue-400 font-medium" target="_blank" rel="noopener noreferrer">
                Injoy Bio
              </a>
            </div>
          </div>
        </div>
      </div>
      
      {/* Fixed CTA Button for Mobile */}
      <div className="fixed bottom-4 right-4 md:hidden z-40">
        <a 
          href="https://injoy.bio" 
          className="bg-primary text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:bg-blue-700 transition"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Visit Injoy Bio"
        >
          <i className="fas fa-external-link-alt text-xl"></i>
        </a>
      </div>
    </footer>
  );
};

export default Footer;
