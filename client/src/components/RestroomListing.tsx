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
import { RestroomWithRating } from '@shared/schema';
import { useTranslation } from 'react-i18next';

export interface RestroomListingProps {
  restroom: RestroomWithRating;
}

const RestroomListing: React.FC<RestroomListingProps> = ({ restroom }) => {
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
      <Card className="mb-4 cursor-pointer hover:shadow-md transition-shadow">
        <CardContent className="p-0">
          <div className="flex">
            {/* Image */}
            <div className="w-24 h-24 md:w-32 md:h-32 flex-shrink-0 flex items-center justify-center bg-gray-100 relative overflow-hidden">
              {restroom.imageUrl ? (
                <img 
                  src={restroom.imageUrl} 
                  alt={restroom.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-gray-400 text-4xl">🚽</div>
              )}
            </div>
            
            {/* Content */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{restroom.name}</h3>
                  <p className="text-sm text-gray-500 mb-2">{restroom.address}, {restroom.city}</p>
                </div>
                
                <div className="flex items-center mt-1 md:mt-0 space-x-1">
                  <StarIcon className="h-4 w-4 text-yellow-500" />
                  <span className="font-medium">{restroom.averageRating?.toFixed(1) || t('ratings.noRatings')}</span>
                  <span className="text-gray-500 text-sm">
                    ({restroom.reviewCount || 0} {t('ratings.reviews', { count: restroom.reviewCount || 0 })})
                  </span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-1 mb-2">
                {restroom.freeToUse && 
                  <Badge variant="outline" className="flex items-center gap-1">
                    <BanknoteIcon className="h-3 w-3" />
                    {t('listing.free')}
                  </Badge>
                }
                
                {restroom.customerOnly && 
                  <Badge variant="outline" className="flex items-center gap-1">
                    <UserIcon className="h-3 w-3" />
                    {t('listing.customerOnly')}
                  </Badge>
                }
                
                {restroom.accessibilityFeatures && 
                  <Badge variant="outline" className="flex items-center gap-1">
                    <AccessibilityIcon className="h-3 w-3" />
                    {t('features.accessible')}
                  </Badge>
                }
                
                {restroom.hours?.toLowerCase().includes('24') && 
                  <Badge variant="outline" className="flex items-center gap-1">
                    <ClockIcon className="h-3 w-3" />
                    {t('listing.open24Hours')}
                  </Badge>
                }
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center text-sm text-gray-500">
                  <MapPinIcon className="h-3 w-3 mr-1" />
                  {restroom.distance !== undefined && formatDistance(restroom.distance)}
                </div>
                
                <Badge variant="secondary" className="hover:bg-primary hover:text-primary-foreground">
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
