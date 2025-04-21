import React, { useState } from 'react';
import { useRoute, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, Clock, MapPin, Star } from 'lucide-react';
import { RestroomWithRating, Review } from '@shared/schema';
import { apiRequest, queryClient } from '@/lib/queryClient';
import Map from '@/components/Map';

const RestroomDetail: React.FC = () => {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute<{ id: string }>('/restroom/:id');
  const [reviewText, setReviewText] = useState('');
  const [selectedRating, setSelectedRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const restroomId = match ? parseInt(params.id) : -1;

  // Fetch restroom details
  const { data: restroom, isLoading, error } = useQuery<RestroomWithRating>({
    queryKey: [`/api/restrooms/${restroomId}`],
    enabled: restroomId > 0,
  });

  // Fetch reviews for this restroom
  const { data: reviews, isLoading: isLoadingReviews } = useQuery<Review[]>({
    queryKey: [`/api/restrooms/${restroomId}/reviews`],
    enabled: restroomId > 0,
  });

  // Handle submitting a new review
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewText.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      // In a real app, the userId would come from auth context
      // Using 1 as a placeholder for the admin user
      await apiRequest('POST', '/api/reviews', {
        restroomId,
        userId: 1,
        rating: selectedRating,
        comment: reviewText
      });
      
      // Reset form and invalidate queries to refresh data
      setReviewText('');
      setSelectedRating(5);
      queryClient.invalidateQueries({ queryKey: [`/api/restrooms/${restroomId}/reviews`] });
      queryClient.invalidateQueries({ queryKey: [`/api/restrooms/${restroomId}`] });
      
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render stars for a given rating
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`h-5 w-5 ${
          i < rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'
        }`}
      />
    ));
  };

  // Select star rating
  const handleRatingClick = (rating: number) => {
    setSelectedRating(rating);
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
            <h1 className="text-2xl font-bold mb-2">Restroom Not Found</h1>
            <p className="text-gray-600 mb-6">The restroom you're looking for might have been removed or doesn't exist.</p>
            <Button onClick={() => setLocation('/find-restrooms')}>
              Browse Other Restrooms
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 w-64 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 w-32 bg-gray-200 rounded mb-8"></div>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-2/3">
              <div className="h-80 bg-gray-200 rounded-lg mb-6"></div>
              <div className="h-4 w-full bg-gray-200 rounded mb-3"></div>
              <div className="h-4 w-full bg-gray-200 rounded mb-3"></div>
              <div className="h-4 w-3/4 bg-gray-200 rounded mb-6"></div>
            </div>
            <div className="md:w-1/3">
              <div className="h-64 bg-gray-200 rounded-lg mb-6"></div>
              <div className="h-40 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!restroom) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          className="mb-4"
          onClick={() => setLocation('/find-restrooms')}
        >
          <i className="fas fa-arrow-left mr-2"></i> Back to Results
        </Button>
        
        <h1 className="text-3xl font-bold">{restroom.name}</h1>
        <p className="text-gray-600 flex items-center mt-1">
          <MapPin className="h-4 w-4 mr-1" />
          {restroom.address}, {restroom.city}, {restroom.state} {restroom.zipCode}
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Main Content */}
        <div className="md:w-2/3">
          <Card className="mb-6 overflow-hidden">
            <img 
              src={restroom.imageUrl || "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80"} 
              alt={restroom.name} 
              className="w-full h-80 object-cover"
            />
            
            <CardContent className="p-6">
              <div className="flex flex-wrap justify-between items-center mb-4">
                <div className="flex items-center mb-2 md:mb-0">
                  <div className="flex text-yellow-500 mr-2">
                    {renderStars(Math.round(restroom.averageRating))}
                  </div>
                  <span className="font-medium">{restroom.averageRating.toFixed(1)}</span>
                  <span className="text-gray-600 text-sm ml-1">({restroom.reviewCount} reviews)</span>
                </div>
                
                <div className="flex items-center text-gray-700">
                  <Clock className="h-4 w-4 mr-1" />
                  <span className="text-sm">{restroom.hours}</span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-4">
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
              
              <h2 className="text-xl font-semibold mb-2">About this Restroom</h2>
              <p className="text-gray-700 mb-4">{restroom.description}</p>
              
              <h3 className="font-semibold text-lg mb-2">Amenities</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                {restroom.soapAvailable && (
                  <div className="flex items-center">
                    <i className="fas fa-soap text-primary mr-2"></i>
                    <span>Soap Available</span>
                  </div>
                )}
                
                {restroom.wellStocked && (
                  <div className="flex items-center">
                    <i className="fas fa-toilet-paper text-primary mr-2"></i>
                    <span>Well Stocked</span>
                  </div>
                )}
                
                {restroom.codeRequired && (
                  <div className="flex items-center">
                    <i className="fas fa-key text-primary mr-2"></i>
                    <span>Code Required</span>
                  </div>
                )}
                
                {restroom.attendantPresent && (
                  <div className="flex items-center">
                    <i className="fas fa-hands-wash text-primary mr-2"></i>
                    <span>Attendant Present</span>
                  </div>
                )}
                
                {restroom.familyFriendly && (
                  <div className="flex items-center">
                    <i className="fas fa-baby text-primary mr-2"></i>
                    <span>Family-Friendly</span>
                  </div>
                )}
                
                {restroom.premiumProducts && (
                  <div className="flex items-center">
                    <i className="fas fa-hand-sparkles text-primary mr-2"></i>
                    <span>Premium Products</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Reviews Section */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Reviews</h2>
              
              {/* Review Form */}
              <form onSubmit={handleSubmitReview} className="mb-6">
                <h3 className="text-lg font-medium mb-2">Write a Review</h3>
                <div className="flex mb-3">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => handleRatingClick(rating)}
                      className="p-1"
                    >
                      <Star
                        className={`h-6 w-6 ${
                          rating <= selectedRating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <Textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Share your experience..."
                  className="mb-3"
                />
                <Button type="submit" disabled={isSubmitting || !reviewText.trim()}>
                  {isSubmitting ? 'Submitting...' : 'Submit Review'}
                </Button>
              </form>
              
              <Separator className="my-6" />
              
              {/* Reviews List */}
              {isLoadingReviews ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
                      <div className="h-16 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : reviews && reviews.length > 0 ? (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-100 pb-4 last:border-0">
                      <div className="flex text-yellow-500 mb-2">
                        {renderStars(review.rating)}
                      </div>
                      <p className="text-gray-700 mb-2">{review.comment}</p>
                      <p className="text-gray-500 text-sm">
                        Posted {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  No reviews yet. Be the first to share your experience!
                </p>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Sidebar */}
        <div className="md:w-1/3">
          <div className="sticky top-24">
            <Map 
              latitude={restroom.latitude} 
              longitude={restroom.longitude} 
            />
            
            <Card className="mt-6 bg-gradient-to-r from-accent to-primary text-white">
              <CardContent className="p-5">
                <h3 className="font-semibold text-lg mb-3">Traveling? Be Prepared</h3>
                <p className="text-sm mb-4 opacity-90">
                  Discover premium hygiene products at Injoy Bio for your personal comfort wherever you go.
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
                    Shop Injoy Products
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestroomDetail;
