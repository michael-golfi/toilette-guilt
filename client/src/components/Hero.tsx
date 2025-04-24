import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { imageUrls } from '@/lib/imageUrls';
import { useTranslation } from 'react-i18next';

const Hero: React.FC = () => {
  const [, setLocation] = useLocation();
  const [searchLocation, setSearchLocation] = useState('');
  const { t } = useTranslation('home');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchLocation.trim()) {
      setLocation(`/find-restrooms?location=${encodeURIComponent(searchLocation)}`);
    } else {
      setLocation('/find-restrooms');
    }
  };

  return (
    <section className="relative bg-primary text-white overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-primary opacity-90"></div>
      
      <div className="container mx-auto px-4 py-12 md:py-20 relative z-10">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-8 md:mb-0">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
              {t('hero.title')}
            </h1>
            <p className="text-lg md:text-xl opacity-90 mb-8">
              {t('hero.subtitle')}
            </p>
            
            <form 
              className="bg-white rounded-lg shadow-lg p-4 flex flex-col md:flex-row items-center" 
              onSubmit={handleSubmit}
            >
              <div className="flex-1 mb-3 md:mb-0 w-full">
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder={t('hero.locationPlaceholder')} 
                    className="w-full py-3 px-4 pr-10 rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary bg-gray-50 text-gray-800" 
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                  />
                  <i className="fas fa-map-marker-alt absolute right-3 top-3.5 text-gray-400"></i>
                </div>
              </div>
              <button 
                type="submit" 
                className="bg-secondary text-white px-6 py-3 rounded-md font-medium hover:bg-green-600 transition w-full md:w-auto md:ml-3"
              >
                {t('hero.cta')}
              </button>
            </form>
            
            <div className="mt-6 flex flex-wrap gap-3">
              <span className="inline-flex items-center bg-white bg-opacity-20 text-sm px-3 py-1 rounded-full">
                <i className="fas fa-star-half-alt mr-2"></i> {t('hero.badgeReviews')}
              </span>
              <span className="inline-flex items-center bg-white bg-opacity-20 text-sm px-3 py-1 rounded-full">
                <i className="fas fa-toilet mr-2"></i> {t('hero.badgeRestrooms')}
              </span>
              <span className="inline-flex items-center bg-white bg-opacity-20 text-sm px-3 py-1 rounded-full">
                <i className="fas fa-users mr-2"></i> {t('hero.badgeCommunity')}
              </span>
            </div>
          </div>
          
          <div className="md:w-1/2 md:pl-12">
            <img 
              src={imageUrls.hero} 
              alt={t('hero.imageAlt')} 
              className="rounded-lg shadow-lg w-full h-auto"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
