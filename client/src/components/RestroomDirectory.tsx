import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiRequest } from '@/lib/queryClient';
import { PublicBathroomWithRating } from '@shared/schema';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Filters, { FilterOptions } from './Filters';
import Map from './Map';
import RestroomListing from './RestroomListing';

interface RestroomDirectoryProps {
  initialLocation?: string;
  initialLatitude?: number;
  initialLongitude?: number;
}

const RestroomDirectory: React.FC<RestroomDirectoryProps> = ({
  initialLocation,
  initialLatitude,
  initialLongitude
}) => {
  const { t } = useTranslation(['restrooms', 'common']);
  const [sortOption, setSortOption] = useState<string>("nearest");
  const [filteredRestrooms, setFilteredRestrooms] = useState<PublicBathroomWithRating[]>([]);
  const [displayCount, setDisplayCount] = useState<number>(3);
  const [currentFilters, setCurrentFilters] = useState<FilterOptions>({
    accessibilityFeatures: false,
    babyChanging: false,
    genderNeutral: false,
    freeToUse: false,
    changingRoom: false,
    singleOccupancy: false,
    customerOnly: false,
    cleanliness: 0,
    distance: 'any'
  });
  const [coordinates, setCoordinates] = useState<{ latitude?: number, longitude?: number }>({});
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [maxDistance, setMaxDistance] = useState(5);
  const [showFreeOnly, setShowFreeOnly] = useState(false);
  const [showAccessibleOnly, setShowAccessibleOnly] = useState(false);
  const [show24HoursOnly, setShow24HoursOnly] = useState(false);

  // Fetch filtered nearby restrooms
  const { data: restrooms, isLoading, refetch: refetchRestrooms } = useQuery<PublicBathroomWithRating[]>({
    queryKey: ['/api/restrooms/nearby', coordinates.latitude, coordinates.longitude, currentFilters],
    queryFn: async () => {
      if (!coordinates.latitude || !coordinates.longitude) return [];

      // Build nearby URL with filters
      let nearbyUrl = `/api/restrooms/nearby?latitude=${coordinates.latitude}&longitude=${coordinates.longitude}`;

      // Add filters if they exist
      if (currentFilters.accessibilityFeatures) {
        nearbyUrl += '&wheelchairAccessible=true';
      }

      if (currentFilters.distance && currentFilters.distance !== 'any') {
        nearbyUrl += `&radius=${currentFilters.distance}`;
      }

      if (currentFilters.cleanliness) {
        nearbyUrl += `&minRating=${currentFilters.cleanliness}`;
      }

      const response = await apiRequest('GET', nearbyUrl);
      const data = await response.json();
      return data.map((restroom: any) => ({
        ...restroom,
        review_rating: parseFloat(restroom.review_rating) || 0,
        review_count: parseInt(restroom.review_count) || 0
      }));
    },
    enabled: !!coordinates.latitude && !!coordinates.longitude
  });

  const { data: accessibilityFeatures } = useQuery<Record<string, string[]>>({
    queryKey: ['accessibilityFeatures'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/restrooms/accessibility-features');
      return response.json();
    },
  });

  const { data: openingHours } = useQuery<Record<string, string[]>>({
    queryKey: ['openingHours'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/restrooms/opening-hours');
      return response.json();
    },
  });

  // Apply filters when filter state changes
  const applyFilters = async (filters: FilterOptions) => {
    setCurrentFilters(filters);
    setIsSearching(true);

    try {
      const response = await apiRequest('POST', '/api/restrooms/filter', filters);
      const data = await response.json();
      setFilteredRestrooms(sortRestrooms(data, sortOption));
    } catch (error) {
      console.error('Error applying filters:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Sort restrooms based on the selected option
  const sortRestrooms = (restroomsToSort: PublicBathroomWithRating[], sortBy: string) => {
    if (!restroomsToSort) return [];

    const sorted = [...restroomsToSort];

    switch (sortBy) {
      case "highest-rated":
        return sorted.sort((a, b) => b.review_rating - a.review_rating);
      case "most-reviewed":
        return sorted.sort((a, b) => b.review_count - a.review_count);
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
    setIsSearching(true);

    try {
      if (searchTerm.trim() === '') {
        // If search is empty, reset to all restrooms
        if (restrooms) {
          setFilteredRestrooms(sortRestrooms(restrooms, sortOption));
        }
        return;
      }

      // Add location to search if available
      let searchUrl = `/api/restrooms/search?query=${encodeURIComponent(searchTerm)}`;

      if (coordinates.latitude && coordinates.longitude) {
        searchUrl += `&latitude=${coordinates.latitude}&longitude=${coordinates.longitude}`;
      }

      // Add any active filters
      if (currentFilters.accessibilityFeatures) {
        searchUrl += '&wheelchairAccessible=true';
      }

      if (currentFilters.cleanliness) {
        searchUrl += `&minRating=${currentFilters.cleanliness}`;
      }

      const response = await apiRequest('GET', searchUrl);
      const data = await response.json();
      setFilteredRestrooms(sortRestrooms(data, sortOption));
    } catch (error) {
      console.error('Error searching restrooms:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Fetch nearby restrooms when coordinates change
  useEffect(() => {
    if (coordinates.latitude && coordinates.longitude) {
      const fetchNearbyRestrooms = async () => {
        setIsSearching(true);
        try {
          const response = await apiRequest(
            'GET',
            `/api/restrooms/nearby?latitude=${coordinates.latitude}&longitude=${coordinates.longitude}&limit=20`
          );
          const data = await response.json();
          setFilteredRestrooms(sortRestrooms(data, sortOption));
        } catch (error) {
          console.error('Error fetching nearby restrooms:', error);
        } finally {
          setIsSearching(false);
        }
      };

      fetchNearbyRestrooms();
    }
  }, [coordinates, sortOption]);

  // Initialize filteredRestrooms with all restrooms
  useEffect(() => {
    if (restrooms) {
      setFilteredRestrooms(sortRestrooms(restrooms, sortOption));
    }
  }, [restrooms, sortOption]);

  // Get user's location if available
  useEffect(() => {
    // Check if we have initial coordinates from URL params
    if (initialLatitude && initialLongitude) {
      setCoordinates({
        latitude: initialLatitude,
        longitude: initialLongitude
      });
    }
    // Otherwise check if we have a location name to geocode
    else if (initialLocation) {
      // This would typically geocode the initialLocation to get coordinates
      // For demo purposes, using mock coordinates
      setCoordinates({
        latitude: 40.7128,
        longitude: -74.0060
      });
    }
    // If no location info provided, try to get user's current location
    else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoordinates({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  }, [initialLocation, initialLatitude, initialLongitude]);

  const filteredRestroomsMemo = React.useMemo(() => {
    if (!restrooms) return [];

    return restrooms
      .filter(restroom => {
        if (showFreeOnly && restroom.price_range !== 'Free') return false;
        if (showAccessibleOnly && !accessibilityFeatures?.[restroom.id]?.length) return false;
        if (show24HoursOnly && !openingHours?.[restroom.id]?.some(hour => hour.toLowerCase().includes('24'))) return false;
        if (searchTerm && !restroom.title.toLowerCase().includes(searchTerm.toLowerCase())) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortOption === "nearest") {
          return (a.distance || Infinity) - (b.distance || Infinity);
        }
        return (b.review_rating || 0) - (a.review_rating || 0);
      });
  }, [restrooms, searchTerm, sortOption, showFreeOnly, showAccessibleOnly, show24HoursOnly, accessibilityFeatures, openingHours]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Side Panel */}
          <div className="w-full md:w-64 space-y-6">
            <Filters onApplyFilters={applyFilters} />
            {/* <Map latitude={coordinates.latitude} longitude={coordinates.longitude} /> */}
          </div>

          {/* Loading Content */}
          <div className="flex-1">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex flex-col md:flex-row gap-4 p-6 bg-white rounded-lg shadow">
                    <div className="w-full md:w-48 h-48 bg-gray-200 rounded-lg"></div>
                    <div className="flex-1 space-y-4">
                      <div className="h-6 w-3/4 bg-gray-200 rounded"></div>
                      <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
                      <div className="flex gap-2">
                        <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
                        <div className="h-6 w-24 bg-gray-200 rounded-full"></div>
                      </div>
                      <div className="h-4 w-1/4 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Filters and Map Section */}
          <div className="md:w-1/3 lg:w-1/4">
            <Filters onApplyFilters={applyFilters} />
            {/* <Map latitude={coordinates.latitude} longitude={coordinates.longitude} /> */}
          </div>

          {/* Listings Section */}
          <div className="md:w-2/3 lg:w-3/4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
              <h2 className="text-2xl font-bold mb-2 sm:mb-0">{t('directory.title', { ns: 'restrooms' })}</h2>

              <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full sm:w-auto">
                {/* Sort Dropdown */}
                <div className="flex items-center gap-2">
                  <label htmlFor="sort-select" className="text-sm font-medium text-gray-700">{t('directory.sortByLabel', { defaultValue: 'Sort by:' })}</label>
                  <Select defaultValue={sortOption} onValueChange={handleSortChange}>
                    <SelectTrigger id="sort-select" className="w-[140px]">
                      <SelectValue placeholder={t('directory.sortBy')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nearest">{t('directory.sortOptions.nearest')}</SelectItem>
                      <SelectItem value="highest-rated">{t('directory.sortOptions.highestRated')}</SelectItem>
                      <SelectItem value="most-reviewed">{t('directory.sortOptions.mostReviewed')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Search Box */}
            <div className="relative mb-8">
              <div className="flex">
                <div className="relative flex-grow">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder={t('directory.searchPlaceholder', { ns: 'restrooms' })}
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
                  {t('directory.searchButton', { ns: 'restrooms' })}
                </Button>
              </div>
            </div>

            {isLoading || isSearching ? (
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
            ) : filteredRestroomsMemo.length > 0 ? (
              // Display restrooms
              <>
                {filteredRestroomsMemo.slice(0, displayCount).map((restroom) => (
                  <RestroomListing
                    key={restroom.id}
                    restroom={restroom}
                    accessibilityFeatures={accessibilityFeatures?.[restroom.id] || []}
                    openingHours={openingHours?.[restroom.id] || []}
                  />
                ))}

                {/* Load More Button */}
                {displayCount < filteredRestroomsMemo.length && (
                  <div className="text-center mt-6">
                    <Button
                      onClick={loadMore}
                      className="bg-primary text-white hover:bg-primary/80"
                    >
                      {t('buttons.loadMore', { ns: 'common' })}
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
                  <h3 className="text-xl font-bold mb-2">{t('directory.noResults', { ns: 'restrooms' })}</h3>
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
