import RestroomDirectory from '@/components/RestroomDirectory';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearch } from 'wouter';

const FindRestrooms: React.FC = () => {
  const search = useSearch();
  const [searchParams, setSearchParams] = useState<URLSearchParams | null>(null);
  const { t } = useTranslation('restrooms');

  useEffect(() => {
    // Parse URL search parameters
    setSearchParams(new URLSearchParams(search));
  }, [search]);

  const locationParam = searchParams?.get('location') || '';
  const latitudeParam = searchParams?.get('latitude');
  const longitudeParam = searchParams?.get('longitude');

  return (
    <>
      <RestroomDirectory
        initialLocation={locationParam}
        initialLatitude={latitudeParam ? parseFloat(latitudeParam) : undefined}
        initialLongitude={longitudeParam ? parseFloat(longitudeParam) : undefined}
      />
    </>
  );
};

export default FindRestrooms;
