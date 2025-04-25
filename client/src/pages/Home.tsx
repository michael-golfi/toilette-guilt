import ArticleShowcase from '../components/ArticleShowcase';
import Hero from '@/components/Hero';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';

const Home: React.FC = () => {
  const [, setLocation] = useLocation();
  const { t } = useTranslation('home');

  const navigateToFindRestrooms = () => {
    setLocation('/find-restrooms');
  };

  return (
    <>
      <Hero />
      <ArticleShowcase />
    </>
  );
};

export default Home;
