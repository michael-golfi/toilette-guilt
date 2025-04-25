import FeaturedArticles from '@/components/FeaturedArticles';
import Hero from '@/components/Hero';
import UserTestimonials from '@/components/UserTestimonials';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';

const Home: React.FC = () => {
  const [, setLocation] = useLocation();
  const { t } = useTranslation('home');

  const navigateToFindRestrooms = () => {
    setLocation('/find-restrooms');
  };

  return (
    <>
      <Hero />

      {/* Top Restrooms CTA Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
            <div className="text-center p-6 border border-gray-100 rounded-lg shadow-sm bg-gray-50">
              <div className="w-16 h-16 bg-blue-100 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-map-marker-alt text-2xl"></i>
              </div>
              <h3 className="text-xl font-semibold mb-2">{t('features.location.title', { defaultValue: 'Location-Based Search' })}</h3>
              <p className="text-gray-600">{t('features.location.description', { defaultValue: 'Find the nearest restrooms based on your current location or any address you enter.' })}</p>
            </div>

            <div className="text-center p-6 border border-gray-100 rounded-lg shadow-sm bg-gray-50">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-star text-2xl"></i>
              </div>
              <h3 className="text-xl font-semibold mb-2">{t('features.ratings.title', { defaultValue: 'User Ratings & Reviews' })}</h3>
              <p className="text-gray-600">{t('features.ratings.description', { defaultValue: 'See what others think about restroom cleanliness, accessibility, and overall quality.' })}</p>
            </div>

            <div className="text-center p-6 border border-gray-100 rounded-lg shadow-sm bg-gray-50">
              <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-filter text-2xl"></i>
              </div>
              <h3 className="text-xl font-semibold mb-2">{t('features.filters.title', { defaultValue: 'Advanced Filters' })}</h3>
              <p className="text-gray-600">{t('features.filters.description', { defaultValue: 'Filter by accessibility features, cleanliness ratings, and more to find exactly what you need.' })}</p>
            </div>
          </div>
        </div>
      </section>

      <UserTestimonials />
      <FeaturedArticles />
    </>
  );
};

export default Home;
