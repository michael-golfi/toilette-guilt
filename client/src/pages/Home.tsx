import FeaturedArticles from '@/components/FeaturedArticles';
import Hero from '@/components/Hero';
import RestroomDirectory from '@/components/RestroomDirectory';
import SubmitListing from '@/components/SubmitListing';
import React from 'react';

const Home: React.FC = () => {
  return (
    <>
      <Hero />
      <RestroomDirectory />
      <FeaturedArticles />
      <SubmitListing />
    </>
  );
};

export default Home;
