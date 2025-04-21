import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { RestroomWithRating } from '@shared/schema';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import Filters, { FilterOptions } from './Filters';
import Map from './Map';
import RestroomListing from './RestroomListing';
import { apiRequest } from '@/lib/queryClient';

interface RestroomDirectoryProps {
  initialLocation?: string;
}

const RestroomDirectory: React.FC<RestroomDirectoryProps> = ({ initialLocation }) => {
  const [sortOption, setSortOption] = useState<string>("nearest");
  const [filteredRestrooms, setFilteredRestrooms] = useState<RestroomWithRating[]>([]);
  const [displayCount, setDisplayCount] = useState<number>(3);
  const [currentFilters, setCurrentFilters] = useState<FilterOptions>({});
  const [coordinates, setCoordinates] = useState<{latitude?: string, longitude?: string}>({});
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Fetch all restrooms
  const { data: restrooms, isLoading } = useQuery<RestroomWithRating[]>({
    queryKey: ['/api/restrooms'],
  });

  // Apply filters when filter state changes
  const applyFilters = async (filters: FilterOptions) => {
    setCurrentFilters(filters);
    
    try {
      const response = await apiRequest('POST', '/api/restrooms/filter', filters);
      const data = await response.json();
      setFilteredRestrooms(sortRestrooms(data, sortOption));
    } catch (error) {
      console.error('Error applying filters:', error);
    }
  };

  // Sort restrooms based on the selected option
  const sortRestrooms = (restroomsToSort: RestroomWithRating[], sortBy: string) => {
    if (!restroomsToSort) return [];
    
    const sorted = [...restroomsToSort];
    
    switch (sortBy) {
      case "highest-rated":
        return sorted.sort((a, b) => b.averageRating - a.averageRating);
      case "most-reviewed":
        return sorted.sort((a, b) => b.reviewCount - a.reviewCount);
      case "nearest":
        return sorted.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
      default:
        return sorted;
    }
  };

  // Handle sort change
  const handleSortChange = (value: string) => {
    setSortOption(value);
    setFilteredRestrooms(sortRestrooms(filteredRestrooms, value));
  };

  // Load more restrooms
  const loadMore = () => {
    setDisplayCount(prev => prev + 3);
  };

  // Handle search input
  const handleSearch = async () => {
    if (searchTerm.trim() === '') {
      // If search is empty, reset to all restrooms
      if (restrooms) {
        setFilteredRestrooms(sortRestrooms(restrooms, sortOption));
      }
      return;
    }
    
    try {
      const response = await apiRequest('GET', `/api/restrooms/search?query=${encodeURIComponent(searchTerm)}`);
      const data = await response.json();
      setFilteredRestrooms(sortRestrooms(data, sortOption));
    } catch (error) {
      console.error('Error searching restrooms:', error);
    }
  };

  // Initialize filteredRestrooms with all restrooms
  useEffect(() => {
    if (restrooms) {
      setFilteredRestrooms(sortRestrooms(restrooms, sortOption));
    }
  }, [restrooms, sortOption]);

  // Get user's location if available
  useEffect(() => {
    if (initialLocation) {
      // This would typically geocode the initialLocation to get coordinates
      // For demo purposes, using mock coordinates
      setCoordinates({
        latitude: "40.7128",
        longitude: "-74.0060"
      });
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoordinates({
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString()
          });
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  }, [initialLocation]);

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Filters and Map Section */}
          <div className="md:w-1/3 lg:w-1/4">
            <Filters onApplyFilters={applyFilters} />
            <Map latitude={coordinates.latitude} longitude={coordinates.longitude} />
            
            {/* Injoy Bio Promo */}
            <Card className="bg-gradient-to-r from-accent to-primary rounded-lg shadow-md">
              <CardContent className="p-5">
                <h3 className="font-semibold text-lg text-white mb-2">Discover Injoy Bio</h3>
                <p className="text-white text-sm mb-4 opacity-90">
                  Premium hygiene products for your personal comfort and wellness.
                </p>
                <Button 
                  asChild
                  className="w-full bg-white text-primary hover:bg-gray-100"
                >
                  <a 
                    href="https://injoy.bio" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    Learn More
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
          
          {/* Listings Section */}
          <div className="md:w-2/3 lg:w-3/4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
              <h2 className="text-2xl font-bold mb-2 sm:mb-0">Public Restrooms Near You</h2>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Sort by:</label>
                <Select defaultValue={sortOption} onValueChange={handleSortChange}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nearest">Nearest</SelectItem>
                    <SelectItem value="highest-rated">Highest Rated</SelectItem>
                    <SelectItem value="most-reviewed">Most Reviewed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Search Box */}
            <div className="relative mb-8">
              <div className="flex">
                <div className="relative flex-grow">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input 
                    type="text"
                    placeholder="Search by city, address or name..." 
                    className="pl-10 pr-24"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSearch();
                      }
                    }}
                  />
                </div>
                <Button 
                  onClick={handleSearch}
                  className="ml-2 bg-primary text-white"
                >
                  Search
                </Button>
              </div>
            </div>
            
            {isLoading ? (
              // Loading skeleton
              Array.from({ length: 3 }).map((_, index) => (
                <Card key={index} className="overflow-hidden mb-6">
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-1/3 lg:w-1/4">
                      <div className="h-48 bg-gray-200 animate-pulse"></div>
                    </div>
                    <div className="p-5 flex-1">
                      <div className="h-6 w-48 bg-gray-200 animate-pulse rounded mb-2"></div>
                      <div className="h-4 w-32 bg-gray-200 animate-pulse rounded mb-4"></div>
                      <div className="flex flex-wrap gap-2 my-3">
                        <div className="h-5 w-20 bg-gray-200 animate-pulse rounded-full"></div>
                        <div className="h-5 w-24 bg-gray-200 animate-pulse rounded-full"></div>
                      </div>
                      <div className="h-16 bg-gray-200 animate-pulse rounded mb-4"></div>
                      <div className="flex justify-between">
                        <div className="h-5 w-32 bg-gray-200 animate-pulse rounded"></div>
                        <div className="h-5 w-24 bg-gray-200 animate-pulse rounded"></div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            ) : filteredRestrooms.length > 0 ? (
              // Display restrooms
              <>
                {filteredRestrooms.slice(0, displayCount).map((restroom) => (
                  <RestroomListing key={restroom.id} restroom={restroom} />
                ))}
                
                {/* Load More Button */}
                {displayCount < filteredRestrooms.length && (
                  <div className="text-center mt-6">
                    <Button 
                      onClick={loadMore}
                      className="bg-primary text-white hover:bg-primary/80"
                    >
                      Load More Restrooms
                    </Button>
                  </div>
                )}
              </>
            ) : (
              // No results
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-6xl mb-4">
                    <i className="fas fa-toilet text-gray-300"></i>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No Restrooms Found</h3>
                  <p className="text-gray-600">
                    We couldn't find any restrooms matching your criteria. Try adjusting your filters or adding a new listing.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default RestroomDirectory;
