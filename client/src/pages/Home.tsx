import React from 'react';
import Hero from '@/components/Hero';
import FeaturedArticles from '@/components/FeaturedArticles';
import InjoyPromotion from '@/components/InjoyPromotion';
import UserTestimonials from '@/components/UserTestimonials';
import SubmitListing from '@/components/SubmitListing';
import RestroomDirectory from '@/components/RestroomDirectory';

const Home: React.FC = () => {
  return (
    <>
      <Hero />
      <RestroomDirectory />
      <FeaturedArticles />
      <InjoyPromotion />
      <UserTestimonials />
      <SubmitListing />
    </>
  );
};

export default Home;
