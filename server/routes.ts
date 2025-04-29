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
import Stripe from 'stripe';

// Initialize Stripe
const stripeKey = process.env.NODE_ENV === 'development'
  ? process.env.STRIPE_SECRET_KEY?.replace('sk_live_', 'sk_test_')
  : process.env.STRIPE_SECRET_KEY;

if (!stripeKey) {
  throw new Error('STRIPE_SECRET_KEY is not defined');
}

const stripe = new Stripe(stripeKey, {
  apiVersion: '2025-03-31.basil',
  typescript: true,
  maxNetworkRetries: 3,
  timeout: 10000
});


export async function registerRoutes(app: Express): Promise<Server> {
  // Test database connection on startup
  try {
    // If storage class has a testConnection method, call it
    if (typeof storage.testConnection === 'function') {
      await storage.testConnection();
      console.log("Database connection verified");
    }
  } catch (error) {
    console.error("Failed to connect to database:", error);
    // Register a fallback route to return database error
    app.use((req: Request, res: Response) => {
      res.status(500).json({ 
        message: "Database connection error", 
        details: error instanceof Error ? error.message : String(error)
      });
    });
    // Still create the server but with error state
    return createServer(app);
  }

  // API prefix
  const apiPrefix = "/api";
  
  // Health check endpoint with DB status
  app.get(`${apiPrefix}/health`, async (req: Request, res: Response) => {
    try {
      // Test DB connection
      if (typeof storage.testConnection === 'function') {
        await storage.testConnection();
        res.json({ status: "ok", database: "connected" });
      } else {
        res.json({ status: "ok", database: "unknown" });
      }
    } catch (error) {
      res.json({ 
        status: "degraded", 
        database: "disconnected",
        error: error instanceof Error ? error.message : String(error)
      });
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
      const limitValue = Math.min(limit, 20);
      
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
  
  // Track a poop at a restroom
  app.post(`${apiPrefix}/restrooms/:id/track-poop`, async (req: Request, res: Response) => {
    try {
      const result = restroomIdSchema.safeParse({ id: req.params.id });
      
      if (!result.success) {
        console.error('Invalid restroom ID:', result.error);
        return res.status(400).json({ 
          message: "Invalid restroom ID", 
          errors: result.error.format(),
          details: result.error.errors
        });
      }
      
      const { id } = result.data;
      
      const count = await storage.trackPoop(id);
      res.json({ count });
    } catch (error) {
      console.error('Error in track-poop endpoint:', error);
      if (error instanceof Error) {
        if (error.message.includes('Restroom not found')) {
          return res.status(404).json({ 
            message: error.message,
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
          });
        }
        return res.status(500).json({ 
          message: "Server error", 
          error: error.message,
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
      }
      res.status(500).json({ 
        message: "Server error", 
        error: String(error)
      });
    }
  });

  // Get poop count for a restroom
  app.get(`${apiPrefix}/restrooms/:id/poop-count`, async (req: Request, res: Response) => {
    try {
      const result = restroomIdSchema.safeParse({ id: req.params.id });
      
      if (!result.success) {
        console.error('Invalid restroom ID:', result.error);
        return res.status(400).json({ 
          message: "Invalid restroom ID", 
          errors: result.error.format(),
          details: result.error.errors
        });
      }
      
      const { id } = result.data;
      
      const count = await storage.getPoopCount(id);
      res.json({ count });
    } catch (error) {
      console.error('Error in poop-count endpoint:', error);
      if (error instanceof Error) {
        if (error.message.includes('Restroom not found')) {
          return res.status(404).json({ 
            message: error.message,
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
          });
        }
        return res.status(500).json({ 
          message: "Server error", 
          error: error.message,
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
      }
      res.status(500).json({ 
        message: "Server error", 
        error: String(error)
      });
    }
  });
  
  // Article endpoints
  app.get(`${apiPrefix}/articles`, async (req: Request, res: Response) => {
    try {
      // Check if pagination parameters are provided
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      
      console.log(`Fetching articles page ${page}, limit ${limit}`);
      
      // Get articles with pagination
      const { articles, total } = await storage.getArticlesWithPagination(page, limit);
      
      console.log(`Articles fetched successfully: ${total} total, ${articles.length} returned`);
      
      // Return paginated response
      res.json({
        data: articles,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error("Articles endpoint error:", error);
      res.status(500).json({ message: "Server error", details: error instanceof Error ? error.message : String(error) });
    }
  });
  
  app.get(`${apiPrefix}/articles/search`, async (req: Request, res: Response) => {
    try {
      const { q } = req.query;
      
      if (!q || typeof q !== 'string') {
        return res.status(400).json({ message: "Search query is required" });
      }
      
      const articles = await storage.searchArticles(q);
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

  // Business registration endpoint
  app.post(`${apiPrefix}/business/register`, async (req: Request, res: Response) => {
    let stripeCustomer: Stripe.Customer | null = null;
    let stripeSubscription: Stripe.Subscription | null = null;

    try {
      const {
        name,
        email,
        phone,
        address,
        city,
        state,
        postalCode,
        country,
        businessHours,
        bathroomFeatures,
      } = req.body;

      // Check if business already exists
      const existingBusiness = await storage.getBusinessByEmail(email);
      if (existingBusiness) {
        // If business exists but payment failed, allow retry
        if (existingBusiness.payment_status === 'failed') {
          // Get existing Stripe customer
          stripeCustomer = await stripe.customers.retrieve(existingBusiness.stripe_customer_id) as Stripe.Customer;
          
          // Create a new subscription
          stripeSubscription = await stripe.subscriptions.create({
            customer: stripeCustomer.id,
            items: [{ price: process.env.STRIPE_PRICE_ID }],
            payment_behavior: 'default_incomplete',
            payment_settings: { save_default_payment_method: 'on_subscription' },
            expand: ['latest_invoice.payment_intent'],
          });

          // Update business with new subscription
          await storage.updateBusinessSubscriptionStatus(
            stripeCustomer.id,
            stripeSubscription.id
          );

          return res.json({
            business: existingBusiness,
            subscription: stripeSubscription,
            clientSecret: (stripeSubscription.latest_invoice as Stripe.Invoice & { payment_intent?: { client_secret: string } })?.payment_intent?.client_secret,
            isRetry: true
          });
        }
        
        return res.status(409).json({ 
          message: "Business already registered with this email",
          business: existingBusiness
        });
      }

      // Create a Stripe customer
      stripeCustomer = await stripe.customers.create({
        email,
        name,
        phone,
        metadata: {
          business_name: name,
          business_address: address,
          business_city: city,
          business_state: state,
          business_postal_code: postalCode,
          business_country: country,
        },
      });

      // Create a subscription
      stripeSubscription = await stripe.subscriptions.create({
        customer: stripeCustomer.id,
        items: [{ price: process.env.STRIPE_PRICE_ID }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
      });

      // Register the business in our database
      const business = await storage.registerBusiness({
        name,
        email,
        phone,
        address,
        city,
        state,
        postalCode,
        country,
        stripeCustomerId: stripeCustomer.id,
        stripeSubscriptionId: stripeSubscription.id,
        businessHours,
        bathroomFeatures,
      });

      res.json({
        business,
        subscription: stripeSubscription,
        clientSecret: (stripeSubscription.latest_invoice as Stripe.Invoice & { payment_intent?: { client_secret: string } })?.payment_intent?.client_secret,
        isRetry: false
      });
    } catch (error) {
      console.error('Business registration error:', error);

      // Clean up Stripe resources if database registration failed
      if (stripeSubscription && !stripeCustomer) {
        try {
          await stripe.subscriptions.cancel(stripeSubscription.id);
        } catch (cleanupError) {
          console.error('Failed to cleanup Stripe subscription:', cleanupError);
        }
      }

      if (error instanceof Error) {
        // Handle specific error cases
        if (error.message.includes('duplicate key value')) {
          return res.status(409).json({ 
            message: "Business already registered",
            error: error.message
          });
        }
        
        if (error.message.includes('stripe_customer_id_key')) {
          // If we have a Stripe customer but failed to save it, try to delete it
          if (stripeCustomer) {
            try {
              await stripe.customers.del(stripeCustomer.id);
            } catch (cleanupError) {
              console.error('Failed to cleanup Stripe customer:', cleanupError);
            }
          }
          return res.status(409).json({ 
            message: "Business already registered with Stripe",
            error: error.message
          });
        }
      }

      res.status(500).json({ 
        message: "Failed to register business", 
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Stripe webhook endpoint
  app.post(`${apiPrefix}/stripe/webhook`, async (req: Request, res: Response) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!sig || !endpointSecret) {
      return res.status(400).json({ message: "Missing stripe signature or webhook secret" });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return res.status(400).json({ message: "Webhook signature verification failed" });
    }

    try {
      switch (event.type) {
        case 'customer.subscription.created':
        case 'customer.subscription.updated': {
          const subscription = event.data.object as Stripe.Subscription;
          await storage.updateBusinessSubscriptionStatus(
            subscription.customer as string,
            subscription.status
          );
          break;
        }
        case 'customer.subscription.deleted': {
          const subscription = event.data.object as Stripe.Subscription;
          await storage.updateBusinessSubscriptionStatus(
            subscription.customer as string,
            'canceled'
          );
          break;
        }
        case 'invoice.payment_succeeded': {
          const invoice = event.data.object as Stripe.Invoice & { subscription?: string };
          if (invoice.subscription) {
            await storage.updateBusinessPaymentStatus(
              invoice.customer as string,
              'paid'
            );
          }
          break;
        }
        case 'invoice.payment_failed': {
          const invoice = event.data.object as Stripe.Invoice & { subscription?: string };
          if (invoice.subscription) {
            await storage.updateBusinessPaymentStatus(
              invoice.customer as string,
              'failed'
            );
          }
          break;
        }
      }

      res.json({ received: true });
    } catch (error) {
      console.error('Webhook processing error:', error);
      res.status(500).json({ 
        message: "Failed to process webhook", 
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
