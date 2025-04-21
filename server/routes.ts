import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertRestroomSchema, insertReviewSchema, insertArticleSchema, insertUserSchema, insertTestimonialSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // API prefix
  const apiPrefix = "/api";
  
  // Health check endpoint
  app.get(`${apiPrefix}/health`, (req: Request, res: Response) => {
    res.json({ status: "ok" });
  });
  
  // User endpoints
  app.post(`${apiPrefix}/users`, async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByUsername(userData.username);
      
      if (existingUser) {
        return res.status(409).json({ message: "Username already exists" });
      }
      
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid input", errors: error.errors });
      } else {
        res.status(500).json({ message: "Server error" });
      }
    }
  });
  
  // Restroom endpoints
  app.get(`${apiPrefix}/restrooms`, async (req: Request, res: Response) => {
    try {
      const restrooms = await storage.getRestrooms();
      res.json(restrooms);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.get(`${apiPrefix}/restrooms/:id`, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      const restroom = await storage.getRestroomById(id);
      if (!restroom) {
        return res.status(404).json({ message: "Restroom not found" });
      }
      
      res.json(restroom);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.post(`${apiPrefix}/restrooms`, async (req: Request, res: Response) => {
    try {
      const restroomData = insertRestroomSchema.parse(req.body);
      const restroom = await storage.createRestroom(restroomData);
      res.status(201).json(restroom);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid input", errors: error.errors });
      } else {
        res.status(500).json({ message: "Server error" });
      }
    }
  });
  
  app.get(`${apiPrefix}/restrooms/nearby`, async (req: Request, res: Response) => {
    try {
      const { latitude, longitude } = req.query;
      
      if (!latitude || !longitude || typeof latitude !== 'string' || typeof longitude !== 'string') {
        return res.status(400).json({ message: "Latitude and longitude are required" });
      }
      
      const restrooms = await storage.getNearbyRestrooms(latitude, longitude);
      res.json(restrooms);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.get(`${apiPrefix}/restrooms/search`, async (req: Request, res: Response) => {
    try {
      const { query } = req.query;
      
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ message: "Search query is required" });
      }
      
      const restrooms = await storage.searchRestrooms(query);
      res.json(restrooms);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.post(`${apiPrefix}/restrooms/filter`, async (req: Request, res: Response) => {
    try {
      const filters = req.body;
      
      // Basic validation that filters object exists
      if (!filters || typeof filters !== 'object') {
        return res.status(400).json({ message: "Filter criteria are required" });
      }
      
      const restrooms = await storage.filterRestrooms(filters);
      res.json(restrooms);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Review endpoints
  app.get(`${apiPrefix}/restrooms/:id/reviews`, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      const reviews = await storage.getReviews(id);
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.post(`${apiPrefix}/reviews`, async (req: Request, res: Response) => {
    try {
      const reviewData = insertReviewSchema.parse(req.body);
      const review = await storage.createReview(reviewData);
      res.status(201).json(review);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid input", errors: error.errors });
      } else {
        res.status(500).json({ message: "Server error" });
      }
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
  
  app.get(`${apiPrefix}/articles/:id`, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      const article = await storage.getArticleById(id);
      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }
      
      res.json(article);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.get(`${apiPrefix}/articles/category/:category`, async (req: Request, res: Response) => {
    try {
      const { category } = req.params;
      
      if (!category) {
        return res.status(400).json({ message: "Category is required" });
      }
      
      const articles = await storage.getArticlesByCategory(category);
      res.json(articles);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.post(`${apiPrefix}/articles`, async (req: Request, res: Response) => {
    try {
      const articleData = insertArticleSchema.parse(req.body);
      const article = await storage.createArticle(articleData);
      res.status(201).json(article);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid input", errors: error.errors });
      } else {
        res.status(500).json({ message: "Server error" });
      }
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
  
  app.post(`${apiPrefix}/testimonials`, async (req: Request, res: Response) => {
    try {
      const testimonialData = insertTestimonialSchema.parse(req.body);
      const testimonial = await storage.createTestimonial(testimonialData);
      res.status(201).json(testimonial);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid input", errors: error.errors });
      } else {
        res.status(500).json({ message: "Server error" });
      }
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
