import ArticleShowcase from '@/components/ArticleShowcase';
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

  // Articles data with targeted keywords for SEO
  const featuredArticles = [
    {
      id: 1,
      title: 'Finding Public Bathrooms Near Me - Complete Guide',
      description: 'Discover how to locate clean public bathrooms and restrooms wherever you go.',
      keywords: ['Public bathroom', 'Restroom public', 'Toilets near me', 'Washroom'],
      image: '/images/articles/public-bathrooms.jpg',
      slug: '/articles/finding-public-bathrooms'
    },
    {
      id: 2,
      title: 'How to Deal with a Clogged Toilet When You\'re Out',
      description: 'Learn what to do when facing toilet problems in public restrooms.',
      keywords: ['Clogged toilet', 'Toilet not flushing', 'Toilet plunger', 'Blocked toilet'],
      image: '/images/articles/toilet-problems.jpg',
      slug: '/articles/clogged-toilet-solutions'
    },
    {
      id: 3,
      title: 'Bathroom Hygiene Essentials: What You Should Know',
      description: 'Essential tips for maintaining proper bathroom hygiene and cleanliness.',
      keywords: ['Bathroom hygiene', 'Bathroom cleanliness', 'Toilet brush', 'Bathroom ventilation'],
      image: '/images/articles/bathroom-hygiene.jpg',
      slug: '/articles/bathroom-hygiene-essentials'
    },
    {
      id: 4,
      title: 'Portable Toilet Options for Outdoor Events',
      description: 'Comprehensive guide to portable toilet solutions for various needs.',
      keywords: ['Portable toilet', 'Porta potties', 'Portable restrooms', 'Chemical toilet'],
      image: '/images/articles/portable-toilets.jpg',
      slug: '/articles/portable-toilet-guide'
    }
  ];

  return (
    <>
      <Hero />
      <ArticleShowcase articles={featuredArticles} />
    </>
  );
};

export default Home;
