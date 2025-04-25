import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useTranslation } from 'react-i18next';

export interface FilterOptions {
  accessibilityFeatures?: boolean;
  babyChanging?: boolean;
  genderNeutral?: boolean;
  freeToUse?: boolean;
  changingRoom?: boolean;
  singleOccupancy?: boolean;
  customerOnly?: boolean;
  cleanliness?: number;
  distance?: string;
}

interface FiltersProps {
  onApplyFilters: (filters: FilterOptions) => void;
}

const Filters: React.FC<FiltersProps> = ({ onApplyFilters }) => {
  const { t } = useTranslation('restrooms');
  
  // Define distance options mapping internal values to translation keys
  const distanceOptions = {
    'any': t('filters.distanceOptions.any'),
    '0.5': t('filters.distanceOptions.halfMile'),
    '1': t('filters.distanceOptions.oneMile'),
    '2': t('filters.distanceOptions.twoMiles'),
    '5': t('filters.distanceOptions.fiveMiles'),
  };

  const [filters, setFilters] = useState<FilterOptions>({
    accessibilityFeatures: false,
    babyChanging: false,
    genderNeutral: false,
    freeToUse: false,
    changingRoom: false,
    singleOccupancy: false,
    customerOnly: false,
    cleanliness: 0, // 0 means no minimum cleanliness filter
    distance: 'any', // Use 'any' as the initial internal value
  });

  const handleCheckboxChange = (featureName: keyof Omit<FilterOptions, 'cleanliness' | 'distance'>) => {
    setFilters(prev => ({
      ...prev,
      [featureName]: !prev[featureName] // Simplified toggle
    }));
  };

  const handleCleanlinessChange = (value: number[]) => {
    setFilters(prev => ({
      ...prev,
      cleanliness: value[0]
    }));
  };

  const handleDistanceChange = (value: string) => {
    setFilters(prev => ({
      ...prev,
      distance: value // Store the internal value ('any', '0.5', '1', etc.)
    }));
  };

  const handleApplyFilters = () => {
    // Construct filters to send, potentially converting distance if API expects numbers
    const filtersToSend: Record<string, any> = { ...filters };
    if (filters.distance === 'any') {
       delete filtersToSend.distance; // Don't send distance if 'any'
    }
     if (filters.cleanliness === 0) {
        delete filtersToSend.cleanliness; // Don't send cleanliness if 0
    }
    // Send only true boolean filters
    Object.keys(filtersToSend).forEach(key => {
        if (typeof filtersToSend[key] === 'boolean' && !filtersToSend[key]) {
            delete filtersToSend[key];
        }
    });

    onApplyFilters(filtersToSend);
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-5">
        <h3 className="font-semibold text-lg mb-4">{t('filters.title')}</h3>

        <div className="mb-4">
          <Label className="block text-sm font-medium text-gray-700 mb-1">{t('filters.features')}</Label> 
          <div className="space-y-2">
            {/* Accessibility */}
            <div className="flex items-center">
              <Checkbox
                id="accessibility"
                checked={!!filters.accessibilityFeatures}
                onCheckedChange={() => handleCheckboxChange('accessibilityFeatures')}
              />
              <Label htmlFor="accessibility" className="ml-2 text-sm font-normal">{t('filters.wheelchairAccessible')}</Label>
            </div>
          </div>
        </div>

        {/* Cleanliness Slider */}
        <div className="mb-4">
          <Label htmlFor="cleanliness" className="block text-sm font-medium text-gray-700 mb-1">
            {t('filters.minCleanliness')} 
          </Label>
          <div className="flex items-center">
            <Slider
              id="cleanliness"
              min={0} // Allow 0 for "any rating"
              max={5}
              step={1}
              value={[filters.cleanliness ?? 0]}
              onValueChange={handleCleanlinessChange}
              className="mr-3"
            />
            <span className="text-sm font-medium text-gray-600 w-12 text-right">
              {filters.cleanliness === 0 ? t('filters.anyRating') : `${filters.cleanliness}+`}
            </span>
          </div>
        </div>

        {/* Distance Select */}
        <div className="mb-4">
          <Label htmlFor="distance" className="block text-sm font-medium text-gray-700 mb-1">{t('filters.distance')}</Label>
          <Select
            value={filters.distance} // Controlled component using internal value
            onValueChange={handleDistanceChange}
          >
            <SelectTrigger id="distance" className="w-full">
              <SelectValue placeholder={t('filters.selectDistancePlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(distanceOptions).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Apply Button */}
        <Button
          className="w-full bg-primary text-white"
          onClick={handleApplyFilters}
        >
          {t('filters.apply')}
        </Button>
      </CardContent>
    </Card>
  );
};

export default Filters;
