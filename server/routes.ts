import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import {
  searchParamsSchema,
  nearbyParamsSchema,
  restroomIdSchema,
  articleIdSchema,
  categoryParamSchema,
} from "../shared/schema";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // API prefix
  const apiPrefix = "/api";
  
  // Health check endpoint
  app.get(`${apiPrefix}/health`, (req: Request, res: Response) => {
    res.json({ status: "ok" });
  });
  
  // Restroom endpoints
  app.get(`${apiPrefix}/restrooms`, async (req: Request, res: Response) => {
    try {
      const restrooms = await storage.getPublicBathrooms();
      res.json(restrooms);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.get(`${apiPrefix}/restrooms/nearby`, async (req: Request, res: Response) => {
    try {
      // Parsing and validating query parameters
      const result = nearbyParamsSchema.safeParse({
        latitude: req.query.latitude ? parseFloat(req.query.latitude as string) : undefined,
        longitude: req.query.longitude ? parseFloat(req.query.longitude as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined
      });
      
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid parameters", 
          errors: result.error.format() 
        });
      }
      
      const { latitude, longitude, limit = 20 } = result.data;
      const limitValue = Math.min(limit, 20); // Cap at 20
      
      const restrooms = await storage.getNearbyPublicBathrooms(latitude, longitude, limitValue);
      res.json(restrooms);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.get(`${apiPrefix}/restrooms/search`, async (req: Request, res: Response) => {
    try {
      const { query, wheelchairAccessible, minRating, latitude, longitude } = req.query;
      
      // Require search query
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ message: "Search query is required" });
      }
      
      // Validate search parameters
      const searchParams = {
        query: query as string,
        wheelchairAccessible: wheelchairAccessible === 'true',
        minRating: minRating ? parseFloat(minRating as string) : undefined,
        latitude: latitude ? parseFloat(latitude as string) : undefined,
        longitude: longitude ? parseFloat(longitude as string) : undefined
      };
      
      const result = searchParamsSchema.safeParse(searchParams);
      
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid search parameters", 
          errors: result.error.format() 
        });
      }
      
      const { wheelchairAccessible: isAccessible, minRating: rating, latitude: lat, longitude: lng } = result.data;
      
      // Build filters object
      const filters: Record<string, any> = {};
      
      if (isAccessible) {
        filters.wheelchairAccessible = true;
      }
      
      if (rating !== undefined) {
        filters.minRating = rating;
      }
      
      if (lat !== undefined && lng !== undefined) {
        filters.latitude = lat;
        filters.longitude = lng;
      }
      
      const restrooms = await storage.searchPublicBathrooms(query, filters);
      res.json(restrooms);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.get(`${apiPrefix}/restrooms/:id`, async (req: Request, res: Response) => {
    try {
      const result = restroomIdSchema.safeParse({ id: req.params.id });
      
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid restroom ID", 
          errors: result.error.format() 
        });
      }
      
      const { id } = result.data;
      
      const restroom = await storage.getPublicBathroomById(id);
      if (!restroom) {
        return res.status(404).json({ message: "Restroom not found" });
      }
      
      res.json(restroom);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.get(`${apiPrefix}/restrooms/:id/reviews`, async (req: Request, res: Response) => {
    try {
      const result = restroomIdSchema.safeParse({ id: req.params.id });
      
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid restroom ID", 
          errors: result.error.format() 
        });
      }
      
      const { id } = result.data;
      
      const reviews = await storage.getPublicBathroomReviews(id);
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Article endpoints
  app.get(`${apiPrefix}/articles`, async (req: Request, res: Response) => {
    try {
      const articles = await storage.getArticles();
      res.json(articles);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.get(`${apiPrefix}/articles/category/:category`, async (req: Request, res: Response) => {
    try {
      const result = categoryParamSchema.safeParse({ category: req.params.category });
      
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid category", 
          errors: result.error.format() 
        });
      }
      
      const { category } = result.data;
      
      const articles = await storage.getArticlesByCategory(category);
      res.json(articles);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.get(`${apiPrefix}/articles/:id`, async (req: Request, res: Response) => {
    try {
      const idParam = parseInt(req.params.id);
      const result = articleIdSchema.safeParse({ id: idParam });
      
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid article ID", 
          errors: result.error.format() 
        });
      }
      
      const { id } = result.data;
      
      const article = await storage.getArticleById(id);
      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }
      
      res.json(article);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Testimonial endpoints
  app.get(`${apiPrefix}/testimonials`, async (req: Request, res: Response) => {
    try {
      const testimonials = await storage.getTestimonials();
      res.json(testimonials);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
