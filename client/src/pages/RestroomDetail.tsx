import React, { useState } from 'react';
import { useRoute, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, Clock, MapPin, Star, ChevronLeft, Accessibility, Baby, Users, Lock, LockOpen, Droplets, Paperclip, User, Sparkles } from 'lucide-react';
import { PublicBathroom, PublicBathroomReview } from '@shared/schema';
import { apiRequest, queryClient } from '@/lib/queryClient';
import Map from '@/components/Map';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';

interface AccessibilityFeature {
  id: string;
  feature_name: string;
}

interface OpeningHour {
  id: string;
  day_of_week: string;
  hours_text: string;
}

const RestroomDetail: React.FC = () => {
  const { t, i18n } = useTranslation(['restrooms', 'common'], { 
    keyPrefix: 'detail'
  });
  const [, setLocation] = useLocation();
  const [match, params] = useRoute<{ id: string }>('/restroom/:id');
  const [reviewText, setReviewText] = useState('');
  const [selectedRating, setSelectedRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const restroomId = match ? params.id : null;

  const { data: restroom, isLoading, error } = useQuery<PublicBathroom>({
    queryKey: [`/api/restrooms/${restroomId}`],
    queryFn: async () => {
      if (!restroomId) throw new Error('No restroom ID provided');
      
      try {
        const response = await apiRequest('GET', `/api/restrooms/${restroomId}`);
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Restroom fetch error:', errorData);
          throw new Error(errorData.message || 'Failed to fetch restroom');
        }
        return response.json();
      } catch (err) {
        console.error('Error fetching restroom:', err);
        throw err;
      }
    },
    enabled: !!restroomId,
  });

  const { data: address } = useQuery({
    queryKey: [`/api/restrooms/${restroomId}/address`],
    queryFn: async () => {
      if (!restroomId) throw new Error('No restroom ID provided');
      const response = await apiRequest('GET', `/api/restrooms/${restroomId}/address`);
      return response.json();
    },
    enabled: !!restroomId,
  });

  const { data: accessibilityFeatures } = useQuery<AccessibilityFeature[]>({
    queryKey: [`/api/restrooms/${restroomId}/accessibility`],
    queryFn: async () => {
      if (!restroomId) throw new Error('No restroom ID provided');
      const response = await apiRequest('GET', `/api/restrooms/${restroomId}/accessibility`);
      return response.json();
    },
    enabled: !!restroomId,
  });

  const { data: openingHours } = useQuery<OpeningHour[]>({
    queryKey: [`/api/restrooms/${restroomId}/hours`],
    queryFn: async () => {
      if (!restroomId) throw new Error('No restroom ID provided');
      const response = await apiRequest('GET', `/api/restrooms/${restroomId}/hours`);
      return response.json();
    },
    enabled: !!restroomId,
  });

  const { data: reviews, isLoading: isLoadingReviews } = useQuery<PublicBathroomReview[]>({
    queryKey: [`/api/restrooms/${restroomId}/reviews`],
    enabled: !!restroomId,
  });

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewText.trim() || selectedRating === 0) {
      alert(t('validation.ratingAndCommentRequired', { ns: 'common', defaultValue: 'Please select a rating and enter a comment.' }));
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await apiRequest('POST', '/api/reviews', {
        restroomId,
        userId: 1,
        rating: selectedRating,
        comment: reviewText
      });
      
      setReviewText('');
      setSelectedRating(0);
      queryClient.invalidateQueries({ queryKey: [`/api/restrooms/${restroomId}/reviews`] });
      queryClient.invalidateQueries({ queryKey: [`/api/restrooms/${restroomId}`] });
      alert(t('validation.reviewSubmitted', { ns: 'common', defaultValue: 'Review submitted successfully!' }));
      
    } catch (err) {
      console.error('Error submitting review:', err);
      alert(t('validation.reviewError', { ns: 'common', defaultValue: 'Failed to submit review. Please try again.' }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderDisplayStars = (rating: number) => {
    const roundedRating = Math.round(rating);
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`h-5 w-5 ${
          i < roundedRating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'
        }`}
        aria-hidden="true"
      />
    ));
  };
  
  const renderRatingInputStars = () => {
    return Array.from({ length: 5 }).map((_, i) => {
      const ratingValue = i + 1;
      return (
        <button
          key={ratingValue}
          type="button"
          onClick={() => handleRatingClick(ratingValue)}
          className="p-1 focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded"
          aria-label={t('ratingLabel', { count: ratingValue, defaultValue: `Rate ${ratingValue} out of 5 stars` })}
        >
          <Star
            className={`h-6 w-6 cursor-pointer transition-colors ${
              ratingValue <= selectedRating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300 hover:text-yellow-400'
            }`}
            aria-hidden="true"
          />
        </button>
      );
    });
  };

  const handleRatingClick = (rating: number) => {
    setSelectedRating(rating);
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
            <h1 className="text-2xl font-bold mb-2">{t('notFound')}</h1>
            <p className="text-gray-600 mb-6">{t('notFoundDescription')}</p>
            <Button onClick={() => setLocation('/find-restrooms')}>
              {t('browseOther')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading || !restroom) {
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

  const formatAddress = () => {
    if (!address) return restroom.address || '';
    const parts = [
      address.street,
      address.city,
      address.state,
      address.postal_code,
      address.country
    ].filter(Boolean);
    return parts.join(', ');
  };

  const formatHours = () => {
    if (!openingHours || openingHours.length === 0) {
      return t('hoursUnknown', { defaultValue: 'Hours not available' });
    }
    return openingHours.map((hour: OpeningHour) => `${hour.day_of_week}: ${hour.hours_text}`).join('\n');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Button 
          variant="ghost" 
          className="mb-6 text-primary hover:bg-primary/10"
          onClick={() => setLocation('/find-restrooms')}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          {t('backToResults')}
        </Button>
        
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{restroom.title}</h1>
            <p className="text-gray-600 flex items-center mt-2">
              <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
              <span>{formatAddress()}</span>
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center bg-yellow-50 px-4 py-2 rounded-full">
              <div className="flex text-yellow-500 mr-2" aria-label={t('averageRatingLabel', { rating: restroom.review_rating.toFixed(1), defaultValue: `Average rating: ${restroom.review_rating.toFixed(1)} out of 5` })}>
                {renderDisplayStars(restroom.review_rating)}
              </div>
              <span className="font-medium text-yellow-700">{restroom.review_rating.toFixed(1)}</span>
              <span className="text-gray-600 text-sm ml-1">
                ({t('reviewCount', { count: restroom.review_count, ns: 'restrooms' })})
              </span>
            </div>
            
            <div className="flex items-center text-gray-700 bg-gray-50 px-4 py-2 rounded-full">
              <Clock className="h-4 w-4 mr-1 flex-shrink-0" />
              <span className="text-sm whitespace-pre-line">{formatHours()}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-2/3 space-y-6">
          {/* Main Image */}
          <Card className="overflow-hidden shadow-md">
            <img 
              src={restroom.thumbnail || 'https://via.placeholder.com/800x400.png'} 
              alt={t('imageAlt', { name: restroom.title, defaultValue: `Image of ${restroom.title}` })}
              className="w-full h-64 md:h-80 object-cover bg-gray-200"
            />
          </Card>
          
          {/* Features and Amenities */}
          <Card className="shadow-md">
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-2 mb-6">
                {accessibilityFeatures?.map((feature: AccessibilityFeature) => (
                  <Badge 
                    key={feature.id} 
                    variant="secondary" 
                    className="bg-purple-50 text-purple-700 hover:bg-purple-100"
                  >
                    <Accessibility className="h-4 w-4 mr-1" />
                    {feature.feature_name}
                  </Badge>
                ))}
                {restroom.price_range === 'Free' && (
                  <Badge variant="secondary" className="bg-green-50 text-green-700 hover:bg-green-100">
                    {t('listing.free', { ns: 'restrooms' })}
                  </Badge>
                )}
              </div>
              
              {restroom.description && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-3">{t('overview')}</h2>
                  <p className="text-gray-700">{restroom.description}</p>
                </div>
              )}
              
              <div>
                <h3 className="text-lg font-semibold mb-4">{t('amenities')}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center text-sm text-gray-700">
                    <Droplets className="h-4 w-4 mr-2 text-primary" />
                    <span>{t('amenitiesList.soapAvailable', { ns: 'restrooms', defaultValue: 'Soap Available'})}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-700">
                    <Paperclip className="h-4 w-4 mr-2 text-primary" />
                    <span>{t('amenitiesList.wellStocked', { ns: 'restrooms', defaultValue: 'Well Stocked (TP, etc.)'})}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-700">
                    <Users className="h-4 w-4 mr-2 text-primary" />
                    <span>{t('amenitiesList.attendantPresent', { ns: 'restrooms', defaultValue: 'Attendant Present'})}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-700">
                    <Sparkles className="h-4 w-4 mr-2 text-primary" />
                    <span>{t('amenitiesList.premiumProducts', { ns: 'restrooms', defaultValue: 'Premium Products'})}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Reviews Section */}
          <Card className="shadow-md">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-6">{t('reviews')}</h2>
              
              <form onSubmit={handleSubmitReview} className="mb-8 border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-medium mb-4">{t('writeReview')}</h3>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('yourRating')}</label>
                  <div className="flex">
                    {renderRatingInputStars()}
                  </div>
                </div>
                <div className="mb-4">
                   <label htmlFor="reviewText" className="block text-sm font-medium text-gray-700 mb-2">{t('yourComment')}</label>
                   <Textarea
                     id="reviewText"
                     value={reviewText}
                     onChange={(e) => setReviewText(e.target.value)}
                     placeholder={t('shareExperiencePlaceholder')}
                     className="min-h-[100px]"
                     required
                   />
                </div>
                <Button 
                  type="submit" 
                  disabled={isSubmitting || !reviewText.trim() || selectedRating === 0}
                  className="w-full sm:w-auto"
                >
                  {isSubmitting 
                    ? t('submitting', { ns: 'common', defaultValue: 'Submitting...' }) 
                    : t('submitReview')}
                </Button>
              </form>
              
              <Separator className="my-6" />
              
              <h3 className="text-lg font-semibold mb-6">{t('communityReviews')}</h3>
              {isLoadingReviews ? (
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="animate-pulse border-b border-gray-100 pb-4 last:border-0">
                      <div className="h-5 w-24 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 w-full bg-gray-200 rounded mb-1"></div>
                      <div className="h-4 w-3/4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 w-28 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : reviews && reviews.length > 0 ? (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0">
                      <div className="flex items-center mb-3">
                         <div className="flex text-yellow-500 mr-2" aria-label={t('reviewRatingLabel', { rating: review.rating || 0, defaultValue: `Rated ${review.rating || 0} out of 5 stars` })}>
                           {renderDisplayStars(review.rating || 0)}
                         </div>
                      </div>
                      <p className="text-gray-700 mb-2">{review.description || ''}</p>
                      <p className="text-gray-500 text-sm">
                        {t('postedOn', {
                          date: review.created_at 
                                ? new Intl.DateTimeFormat(i18n.language).format(new Date(review.created_at))
                                : t('unknownDate', { ns: 'common', defaultValue: 'Unknown date' })
                        })}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  {t('noReviewsYet')}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* <div className="lg:w-1/3">
          <div className="sticky top-24 space-y-6">
            <Map 
              latitude={restroom.latitude} 
              longitude={restroom.longitude} 
            />
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default RestroomDetail;
