import { Article } from '@shared/schema';
import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';

const ArticleShowcase: React.FC = () => {
  const [, setLocation] = useLocation();
  const { t } = useTranslation('home');

  // Fetch articles from API
  const { data: articlesData, isLoading, error } = useQuery<{ data: Article[] }>({
    queryKey: ['/api/articles'],
  });

  // Map API articles to the format expected by the UI
  const articles = React.useMemo(() => {
    if (!articlesData) return [];

    return articlesData['data'].slice(0, 4).map(article => ({
      id: article.id,
      title: article.title,
      description: article.excerpt,
      keywords: article.category.split(',').map(cat => cat.trim()),
      image: article.image_url || '/images/placeholder-article.jpg',
      slug: `/article/${article.id}`,
    }));
  }, [articlesData]);

  if (isLoading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">{t('bathroomResources.title')}</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">{t('bathroomResources.subtitle')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map(idx => (
              <div key={idx} className="bg-white rounded-lg overflow-hidden shadow-md animate-pulse">
                <div className="h-48 bg-gray-200" />
                <div className="p-6">
                  <div className="h-6 bg-gray-200 rounded mb-2" />
                  <div className="h-16 bg-gray-200 rounded mb-4" />
                  <div className="flex gap-2 mb-4">
                    <div className="h-6 w-16 bg-gray-200 rounded-full" />
                    <div className="h-6 w-16 bg-gray-200 rounded-full" />
                  </div>
                  <div className="h-6 w-24 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error || articles.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">{t('bathroomResources.title')}</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">{t('bathroomResources.subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {articles.map(article => (
            <div 
              key={article.id} 
              className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all cursor-pointer"
              onClick={() => setLocation(article.slug)}
            >
              <img src={article.image} alt={article.title} className="w-full h-48 object-cover" />
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{article.title}</h3>
                <p className="text-gray-600 mb-4">{article.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {article.keywords.slice(0, 2).map((keyword, idx) => (
                    <span key={idx} className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs">
                      {t(`categories.${keyword}`, { ns: 'articles' })}
                    </span>
                  ))}
                </div>

                <span className="text-blue-600 font-medium inline-flex items-center">
                  {t('bathroomResources.readMore')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ArticleShowcase;