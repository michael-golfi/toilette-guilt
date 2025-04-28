import React from 'react';
import { Link } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  AccessibilityIcon, 
  StarIcon, 
  BanknoteIcon, 
  UserIcon, 
  MapPinIcon,
  ClockIcon 
} from 'lucide-react';
import { PublicBathroomWithRating } from '@shared/schema';
import { useTranslation } from 'react-i18next';

export interface RestroomListingProps {
  restroom: PublicBathroomWithRating;
  accessibilityFeatures?: string[];
  openingHours?: string[];
}

const RestroomListing: React.FC<RestroomListingProps> = ({ 
  restroom,
  accessibilityFeatures = [],
  openingHours = []
}) => {
  const { t } = useTranslation(['restrooms', 'common']);

  // Format distance with units
  const formatDistance = (distance?: number) => {
    if (distance === undefined || distance === null) return t('distance.unknown');
    
    return distance < 1 
      ? t('distance.metersAway', { distance: Math.round(distance * 1000) })
      : t('distance.kilometersAway', { distance: distance.toFixed(1) });
  };

  return (
    <Link href={`/restroom/${restroom.id}`}>
      <Card className="mb-6 cursor-pointer hover:shadow-lg transition-all duration-200 border-0">
        <CardContent className="p-0">
          <div className="flex flex-col md:flex-row">
            {/* Image */}
            <div className="w-full md:w-48 h-48 md:h-auto flex-shrink-0 relative overflow-hidden bg-gray-100">
              {restroom.thumbnail ? (
                <img 
                  src={restroom.thumbnail} 
                  alt={restroom.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-gray-400 text-6xl">🚽</div>
                </div>
              )}
            </div>
            
            {/* Content */}
            <div className="flex-1 p-6">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-gray-900">{restroom.title}</h3>
                  <p className="text-sm text-gray-500 flex items-center">
                    <MapPinIcon className="h-4 w-4 mr-1" />
                    {restroom.address}
                  </p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="flex items-center bg-yellow-50 px-3 py-1 rounded-full">
                    <StarIcon className="h-4 w-4 text-yellow-500" />
                    <span className="ml-1 font-medium text-yellow-700">
                      {restroom.review_rating?.toFixed(1) || t('ratings.noRatings')}
                    </span>
                  </div>
                  <span className="text-gray-500 text-sm">
                    ({restroom.review_count || 0} {t('ratings.reviews', { count: restroom.review_count || 0 })})
                  </span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 my-4">
                {restroom.price_range === 'Free' && 
                  <Badge variant="secondary" className="flex items-center gap-1 bg-green-50 text-green-700 hover:bg-green-100">
                    <BanknoteIcon className="h-3 w-3" />
                    {t('listing.free')}
                  </Badge>
                }
                
                {restroom.price_range === 'Customer Only' && 
                  <Badge variant="secondary" className="flex items-center gap-1 bg-blue-50 text-blue-700 hover:bg-blue-100">
                    <UserIcon className="h-3 w-3" />
                    {t('listing.customerOnly')}
                  </Badge>
                }
                
                {accessibilityFeatures.length > 0 && 
                  <Badge variant="secondary" className="flex items-center gap-1 bg-purple-50 text-purple-700 hover:bg-purple-100">
                    <AccessibilityIcon className="h-3 w-3" />
                    {t('features.accessible')}
                  </Badge>
                }
                
                {openingHours.some(hour => hour.toLowerCase().includes('24')) && 
                  <Badge variant="secondary" className="flex items-center gap-1 bg-orange-50 text-orange-700 hover:bg-orange-100">
                    <ClockIcon className="h-3 w-3" />
                    {t('listing.open24Hours')}
                  </Badge>
                }
              </div>
              
              <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-gray-500">
                  {restroom.distance !== undefined && formatDistance(restroom.distance)}
                </div>
                
                <Badge variant="default" className="bg-primary hover:bg-primary/90">
                  {t('listing.viewDetails')}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default RestroomListing;
