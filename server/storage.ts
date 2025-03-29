import { users, type User, type InsertUser, guides, type Guide, type InsertGuide } from "@shared/schema";

// Interface for storage operations
export interface IStorage {
  // User operations (kept from original)
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Guide operations
  createGuide(guide: InsertGuide): Promise<Guide>;
  getGuideBySlug(slug: string): Promise<Guide | undefined>;
  getRecentGuides(limit?: number): Promise<Guide[]>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private guides: Map<number, Guide>;
  private userCurrentId: number;
  private guideCurrentId: number;

  constructor() {
    this.users = new Map();
    this.guides = new Map();
    this.userCurrentId = 1;
    this.guideCurrentId = 1;
  }

  // User operations (kept from original)
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
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Guide operations
  async createGuide(insertGuide: InsertGuide): Promise<Guide> {
    const id = this.guideCurrentId++;
    const createdAt = new Date();
    const guide: Guide = { ...insertGuide, id, createdAt };
    this.guides.set(id, guide);
    return guide;
  }

  async getGuideBySlug(slug: string): Promise<Guide | undefined> {
    return Array.from(this.guides.values()).find(
      (guide) => guide.slug === slug,
    );
  }

  async getRecentGuides(limit: number = 5): Promise<Guide[]> {
    return Array.from(this.guides.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }
}

export const storage = new MemStorage();
