import { z } from "zod";

// Shared schemas for validation
export const searchParamsSchema = z.object({
  query: z.string().min(1, "Search query is required"),
  wheelchairAccessible: z.boolean().optional(),
  minRating: z.number().min(0).max(5).optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export const nearbyParamsSchema = z.object({
  latitude: z.number({
    required_error: "Latitude is required",
    invalid_type_error: "Latitude must be a number"
  }),
  longitude: z.number({
    required_error: "Longitude is required",
    invalid_type_error: "Longitude must be a number"
  }),
  limit: z.number().min(1).max(20).optional(),
});

export const restroomIdSchema = z.object({
  id: z.string().min(1, "Restroom ID is required")
});

export const articleIdSchema = z.object({
  id: z.number().int().positive("Article ID must be a positive integer")
});

export const categoryParamSchema = z.object({
  category: z.string().min(1, "Category is required")
});

// Result schemas for type safety on responses
export const publicBathroomSchema = z.object({
  id: z.string(),
  title: z.string(),
  link: z.string().optional(),
  status: z.string().optional(),
  address: z.string().optional(),
  data_id: z.string().optional(),
  category: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  timezone: z.string().optional(),
  web_site: z.string().optional(),
  plus_code: z.string().optional(),
  thumbnail: z.string().optional(),
  description: z.string().optional(),
  price_range: z.string().optional(),
  review_count: z.number(),
  review_rating: z.number(),
  poop_count: z.number(),
  distance: z.number().optional(),
  created_at: z.date(),
  updated_at: z.date(),
});

export const articleSchema = z.object({
  id: z.number(),
  title: z.string(),
  content: z.string(),
  excerpt: z.string(),
  image_url: z.string().optional(),
  category: z.string(),
  created_at: z.date(),
  updated_at: z.date(),
});

export const reviewSchema = z.object({
  id: z.string(),
  public_bathroom_id: z.string(),
  reviewer_name: z.string().optional(),
  review_date: z.string().optional(),
  rating: z.number().optional(),
  description: z.string().optional(),
  profile_picture: z.string().optional(),
  created_at: z.date(),
  updated_at: z.date(),
});

export const testimonialSchema = z.object({
  id: z.number(),
  name: z.string(),
  location: z.string(),
  rating: z.number(),
  comment: z.string(),
  created_at: z.date(),
});

// Input types
export type SearchParams = z.infer<typeof searchParamsSchema>;
export type NearbyParams = z.infer<typeof nearbyParamsSchema>;

// Output types
export type PublicBathroom = z.infer<typeof publicBathroomSchema>;
export type PublicBathroomWithRating = PublicBathroom & { distance?: number };
export type Article = z.infer<typeof articleSchema>;
export type PublicBathroomReview = z.infer<typeof reviewSchema>;
export type Testimonial = z.infer<typeof testimonialSchema>; 