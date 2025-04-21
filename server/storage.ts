import { 
  users, type User, type InsertUser,
  restrooms, type Restroom, type InsertRestroom, type RestroomWithRating,
  reviews, type Review, type InsertReview,
  articles, type Article, type InsertArticle,
  testimonials, type Testimonial, type InsertTestimonial
} from "@shared/schema";

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
    
    // Apply boolean filters
    for (const [key, value] of Object.entries(filters)) {
      if (typeof value === 'boolean') {
        filteredRestrooms = filteredRestrooms.filter(restroom => 
          // @ts-ignore - Dynamic property access
          restroom[key] === value
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

export const storage = new MemStorage();
