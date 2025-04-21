import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Users schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
});

// Restrooms schema
export const restrooms = pgTable("restrooms", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zipCode: text("zip_code").notNull(),
  latitude: text("latitude").notNull(),
  longitude: text("longitude").notNull(),
  description: text("description").notNull(),
  hours: text("hours").notNull(),
  accessibilityFeatures: boolean("accessibility_features").default(false),
  babyChanging: boolean("baby_changing").default(false),
  genderNeutral: boolean("gender_neutral").default(false),
  freeToUse: boolean("free_to_use").default(false),
  changingRoom: boolean("changing_room").default(false),
  singleOccupancy: boolean("single_occupancy").default(false),
  customerOnly: boolean("customer_only").default(false),
  codeRequired: boolean("code_required").default(false),
  attendantPresent: boolean("attendant_present").default(false),
  familyFriendly: boolean("family_friendly").default(false),
  soapAvailable: boolean("soap_available").default(false),
  wellStocked: boolean("well_stocked").default(false),
  premiumProducts: boolean("premium_products").default(false),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  createdBy: integer("created_by").references(() => users.id),
});

export const insertRestroomSchema = createInsertSchema(restrooms).omit({
  id: true,
  createdAt: true,
});

// Reviews schema
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  restroomId: integer("restroom_id")
    .notNull()
    .references(() => restrooms.id),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
});

// Articles schema
export const articles = pgTable("articles", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  excerpt: text("excerpt").notNull(),
  imageUrl: text("image_url"),
  category: text("category").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  authorId: integer("author_id").references(() => users.id),
});

export const insertArticleSchema = createInsertSchema(articles).omit({
  id: true,
  createdAt: true,
});

// Testimonials schema
export const testimonials = pgTable("testimonials", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  location: text("location").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTestimonialSchema = createInsertSchema(testimonials).omit({
  id: true,
  createdAt: true,
});

// Relations definitions
export const usersRelations = relations(users, ({ many }) => ({
  reviews: many(reviews),
  restrooms: many(restrooms),
  articles: many(articles)
}));

export const restroomsRelations = relations(restrooms, ({ one, many }) => ({
  creator: one(users, {
    fields: [restrooms.createdBy],
    references: [users.id]
  }),
  reviews: many(reviews)
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  restroom: one(restrooms, {
    fields: [reviews.restroomId],
    references: [restrooms.id]
  }),
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id]
  })
}));

export const articlesRelations = relations(articles, ({ one }) => ({
  author: one(users, {
    fields: [articles.authorId],
    references: [users.id]
  })
}));

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Restroom = typeof restrooms.$inferSelect;
export type InsertRestroom = z.infer<typeof insertRestroomSchema>;

export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;

export type Article = typeof articles.$inferSelect;
export type InsertArticle = z.infer<typeof insertArticleSchema>;

export type Testimonial = typeof testimonials.$inferSelect;
export type InsertTestimonial = z.infer<typeof insertTestimonialSchema>;

// Extended type for restroom with average rating
export type RestroomWithRating = Restroom & {
  averageRating: number;
  reviewCount: number;
  distance?: number;
};
