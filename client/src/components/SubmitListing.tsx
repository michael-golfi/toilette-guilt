import React from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

const SubmitListing: React.FC = () => {
  const [, setLocation] = useLocation();
  const { t } = useTranslation('home');

  const navigateToSubmitForm = () => {
    setLocation('/submit-listing');
  };

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-3">{t('submitListing.title')}</h2>
          <p className="text-gray-600 mb-8">
            {t('submitListing.description')}
          </p>
          
          <Button 
            className="bg-secondary text-white hover:bg-green-600"
            onClick={navigateToSubmitForm}
          >
            <i className="fas fa-plus-circle mr-2"></i> {t('submitListing.button')}
          </Button>
        </div>
      </div>
    </section>
  );
};

export default SubmitListing;
