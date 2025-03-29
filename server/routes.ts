import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateGuideContent } from "./anthropic-client";
import { generateGuideSchema, type GuideSection } from "@shared/schema";
import { nanoid } from "nanoid";

// Cache management for faster responses
interface CacheEntry {
  data: any;
  timestamp: number;
}

class ResponseCache {
  private cache: Map<string, CacheEntry>;
  private ttl: number; // Time to live in milliseconds
  
  constructor(ttl = 3600000) { // Default 1 hour
    this.cache = new Map();
    this.ttl = ttl;
  }
  
  set(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }
  
  get(key: string): any | null {
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    // Check if entry has expired
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }
  
  invalidateByPrefix(prefix: string): void {
    // Convert keys to array to avoid iterator issues
    const keys = Array.from(this.cache.keys());
    for (const key of keys) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    }
  }
}

// Initialize cache with 30-minute TTL for development, longer for production
const responseCache = new ResponseCache(process.env.NODE_ENV === 'production' ? 3600000 : 1800000);

// Ensure the ANTHROPIC_API_KEY is set
if (!process.env.ANTHROPIC_API_KEY) {
  console.error('ANTHROPIC_API_KEY environment variable is not set');
}

// Function to generate SEO-friendly slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')  // Remove special characters
    .replace(/\s+/g, '-')      // Replace spaces with hyphens
    .replace(/-+/g, '-')       // Collapse multiple hyphens
    .substring(0, 50) + '-' + nanoid(8); // Limit length and add unique ID
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Middleware for handling JSON parsing errors
  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof SyntaxError && 'body' in err) {
      return res.status(400).json({ 
        message: 'Invalid JSON in request body',
        error: err.message
      });
    }
    next(err);
  });

  // Utility for handling escaped quotes in JSON strings
  const sanitizeJsonString = (str: string): string => {
    // Handle quotes inside JSON strings - matches quote patterns that cause issues
    return str
      // Fix quotes inside title or content that have special characters
      .replace(/"([^"]*)"([^"]*)"([^"]*)"/g, (match, p1, p2, p3) => {
        // If this looks like quoting inside a string value, escape the inner quotes
        return `"${p1}\\\"${p2}\\\"${p3}"`;
      })
      // Fix any remaining problematic quotes
      .replace(/(\w+):"([^"]*)"/g, (match, key, value) => {
        // Only wrap property name in quotes if it's not already
        if (!match.startsWith('"')) {
          return `"${key}":"${value}"`;
        }
        return match;
      });
  };

  // API endpoint to generate a guide using Anthropic API
  app.post('/api/guides/generate', async (req: Request, res: Response) => {
    const startTime = Date.now();
    try {
      // Validate the request body
      const validationResult = generateGuideSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: 'Invalid request body', 
          errors: validationResult.error.errors 
        });
      }
      
      const { query } = validationResult.data;
      
      // Check cache first for identical queries (speeds up development/testing)
      const cacheKey = `guide:${query.toLowerCase().trim()}`;
      const cachedGuide = responseCache.get(cacheKey);
      
      if (cachedGuide) {
        console.log(`Cache hit for query: "${query.substring(0, 30)}..."`);
        return res.status(200).json({ guide: cachedGuide });
      }
      
      console.log(`Generating guide for: "${query.substring(0, 30)}..."`);
      
      // Call Anthropic API to generate guide content using our dedicated client
      // This uses the newest claude-3-7-sonnet-20250219 model for improved responses
      const textContent = await generateGuideContent(query);
      
      // Parse the JSON content we received from Claude
      let parsedContent;
      try {
        // Process the textContent from the API
        const isProduction = process.env.NODE_ENV === 'production';
        
        // Log the raw response in development mode
        if (!isProduction) {
          console.log("Raw API response:", textContent.substring(0, 200) + "...");
        }
        
        // Extract JSON content with enhanced robustness
        let jsonContent = textContent.trim();
        
        // 1. Handle markdown code blocks
        if (jsonContent.includes("```")) {
          // Match content within code blocks, prioritize those marked as JSON
          const jsonMatch = 
            jsonContent.match(/```json\s*([\s\S]*?)\s*```/) || 
            jsonContent.match(/```\s*([\s\S]*?)\s*```/);
            
          if (jsonMatch && jsonMatch[1]) {
            jsonContent = jsonMatch[1].trim();
          }
        }
        
        // 2. Check if we have proper JSON starting with {
        if (!jsonContent.trim().startsWith("{")) {
          // Look for the first { and last } to extract JSON object
          const startIndex = jsonContent.indexOf('{');
          const endIndex = jsonContent.lastIndexOf('}');
          
          if (startIndex >= 0 && endIndex > startIndex) {
            jsonContent = jsonContent.substring(startIndex, endIndex + 1);
          } else {
            // Alternative: find JSON-like patterns if no clear outer braces
            const jsonMatch = jsonContent.match(/{[\s\S]*?}/);
            if (jsonMatch) {
              jsonContent = jsonMatch[0];
            }
          }
        }
        
        // 3. Find and fix common JSON syntax issues
        jsonContent = jsonContent.trim()
          // Remove trailing commas in objects and arrays
          .replace(/,\s*([}\]])/g, '$1')
          
          // Ensure property names are quoted
          .replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":')
          
          // Fix single quotes used as JSON delimiters
          .replace(/'([^']*)'([,}])/g, '"$1"$2')
          
          // Fix unquoted values
          .replace(/:\s*([a-zA-Z0-9_]+)([,}])/g, ':"$1"$2')
          
          // Handle nested quotes in content
          .replace(/:\s*"(.*)"/g, (match) => sanitizeJsonString(match));
        
        if (!isProduction) {
          console.log("Extracted JSON:", jsonContent.substring(0, 200) + "...");
        }
        
        // First attempt at parsing
        try {
          parsedContent = JSON.parse(jsonContent);
        } catch (parseError) {
          console.error("Initial JSON parse failed, applying advanced fixes:", isProduction ? 'Error occurred' : parseError);
          
          // Try even more aggressive fixes
          jsonContent = jsonContent
            // Escape all potentially problematic quotes
            .replace(/:\s*"([^"]*)"/g, (match, content) => {
              return `:${JSON.stringify(content.replace(/"/g, '\\"'))}`;
            })
            
            // Balance all brackets and braces
            .replace(/\\"/g, '"')  // First convert escaped quotes
            .replace(/"/g, '\\"')  // Then escape all quotes
            .replace(/\\\\"/g, '\\"'); // Fix double escaping
            
          // Wrap in quotes and parse as string first, then parse as JSON
          try {
            const jsonStr = `"${jsonContent.replace(/"/g, '\\"')}"`;
            const unescaped = JSON.parse(jsonStr);
            parsedContent = JSON.parse(unescaped);
          } catch (err) {
            // As a last resort, use a regex-based approach to extract meaningful content
            try {
              // Extract title
              const titleMatch = jsonContent.match(/"title"\s*:\s*"([^"]+)"/);
              const title = titleMatch ? titleMatch[1] : `How to ${query}`;
              
              // Extract sections
              const sectionMatches = jsonContent.match(/"title"\s*:\s*"([^"]+)"[^{]*"type"\s*:\s*"([^"]+)"/g) || [];
              
              // Initialize parsed content with proper typing
              const extractedSections: GuideSection[] = [];
              parsedContent = {
                title,
                sections: extractedSections
              };
              
              // Add fallback content if we have no sections
              if (sectionMatches.length === 0) {
                throw new Error("Could not extract meaningful section data");
              }
              
              // Try to extract section content
              let currentIndex = 0;
              for (const sectionMatch of sectionMatches) {
                const titleMatch = sectionMatch.match(/"title"\s*:\s*"([^"]+)"/);
                const typeMatch = sectionMatch.match(/"type"\s*:\s*"([^"]+)"/);
                
                if (titleMatch) {
                  const section: GuideSection = {
                    title: titleMatch[1],
                    type: typeMatch && typeMatch[1] === 'list' ? 'list' : 'text',
                    content: ["Content for this section was not properly formatted."],
                  };
                  parsedContent.sections.push(section);
                }
                
                currentIndex++;
              }
              
            } catch (finalError) {
              console.error("JSON parsing failed after all attempts");
              throw finalError; 
            }
          }
        }
        
        // Validate the parsed content structure and normalize
        if (!parsedContent.title || !Array.isArray(parsedContent.sections)) {
          throw new Error("Invalid guide structure: missing required properties");
        }
        
        // Ensure all sections have required properties in correct format
        parsedContent.sections = parsedContent.sections.map((section: any, index: number) => {
          const validatedSection: GuideSection = {
            title: section.title || `Section ${index + 1}`,
            type: section.type === 'list' ? 'list' : 'text',
            content: Array.isArray(section.content) 
              ? section.content.map((p: any) => typeof p === 'string' ? p : String(p)) 
              : [],
          };
          
          if (validatedSection.type === 'list' && Array.isArray(section.items)) {
            validatedSection.items = section.items.map((item: any) => typeof item === 'string' ? item : String(item));
          } else if (validatedSection.type === 'list' && !Array.isArray(section.items)) {
            // Convert to text type if items aren't provided for list type
            validatedSection.type = 'text';
          }
          
          return validatedSection;
        });
        
        console.log("Successfully parsed and validated JSON");
      } catch (err) {
        const error = err as Error;
        console.error('Failed to parse JSON from API response:', error);
        
        // Create a fallback structure that's still useful to the user
        const fallbackSections: GuideSection[] = [
          {
            title: "Introduction",
            type: "text",
            content: [
              `You asked about "${query}". We're working on a complete guide for you.`,
              "Our AI is gathering the best information but had trouble formatting the response."
            ]
          },
          {
            title: "Try These Tips",
            type: "list",
            content: [], // Empty content array for list type
            items: [
              "Be more specific in your question",
              "Break complex topics into smaller questions", 
              "Check our existing guides on similar topics below",
              "Try again in a few moments"
            ]
          },
          {
            title: "Explore Related Guides",
            type: "text",
            content: ["While you wait, check out our popular and recently created guides below."]
          }
        ];
        
        parsedContent = {
          title: `How to ${query}`,
          sections: fallbackSections
        };
        console.log("Using enhanced fallback content structure");
      }
      
      // Create a slug from the title
      const slug = generateSlug(parsedContent.title);
      
      // Save the guide to storage
      const guide = await storage.createGuide({
        query,
        title: parsedContent.title,
        content: parsedContent,
        slug,
      });
      
      // Store in cache for faster repeated access
      responseCache.set(cacheKey, guide);
      
      // For performance monitoring
      const responseTime = Date.now() - startTime;
      console.log(`Guide generated in ${responseTime}ms`);
      
      return res.status(200).json({ guide });
    } catch (err) {
      const error = err as Error;
      console.error('Error generating guide:', error);
      return res.status(500).json({ 
        message: 'Failed to generate guide', 
        error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message
      });
    }
  });
  
  // API endpoint to get a guide by slug - with caching
  app.get('/api/guides/:slug', async (req: Request, res: Response) => {
    try {
      const { slug } = req.params;
      
      // Check cache first
      const cacheKey = `guide-slug:${slug}`;
      const cachedGuide = responseCache.get(cacheKey);
      
      if (cachedGuide) {
        return res.status(200).json({ guide: cachedGuide });
      }
      
      // Fetch from storage if not in cache
      const guide = await storage.getGuideBySlug(slug);
      
      if (!guide) {
        return res.status(404).json({ message: 'Guide not found' });
      }
      
      // Store in cache for faster repeated access
      responseCache.set(cacheKey, guide);
      
      return res.status(200).json({ guide });
    } catch (err) {
      const error = err as Error;
      console.error('Error fetching guide:', error);
      return res.status(500).json({ 
        message: 'Failed to fetch guide', 
        error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message
      });
    }
  });
  
  // API endpoint to get recent guides - with caching
  app.get('/api/guides/recent/list', async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      
      // Check cache first
      const cacheKey = `recent-guides:${limit}`;
      const cachedGuides = responseCache.get(cacheKey);
      
      if (cachedGuides) {
        return res.status(200).json({ guides: cachedGuides });
      }
      
      // Fetch from storage if not in cache
      const guides = await storage.getRecentGuides(limit);
      
      // Store in cache for faster repeated access (short TTL for recent list)
      responseCache.set(cacheKey, guides);
      
      return res.status(200).json({ guides });
    } catch (err) {
      const error = err as Error;
      console.error('Error fetching recent guides:', error);
      return res.status(500).json({ 
        message: 'Failed to fetch recent guides', 
        error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
