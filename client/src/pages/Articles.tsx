import React, { useState, useEffect } from 'react';
import { useLocation, useSearch } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Article } from '@shared/schema';
import { Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Define categories with keys for translation
const categoryKeys = ['all', 'hygieneTips', 'accessibility', 'ecoFriendly'];


// Mapping from internal key to CSS class
const categoryKeyToCssMap: { [key: string]: string } = {
  'hygieneTips': 'article-tag-hygiene',
  'accessibility': 'article-tag-accessibility',
  'ecoFriendly': 'article-tag-eco',
};

const Articles: React.FC = () => {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTabKey, setActiveTabKey] = useState<string>(categoryKeys[0]); // Default to 'all'
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const { t } = useTranslation(['articles', 'common']);

  const searchParams = new URLSearchParams(search);
  const categoryKeyParam = searchParams.get('categoryKey');

  // Fetch all articles
  const { data: articles, isLoading } = useQuery<{ data: Article[] }>({
    queryKey: ['/api/articles'],
  });

  // Set active tab based on URL parameter
  useEffect(() => {
    if (categoryKeyParam && categoryKeys.includes(categoryKeyParam)) {
      setActiveTabKey(categoryKeyParam);
    } else {
      setActiveTabKey(categoryKeys[0]); // 'all'
    }
  }, [categoryKeyParam]);

  // Filter articles when data, tab, or search term changes
  useEffect(() => {
    if (!articles) return;

    let filtered = [...articles['data']];

    // Filter by category key if not "all"
    if (activeTabKey !== categoryKeys[0]) {
      filtered = filtered.filter(article => {
        const articleKey = article.category;
        return articleKey === activeTabKey;
      });
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(term) ||
        article.excerpt.toLowerCase().includes(term) ||
        (article.content && article.content.toLowerCase().includes(term))
      );
    }

    setFilteredArticles(filtered);
  }, [articles, activeTabKey, searchTerm]);

  // Update URL when tab changes
  const handleTabChange = (tabKey: string) => {
    setActiveTabKey(tabKey);
    setSearchTerm(''); // Clear search on tab change

    if (tabKey === categoryKeys[0]) { // 'all'
      setLocation('/articles');
    } else {
      setLocation(`/articles?categoryKey=${tabKey}`);
    }
  };

  const navigateToArticle = (id: number) => {
    setLocation(`/article/${id}`);
  };

  // Function to get the class name based on the category KEY
  const getCategoryClassNameByKey = (key: string | undefined) => {
    return key && categoryKeyToCssMap[key] ? `article-tag ${categoryKeyToCssMap[key]}` : 'article-tag article-tag-hygiene'; // Default class
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">{t('listing.title')}</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          {t('listing.subtitle')}
        </p>
      </div>

      <div className="max-w-5xl mx-auto">
        {/* Search Bar */}
        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            placeholder={t('listing.searchPlaceholder')}
            className="pl-10 pr-4 py-2 border rounded-md w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label={t('listing.searchPlaceholder')}
          />
        </div>

        {/* Category Tabs */}
        <Tabs value={activeTabKey} onValueChange={handleTabChange} className="mb-8">
          <TabsList className="w-full grid grid-cols-2 sm:grid-cols-4">
            {categoryKeys.map(key => (
              <TabsTrigger key={key} value={key}>{t(`categories.${key}`)}</TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Articles Grid or Loading/No Results State */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="overflow-hidden">
                <div className="h-48 bg-gray-200 animate-pulse"></div>
                <CardContent className="p-6">
                  <div className="h-6 w-24 bg-gray-200 animate-pulse rounded-full mb-3"></div>
                  <div className="h-7 bg-gray-200 animate-pulse rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 animate-pulse rounded mb-1"></div>
                  <div className="h-4 bg-gray-200 animate-pulse rounded mb-1"></div>
                  <div className="h-4 bg-gray-200 animate-pulse rounded mb-4"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredArticles.map((article) => {
              const articleCategoryKey = article.category;
              const categoryClassName = getCategoryClassNameByKey(articleCategoryKey);
              const translatedCategoryName = articleCategoryKey ? t(`categories.${articleCategoryKey}`) : article.category; // Fallback to original name if key not found

              return (
                <Card
                  key={article.id}
                  className="overflow-hidden shadow-md transition hover:shadow-lg cursor-pointer flex flex-col"
                  onClick={() => navigateToArticle(article.id)}
                >
                  <img
                    src={article.imageUrl || 'https://via.placeholder.com/400x200.png'}
                    alt={t('listing.imageAlt', { title: article.title, defaultValue: `Image for ${article.title}` })}
                    className="w-full h-48 object-cover bg-gray-200"
                  />
                  <CardContent className="p-6 flex-grow">
                    <span className={categoryClassName}>{translatedCategoryName}</span>
                    <h3 className="text-xl font-semibold mt-3 mb-2 line-clamp-2">{article.title}</h3>
                    <p className="text-gray-600 text-sm line-clamp-3">{article.excerpt}</p>
                  </CardContent>
                  <CardFooter className="pt-0 pb-4 px-6 mt-auto">
                    <span className="text-primary font-medium hover:text-primary/80 inline-flex items-center text-sm">
                      {t('featured.readArticle')} <i className="fas fa-arrow-right ml-1.5"></i>
                    </span>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        ) : (
          // No Results Found
          <Card className="col-span-full">
            <CardContent className="p-8 text-center">
              <div className="text-6xl mb-4 text-gray-300">
                <i className="fas fa-file-alt"></i>
              </div>
              <h3 className="text-xl font-semibold mb-2">{t('listing.noResults')}</h3>
              <p className="text-gray-600 mb-4">{t('listing.noResultsHint')}</p>
              <Button variant="outline" onClick={() => {
                setSearchTerm('');
                handleTabChange(categoryKeys[0]); // Reset to 'all' tab key
              }}>
                {t('listing.clearSearch')}
              </Button>
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  );
};

export default Articles;
