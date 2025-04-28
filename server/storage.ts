import { neonConfig } from "@neondatabase/serverless";
import pg from "pg";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

import {
  Article,
  PublicBathroomReview,
  PublicBathroomWithRating,
  Testimonial,
  articleIdSchema,
  articleSchema,
  categoryParamSchema,
  nearbyParamsSchema,
  publicBathroomSchema,
  restroomIdSchema,
  reviewSchema,
  searchParamsSchema,
  testimonialSchema,
} from "../shared/schema";
import type {
  IStorage,
  PublicBathroomAccessibilityFeature,
  PublicBathroomAddress,
  PublicBathroomCategory,
  PublicBathroomImage,
  PublicBathroomOpeningHour,
} from "./types";

const { Pool } = pg;

function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number | undefined,
  lon2: number | undefined
): number {
  if (!lat1 || !lon1 || !lat2 || !lon2) {
    return Number.MAX_VALUE;
  }

  // Haversine formula for calculating distance between two points on Earth
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export class SqlStorage implements IStorage {
  private pool: pg.Pool;

  constructor(connectionString: string) {
    if (!connectionString) {
      throw new Error(
        "DATABASE_URL must be set. Did you forget to provision a database?"
      );
    }

    console.log("Initializing database connection pool...", connectionString);

    try {
      this.pool = new Pool({ connectionString });

      // Test connection on startup
      this.testConnection();
    } catch (error) {
      console.error("Failed to initialize database connection:", error);
      throw error;
    }
  }

  // Method to test database connection
  async testConnection(): Promise<void> {
    try {
      const client = await this.pool.connect();
      const result = await client.query("SELECT NOW()");
      console.log("Database connection successful:", result.rows[0]);
      client.release();
    } catch (error) {
      console.error(
        "Database connection test failed:",
        JSON.stringify(error, null, 2)
      );
      throw new Error(
        `Database connection failed: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  // Public bathroom methods
  async getPublicBathrooms(): Promise<PublicBathroomWithRating[]> {
    const query = `
      select pb.*, 
        coalesce(avg(r.rating), 0) as average_rating,
        count(r.id) as review_count
      from app_public.public_bathrooms pb
      left join app_public.public_bathroom_reviews r on r.public_bathroom_id = pb.id
      group by pb.id
    `;

    const { rows } = await this.pool.query(query);
    const bathrooms = rows.map((row) =>
      this.mapToPublicBathroomWithRating(row)
    );

    // Validate each bathroom with Zod
    const validatedBathrooms: PublicBathroomWithRating[] = [];

    for (const bathroom of bathrooms) {
      try {
        // Validate using the schema
        const validatedBathroom = publicBathroomSchema.parse(bathroom);
        validatedBathrooms.push(validatedBathroom as PublicBathroomWithRating);
      } catch (error) {
        console.error("Invalid bathroom data:", error, bathroom);
        // Skip invalid data
      }
    }

    return validatedBathrooms;
  }

  async getPublicBathroomById(
    id: string
  ): Promise<PublicBathroomWithRating | null> {
    // Validate the ID parameter
    try {
      restroomIdSchema.parse({ id });
    } catch (error) {
      throw new Error(`Invalid restroom ID: ${error}`);
    }

    const query = `
      select pb.*, 
        coalesce(avg(r.rating), 0) as average_rating,
        count(r.id) as review_count
      from app_public.public_bathrooms pb
      left join app_public.public_bathroom_reviews r on r.public_bathroom_id = pb.id
      where pb.id = $1
      group by pb.id
    `;

    const { rows } = await this.pool.query(query, [id]);

    if (rows.length === 0) {
      return null;
    }

    const bathroom = this.mapToPublicBathroomWithRating(rows[0]);

    // Validate the bathroom data
    try {
      return publicBathroomSchema.parse(bathroom) as PublicBathroomWithRating;
    } catch (error) {
      console.error("Invalid bathroom data:", error, bathroom);
      return null;
    }
  }

  async getNearbyPublicBathrooms(
    latitude: number,
    longitude: number,
    limit: number = 20,
    radius: number = 5  // Default radius in kilometers
  ): Promise<PublicBathroomWithRating[]> {
    try {
      nearbyParamsSchema.parse({ latitude, longitude, limit });
    } catch (error) {
      throw new Error(`Invalid nearby parameters: ${error}`);
    }

    // Optimized query using the spatial index with two-step filtering
    const query = `
      select 
        pb.*,
        coalesce(avg(r.rating), 0) as average_rating,
        count(r.id) as review_count,
        st_distance(
          st_makepoint($2, $1)::geography,
          pb.location,
          true
        ) as distance
      from public_bathrooms pb
      left join public_bathroom_reviews r on r.public_bathroom_id = pb.id
      where pb.location && st_expand(st_makepoint($2, $1)::geography, $4 * 1000)
        and st_dwithin(
          st_makepoint($2, $1)::geography,
          pb.location,
          $4 * 1000,  -- Convert km to meters
          true
        )
      group by pb.id
      order by distance
      limit $3
    `;

    const { rows } = await this.pool.query(query, [latitude, longitude, limit, radius]);

    // Map and validate results
    const validatedBathrooms: PublicBathroomWithRating[] = [];

    for (const row of rows) {
      try {
        const bathroom = this.mapToPublicBathroomWithRating(row);
        
        // Set the distance from PostGIS calculation
        bathroom.distance = parseFloat(row.distance) / 1000; // Convert meters to kilometers
        
        // Validate using the schema
        const validatedBathroom = publicBathroomSchema.parse(bathroom);
        validatedBathrooms.push(validatedBathroom as PublicBathroomWithRating);
      } catch (error) {
        console.error("Invalid bathroom data:", error, row);
        // Skip invalid data
      }
    }

    return validatedBathrooms;
  }

  async searchPublicBathrooms(
    query: string,
    filters: Record<string, any> = {}
  ): Promise<PublicBathroomWithRating[]> {
    // Validate search parameters
    try {
      // Convert filters to a format that matches our schema
      const searchParams = {
        query,
        wheelchairAccessible: filters.wheelchairAccessible,
        minRating: filters.minRating,
        latitude: filters.latitude,
        longitude: filters.longitude,
      };

      searchParamsSchema.parse(searchParams);
    } catch (error) {
      throw new Error(`Invalid search parameters: ${error}`);
    }

    // Start building the query with joins
    let sqlQuery = `
      select distinct pb.*, 
        coalesce(avg(r.rating), 0) as average_rating,
        count(r.id) as review_count
      from app_public.public_bathrooms pb
      left join app_public.public_bathroom_reviews r on r.public_bathroom_id = pb.id
      left join app_public.public_bathroom_addresses addr on addr.public_bathroom_id = pb.id
    `;

    // Add join for wheelchair accessibility filter if needed
    if (filters.wheelchairAccessible) {
      sqlQuery += `
        left join app_public.public_bathroom_accessibility_features af on af.public_bathroom_id = pb.id
      `;
    }

    // Start building WHERE conditions
    const conditions: string[] = [];
    const params: any[] = [];
    let paramCount = 1;

    // Add text search condition
    conditions.push(`(
      pb.title ilike $${paramCount} or
      pb.address ilike $${paramCount} or
      pb.description ilike $${paramCount} or
      addr.street ilike $${paramCount} or
      addr.city ilike $${paramCount} or
      addr.state ilike $${paramCount} or
      addr.postal_code ilike $${paramCount} or
      addr.country ilike $${paramCount}
    )`);
    params.push(`%${query}%`);
    paramCount++;

    // Add wheelchair accessibility filter
    if (filters.wheelchairAccessible) {
      conditions.push(
        `(af.enabled = true and af.feature_name = $${paramCount})`
      );
      params.push("Wheelchair-accessible");
      paramCount++;
    }

    // Add minimum rating filter
    if (typeof filters.minRating === "number") {
      conditions.push(`coalesce(avg(r.rating), 0) >= $${paramCount}`);
      params.push(filters.minRating);
      paramCount++;
    }

    // Finalize the query
    if (conditions.length > 0) {
      sqlQuery += ` where ${conditions.join(" and ")}`;
    }

    // Add group by and order clause
    sqlQuery += ` group by pb.id`;

    // Add minimum rating having clause
    if (typeof filters.minRating === "number") {
      sqlQuery += ` having coalesce(avg(r.rating), 0) >= ${filters.minRating}`;
    }

    // Execute the query
    const { rows } = await this.pool.query(sqlQuery, params);

    // Map results to PublicBathroomWithRating objects
    const validatedResults: PublicBathroomWithRating[] = [];

    for (const row of rows) {
      try {
        const bathroom = this.mapToPublicBathroomWithRating(row);

        // Validate using the schema
        const validatedBathroom = publicBathroomSchema.parse(bathroom);
        validatedResults.push(validatedBathroom as PublicBathroomWithRating);
      } catch (error) {
        console.error("Invalid bathroom data:", error, row);
        // Skip invalid data
      }
    }

    // Calculate distances and sort by distance if coordinates are provided
    if (
      typeof filters.latitude === "number" &&
      typeof filters.longitude === "number"
    ) {
      for (const bathroom of validatedResults) {
        bathroom.distance = calculateDistance(
          filters.latitude,
          filters.longitude,
          bathroom.latitude,
          bathroom.longitude
        );
      }

      // Sort by distance
      validatedResults.sort(
        (a, b) =>
          (a.distance || Number.MAX_VALUE) - (b.distance || Number.MAX_VALUE)
      );
    }

    return validatedResults;
  }

  async filterPublicBathrooms(
    filters: Record<string, any>
  ): Promise<PublicBathroomWithRating[]> {
    // Start with base query
    let query = `
      select pb.*, 
        coalesce(avg(r.rating), 0) as average_rating,
        count(r.id) as review_count
      from app_public.public_bathrooms pb
      left join app_public.public_bathroom_reviews r on r.public_bathroom_id = pb.id
    `;

    // Add WHERE clauses based on filters
    const conditions: string[] = [];
    const params: any[] = [];
    let paramCount = 1;

    // Handle specific filters
    if (filters.minRating !== undefined && !isNaN(Number(filters.minRating))) {
      conditions.push(`coalesce(avg(r.rating), 0) >= $${paramCount}`);
      params.push(Number(filters.minRating));
      paramCount++;
    }

    // If we have accessibility feature filters
    if (filters.hasAccessibility) {
      query += ` left join app_public.public_bathroom_accessibility_features af on af.public_bathroom_id = pb.id`;
      conditions.push(
        `(af.enabled = true and af.feature_name = $${paramCount})`
      );
      params.push("Wheelchair-accessible");
      paramCount++;
    }

    if (conditions.length > 0) {
      query += ` where ${conditions.join(" and ")}`;
    }

    query += ` group by pb.id`;

    const { rows } = await this.pool.query(query, params);

    // Map results to PublicBathroomWithRating objects and validate
    const validatedResults: PublicBathroomWithRating[] = [];

    for (const row of rows) {
      try {
        const bathroom = this.mapToPublicBathroomWithRating(row);

        // Validate using the schema
        const validatedBathroom = publicBathroomSchema.parse(bathroom);
        validatedResults.push(validatedBathroom as PublicBathroomWithRating);
      } catch (error) {
        console.error("Invalid bathroom data:", error, row);
        // Skip invalid data
      }
    }

    return validatedResults;
  }

  async getPublicBathroomReviews(
    publicBathroomId: string
  ): Promise<PublicBathroomReview[]> {
    // Validate the ID parameter
    try {
      restroomIdSchema.parse({ id: publicBathroomId });
    } catch (error) {
      throw new Error(`Invalid restroom ID: ${error}`);
    }

    const query = `
      select * from app_public.public_bathroom_reviews
      where public_bathroom_id = $1
      order by review_date desc
    `;

    const { rows } = await this.pool.query(query, [publicBathroomId]);

    // Validate each review with Zod
    const validatedReviews: PublicBathroomReview[] = [];

    for (const row of rows) {
      try {
        // Validate using the schema
        const validatedReview = reviewSchema.parse(row);
        validatedReviews.push(validatedReview);
      } catch (error) {
        console.error("Invalid review data:", error, row);
        // Skip invalid data
      }
    }

    return validatedReviews;
  }

  // Article methods
  async getArticles(): Promise<Article[]> {
    const query = `
      select * from app_public.articles
      order by created_at desc
    `;

    const { rows } = await this.pool.query(query);

    // Validate each article with Zod
    const validatedArticles: Article[] = [];

    for (const row of rows) {
      try {
        // Convert date strings to Date objects
        const processedRow = {
          ...row,
          created_at: new Date(row.created_at),
          updated_at: new Date(row.updated_at),
        };

        // Validate using the schema
        const validatedArticle = articleSchema.parse(processedRow);
        validatedArticles.push(validatedArticle);
      } catch (error) {
        console.error("Invalid article data:", error, row);
        // Skip invalid data
      }
    }

    return validatedArticles;
  }

  async getArticleById(id: number): Promise<Article | null> {
    // Validate the ID parameter
    try {
      articleIdSchema.parse({ id });
    } catch (error) {
      throw new Error(`Invalid article ID: ${error}`);
    }

    const query = `
      select * from app_public.articles
      where id = $1
    `;

    const { rows } = await this.pool.query(query, [id]);

    if (rows.length === 0) {
      return null;
    }

    // Convert date strings to Date objects
    const processedRow = {
      ...rows[0],
      created_at: new Date(rows[0].created_at),
      updated_at: new Date(rows[0].updated_at),
    };

    // Validate the article data
    try {
      return articleSchema.parse(processedRow);
    } catch (error) {
      console.error("Invalid article data:", error, rows[0]);
      return null;
    }
  }

  async getArticlesByCategory(category: string): Promise<Article[]> {
    // Validate the category parameter
    try {
      categoryParamSchema.parse({ category });
    } catch (error) {
      throw new Error(`Invalid category: ${error}`);
    }

    // Search for articles with matching category (including comma-separated values)
    const query = `
      select * from app_public.articles
      where category = $1 
      or category like $2
      or category like $3
      or category like $4
      order by created_at desc
    `;

    // Parameters to match different positions of the category in the comma-separated list
    const { rows } = await this.pool.query(query, [
      category, // Exact match
      `${category},%`, // Category at start
      `%,${category},%`, // Category in middle
      `%,${category}`, // Category at end
    ]);

    // Validate each article with Zod
    const validatedArticles: Article[] = [];

    for (const row of rows) {
      try {
        // Convert date strings to Date objects
        const processedRow = {
          ...row,
          created_at: new Date(row.created_at),
          updated_at: new Date(row.updated_at),
        };

        // Validate using the schema
        const validatedArticle = articleSchema.parse(processedRow);
        validatedArticles.push(validatedArticle);
      } catch (error) {
        console.error("Invalid article data:", error, row);
        // Skip invalid data
      }
    }

    return validatedArticles;
  }

  async getArticlesWithPagination(
    page: number = 1,
    limit: number = 10
  ): Promise<{ articles: Article[]; total: number }> {
    const offset = (page - 1) * limit;

    // Get total count
    const countQuery = `
    select count(*) as total from app_public.articles
  `;

    // Get paginated articles
    const articlesQuery = `
    select * from app_public.articles
    order by created_at desc
    limit $1 offset $2
  `;

    const [countResult, articlesResult] = await Promise.all([
      this.pool.query(countQuery),
      this.pool.query(articlesQuery, [limit, offset]),
    ]);

    const total = parseInt(countResult.rows[0].total) || 0;

    // Validate each article with Zod
    const validatedArticles: Article[] = [];

    for (const row of articlesResult.rows) {
      try {
        // Convert date strings to Date objects
        const processedRow = {
          ...row,
          created_at: new Date(row.created_at),
          updated_at: new Date(row.updated_at),
        };

        // Validate using the schema
        const validatedArticle = articleSchema.parse(processedRow);
        validatedArticles.push(validatedArticle);
      } catch (error) {
        console.error("Invalid article data:", error, row);
        // Skip invalid data
      }
    }

    return {
      articles: validatedArticles,
      total,
    };
  }

  async searchArticles(searchTerm: string): Promise<Article[]> {
    const query = `
      select * from app_public.articles
      where 
        title ilike $1 or 
        content ilike $1 or 
        excerpt ilike $1 or
        category ilike $1
      order by created_at desc
    `;

    const { rows } = await this.pool.query(query, [`%${searchTerm}%`]);

    // Validate each article with Zod
    const validatedArticles: Article[] = [];

    for (const row of rows) {
      try {
        // Convert date strings to Date objects
        const processedRow = {
          ...row,
          created_at: new Date(row.created_at),
          updated_at: new Date(row.updated_at),
        };

        // Validate using the schema
        const validatedArticle = articleSchema.parse(processedRow);
        validatedArticles.push(validatedArticle);
      } catch (error) {
        console.error("Invalid article data:", error, row);
        // Skip invalid data
      }
    }

    return validatedArticles;
  }

  // Testimonial methods
  async getTestimonials(): Promise<Testimonial[]> {
    const query = `
      select * from app_public.testimonials
      order by created_at desc
    `;

    const { rows } = await this.pool.query(query);

    // Validate each testimonial with Zod
    const validatedTestimonials: Testimonial[] = [];

    for (const row of rows) {
      try {
        // Validate using the schema
        const validatedTestimonial = testimonialSchema.parse(row);
        validatedTestimonials.push(validatedTestimonial);
      } catch (error) {
        console.error("Invalid testimonial data:", error, row);
        // Skip invalid data
      }
    }

    return validatedTestimonials;
  }

  // Related entity methods
  async getPublicBathroomImages(
    publicBathroomId: string
  ): Promise<PublicBathroomImage[]> {
    // Validate the ID parameter
    try {
      restroomIdSchema.parse({ id: publicBathroomId });
    } catch (error) {
      throw new Error(`Invalid restroom ID: ${error}`);
    }

    const query = `
      select * from app_public.public_bathroom_images
      where public_bathroom_id = $1
    `;

    const { rows } = await this.pool.query(query, [publicBathroomId]);
    return rows;
  }

  async getPublicBathroomAddress(
    publicBathroomId: string
  ): Promise<PublicBathroomAddress | null> {
    // Validate the ID parameter
    try {
      restroomIdSchema.parse({ id: publicBathroomId });
    } catch (error) {
      throw new Error(`Invalid restroom ID: ${error}`);
    }

    const query = `
      select * from app_public.public_bathroom_addresses
      where public_bathroom_id = $1
    `;

    const { rows } = await this.pool.query(query, [publicBathroomId]);

    if (rows.length === 0) {
      return null;
    }

    return rows[0];
  }

  async getPublicBathroomAccessibilityFeatures(
    publicBathroomId: string
  ): Promise<PublicBathroomAccessibilityFeature[]> {
    // Validate the ID parameter
    try {
      restroomIdSchema.parse({ id: publicBathroomId });
    } catch (error) {
      throw new Error(`Invalid restroom ID: ${error}`);
    }

    const query = `
      select * from app_public.public_bathroom_accessibility_features
      where public_bathroom_id = $1
    `;

    const { rows } = await this.pool.query(query, [publicBathroomId]);
    return rows;
  }

  async getPublicBathroomCategories(
    publicBathroomId: string
  ): Promise<PublicBathroomCategory[]> {
    // Validate the ID parameter
    try {
      restroomIdSchema.parse({ id: publicBathroomId });
    } catch (error) {
      throw new Error(`Invalid restroom ID: ${error}`);
    }

    const query = `
      select * from app_public.public_bathroom_categories
      where public_bathroom_id = $1
    `;

    const { rows } = await this.pool.query(query, [publicBathroomId]);
    return rows;
  }

  async getPublicBathroomOpeningHours(
    publicBathroomId: string
  ): Promise<PublicBathroomOpeningHour[]> {
    // Validate the ID parameter
    try {
      restroomIdSchema.parse({ id: publicBathroomId });
    } catch (error) {
      throw new Error(`Invalid restroom ID: ${error}`);
    }

    const query = `
      select * from app_public.public_bathroom_opening_hours
      where public_bathroom_id = $1
      order by 
        case 
          when day_of_week = 'Monday' then 1
          when day_of_week = 'Tuesday' then 2
          when day_of_week = 'Wednesday' then 3
          when day_of_week = 'Thursday' then 4
          when day_of_week = 'Friday' then 5
          when day_of_week = 'Saturday' then 6
          when day_of_week = 'Sunday' then 7
        end
    `;

    const { rows } = await this.pool.query(query, [publicBathroomId]);
    return rows;
  }

  private mapToPublicBathroomWithRating(row: any): PublicBathroomWithRating {
    return {
      id: row.id,
      title: row.title,
      link: row.link,
      status: row.status,
      address: row.address,
      data_id: row.data_id,
      category: row.category,
      latitude: row.latitude,
      longitude: row.longitude,
      timezone: row.timezone,
      web_site: row.web_site,
      plus_code: row.plus_code,
      thumbnail: row.thumbnail,
      description: row.description,
      price_range: row.price_range,
      review_count: parseInt(row.review_count) || 0,
      review_rating: parseFloat(row.average_rating) || 0,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }
}

export const storage = new SqlStorage(process.env.DATABASE_URL!);

// For testing purposes only
export function getTestStorage(connectionString: string): IStorage {
  return new SqlStorage(connectionString);
}
