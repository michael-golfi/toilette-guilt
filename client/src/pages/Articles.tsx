import React, { useState, useEffect } from 'react';
import { useLocation, useSearch } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Article } from '@shared/schema';
import { Search } from 'lucide-react';

const Articles: React.FC = () => {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<string>('all');
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  
  const searchParams = new URLSearchParams(search);
  const categoryParam = searchParams.get('category');

  // Fetch all articles
  const { data: articles, isLoading } = useQuery<Article[]>({
    queryKey: ['/api/articles'],
  });

  // Set active tab based on URL parameter
  useEffect(() => {
    if (categoryParam) {
      setActiveTab(categoryParam.toLowerCase());
    } else {
      setActiveTab('all');
    }
  }, [categoryParam]);

  // Filter articles when tab changes or search term changes
  useEffect(() => {
    if (!articles) return;
    
    let filtered = [...articles];
    
    // Filter by category if not "all"
    if (activeTab !== 'all') {
      filtered = filtered.filter(article => 
        article.category.toLowerCase() === activeTab
      );
    }
    
    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(article => 
        article.title.toLowerCase().includes(term) ||
        article.excerpt.toLowerCase().includes(term) ||
        article.content.toLowerCase().includes(term)
      );
    }
    
    setFilteredArticles(filtered);
  }, [articles, activeTab, searchTerm]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSearchTerm('');
    
    // Update URL with category parameter
    if (value === 'all') {
      setLocation('/articles');
    } else {
      const category = value.charAt(0).toUpperCase() + value.slice(1);
      setLocation(`/articles?category=${encodeURIComponent(category)}`);
    }
  };

  const navigateToArticle = (id: number) => {
    setLocation(`/article/${id}`);
  };

  const getCategoryClassName = (category: string) => {
    switch (category) {
      case 'Hygiene Tips':
        return 'article-tag article-tag-hygiene';
      case 'Accessibility':
        return 'article-tag article-tag-accessibility';
      case 'Eco-Friendly':
        return 'article-tag article-tag-eco';
      default:
        return 'article-tag article-tag-hygiene';
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Bathroom Hygiene & Wellness Resources</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Expert advice, tips, and articles to promote better hygiene practices and destigmatize bathroom-related topics.
        </p>
      </div>
      
      <div className="max-w-5xl mx-auto">
        {/* Search Bar */}
        <div className="relative mb-8">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <Input 
            type="text"
            placeholder="Search articles..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {/* Category Tabs */}
        <Tabs defaultValue={activeTab} onValueChange={handleTabChange} className="mb-8">
          <TabsList className="w-full grid grid-cols-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="hygiene tips">Hygiene</TabsTrigger>
            <TabsTrigger value="accessibility">Accessibility</TabsTrigger>
            <TabsTrigger value="eco-friendly">Eco-Friendly</TabsTrigger>
          </TabsList>
        </Tabs>
        
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
            {filteredArticles.map((article) => (
              <Card 
                key={article.id}
                className="overflow-hidden shadow-md transition hover:shadow-lg cursor-pointer" 
                onClick={() => navigateToArticle(article.id)}
              >
                <img 
                  src={article.imageUrl || ""} 
                  alt={article.title} 
                  className="w-full h-48 object-cover"
                />
                <CardContent className="p-6">
                  <span className={getCategoryClassName(article.category)}>{article.category}</span>
                  <h3 className="text-xl font-semibold mt-3 mb-2">{article.title}</h3>
                  <p className="text-gray-600 text-sm line-clamp-3">{article.excerpt}</p>
                </CardContent>
                <CardFooter className="pt-0 pb-6 px-6">
                  <span className="text-primary font-medium hover:text-blue-700 inline-flex items-center">
                    Read Article <i className="fas fa-arrow-right ml-2"></i>
                  </span>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <CardContent>
              <div className="text-6xl mb-4 text-gray-300">
                <i className="fas fa-file-alt"></i>
              </div>
              <h3 className="text-xl font-semibold mb-2">No Articles Found</h3>
              <p className="text-gray-600 mb-6">
                We couldn't find any articles matching your search criteria.
              </p>
              <Button variant="outline" onClick={() => {
                setSearchTerm('');
                handleTabChange('all');
              }}>
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}
        
        {/* Call to Action for Injoy */}
        <div className="mt-16 bg-gradient-to-r from-blue-800 to-primary text-white rounded-lg p-8">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-2/3 mb-6 md:mb-0 md:pr-8">
              <h3 className="text-2xl font-bold mb-3">Enhance Your Personal Hygiene Routine</h3>
              <p className="mb-4 opacity-90">
                Discover premium products from Injoy Bio that complement the hygiene practices discussed in our articles.
              </p>
              <Button 
                asChild
                className="bg-white text-primary hover:bg-gray-100"
              >
                <a 
                  href="https://injoy.bio" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  Visit Injoy Bio
                </a>
              </Button>
            </div>
            <div className="md:w-1/3">
              <img 
                src="https://images.unsplash.com/photo-1615900119312-2acd3a71f3aa?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&q=80" 
                alt="Premium bathroom hygiene products" 
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Articles;
