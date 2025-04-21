import React from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';

const SubmitListing: React.FC = () => {
  const [, setLocation] = useLocation();

  const navigateToSubmitForm = () => {
    setLocation('/submit-listing');
  };

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-3">Help Grow Our Directory</h2>
          <p className="text-gray-600 mb-8">
            Know of a public restroom that's not in our database? Submit it to help others find clean, accessible facilities.
          </p>
          
          <Button 
            className="bg-secondary text-white hover:bg-green-600"
            onClick={navigateToSubmitForm}
          >
            <i className="fas fa-plus-circle mr-2"></i> Submit a New Restroom
          </Button>
        </div>
      </div>
    </section>
  );
};

export default SubmitListing;
