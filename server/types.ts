import {
  Article,
  PublicBathroomReview,
  PublicBathroomWithRating,
  Testimonial,
} from "../shared/schema";

export type PublicBathroomImage = {
  id: string;
  public_bathroom_id: string;
  image_url: string;
  title?: string;
  created_at: Date;
  updated_at: Date;
};

export type PublicBathroomAddress = {
  id: string;
  public_bathroom_id: string;
  street?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  borough?: string;
  created_at: Date;
  updated_at: Date;
};

export type PublicBathroomAccessibilityFeature = {
  id: string;
  public_bathroom_id: string;
  feature_name: string;
  enabled: boolean;
  created_at: Date;
  updated_at: Date;
};

export type PublicBathroomCategory = {
  id: string;
  public_bathroom_id: string;
  category_name: string;
  created_at: Date;
  updated_at: Date;
};

export type PublicBathroomOpeningHour = {
  id: string;
  public_bathroom_id: string;
  day_of_week: string;
  hours_text: string;
  created_at: Date;
  updated_at: Date;
};

export type PublicBathroomReviewImage = {
  id: string;
  review_id: string;
  image_url: string;
  created_at: Date;
  updated_at: Date;
};

// Define the read-only storage interface
export interface IStorage {
  // Database connection test
  testConnection?(): Promise<void>;

  // Public Bathroom methods
  getPublicBathrooms(): Promise<PublicBathroomWithRating[]>;
  getPublicBathroomById(id: string): Promise<PublicBathroomWithRating | null>;
  getNearbyPublicBathrooms(
    latitude: number,
    longitude: number,
    limit?: number
  ): Promise<PublicBathroomWithRating[]>;
  searchPublicBathrooms(
    query: string,
    filters?: Record<string, any>
  ): Promise<PublicBathroomWithRating[]>;
  filterPublicBathrooms(
    filters: Record<string, any>
  ): Promise<PublicBathroomWithRating[]>;

  // Review methods
  getPublicBathroomReviews(
    publicBathroomId: string
  ): Promise<PublicBathroomReview[]>;

  // Article methods
  getArticles(): Promise<Article[]>;
  getArticleById(id: number): Promise<Article | null>;
  getArticlesByCategory(category: string): Promise<Article[]>;
  getArticlesWithPagination(
    page?: number,
    limit?: number
  ): Promise<{ articles: Article[]; total: number }>;
  searchArticles(searchTerm: string): Promise<Article[]>;

  // Testimonial methods
  getTestimonials(): Promise<Testimonial[]>;

  // Related entity methods
  getPublicBathroomImages(
    publicBathroomId: string
  ): Promise<PublicBathroomImage[]>;
  getPublicBathroomAddress(
    publicBathroomId: string
  ): Promise<PublicBathroomAddress | null>;
  getPublicBathroomAccessibilityFeatures(
    publicBathroomId: string
  ): Promise<PublicBathroomAccessibilityFeature[]>;
  getPublicBathroomCategories(
    publicBathroomId: string
  ): Promise<PublicBathroomCategory[]>;
  getPublicBathroomOpeningHours(
    publicBathroomId: string
  ): Promise<PublicBathroomOpeningHour[]>;

  // Poop tracking methods
  trackPoop(publicBathroomId: string): Promise<number>;
  getPoopCount(publicBathroomId: string): Promise<number>;
}
