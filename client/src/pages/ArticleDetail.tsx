import React from 'react';
import { useRoute, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowLeft, Calendar, User } from 'lucide-react';
import { Article } from '@shared/schema';

const ArticleDetail: React.FC = () => {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute<{ id: string }>('/article/:id');
  
  const articleId = match ? parseInt(params.id) : -1;

  // Fetch article details
  const { data: article, isLoading, error } = useQuery<Article>({
    queryKey: [`/api/articles/${articleId}`],
    enabled: articleId > 0,
  });

  // Format date for display
  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  // Get category class for styling
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

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
            <h1 className="text-2xl font-bold mb-2">Article Not Found</h1>
            <p className="text-gray-600 mb-6">The article you're looking for might have been removed or doesn't exist.</p>
            <Button onClick={() => setLocation('/articles')}>
              Browse Other Articles
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

  // Split article content by newlines to create paragraphs
  const paragraphs = article.content.split('\n\n');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <Button 
          variant="ghost" 
          className="mb-6"
          onClick={() => setLocation('/articles')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Articles
        </Button>
        
        <span className={getCategoryClassName(article.category)}>{article.category}</span>
        
        <h1 className="text-3xl md:text-4xl font-bold mt-3 mb-4">{article.title}</h1>
        
        <div className="flex flex-wrap items-center text-gray-500 text-sm mb-8">
          <div className="flex items-center mr-4">
            <User className="h-4 w-4 mr-1" />
            <span>Author</span>
          </div>
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            <span>{formatDate(article.createdAt)}</span>
          </div>
        </div>
        
        {article.imageUrl && (
          <img 
            src={article.imageUrl} 
            alt={article.title} 
            className="w-full h-auto rounded-lg mb-8 shadow-md"
          />
        )}
        
        <div className="prose prose-lg max-w-none">
          {paragraphs.map((paragraph, index) => (
            <p key={index} className="mb-4 text-gray-700 leading-relaxed">
              {paragraph}
            </p>
          ))}
        </div>
        
        {/* Related Articles Section (would normally fetch related articles) */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <h2 className="text-2xl font-bold mb-6">Recommended For You</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="overflow-hidden shadow hover:shadow-md transition">
              <CardContent className="p-6">
                <span className="article-tag article-tag-hygiene">Hygiene Tips</span>
                <h3 className="text-lg font-semibold mt-2 mb-2">Maintain Hygiene on the Go: Travel Tips</h3>
                <p className="text-gray-600 text-sm mb-3">
                  Essential hygiene practices to follow when using public facilities while traveling.
                </p>
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-primary"
                  onClick={() => setLocation('/articles?category=Hygiene%20Tips')}
                >
                  Browse Hygiene Articles
                </Button>
              </CardContent>
            </Card>
            
            <Card className="overflow-hidden shadow hover:shadow-md transition">
              <CardContent className="p-6">
                <span className="article-tag article-tag-eco">Eco-Friendly</span>
                <h3 className="text-lg font-semibold mt-2 mb-2">Sustainable Hygiene Products from Injoy Bio</h3>
                <p className="text-gray-600 text-sm mb-3">
                  Discover eco-friendly alternatives that are better for you and the environment.
                </p>
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-primary"
                  asChild
                >
                  <a href="https://injoy.bio" target="_blank" rel="noopener noreferrer">
                    Visit Injoy Bio
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
