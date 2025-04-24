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
import { useTranslation } from 'react-i18next';

const RestroomDetail: React.FC = () => {
  const { t, i18n } = useTranslation(['restrooms', 'common'], { 
    keyPrefix: 'detail'
  });
  const [, setLocation] = useLocation();
  const [match, params] = useRoute<{ id: string }>('/restroom/:id');
  const [reviewText, setReviewText] = useState('');
  const [selectedRating, setSelectedRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const restroomId = match ? parseInt(params.id) : -1;

  const { data: restroom, isLoading, error } = useQuery<RestroomWithRating>({
    queryKey: [`/api/restrooms/${restroomId}`],
    enabled: restroomId > 0,
  });

  const { data: reviews, isLoading: isLoadingReviews } = useQuery<Review[]>({
    queryKey: [`/api/restrooms/${restroomId}/reviews`],
    enabled: restroomId > 0,
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
        <Card>
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

  const displayHours = restroom.hours ? restroom.hours : t('hoursUnknown', { defaultValue: 'Hours not available' });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          className="mb-4 text-primary hover:bg-primary/10"
          onClick={() => setLocation('/find-restrooms')}
        >
          <i className="fas fa-arrow-left mr-2"></i> {t('backToResults')}
        </Button>
        
        <h1 className="text-3xl font-bold">{restroom.name}</h1>
        <p className="text-gray-600 flex items-center mt-1">
          <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
          <span>{restroom.address}, {restroom.city}, {restroom.state} {restroom.zipCode}</span>
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-2/3">
          <Card className="mb-6 overflow-hidden shadow-md">
            <img 
              src={restroom.imageUrl || 'https://via.placeholder.com/800x400.png'} 
              alt={t('imageAlt', { name: restroom.name, defaultValue: `Image of ${restroom.name}` })}
              className="w-full h-64 md:h-80 object-cover bg-gray-200"
            />
            
            <CardContent className="p-6">
              <div className="flex flex-wrap justify-between items-start gap-y-2 mb-4">
                <div className="flex items-center">
                  <div className="flex text-yellow-500 mr-2" aria-label={t('averageRatingLabel', { rating: restroom.averageRating.toFixed(1), defaultValue: `Average rating: ${restroom.averageRating.toFixed(1)} out of 5` })}>
                    {renderDisplayStars(restroom.averageRating)}
                  </div>
                  <span className="font-medium">{restroom.averageRating.toFixed(1)}</span>
                  <span className="text-gray-600 text-sm ml-1">
                    ({t('reviewCount', { count: restroom.reviewCount, ns: 'restrooms' })}) 
                  </span>
                </div>
                
                <div className="flex items-center text-gray-700">
                  <Clock className="h-4 w-4 mr-1 flex-shrink-0" />
                  <span className="text-sm">{displayHours}</span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {restroom.accessibilityFeatures && (
                  <span className="feature-tag feature-tag-accessibility">{t('features.accessible', { ns: 'restrooms' })}</span>
                )}
                {restroom.babyChanging && (
                  <span className="feature-tag feature-tag-baby-changing">{t('features.changingTable', { ns: 'restrooms' })}</span>
                )}
                {restroom.genderNeutral && (
                  <span className="feature-tag feature-tag-gender-neutral">{t('features.genderNeutral', { ns: 'restrooms' })}</span>
                )}
                {restroom.freeToUse && (
                  <span className="feature-tag feature-tag-free">{t('listing.free', { ns: 'restrooms' })}</span>
                )}
                {restroom.changingRoom && (
                  <span className="feature-tag feature-tag-changing-room">{t('features.changingRoom', { ns: 'restrooms', defaultValue: 'Changing Room'})}</span>
                )}
                {restroom.customerOnly && (
                  <span className="feature-tag feature-tag-customer-only">{t('listing.customerOnly', { ns: 'restrooms' })}</span>
                )}
                {restroom.singleOccupancy && (
                  <span className="feature-tag feature-tag-single-occupancy">{t('features.singleOccupancy', { ns: 'restrooms', defaultValue: 'Single Occupancy'})}</span>
                )}
              </div>
              
              {restroom.description && (
                <>
                  <h2 className="text-xl font-semibold mb-2">{t('overview')}</h2>
                  <p className="text-gray-700 mb-4">{restroom.description}</p>
                </>
              )}
              
              <h3 className="font-semibold text-lg mb-2">{t('amenities')}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                {restroom.soapAvailable && (
                  <div className="flex items-center text-sm text-gray-700">
                    <i className="fas fa-soap text-primary w-4 text-center mr-2"></i>
                    <span>{t('amenitiesList.soapAvailable', { ns: 'restrooms', defaultValue: 'Soap Available'})}</span>
                  </div>
                )}
                {restroom.wellStocked && (
                  <div className="flex items-center text-sm text-gray-700">
                    <i className="fas fa-toilet-paper text-primary w-4 text-center mr-2"></i>
                    <span>{t('amenitiesList.wellStocked', { ns: 'restrooms', defaultValue: 'Well Stocked (TP, etc.)'})}</span>
                  </div>
                )}
                {restroom.codeRequired !== undefined && (
                  <div className="flex items-center text-sm text-gray-700">
                    <i className={`fas ${restroom.codeRequired ? 'fa-lock' : 'fa-lock-open'} text-primary w-4 text-center mr-2`}></i>
                    <span>{restroom.codeRequired ? t('amenitiesList.codeRequired', { ns: 'restrooms', defaultValue: 'Code Required'}) : t('amenitiesList.noCodeRequired', { ns: 'restrooms', defaultValue: 'No Code Required'})}</span>
                  </div>
                )}
                {restroom.attendantPresent && (
                  <div className="flex items-center text-sm text-gray-700">
                    <i className="fas fa-user-tie text-primary w-4 text-center mr-2"></i>
                    <span>{t('amenitiesList.attendantPresent', { ns: 'restrooms', defaultValue: 'Attendant Present'})}</span>
                  </div>
                )}
                {restroom.familyFriendly && (
                  <div className="flex items-center text-sm text-gray-700">
                    <i className="fas fa-baby text-primary w-4 text-center mr-2"></i>
                    <span>{t('amenitiesList.familyFriendly', { ns: 'restrooms', defaultValue: 'Family Friendly'})}</span>
                  </div>
                )}
                {restroom.premiumProducts && (
                  <div className="flex items-center text-sm text-gray-700">
                    <i className="fas fa-hand-sparkles text-primary w-4 text-center mr-2"></i>
                    <span>{t('amenitiesList.premiumProducts', { ns: 'restrooms', defaultValue: 'Premium Products'})}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-md">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">{t('reviews')}</h2>
              
              <form onSubmit={handleSubmitReview} className="mb-6 border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-medium mb-3">{t('writeReview')}</h3>
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('yourRating')}</label>
                  <div className="flex">
                    {renderRatingInputStars()}
                  </div>
                </div>
                <div className="mb-3">
                   <label htmlFor="reviewText" className="block text-sm font-medium text-gray-700 mb-1">{t('yourComment')}</label>
                   <Textarea
                     id="reviewText"
                     value={reviewText}
                     onChange={(e) => setReviewText(e.target.value)}
                     placeholder={t('shareExperiencePlaceholder')}
                     className="mb-3 min-h-[80px]"
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
              
              <h3 className="text-lg font-semibold mb-4">{t('communityReviews')}</h3>
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
                    <div key={review.id} className="border-b border-gray-100 pb-4 last:border-0">
                      <div className="flex items-center mb-2">
                         <div className="flex text-yellow-500 mr-2" aria-label={t('reviewRatingLabel', { rating: review.rating, defaultValue: `Rated ${review.rating} out of 5 stars` })}>
                           {renderDisplayStars(review.rating)}
                         </div>
                         {/* Optionally display user name if available */}
                         {/* <span className="font-medium text-sm">- {review.userName || 'Anonymous'}</span> */} 
                      </div>
                      <p className="text-gray-700 mb-2">{review.comment}</p>
                      <p className="text-gray-500 text-sm">
                        {t('postedOn', {
                          date: review.createdAt 
                                ? new Intl.DateTimeFormat(i18n.language).format(new Date(review.createdAt))
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
        
        <div className="lg:w-1/3">
          <div className="sticky top-24 space-y-6">
            <Map 
              latitude={restroom.latitude} 
              longitude={restroom.longitude} 
            />
            
            <Card className="bg-gradient-to-br from-accent to-primary text-white shadow-lg">
              <CardContent className="p-5">
                <h3 className="font-semibold text-lg mb-2">{t('promoSidebar.title', {defaultValue: 'Enhance Your Well-being'})}</h3>
                <p className="text-sm mb-4 opacity-90">
                  {t('promoSidebar.description', {defaultValue: 'Explore premium hygiene and wellness products from our partner, Injoy Bio.'})}
                </p>
                <Button 
                  asChild
                  variant="secondary"
                  className="w-full bg-white text-primary hover:bg-gray-100 font-semibold"
                >
                  <a 
                    href="https://injoy.bio" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    {t('promoSidebar.button', {defaultValue: 'Visit Injoy Bio'})}
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
