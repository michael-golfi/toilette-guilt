import React from 'react';
import { useLocation } from 'wouter';
import { Card } from '@/components/ui/card';
import { type RestroomWithRating } from '@shared/schema';

interface RestroomListingProps {
  restroom: RestroomWithRating;
}

const RestroomListing: React.FC<RestroomListingProps> = ({ restroom }) => {
  const [, setLocation] = useLocation();

  const formatDistance = (distance?: number) => {
    if (distance === undefined) return '';
    
    // Round to 1 decimal place
    const rounded = Math.round(distance * 10) / 10;
    return `${rounded} miles away`;
  };

  const navigateToDetail = () => {
    setLocation(`/restroom/${restroom.id}`);
  };

  return (
    <Card className="overflow-hidden mb-6">
      <div className="flex flex-col md:flex-row">
        <div className="md:w-1/3 lg:w-1/4">
          <img 
            src={restroom.imageUrl || "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80"} 
            alt={restroom.name} 
            className="h-48 w-full object-cover"
          />
        </div>
        
        <div className="p-5 flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-semibold mb-1">{restroom.name}</h3>
              <p className="text-gray-600 text-sm mb-2">
                {restroom.address}, {restroom.city}, {restroom.state}
              </p>
            </div>
            <div className="flex flex-col items-end">
              <div className="flex items-center mb-1">
                <span className="text-yellow-500 mr-1"><i className="fas fa-star"></i></span>
                <span className="font-medium">{restroom.averageRating.toFixed(1)}</span>
                <span className="text-gray-600 text-sm ml-1">({restroom.reviewCount} reviews)</span>
              </div>
              {restroom.distance !== undefined && (
                <span className="text-sm text-gray-600">{formatDistance(restroom.distance)}</span>
              )}
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 my-3">
            {restroom.accessibilityFeatures && (
              <span className="feature-tag feature-tag-accessibility">Accessibility Features</span>
            )}
            {restroom.babyChanging && (
              <span className="feature-tag feature-tag-baby-changing">Baby Changing</span>
            )}
            {restroom.genderNeutral && (
              <span className="feature-tag feature-tag-gender-neutral">Gender Neutral</span>
            )}
            {restroom.freeToUse && (
              <span className="feature-tag feature-tag-free">Free</span>
            )}
            {restroom.changingRoom && (
              <span className="feature-tag feature-tag-changing-room">Changing Room</span>
            )}
            {restroom.customerOnly && (
              <span className="feature-tag feature-tag-customer-only">Customers Only</span>
            )}
            {restroom.singleOccupancy && (
              <span className="feature-tag feature-tag-single-occupancy">Single Occupancy</span>
            )}
          </div>
          
          <p className="text-gray-700 text-sm mb-4">{restroom.description}</p>
          
          <div className="flex flex-wrap justify-between items-center">
            <div className="flex flex-wrap gap-3">
              <span className="inline-flex items-center text-sm text-gray-700">
                <i className="fas fa-clock text-gray-500 mr-1"></i> {restroom.hours}
              </span>
              
              {restroom.soapAvailable && (
                <span className="inline-flex items-center text-sm text-gray-700">
                  <i className="fas fa-soap text-gray-500 mr-1"></i> Soap Available
                </span>
              )}
              
              {restroom.wellStocked && (
                <span className="inline-flex items-center text-sm text-gray-700">
                  <i className="fas fa-toilet-paper text-gray-500 mr-1"></i> Well Stocked
                </span>
              )}
              
              {restroom.codeRequired && (
                <span className="inline-flex items-center text-sm text-gray-700">
                  <i className="fas fa-key text-gray-500 mr-1"></i> Code Required
                </span>
              )}
              
              {restroom.attendantPresent && (
                <span className="inline-flex items-center text-sm text-gray-700">
                  <i className="fas fa-hands-wash text-gray-500 mr-1"></i> Attendant Present
                </span>
              )}
              
              {restroom.familyFriendly && (
                <span className="inline-flex items-center text-sm text-gray-700">
                  <i className="fas fa-baby text-gray-500 mr-1"></i> Family-Friendly
                </span>
              )}
              
              {restroom.premiumProducts && (
                <span className="inline-flex items-center text-sm text-gray-700">
                  <i className="fas fa-hand-sparkles text-gray-500 mr-1"></i> Premium Products
                </span>
              )}
            </div>
            
            <button
              onClick={navigateToDetail}
              className="mt-3 sm:mt-0 inline-flex items-center text-primary hover:text-blue-700 font-medium text-sm"
            >
              View Details <i className="fas fa-chevron-right ml-1"></i>
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default RestroomListing;
