import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

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
  const [filters, setFilters] = useState<FilterOptions>({
    // Initialize with undefined values so no filters are applied initially
    accessibilityFeatures: undefined,
    babyChanging: undefined,
    genderNeutral: undefined,
    freeToUse: undefined,
    changingRoom: undefined,
    singleOccupancy: undefined,
    customerOnly: undefined,
    cleanliness: 0, // Set to 0 to not filter by rating initially
    distance: 'Any distance',
  });

  const handleCheckboxChange = (featureName: keyof FilterOptions) => {
    setFilters(prev => ({ 
      ...prev, 
      // Toggle between true and undefined (not false)
      [featureName]: prev[featureName] === true ? undefined : true 
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
      distance: value
    }));
  };

  const handleApplyFilters = () => {
    onApplyFilters(filters);
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-5">
        <h3 className="font-semibold text-lg mb-4">Filters</h3>
        
        <div className="mb-4">
          <Label className="block text-sm font-medium text-gray-700 mb-1">Features</Label>
          <div className="space-y-2">
            <div className="flex items-center">
              <Checkbox 
                id="accessibility" 
                checked={filters.accessibilityFeatures}
                onCheckedChange={() => handleCheckboxChange('accessibilityFeatures')}
              />
              <Label htmlFor="accessibility" className="ml-2 text-sm">Accessibility Features</Label>
            </div>
            
            <div className="flex items-center">
              <Checkbox 
                id="babyChanging" 
                checked={filters.babyChanging}
                onCheckedChange={() => handleCheckboxChange('babyChanging')}
              />
              <Label htmlFor="babyChanging" className="ml-2 text-sm">Baby Changing</Label>
            </div>
            
            <div className="flex items-center">
              <Checkbox 
                id="genderNeutral" 
                checked={filters.genderNeutral}
                onCheckedChange={() => handleCheckboxChange('genderNeutral')}
              />
              <Label htmlFor="genderNeutral" className="ml-2 text-sm">Gender Neutral</Label>
            </div>
            
            <div className="flex items-center">
              <Checkbox 
                id="freeToUse" 
                checked={filters.freeToUse}
                onCheckedChange={() => handleCheckboxChange('freeToUse')}
              />
              <Label htmlFor="freeToUse" className="ml-2 text-sm">Free to Use</Label>
            </div>
            
            <div className="flex items-center">
              <Checkbox 
                id="changingRoom" 
                checked={filters.changingRoom}
                onCheckedChange={() => handleCheckboxChange('changingRoom')}
              />
              <Label htmlFor="changingRoom" className="ml-2 text-sm">Changing Room</Label>
            </div>
            
            <div className="flex items-center">
              <Checkbox 
                id="singleOccupancy" 
                checked={filters.singleOccupancy}
                onCheckedChange={() => handleCheckboxChange('singleOccupancy')}
              />
              <Label htmlFor="singleOccupancy" className="ml-2 text-sm">Single Occupancy</Label>
            </div>
            
            <div className="flex items-center">
              <Checkbox 
                id="customerOnly" 
                checked={filters.customerOnly}
                onCheckedChange={() => handleCheckboxChange('customerOnly')}
              />
              <Label htmlFor="customerOnly" className="ml-2 text-sm">Customer Only</Label>
            </div>
          </div>
        </div>
        
        <div className="mb-4">
          <Label htmlFor="cleanliness" className="block text-sm font-medium text-gray-700 mb-1">
            Cleanliness Rating
          </Label>
          <div className="flex items-center">
            <div className="w-full mr-3">
              <Slider 
                id="cleanliness"
                min={1} 
                max={5} 
                step={1} 
                defaultValue={[filters.cleanliness || 3]}
                onValueChange={handleCleanlinessChange}
              />
            </div>
            <span className="text-sm font-medium text-gray-600">{filters.cleanliness}+</span>
          </div>
        </div>
        
        <div className="mb-4">
          <Label htmlFor="distance" className="block text-sm font-medium text-gray-700 mb-1">Distance</Label>
          <Select 
            defaultValue={filters.distance} 
            onValueChange={handleDistanceChange}
          >
            <SelectTrigger id="distance" className="w-full">
              <SelectValue placeholder="Select distance" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Any distance">Any distance</SelectItem>
              <SelectItem value="Within 0.5 miles">Within 0.5 miles</SelectItem>
              <SelectItem value="Within 1 mile">Within 1 mile</SelectItem>
              <SelectItem value="Within 2 miles">Within 2 miles</SelectItem>
              <SelectItem value="Within 5 miles">Within 5 miles</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button 
          className="w-full bg-primary text-white" 
          onClick={handleApplyFilters}
        >
          Apply Filters
        </Button>
      </CardContent>
    </Card>
  );
};

export default Filters;
