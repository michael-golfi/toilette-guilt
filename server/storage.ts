import { 
  users, type User, type InsertUser,
  restrooms, type Restroom, type InsertRestroom, type RestroomWithRating,
  reviews, type Review, type InsertReview,
  articles, type Article, type InsertArticle,
  testimonials, type Testimonial, type InsertTestimonial
} from "@shared/schema";
import { eq, or, ilike } from "drizzle-orm";
import { db } from "./db";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Restroom methods
  getRestrooms(): Promise<RestroomWithRating[]>;
  getRestroomById(id: number): Promise<RestroomWithRating | undefined>;
  getNearbyRestrooms(latitude: string, longitude: string): Promise<RestroomWithRating[]>;
  createRestroom(restroom: InsertRestroom): Promise<Restroom>;
  updateRestroom(id: number, restroom: Partial<Restroom>): Promise<Restroom | undefined>;
  deleteRestroom(id: number): Promise<boolean>;
  searchRestrooms(query: string): Promise<RestroomWithRating[]>;
  filterRestrooms(filters: Partial<Record<string, boolean | number>>): Promise<RestroomWithRating[]>;
  
  // Review methods
  getReviews(restroomId: number): Promise<Review[]>;
  getReviewById(id: number): Promise<Review | undefined>;
  createReview(review: InsertReview): Promise<Review>;
  deleteReview(id: number): Promise<boolean>;
  
  // Article methods
  getArticles(): Promise<Article[]>;
  getArticleById(id: number): Promise<Article | undefined>;
  createArticle(article: InsertArticle): Promise<Article>;
  getArticlesByCategory(category: string): Promise<Article[]>;
  
  // Testimonial methods
  getTestimonials(): Promise<Testimonial[]>;
  createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial>;
}

function calculateDistance(lat1: string, lon1: string, lat2: string, lon2: string): number {
  // Simple placeholder - in a real app, use Haversine formula
  // This is a very basic approximation for demo purposes
  const a = Math.abs(Number(lat1) - Number(lat2));
  const b = Math.abs(Number(lon1) - Number(lon2));
  return Math.sqrt(a * a + b * b) * 111; // 111 km per degree approx
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private restrooms: Map<number, Restroom>;
  private reviews: Map<number, Review>;
  private articles: Map<number, Article>;
  private testimonials: Map<number, Testimonial>;
  private userCurrentId: number;
  private restroomCurrentId: number;
  private reviewCurrentId: number;
  private articleCurrentId: number;
  private testimonialCurrentId: number;

  constructor() {
    this.users = new Map();
    this.restrooms = new Map();
    this.reviews = new Map();
    this.articles = new Map();
    this.testimonials = new Map();
    
    this.userCurrentId = 1;
    this.restroomCurrentId = 1;
    this.reviewCurrentId = 1;
    this.articleCurrentId = 1;
    this.testimonialCurrentId = 1;
    
    // Seed data
    this.seedData();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const timestamp = new Date();
    const user: User = { ...insertUser, id, createdAt: timestamp };
    this.users.set(id, user);
    return user;
  }
  
  // Restroom methods
  async getRestrooms(): Promise<RestroomWithRating[]> {
    const restroomsArray = Array.from(this.restrooms.values());
    return restroomsArray.map(restroom => this.attachRestroomRating(restroom));
  }
  
  async getRestroomById(id: number): Promise<RestroomWithRating | undefined> {
    const restroom = this.restrooms.get(id);
    if (!restroom) return undefined;
    return this.attachRestroomRating(restroom);
  }
  
  async getNearbyRestrooms(latitude: string, longitude: string): Promise<RestroomWithRating[]> {
    const restroomsArray = Array.from(this.restrooms.values());
    
    return restroomsArray
      .map(restroom => {
        const distance = calculateDistance(
          latitude, 
          longitude, 
          restroom.latitude, 
          restroom.longitude
        );
        
        return {
          ...this.attachRestroomRating(restroom),
          distance
        };
      })
      .sort((a, b) => (a.distance || 0) - (b.distance || 0));
  }
  
  async createRestroom(insertRestroom: InsertRestroom): Promise<Restroom> {
    const id = this.restroomCurrentId++;
    const timestamp = new Date();
    const restroom: Restroom = { ...insertRestroom, id, createdAt: timestamp };
    this.restrooms.set(id, restroom);
    return restroom;
  }
  
  async updateRestroom(id: number, restroomUpdate: Partial<Restroom>): Promise<Restroom | undefined> {
    const restroom = this.restrooms.get(id);
    if (!restroom) return undefined;
    
    const updatedRestroom = { ...restroom, ...restroomUpdate };
    this.restrooms.set(id, updatedRestroom);
    return updatedRestroom;
  }
  
  async deleteRestroom(id: number): Promise<boolean> {
    return this.restrooms.delete(id);
  }
  
  async searchRestrooms(query: string): Promise<RestroomWithRating[]> {
    const lowerQuery = query.toLowerCase();
    
    const matchingRestrooms = Array.from(this.restrooms.values()).filter(restroom => 
      restroom.name.toLowerCase().includes(lowerQuery) ||
      restroom.address.toLowerCase().includes(lowerQuery) ||
      restroom.city.toLowerCase().includes(lowerQuery) ||
      restroom.state.toLowerCase().includes(lowerQuery) ||
      restroom.zipCode.toLowerCase().includes(lowerQuery) ||
      restroom.description.toLowerCase().includes(lowerQuery)
    );
    
    return matchingRestrooms.map(restroom => this.attachRestroomRating(restroom));
  }
  
  async filterRestrooms(filters: Partial<Record<string, boolean | number>>): Promise<RestroomWithRating[]> {
    let filteredRestrooms = Array.from(this.restrooms.values());
    
    // Apply boolean filters - only filter when the value is true
    for (const [key, value] of Object.entries(filters)) {
      if (typeof value === 'boolean' && value === true) {
        filteredRestrooms = filteredRestrooms.filter(restroom => 
          // @ts-ignore - Dynamic property access
          restroom[key] === true
        );
      }
    }
    
    // Apply cleanliness rating filter if present
    const minRating = filters.cleanliness as number | undefined;
    if (minRating !== undefined && typeof minRating === 'number') {
      filteredRestrooms = filteredRestrooms.map(restroom => this.attachRestroomRating(restroom))
        .filter(restroom => restroom.averageRating >= minRating);
    } else {
      filteredRestrooms = filteredRestrooms.map(restroom => this.attachRestroomRating(restroom));
    }
    
    // Log the filter criteria and results for debugging
    console.log('Filter criteria:', filters);
    console.log('Filtered restrooms count:', filteredRestrooms.length);
    
    return filteredRestrooms;
  }
  
  // Review methods
  async getReviews(restroomId: number): Promise<Review[]> {
    return Array.from(this.reviews.values())
      .filter(review => review.restroomId === restroomId);
  }
  
  async getReviewById(id: number): Promise<Review | undefined> {
    return this.reviews.get(id);
  }
  
  async createReview(insertReview: InsertReview): Promise<Review> {
    const id = this.reviewCurrentId++;
    const timestamp = new Date();
    const review: Review = { ...insertReview, id, createdAt: timestamp };
    this.reviews.set(id, review);
    return review;
  }
  
  async deleteReview(id: number): Promise<boolean> {
    return this.reviews.delete(id);
  }
  
  // Article methods
  async getArticles(): Promise<Article[]> {
    return Array.from(this.articles.values());
  }
  
  async getArticleById(id: number): Promise<Article | undefined> {
    return this.articles.get(id);
  }
  
  async createArticle(insertArticle: InsertArticle): Promise<Article> {
    const id = this.articleCurrentId++;
    const timestamp = new Date();
    const article: Article = { ...insertArticle, id, createdAt: timestamp };
    this.articles.set(id, article);
    return article;
  }
  
  async getArticlesByCategory(category: string): Promise<Article[]> {
    return Array.from(this.articles.values())
      .filter(article => article.category === category);
  }
  
  // Testimonial methods
  async getTestimonials(): Promise<Testimonial[]> {
    return Array.from(this.testimonials.values());
  }
  
  async createTestimonial(insertTestimonial: InsertTestimonial): Promise<Testimonial> {
    const id = this.testimonialCurrentId++;
    const timestamp = new Date();
    const testimonial: Testimonial = { ...insertTestimonial, id, createdAt: timestamp };
    this.testimonials.set(id, testimonial);
    return testimonial;
  }
  
  // Helper method to calculate average rating
  private attachRestroomRating(restroom: Restroom): RestroomWithRating {
    const restroomReviews = Array.from(this.reviews.values())
      .filter(review => review.restroomId === restroom.id);
    
    const reviewCount = restroomReviews.length;
    
    const averageRating = reviewCount > 0
      ? restroomReviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount
      : 0;
    
    return {
      ...restroom,
      averageRating,
      reviewCount
    };
  }
  
  // Seed method to populate initial data
  private seedData() {
    // Seed users
    const admin: InsertUser = {
      username: "admin",
      password: "password123",
      email: "admin@toiletteguilt.com"
    };
    this.createUser(admin);
    
    // Seed restrooms
    const centralPark: InsertRestroom = {
      name: "Central Park Public Restroom",
      address: "65 Central Park West",
      city: "New York",
      state: "NY",
      zipCode: "10023",
      latitude: "40.7812",
      longitude: "-73.9665",
      description: "This well-maintained public facility features touchless fixtures, clean stalls, and is regularly serviced. Accessible entrance with wide doorways.",
      hours: "6AM-10PM",
      accessibilityFeatures: true,
      babyChanging: true,
      genderNeutral: true,
      freeToUse: true,
      changingRoom: false,
      singleOccupancy: false,
      customerOnly: false,
      codeRequired: false,
      attendantPresent: false,
      familyFriendly: false,
      soapAvailable: true,
      wellStocked: true,
      premiumProducts: false,
      imageUrl: "https://images.unsplash.com/photo-1613214756180-22cfbf6a15b5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
      createdBy: 1
    };
    
    const metroShopping: InsertRestroom = {
      name: "Metropolitan Shopping Center",
      address: "233 Broadway",
      city: "New York",
      state: "NY",
      zipCode: "10279",
      latitude: "40.7128",
      longitude: "-74.0060",
      description: "Luxury shopping center restrooms with attendant service, premium hand soap, and individual cloth towels. Exceptionally clean with elegant fixtures.",
      hours: "9AM-9PM",
      accessibilityFeatures: true,
      babyChanging: true,
      genderNeutral: false,
      freeToUse: true,
      changingRoom: true,
      singleOccupancy: false,
      customerOnly: false,
      codeRequired: false,
      attendantPresent: true,
      familyFriendly: true,
      soapAvailable: true,
      wellStocked: true,
      premiumProducts: true,
      imageUrl: "https://images.unsplash.com/photo-1584622781564-1d987f7333c1?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
      createdBy: 1
    };
    
    const riverside: InsertRestroom = {
      name: "Riverside Coffee Shop",
      address: "78 Hudson River Greenway",
      city: "New York",
      state: "NY",
      zipCode: "10014",
      latitude: "40.7309",
      longitude: "-74.0096",
      description: "Stylish bathroom with artisanal soap and hand lotion. The facilities are clean, though you may need to purchase something to receive the door code.",
      hours: "7AM-8PM",
      accessibilityFeatures: false,
      babyChanging: false,
      genderNeutral: true,
      freeToUse: false,
      changingRoom: false,
      singleOccupancy: true,
      customerOnly: true,
      codeRequired: true,
      attendantPresent: false,
      familyFriendly: false,
      soapAvailable: true,
      wellStocked: true,
      premiumProducts: true,
      imageUrl: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
      createdBy: 1
    };
    
    this.createRestroom(centralPark).then(r1 => {
      this.createRestroom(metroShopping).then(r2 => {
        this.createRestroom(riverside).then(r3 => {
          // Add reviews
          const reviews: InsertReview[] = [
            { restroomId: r1.id, userId: 1, rating: 4, comment: "Very clean and accessible!" },
            { restroomId: r1.id, userId: 1, rating: 5, comment: "Well maintained, soap was fully stocked." },
            { restroomId: r2.id, userId: 1, rating: 5, comment: "Luxury bathroom experience!" },
            { restroomId: r2.id, userId: 1, rating: 4, comment: "Very clean, attendant was helpful." },
            { restroomId: r3.id, userId: 1, rating: 4, comment: "Nice bathroom but had to buy a coffee first." },
          ];
          
          reviews.forEach(review => this.createReview(review));
        });
      });
    });
    
    // Seed articles
    const handwashing: InsertArticle = {
      title: "The Right Way to Wash Your Hands (Most People Get It Wrong)",
      content: "Proper handwashing is one of the most effective ways to prevent the spread of germs and illnesses. According to the World Health Organization (WHO), the correct handwashing technique involves several steps that many people skip or rush through.\n\nHere's the WHO-recommended technique:\n\n1. Wet your hands with clean, running water\n2. Apply enough soap to cover all hand surfaces\n3. Rub hands palm to palm\n4. Rub right palm over left dorsum with interlaced fingers and vice versa\n5. Rub palm to palm with fingers interlaced\n6. Rub backs of fingers to opposing palms with fingers interlocked\n7. Rotational rubbing of left thumb clasped in right palm and vice versa\n8. Rotational rubbing, backward and forward with clasped fingers of right hand in left palm and vice versa\n9. Rinse hands with water\n10. Dry hands thoroughly with a single-use towel\n\nThe entire process should take about 20 seconds - about the time it takes to sing \"Happy Birthday\" twice. Make sure to turn off the faucet using a paper towel to avoid recontamination.\n\nRemember, washing your hands is particularly important:\n- Before, during, and after preparing food\n- Before eating\n- Before and after caring for someone who is sick\n- After using the toilet\n- After changing diapers or cleaning up a child who has used the toilet\n- After blowing your nose, coughing, or sneezing\n- After touching an animal, animal feed, or animal waste\n- After handling pet food or pet treats\n- After touching garbage\n\nBy following these guidelines, you can significantly reduce your risk of getting sick and spreading germs to others.",
      excerpt: "Discover the WHO-recommended handwashing technique that kills 99.9% of germs and helps prevent illness.",
      imageUrl: "https://images.unsplash.com/photo-1585914641050-fa9883c4e21c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
      category: "Hygiene Tips",
      authorId: 1
    };
    
    const accessibility: InsertArticle = {
      title: "Designing Truly Accessible Restrooms: Beyond The Basics",
      content: "While ADA compliance is a crucial starting point for bathroom accessibility, truly inclusive restroom design goes beyond meeting minimum standards. Creating spaces that work for people of all abilities requires thoughtful consideration of diverse needs.\n\nHere are some key elements of truly accessible restroom design:\n\n1. **Beyond Minimum Dimensions**: ADA requires a minimum 60-inch turning radius for wheelchairs, but providing additional space makes navigation much easier, especially for larger mobility devices or when assistance is needed.\n\n2. **Thoughtful Fixture Selection**: Choose faucets, soap dispensers, and hand dryers that can be operated with minimal dexterity or strength. Touchless options are ideal for many users.\n\n3. **Height Variations**: Consider providing amenities at different heights to accommodate wheelchair users, people of different statures, and children.\n\n4. **Clear Signage**: Use high-contrast, large-print text alongside Braille and universally recognized symbols. Position signs at heights visible to seated and standing individuals.\n\n5. **Sensory Considerations**: For neurodivergent individuals, features like adjustable lighting levels, sound dampening, and non-harsh hand dryers can make a significant difference.\n\n6. **Family and Caregiver Support**: Include adult-sized changing tables, adequate space for caregivers, and features that support families with young children.\n\n7. **Emergency Response**: Emergency call systems should be reachable from multiple positions, including from the floor in case of falls.\n\n8. **Gender Inclusivity**: Single-occupancy, gender-neutral facilities provide safe options for everyone, including transgender and non-binary individuals.\n\nDuring the planning phase, involve disability advocates and accessibility consultants who can provide valuable insights from lived experience. Regular post-implementation audits can also help identify areas for improvement.\n\nRemember that accessibility features benefit everyone. Wider doorways help people carrying packages, touchless fixtures reduce germ transmission, and spacious layouts help parents with strollers. When we design for those with the greatest needs, we create better spaces for all users.",
      excerpt: "Why ADA compliance is just the starting point for creating truly inclusive bathroom spaces for all abilities.",
      imageUrl: "https://images.unsplash.com/photo-1594877720771-9723308a2e48?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
      category: "Accessibility",
      authorId: 1
    };
    
    const sustainability: InsertArticle = {
      title: "Sustainable Bathroom Practices: Small Changes With Big Impact",
      content: "The bathroom might be one of the smallest rooms in your home, but it can have one of the biggest environmental footprints. By adopting more sustainable bathroom practices, you can significantly reduce water waste, plastic consumption, and chemical pollution.\n\n**Water Conservation**\n\n1. **Fix Leaks Promptly**: A dripping faucet can waste up to 3,000 gallons of water per year. Check for leaks regularly and repair them quickly.\n\n2. **Install Low-Flow Fixtures**: Modern low-flow showerheads can reduce water usage by up to 60% without compromising water pressure or shower experience.\n\n3. **Dual-Flush Toilets**: These allow you to use less water for liquid waste and more for solid waste, reducing overall water consumption.\n\n4. **Turn Off the Tap**: Don't let water run while brushing teeth, shaving, or washing your face. This simple habit can save hundreds of gallons monthly.\n\n**Reducing Plastic Waste**\n\n1. **Switch to Bar Products**: Bar soap, shampoo, and conditioner eliminate the need for plastic bottles and often last longer than liquid versions.\n\n2. **Refillable Dispensers**: For products that must be liquid, use refillable dispensers and buy in bulk to reduce packaging waste.\n\n3. **Bamboo Alternatives**: Replace plastic toothbrushes, cotton swabs, and razors with bamboo or other biodegradable materials.\n\n4. **Reusable Cloth**: Swap disposable makeup wipes and cotton pads for washable, reusable alternatives made from organic cotton or bamboo.\n\n**Chemical Reduction**\n\n1. **Natural Cleaning Products**: Vinegar, baking soda, and castile soap can effectively clean most bathroom surfaces without harsh chemicals.\n\n2. **DIY Solutions**: Make your own cleaning sprays using essential oils like tea tree and eucalyptus, which have natural antibacterial properties.\n\n3. **Look for Certifications**: When purchasing products, look for legitimate eco-certifications like ECOLOGO, Green Seal, or EPA Safer Choice.\n\n**Public Restroom Eco-Practices**\n\n1. **Use Hand Dryers**: When available, opt for hand dryers instead of paper towels to reduce paper waste.\n\n2. **Report Problems**: Notify management about leaks, running toilets, or other water-wasting issues.\n\n3. **Carry Reusables**: Keep a small reusable towel in your bag for drying hands when dryers aren't available.\n\nEvery small change adds up. By implementing even a few of these sustainable practices, you'll be contributing to significant environmental protection. Remember, the most sustainable products are often those you already own—use what you have before replacing items with eco-friendly alternatives.",
      excerpt: "From water conservation to eco-friendly products, learn how your bathroom habits can help the planet.",
      imageUrl: "https://images.unsplash.com/photo-1583947582886-f40ec95cc4c7?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
      category: "Eco-Friendly",
      authorId: 1
    };
    
    this.createArticle(handwashing);
    this.createArticle(accessibility);
    this.createArticle(sustainability);
    
    // Seed testimonials
    const testimonials: InsertTestimonial[] = [
      {
        name: "Sarah K.",
        location: "New York, NY",
        rating: 5,
        comment: "This app is a lifesaver! As someone with IBS, knowing where clean restrooms are located has decreased my anxiety about going out. Thank you for destigmatizing this important topic!"
      },
      {
        name: "Michael T.",
        location: "Chicago, IL",
        rating: 4,
        comment: "As a parent of young children, finding restrooms with changing tables is crucial. This directory has made our family outings so much less stressful. The reviews are accurate and helpful!"
      },
      {
        name: "Jamie L.",
        location: "San Francisco, CA",
        rating: 5,
        comment: "I discovered Injoy Bio through this site and their products are amazing! The bathroom hygiene articles have also been super informative. It's refreshing to see these topics discussed openly."
      }
    ];
    
    testimonials.forEach(testimonial => this.createTestimonial(testimonial));
  }
}

// Database Storage implementation
export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }
  
  // Restroom methods
  async getRestrooms(): Promise<RestroomWithRating[]> {
    const allRestrooms = await db.select().from(restrooms);
    return Promise.all(allRestrooms.map(async (restroom) => this.attachRestroomRating(restroom)));
  }
  
  async getRestroomById(id: number): Promise<RestroomWithRating | undefined> {
    const [restroom] = await db.select().from(restrooms).where(eq(restrooms.id, id));
    if (!restroom) return undefined;
    return this.attachRestroomRating(restroom);
  }
  
  async getNearbyRestrooms(latitude: string, longitude: string): Promise<RestroomWithRating[]> {
    const allRestrooms = await db.select().from(restrooms);
    
    const restroomsWithDistance = await Promise.all(
      allRestrooms.map(async (restroom) => {
        const distance = calculateDistance(
          latitude,
          longitude,
          restroom.latitude,
          restroom.longitude
        );
        
        const withRating = await this.attachRestroomRating(restroom);
        return {
          ...withRating,
          distance
        };
      })
    );
    
    return restroomsWithDistance.sort((a, b) => (a.distance || 0) - (b.distance || 0));
  }
  
  async createRestroom(insertRestroom: InsertRestroom): Promise<Restroom> {
    const [restroom] = await db
      .insert(restrooms)
      .values(insertRestroom)
      .returning();
    return restroom;
  }
  
  async updateRestroom(id: number, restroomUpdate: Partial<Restroom>): Promise<Restroom | undefined> {
    const [restroom] = await db
      .update(restrooms)
      .set(restroomUpdate)
      .where(eq(restrooms.id, id))
      .returning();
    return restroom || undefined;
  }
  
  async deleteRestroom(id: number): Promise<boolean> {
    await db.delete(restrooms).where(eq(restrooms.id, id));
    return true;
  }
  
  async searchRestrooms(query: string): Promise<RestroomWithRating[]> {
    const lowerQuery = query.toLowerCase();
    
    // Perform search across multiple fields
    const matchingRestrooms = await db
      .select()
      .from(restrooms)
      .where(
        or(
          ilike(restrooms.name, `%${lowerQuery}%`),
          ilike(restrooms.address, `%${lowerQuery}%`),
          ilike(restrooms.city, `%${lowerQuery}%`),
          ilike(restrooms.state, `%${lowerQuery}%`),
          ilike(restrooms.zipCode, `%${lowerQuery}%`),
          ilike(restrooms.description, `%${lowerQuery}%`)
        )
      );
    
    return Promise.all(matchingRestrooms.map(restroom => this.attachRestroomRating(restroom)));
  }
  
  async filterRestrooms(filters: Partial<Record<string, boolean | number>>): Promise<RestroomWithRating[]> {
    let query = db.select().from(restrooms);
    
    // Apply boolean filters (only for true values)
    const booleanColumns = [
      'accessibilityFeatures', 'babyChanging', 'genderNeutral', 'freeToUse',
      'changingRoom', 'singleOccupancy', 'customerOnly', 'codeRequired',
      'attendantPresent', 'familyFriendly', 'soapAvailable', 'wellStocked',
      'premiumProducts'
    ];
    
    for (const column of booleanColumns) {
      if (filters[column] === true) {
        // @ts-ignore - We know these are valid column names
        query = query.where(eq(restrooms[column], true));
      }
    }
    
    // Execute the query
    const filteredRestrooms = await query;
    
    // Get all restrooms with ratings
    const restroomsWithRatings = await Promise.all(
      filteredRestrooms.map(restroom => this.attachRestroomRating(restroom))
    );
    
    // Apply cleanliness rating filter if present
    const minRating = filters.cleanliness as number | undefined;
    if (minRating !== undefined && typeof minRating === 'number' && minRating > 0) {
      return restroomsWithRatings.filter(restroom => restroom.averageRating >= minRating);
    }
    
    return restroomsWithRatings;
  }
  
  // Review methods
  async getReviews(restroomId: number): Promise<Review[]> {
    return db
      .select()
      .from(reviews)
      .where(eq(reviews.restroomId, restroomId));
  }
  
  async getReviewById(id: number): Promise<Review | undefined> {
    const [review] = await db
      .select()
      .from(reviews)
      .where(eq(reviews.id, id));
    return review || undefined;
  }
  
  async createReview(insertReview: InsertReview): Promise<Review> {
    const [review] = await db
      .insert(reviews)
      .values(insertReview)
      .returning();
    return review;
  }
  
  async deleteReview(id: number): Promise<boolean> {
    await db.delete(reviews).where(eq(reviews.id, id));
    return true;
  }
  
  // Article methods
  async getArticles(): Promise<Article[]> {
    return db.select().from(articles);
  }
  
  async getArticleById(id: number): Promise<Article | undefined> {
    const [article] = await db
      .select()
      .from(articles)
      .where(eq(articles.id, id));
    return article || undefined;
  }
  
  async createArticle(insertArticle: InsertArticle): Promise<Article> {
    const [article] = await db
      .insert(articles)
      .values(insertArticle)
      .returning();
    return article;
  }
  
  async getArticlesByCategory(category: string): Promise<Article[]> {
    return db
      .select()
      .from(articles)
      .where(eq(articles.category, category));
  }
  
  // Testimonial methods
  async getTestimonials(): Promise<Testimonial[]> {
    return db.select().from(testimonials);
  }
  
  async createTestimonial(insertTestimonial: InsertTestimonial): Promise<Testimonial> {
    const [testimonial] = await db
      .insert(testimonials)
      .values(insertTestimonial)
      .returning();
    return testimonial;
  }
  
  // Helper method to calculate average rating
  private async attachRestroomRating(restroom: Restroom): Promise<RestroomWithRating> {
    const restroomReviews = await db
      .select()
      .from(reviews)
      .where(eq(reviews.restroomId, restroom.id));
    
    const reviewCount = restroomReviews.length;
    
    const averageRating = reviewCount > 0
      ? restroomReviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount
      : 0;
    
    return {
      ...restroom,
      averageRating,
      reviewCount
    };
  }
}

// Export storage instance
export const storage = new DatabaseStorage();

// Seed the database with initial data
async function seedDatabase() {
  try {
    // Clear existing database data for testing
    try {
      await db.delete(reviews);
      await db.delete(restrooms);
      await db.delete(articles);
      await db.delete(testimonials);
      await db.delete(users);
      console.log('Cleared existing database data for fresh seeding');
    } catch (err) {
      console.log('Error clearing database, continuing with seed:', err);
    }
    
    // Seed fresh data
    console.log('Seeding database with initial data...');
      
      // Create admin user
      const admin = await storage.createUser({
        username: "admin",
        password: "password123",
        email: "admin@toiletteguilt.com"
      });
      
      // Create restrooms
      const centralPark = await storage.createRestroom({
        name: "Central Park Public Restroom",
        address: "65 Central Park West",
        city: "New York",
        state: "NY",
        zipCode: "10023",
        latitude: "40.7812",
        longitude: "-73.9665",
        description: "This well-maintained public facility features touchless fixtures, clean stalls, and is regularly serviced. Accessible entrance with wide doorways.",
        hours: "6AM-10PM",
        accessibilityFeatures: true,
        babyChanging: true,
        genderNeutral: true,
        freeToUse: true,
        changingRoom: false,
        singleOccupancy: false,
        customerOnly: false,
        codeRequired: false,
        attendantPresent: false,
        familyFriendly: false,
        soapAvailable: true,
        wellStocked: true,
        premiumProducts: false,
        imageUrl: "https://images.unsplash.com/photo-1613214756180-22cfbf6a15b5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
        createdBy: admin.id
      });
      
      const metroShopping = await storage.createRestroom({
        name: "Metropolitan Shopping Center",
        address: "233 Broadway",
        city: "New York",
        state: "NY",
        zipCode: "10279",
        latitude: "40.7128",
        longitude: "-74.0060",
        description: "Luxury shopping center restrooms with attendant service, premium hand soap, and individual cloth towels. Exceptionally clean with elegant fixtures.",
        hours: "9AM-9PM",
        accessibilityFeatures: true,
        babyChanging: true,
        genderNeutral: false,
        freeToUse: true,
        changingRoom: true,
        singleOccupancy: false,
        customerOnly: false,
        codeRequired: false,
        attendantPresent: true,
        familyFriendly: true,
        soapAvailable: true,
        wellStocked: true,
        premiumProducts: true,
        imageUrl: "https://images.unsplash.com/photo-1584622781564-1d987f7333c1?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
        createdBy: admin.id
      });
      
      const riverside = await storage.createRestroom({
        name: "Riverside Coffee Shop",
        address: "78 Hudson River Greenway",
        city: "New York",
        state: "NY",
        zipCode: "10014",
        latitude: "40.7309",
        longitude: "-74.0096",
        description: "Stylish bathroom with artisanal soap and hand lotion. The facilities are clean, though you may need to purchase something to receive the door code.",
        hours: "7AM-8PM",
        accessibilityFeatures: false,
        babyChanging: false,
        genderNeutral: true,
        freeToUse: false,
        changingRoom: false,
        singleOccupancy: true,
        customerOnly: true,
        codeRequired: true,
        attendantPresent: false,
        familyFriendly: false,
        soapAvailable: true,
        wellStocked: true,
        premiumProducts: true,
        imageUrl: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
        createdBy: admin.id
      });
      
      // Add more restrooms with diverse filter options for testing
      const grandStation = await storage.createRestroom({
        name: "Grand Central Terminal",
        address: "89 E 42nd Street",
        city: "New York",
        state: "NY",
        zipCode: "10017",
        latitude: "40.7527",
        longitude: "-73.9772",
        description: "Public facilities in the lower concourse of Grand Central. Clean and well-maintained with attendants present during peak hours.",
        hours: "5:30AM-1:30AM",
        accessibilityFeatures: true,
        babyChanging: true,
        genderNeutral: false,
        freeToUse: true,
        changingRoom: true,
        singleOccupancy: false,
        customerOnly: false,
        codeRequired: false,
        attendantPresent: true,
        familyFriendly: true,
        soapAvailable: true,
        wellStocked: true,
        premiumProducts: false,
        imageUrl: "https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
        createdBy: admin.id
      });
      
      const publicLibrary = await storage.createRestroom({
        name: "New York Public Library",
        address: "476 5th Ave",
        city: "New York",
        state: "NY",
        zipCode: "10018",
        latitude: "40.7532",
        longitude: "-73.9822",
        description: "Clean restrooms available on multiple floors. Quiet and typically not crowded except during special events.",
        hours: "10AM-6PM",
        accessibilityFeatures: true,
        babyChanging: false,
        genderNeutral: false,
        freeToUse: true,
        changingRoom: false,
        singleOccupancy: false,
        customerOnly: false,
        codeRequired: false,
        attendantPresent: false,
        familyFriendly: true,
        soapAvailable: true,
        wellStocked: true,
        premiumProducts: false,
        imageUrl: "https://images.unsplash.com/photo-1541671034471-a9d3ea84bf4a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
        createdBy: admin.id
      });
      
      const hotelLuxury = await storage.createRestroom({
        name: "The Ritz-Carlton Hotel Lobby",
        address: "50 Central Park South",
        city: "New York",
        state: "NY",
        zipCode: "10019",
        latitude: "40.7659",
        longitude: "-73.9771",
        description: "Luxurious hotel lobby restrooms with premium amenities. Exceptionally clean with high-end finishes and complimentary toiletries.",
        hours: "24/7",
        accessibilityFeatures: true,
        babyChanging: true,
        genderNeutral: false,
        freeToUse: true,
        changingRoom: true,
        singleOccupancy: true,
        customerOnly: false,
        codeRequired: false,
        attendantPresent: true,
        familyFriendly: true,
        soapAvailable: true,
        wellStocked: true,
        premiumProducts: true,
        imageUrl: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
        createdBy: admin.id
      });
      
      const gasStation = await storage.createRestroom({
        name: "Shell Gas Station",
        address: "450 W 126th St",
        city: "New York",
        state: "NY",
        zipCode: "10027",
        latitude: "40.8150",
        longitude: "-73.9561",
        description: "Basic restroom facilities available at this gas station. Requires key from attendant.",
        hours: "24/7",
        accessibilityFeatures: false,
        babyChanging: false,
        genderNeutral: false,
        freeToUse: false,
        changingRoom: false,
        singleOccupancy: true,
        customerOnly: true,
        codeRequired: true,
        attendantPresent: false,
        familyFriendly: false,
        soapAvailable: true,
        wellStocked: false,
        premiumProducts: false,
        imageUrl: "https://images.unsplash.com/photo-1605034313761-73ea4a0cfbf3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
        createdBy: admin.id
      });
      
      // Create reviews
      await storage.createReview({ 
        restroomId: centralPark.id, 
        userId: admin.id, 
        rating: 4, 
        comment: "Very clean and accessible!" 
      });
      
      await storage.createReview({ 
        restroomId: centralPark.id, 
        userId: admin.id, 
        rating: 5, 
        comment: "Well maintained, soap was fully stocked." 
      });
      
      await storage.createReview({ 
        restroomId: metroShopping.id, 
        userId: admin.id, 
        rating: 5, 
        comment: "Luxury bathroom experience!" 
      });
      
      await storage.createReview({ 
        restroomId: metroShopping.id, 
        userId: admin.id, 
        rating: 4, 
        comment: "Very clean, attendant was helpful." 
      });
      
      await storage.createReview({ 
        restroomId: riverside.id, 
        userId: admin.id, 
        rating: 4, 
        comment: "Nice bathroom but had to buy a coffee first." 
      });
      
      // Add reviews for new restrooms
      await storage.createReview({
        restroomId: grandStation.id,
        userId: admin.id,
        rating: 3,
        comment: "Clean but very busy during rush hour. Had to wait in line."
      });
      
      await storage.createReview({
        restroomId: grandStation.id,
        userId: admin.id,
        rating: 4,
        comment: "Attendant kept the place spotless. Love the central location."
      });
      
      await storage.createReview({
        restroomId: publicLibrary.id,
        userId: admin.id,
        rating: 5,
        comment: "Quietest public restroom in the city! Always clean."
      });
      
      await storage.createReview({
        restroomId: publicLibrary.id,
        userId: admin.id,
        rating: 4,
        comment: "Well maintained but limited hours since it's in a library."
      });
      
      await storage.createReview({
        restroomId: hotelLuxury.id,
        userId: admin.id,
        rating: 5,
        comment: "Fancy! Has mouthwash, hand lotion, and cloth towels."
      });
      
      await storage.createReview({
        restroomId: hotelLuxury.id,
        userId: admin.id,
        rating: 5,
        comment: "5-star hotel bathroom experience without needing to be a guest."
      });
      
      await storage.createReview({
        restroomId: gasStation.id,
        userId: admin.id,
        rating: 2,
        comment: "Basic and functional but not very clean."
      });
      
      await storage.createReview({
        restroomId: gasStation.id,
        userId: admin.id,
        rating: 1,
        comment: "Had to buy something to get the key. Bathroom was poorly maintained."
      });
      
      // Create articles
      await storage.createArticle({
        title: "The Right Way to Wash Your Hands (Most People Get It Wrong)",
        content: "Proper handwashing is one of the most effective ways to prevent the spread of germs and illnesses. According to the World Health Organization (WHO), the correct handwashing technique involves several steps that many people skip or rush through.\n\nHere's the WHO-recommended technique:\n\n1. Wet your hands with clean, running water\n2. Apply enough soap to cover all hand surfaces\n3. Rub hands palm to palm\n4. Rub right palm over left dorsum with interlaced fingers and vice versa\n5. Rub palm to palm with fingers interlaced\n6. Rub backs of fingers to opposing palms with fingers interlocked\n7. Rotational rubbing of left thumb clasped in right palm and vice versa\n8. Rotational rubbing, backward and forward with clasped fingers of right hand in left palm and vice versa\n9. Rinse hands with water\n10. Dry hands thoroughly with a single-use towel\n\nThe entire process should take about 20 seconds - about the time it takes to sing \"Happy Birthday\" twice. Make sure to turn off the faucet using a paper towel to avoid recontamination.\n\nRemember, washing your hands is particularly important:\n- Before, during, and after preparing food\n- Before eating\n- Before and after caring for someone who is sick\n- After using the toilet\n- After changing diapers or cleaning up a child who has used the toilet\n- After blowing your nose, coughing, or sneezing\n- After touching an animal, animal feed, or animal waste\n- After handling pet food or pet treats\n- After touching garbage\n\nBy following these guidelines, you can significantly reduce your risk of getting sick and spreading germs to others.",
        excerpt: "Discover the WHO-recommended handwashing technique that kills 99.9% of germs and helps prevent illness.",
        imageUrl: "https://images.unsplash.com/photo-1585914641050-fa9883c4e21c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
        category: "Hygiene Tips",
        authorId: admin.id
      });
      
      await storage.createArticle({
        title: "Designing Truly Accessible Restrooms: Beyond The Basics",
        content: "While ADA compliance is a crucial starting point for bathroom accessibility, truly inclusive restroom design goes far beyond the minimum requirements. When we think about accessibility, we often focus on wheelchair access, but there are many other considerations to make restrooms welcoming and functional for people of all abilities.\n\nHere are some elements to consider when designing or evaluating truly accessible restroom facilities:\n\n## Beyond Wheelchair Access\n\n1. **Clear wayfinding and signage**: Use high-contrast, large-font signage with tactile elements and braille. Consider audio cues and smart technology to assist with navigation.\n\n2. **Sensory considerations**: Install non-fluorescent lighting options to accommodate those with sensory sensitivities or epilepsy. Provide sound-dampening features for those with auditory sensitivities.\n\n3. **Height-adjustable elements**: When possible, incorporate sinks and hand dryers at multiple heights to accommodate users of different statures, including children and people of short stature.\n\n4. **Non-slip flooring**: Ensure floors remain slip-resistant even when wet, benefiting everyone but especially those with mobility or balance challenges.\n\n## Inclusive Family Facilities\n\n1. **Universal changing stations**: Install adult-sized changing tables in at least some restrooms, as standard baby changing tables don't accommodate older children or adults who may need assistance.\n\n2. **Family restrooms**: Design spacious family restrooms that can accommodate multiple family members, including those with mobility devices.\n\n3. **Caregiver support**: Include features like a shelf near the toilet for medical supplies and hooks for bags or clothing.\n\n## Gender Inclusivity\n\n1. **Single-occupancy options**: Provide clearly marked all-gender, single-occupancy restrooms when possible.\n\n2. **Privacy considerations**: Ensure stall doors and walls extend close to the floor and ceiling, with no gaps in the doors, benefiting all users but especially transgender and non-binary individuals who may face harassment.\n\n## Invisible Disabilities\n\n1. **Accessible handles and faucets**: Choose hardware that can be operated with minimal grip strength or dexterity for those with arthritis or other conditions.\n\n2. **Emergency features**: Install emergency pull cords that alert staff if someone needs assistance.\n\n3. **Ostomy support**: Include a shelf and hook in at least one stall for people who use ostomy bags.\n\nRemember that accessible design benefits everyone, not just those with disabilities. Pregnant women, elderly individuals, people with temporary injuries, and parents with children all benefit from thoughtfully designed facilities.\n\nBy going beyond basic code compliance and embracing truly inclusive design principles, we can create restroom spaces that respect the dignity and meet the needs of all users.",
        excerpt: "Creating truly inclusive restrooms means going beyond ADA compliance to consider invisible disabilities, sensory needs, and diverse user requirements.",
        imageUrl: "https://images.unsplash.com/photo-1594708053186-a48a36e654a2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
        category: "Accessibility",
        authorId: admin.id
      });
      
      await storage.createArticle({
        title: "Sustainable Restroom Solutions: Reducing Environmental Impact",
        content: "Public restrooms represent a significant opportunity for environmental conservation. By implementing sustainable practices and technologies, facility managers can dramatically reduce water usage, energy consumption, and waste production while often lowering long-term operational costs.\n\n## Water Conservation Technologies\n\n1. **High-efficiency toilets (HETs)**: Modern HETs use just 1.28 gallons per flush compared to older models that use 3-5 gallons. For high-traffic public restrooms, this can save thousands of gallons daily.\n\n2. **Waterless urinals**: These fixtures can save approximately 40,000 gallons of water per urinal annually while reducing sewage costs.\n\n3. **Advanced sensor faucets**: Newer models combine infrared sensors with aerators to reduce water usage by up to 70% compared to conventional faucets.\n\n4. **Water recycling systems**: Greywater recycling can repurpose handwashing water for toilet flushing, creating a closed-loop system.\n\n## Energy Efficiency Measures\n\n1. **LED lighting**: Replacing traditional lighting with LEDs can reduce energy consumption by up to 75% while providing better illumination.\n\n2. **Motion sensors**: Installing occupancy sensors ensures lights only operate when the facility is in use.\n\n3. **High-efficiency hand dryers**: Modern hand dryers use 80% less energy than older models and eliminate paper towel waste. Some newer models dry hands in as little as 10 seconds.\n\n4. **Natural lighting**: Where possible, incorporating skylights or light tubes can reduce daytime lighting needs.\n\n## Sustainable Materials\n\n1. **Recycled and recyclable materials**: Toilet partitions, countertops, and other fixtures can be made from recycled plastics, metals, or composite materials.\n\n2. **Low-VOC products**: Using low volatile organic compound paints, adhesives, and sealants improves indoor air quality.\n\n3. **Durable fixtures**: Selecting vandal-resistant, long-lasting fixtures reduces replacement frequency and associated waste.\n\n## Waste Reduction Strategies\n\n1. **Bulk soap dispensers**: These eliminate the waste associated with individual soap packets or disposable dispensers.\n\n2. **Electric hand dryers**: While there are ongoing debates about their overall environmental impact, modern energy-efficient hand dryers typically have a lower carbon footprint than paper towels when considering the entire lifecycle.\n\n3. **Smart dispensers**: Toilet paper and towel dispensers can be designed to release controlled amounts, reducing overuse and waste.\n\n## Implementation Considerations\n\nWhen planning sustainable restroom upgrades, consider these factors:\n\n- **Return on investment**: While some sustainable technologies have higher upfront costs, the long-term savings in water, energy, and reduced maintenance often provide significant ROI.\n\n- **User experience**: Ensure that sustainable solutions don't compromise the user experience. The best green technologies should be intuitive and effective.\n\n- **Maintenance requirements**: Some sustainable solutions may require different maintenance procedures. Staff training should be part of any implementation plan.\n\n- **Compliance**: Ensure all modifications meet relevant accessibility requirements and building codes.\n\nBy embracing sustainable restroom design, facility managers can significantly reduce environmental impact while often improving the user experience and reducing long-term operational costs.",
        excerpt: "Explore how sustainable restroom technologies can dramatically reduce environmental impact while lowering operational costs in public facilities.",
        imageUrl: "https://images.unsplash.com/photo-1584622786477-cdc9afd72313?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
        category: "Sustainability",
        authorId: admin.id
      });
      
      // Create testimonials
      await storage.createTestimonial({
        name: "Sarah K.",
        location: "New York, NY",
        rating: 5,
        comment: "This app saved me during my pregnancy! I could always find a clean, accessible restroom when I needed one most."
      });
      
      await storage.createTestimonial({
        name: "Michael T.",
        location: "Chicago, IL",
        rating: 5,
        comment: "As someone with Crohn's disease, this app has been life-changing. I can now explore new places with confidence."
      });
      
      await storage.createTestimonial({
        name: "Elena R.",
        location: "Portland, OR",
        rating: 4,
        comment: "I love that I can filter for gender-neutral bathrooms. Makes traveling so much less stressful."
      });
      
      console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

// Call the seed function
seedDatabase();
