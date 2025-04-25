import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { imageUrls } from '@/lib/imageUrls';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Loader2, MapPin } from 'lucide-react';

const Hero: React.FC = () => {
  const [, setLocation] = useLocation();
  const [searchLocation, setSearchLocation] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const { t } = useTranslation('home');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchLocation.trim()) {
      setLocation(`/find-restrooms?location=${encodeURIComponent(searchLocation)}`);
    } else {
      setLocation('/find-restrooms');
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      // Geolocation is not supported by the browser
      alert(t('hero.geolocationNotSupported', { defaultValue: 'Geolocation is not supported by your browser' }));
      return;
    }

    setIsLocating(true);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        // Success - we have the coordinates
        const { latitude, longitude } = position.coords;
        setIsLocating(false);
        setLocation(`/find-restrooms?latitude=${latitude}&longitude=${longitude}`);
      },
      (error) => {
        // Error getting location
        setIsLocating(false);
        console.error('Error getting location:', error);
        
        let errorMessage = '';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = t('hero.geolocationDenied', { defaultValue: 'Location permission denied' });
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = t('hero.geolocationUnavailable', { defaultValue: 'Location information is unavailable' });
            break;
          case error.TIMEOUT:
            errorMessage = t('hero.geolocationTimeout', { defaultValue: 'Location request timed out' });
            break;
          default:
            errorMessage = t('hero.geolocationError', { defaultValue: 'An unknown error occurred' });
        }
        
        alert(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
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
              className="bg-white rounded-lg shadow-lg p-4 md:p-5" 
              onSubmit={handleSubmit}
            >
              <div className="flex flex-col-reverse md:flex-row gap-3">
                <Button
                  type="button"
                  variant="default"
                  size="icon"
                  className="bg-primary hover:bg-primary/90 text-white rounded-md h-12 min-w-[46px] flex-shrink-0"
                  onClick={handleUseCurrentLocation}
                  disabled={isLocating}
                  title={t('hero.useMyLocation', { defaultValue: 'Use my location' })}
                >
                  {isLocating ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <MapPin className="h-5 w-5" />
                  )}
                </Button>
                
                <div className="flex-1 relative">
                  <div className="flex h-12 w-full">
                    <input 
                      type="text" 
                      placeholder={t('hero.locationPlaceholder')} 
                      className="w-full h-full px-4 rounded-l-md border-0 shadow-none focus:ring-0 bg-gray-50 text-gray-800 text-sm md:text-base" 
                      value={searchLocation}
                      onChange={(e) => setSearchLocation(e.target.value)}
                    />
                    
                    <button 
                      type="submit" 
                      className="bg-secondary text-white px-3 md:px-6 py-3 rounded-r-md rounded-l-none font-medium hover:bg-green-600 transition h-full whitespace-nowrap flex-shrink-0"
                    >
                      {t('hero.cta')}
                    </button>
                  </div>
                </div>
              </div>
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
