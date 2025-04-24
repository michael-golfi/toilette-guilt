import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';

interface MapProps {
  latitude?: string;
  longitude?: string;
}

const Map: React.FC<MapProps> = ({ latitude, longitude }) => {
  const { t } = useTranslation('restrooms');

  return (
    <Card>
      <CardContent className="p-5">
        <h3 className="font-semibold text-lg mb-4">{t('map.title')}</h3>
        <div className="bg-gray-200 rounded-lg h-64 flex items-center justify-center text-center">
          <div className="text-gray-500 text-sm px-4">
            <p>{t('map.placeholder.interactiveMap')}</p>
            <p className="mt-2">
              {t('map.placeholder.usingCoordinates')}
              {latitude ? `${latitude}, ${longitude}` : t('map.placeholder.currentLocation')}
            </p>
            <p className="mt-4 text-xs text-gray-400">
              {t('map.placeholder.disclaimer')}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Map;
