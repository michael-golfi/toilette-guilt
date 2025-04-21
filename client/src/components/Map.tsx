import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface MapProps {
  latitude?: string;
  longitude?: string;
}

const Map: React.FC<MapProps> = ({ latitude, longitude }) => {
  return (
    <Card>
      <CardContent className="p-5">
        <h3 className="font-semibold text-lg mb-4">Restrooms Near You</h3>
        <div className="bg-gray-200 rounded-lg h-64 flex items-center justify-center text-center">
          <div className="text-gray-500 text-sm px-4">
            <p>Interactive map would display here.</p>
            <p className="mt-2">Using coordinates: {latitude ? `${latitude}, ${longitude}` : "Current location"}</p>
            <p className="mt-4 text-xs text-gray-400">
              In a production environment, this would integrate with Google Maps or a similar mapping service.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Map;
