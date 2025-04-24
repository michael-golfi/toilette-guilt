import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';

const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [location] = useLocation();
  const { t } = useTranslation('common');

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
              <span className="font-bold text-xl md:text-2xl text-gray-800">{t('brandName', { defaultValue: 'Toilette Guilt' })}</span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-6">
            <Link href="/find-restrooms">
              <a className={`text-gray-600 hover:text-primary font-medium ${location === '/find-restrooms' ? 'text-primary' : ''}`}>
                {t('navigation.findRestrooms')}
              </a>
            </Link>
            <Link href="/articles">
              <a className={`text-gray-600 hover:text-primary font-medium ${location === '/articles' ? 'text-primary' : ''}`}>
                {t('navigation.articles')}
              </a>
            </Link>
            <Link href="/submit-listing">
              <a className={`text-gray-600 hover:text-primary font-medium ${location === '/submit-listing' ? 'text-primary' : ''}`}>
                {t('navigation.submitListing')}
              </a>
            </Link>
            <Link href="/about">
              <a className={`text-gray-600 hover:text-primary font-medium ${location === '/about' ? 'text-primary' : ''}`}>
                {t('navigation.about')}
              </a>
            </Link>
          </nav>
          
          <div className="flex items-center space-x-4">
            <LanguageSwitcher />
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleMobileMenu} 
              className="md:hidden text-gray-500 hover:text-gray-700"
              aria-label={t('header.toggleMenuAriaLabel', { defaultValue: 'Toggle navigation menu' })}
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
                  {t('navigation.findRestrooms')}
                </a>
              </Link>
              <Link href="/articles">
                <a 
                  className={`text-gray-600 hover:text-primary font-medium px-2 py-1 ${location === '/articles' ? 'text-primary' : ''}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {t('navigation.articles')}
                </a>
              </Link>
              <Link href="/submit-listing">
                <a 
                  className={`text-gray-600 hover:text-primary font-medium px-2 py-1 ${location === '/submit-listing' ? 'text-primary' : ''}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {t('navigation.submitListing')}
                </a>
              </Link>
              <Link href="/about">
                <a 
                  className={`text-gray-600 hover:text-primary font-medium px-2 py-1 ${location === '/about' ? 'text-primary' : ''}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {t('navigation.about')}
                </a>
              </Link>
              <div className="px-2 py-1">
                <LanguageSwitcher />
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
