import React from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { type Article } from '@shared/schema';
import { useTranslation } from 'react-i18next';


// Mapping from internal key to CSS class
const categoryKeyToCssMap: { [key: string]: string } = {
  'hygieneTips': 'article-tag-hygiene',
  'accessibility': 'article-tag-accessibility',
  'ecoFriendly': 'article-tag-eco',
};

const FeaturedArticles: React.FC = () => {
  const [, setLocation] = useLocation();
  const { t } = useTranslation('articles');

  const { data: articles, isLoading } = useQuery<Article[]>({
    queryKey: ['/api/articles'],
  });

  const getCategoryClassNameByKey = (key: string | undefined) => {
    return key && categoryKeyToCssMap[key] ? `article-tag ${categoryKeyToCssMap[key]}` : 'article-tag article-tag-hygiene'; // Default class
  };

  const navigateToArticle = (id: number) => {
    setLocation(`/article/${id}`);
  };

  const navigateToAllArticles = () => {
    setLocation('/articles');
  };

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-3">{t('featured.title')}</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {t('featured.subtitle')}
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 3 }).map((_, index) => (
              <Card key={index} className="bg-gray-50">
                <div className="h-48 bg-gray-200 animate-pulse"></div>
                <CardContent className="p-6">
                  <div className="h-6 w-24 bg-gray-200 animate-pulse rounded-full mb-3"></div>
                  <div className="h-7 bg-gray-200 animate-pulse rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 animate-pulse rounded mb-1"></div>
                  <div className="h-4 bg-gray-200 animate-pulse rounded mb-4"></div>
                  <div className="h-6 w-28 bg-gray-200 animate-pulse rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles?.slice(0, 3).map((article) => (
              <Card
                key={article.id}
                className="bg-gray-50 overflow-hidden shadow-md transition hover:shadow-lg"
              >
                {article.image_url &&
                  <img
                    src={article.image_url}
                    alt={article.title}
                    className="w-full h-48 object-cover"
                  />}
                <CardContent className="p-6">
                  {(() => {
                    const categoryClassName = getCategoryClassNameByKey(article.category);
                    const translatedCategoryName = article.category ? t(`categories.${article.category}`) : article.category;
                    return <span className={categoryClassName}>{translatedCategoryName}</span>
                  })()}
                  <h3 className="text-xl font-semibold mt-3 mb-2">{article.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{article.excerpt}</p>
                  <button
                    onClick={() => navigateToArticle(article.id)}
                    className="text-primary font-medium hover:text-blue-700 inline-flex items-center"
                  >
                    {t('featured.readArticle')} <i className="fas fa-arrow-right ml-2"></i>
                  </button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="text-center mt-10">
          <Button
            variant="outline"
            className="border-primary text-primary hover:bg-primary hover:text-white"
            onClick={navigateToAllArticles}
          >
            {t('featured.viewAll')}
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedArticles;
