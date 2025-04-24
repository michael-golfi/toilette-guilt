import React from 'react';
import { useRoute, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowLeft, Calendar, User } from 'lucide-react';
import { Article } from '@shared/schema';
import { useTranslation } from 'react-i18next';

// Mapping from API category name (assumed English) to internal key
const apiCategoryToKeyMap: { [key: string]: string } = {
  'Hygiene Tips': 'hygienetips',
  'Accessibility': 'accessibility',
  'Eco-Friendly': 'ecofriendly',
};

// Mapping from internal key to CSS class
const categoryKeyToCssMap: { [key: string]: string } = {
  'hygienetips': 'article-tag-hygiene',
  'accessibility': 'article-tag-accessibility',
  'ecofriendly': 'article-tag-eco',
};

const ArticleDetail: React.FC = () => {
  const { t, i18n } = useTranslation(['articles', 'common']);
  const [, setLocation] = useLocation();
  const [match, params] = useRoute<{ id: string }>('/article/:id');
  
  const articleId = match ? parseInt(params.id) : -1;

  // Fetch article details
  const { data: article, isLoading, error } = useQuery<Article>({
    queryKey: [`/api/articles/${articleId}`],
    enabled: articleId > 0,
  });

  // Format date using current language
  const formatDate = (dateString: string | Date) => {
    if (!dateString) return t('common:unknownDate');
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(i18n.language, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  // Get category class name based on the category KEY
  const getCategoryClassNameByKey = (key: string | undefined) => {
    return key && categoryKeyToCssMap[key] ? `article-tag ${categoryKeyToCssMap[key]}` : 'article-tag article-tag-hygiene'; // Default class
  };

  // Find category key from API display name
  const getCategoryKeyFromDisplayName = (apiDisplayName: string): string | undefined => {
     return apiCategoryToKeyMap[apiDisplayName];
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="shadow-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
            <h1 className="text-2xl font-bold mb-2">{t('detail.error.title')}</h1>
            <p className="text-gray-600 mb-6">{t('detail.error.description')}</p>
            <Button variant="outline" onClick={() => setLocation('/articles')}>
              <ArrowLeft className="h-4 w-4 mr-2" /> {t('detail.error.button')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse max-w-3xl mx-auto">
          <div className="h-8 w-64 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 w-32 bg-gray-200 rounded mb-8"></div>
          <div className="h-60 bg-gray-200 rounded-lg mb-6"></div>
          <div className="h-4 w-full bg-gray-200 rounded mb-3"></div>
          <div className="h-4 w-full bg-gray-200 rounded mb-3"></div>
          <div className="h-4 w-full bg-gray-200 rounded mb-3"></div>
          <div className="h-4 w-3/4 bg-gray-200 rounded mb-6"></div>
        </div>
      </div>
    );
  }

  if (!article) {
    return null;
  }

  // Split article content by double newlines for paragraphs
  const paragraphs = article.content.split(/\n\n+/).filter(p => p.trim() !== '');
  const articleCategoryKey = getCategoryKeyFromDisplayName(article.category);
  const articleCategoryClassName = getCategoryClassNameByKey(articleCategoryKey);
  const translatedCategoryName = articleCategoryKey ? t(`categories.${articleCategoryKey}`) : article.category;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <Button 
          variant="ghost" 
          className="mb-6 text-primary hover:bg-primary/10 px-2"
          onClick={() => setLocation('/articles')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> {t('detail.backButton')}
        </Button>
        
        <span className={articleCategoryClassName}>{translatedCategoryName}</span>
        
        <h1 className="text-3xl md:text-4xl font-bold mt-3 mb-4 leading-tight">{article.title}</h1>
        
        <div className="flex flex-wrap items-center text-gray-500 text-sm mb-8 gap-x-4 gap-y-1">
          <div className="flex items-center">
            <User className="h-4 w-4 mr-1.5" />
            <span>{t('detail.authorLabel')}</span>
          </div>
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-1.5" />
            <span>{article.createdAt ? formatDate(article.createdAt) : t('common:unknownDate')}</span>
          </div>
        </div>
        
        {article.imageUrl && (
          <img 
            src={article.imageUrl} 
            alt={t('detail.imageAlt', { title: article.title })} 
            className="w-full h-auto rounded-lg mb-8 shadow-md object-cover bg-gray-200"
          />
        )}
        
        <div className="prose prose-lg max-w-none text-gray-800">
          {paragraphs.map((paragraph, index) => (
            <p key={index} className="mb-4 leading-relaxed">
              {paragraph}
            </p>
          ))}
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-200">
          <h2 className="text-2xl font-bold mb-6">{t('detail.related.title')}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="overflow-hidden shadow hover:shadow-md transition">
              <CardContent className="p-6">
                <span className={getCategoryClassNameByKey('hygienetips')}>
                   {t('detail.related.card1.category')} 
                </span>
                <h3 className="text-lg font-semibold mt-2 mb-2">{t('detail.related.card1.title')}</h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                  {t('detail.related.card1.description')}
                </p>
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-primary"
                  onClick={() => setLocation('/articles?categoryKey=hygienetips')}
                >
                  {t('detail.related.card1.button')}
                </Button>
              </CardContent>
            </Card>
            
            <Card className="overflow-hidden shadow hover:shadow-md transition">
              <CardContent className="p-6">
                 <span className={getCategoryClassNameByKey('ecofriendly')}>
                   {t('detail.related.card2.category')} 
                 </span>
                <h3 className="text-lg font-semibold mt-2 mb-2">{t('detail.related.card2.title')}</h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                  {t('detail.related.card2.description')}
                </p>
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-primary"
                  asChild
                >
                  <a href="https://injoy.bio" target="_blank" rel="noopener noreferrer">
                    {t('detail.related.card2.button')}
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

export default ArticleDetail;
