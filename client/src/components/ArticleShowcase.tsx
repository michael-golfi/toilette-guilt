import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';

interface Article {
  id: number;
  title: string;
  description: string;
  keywords: string[];
  image: string;
  slug: string;
}

interface ArticleShowcaseProps {
  articles: Article[];
}

const ArticleShowcase: React.FC<ArticleShowcaseProps> = ({ articles }) => {
  const [, setLocation] = useLocation();
  const { t } = useTranslation('home');

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">{t('bathroomResources.title')}</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">{t('bathroomResources.subtitle')}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {articles.map(article => (
            <div key={article.id} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all">
              <img src={article.image} alt={article.title} className="w-full h-48 object-cover" />
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{article.title}</h3>
                <p className="text-gray-600 mb-4">{article.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {article.keywords.slice(0, 2).map((keyword, idx) => (
                    <span key={idx} className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs">
                      {keyword}
                    </span>
                  ))}
                </div>
                <button 
                  onClick={() => setLocation(article.slug)}
                  className="text-blue-600 font-medium hover:underline">
                  {t('bathroomResources.readMore')}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ArticleShowcase;