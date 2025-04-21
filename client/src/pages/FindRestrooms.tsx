import React, { useEffect, useState } from 'react';
import { useLocation, useSearch } from 'wouter';
import RestroomDirectory from '@/components/RestroomDirectory';

const FindRestrooms: React.FC = () => {
  const [location] = useLocation();
  const search = useSearch();
  const [searchParams, setSearchParams] = useState<URLSearchParams | null>(null);

  useEffect(() => {
    // Parse URL search parameters
    setSearchParams(new URLSearchParams(search));
  }, [search]);

  const locationParam = searchParams?.get('location') || '';

  return (
    <div className="pt-8 pb-16">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto mb-8">
          <h1 className="text-3xl font-bold mb-4">Find Public Restrooms</h1>
          {locationParam ? (
            <p className="text-gray-600">
              Showing results near <span className="font-medium">{locationParam}</span>
            </p>
          ) : (
            <p className="text-gray-600">
              Browse our directory of clean, accessible public restrooms
            </p>
          )}
        </div>
      </div>
      
      <RestroomDirectory initialLocation={locationParam} />
    </div>
  );
};

export default FindRestrooms;
