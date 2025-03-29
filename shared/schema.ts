import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// The users table is kept from the original schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

// Create a guides table to store generated guides
export const guides = pgTable("guides", {
  id: serial("id").primaryKey(),
  query: text("query").notNull(),
  title: text("title").notNull(),
  content: jsonb("content").notNull(), // Store structured guide content as JSON
  createdAt: timestamp("created_at").defaultNow().notNull(),
  slug: text("slug").notNull().unique(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertGuideSchema = createInsertSchema(guides).pick({
  query: true,
  title: true,
  content: true,
  slug: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertGuide = z.infer<typeof insertGuideSchema>;
export type Guide = typeof guides.$inferSelect;

// Define the structure of a guide section
export interface GuideSection {
  title: string;
  content: string[];
  type?: "text" | "list";
  items?: string[];
}

// Define the structure for API request to generate a guide
export const generateGuideSchema = z.object({
  query: z.string().min(3).max(200),
});

export type GenerateGuideRequest = z.infer<typeof generateGuideSchema>;
