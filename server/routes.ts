import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import Anthropic from '@anthropic-ai/sdk';
import { generateGuideSchema, type GuideSection } from "@shared/schema";
import { nanoid } from "nanoid";

// Create Anthropic client
if (!process.env.ANTHROPIC_API_KEY) {
  console.error('ANTHROPIC_API_KEY environment variable is not set');
}

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Function to generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 50) + '-' + nanoid(8);
}

export async function registerRoutes(app: Express): Promise<Server> {
  // API endpoint to generate a guide using Anthropic API
  app.post('/api/guides/generate', async (req: Request, res: Response) => {
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
      
      // Call Anthropic API to generate guide content
      // the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
      const response = await anthropic.messages.create({
        model: 'claude-3-7-sonnet-20250219',
        max_tokens: 2000,
        system: `You are a how-to guide expert. Generate a comprehensive, step-by-step guide based on the user's query. 
        Structure your response as valid JSON with the following format:
        {
          "title": "A clear, SEO-friendly title for the guide",
          "sections": [
            {
              "title": "Section title",
              "type": "text or list",
              "content": ["Paragraph 1", "Paragraph 2"], 
              "items": ["Item 1", "Item 2"] // Only if type is list
            }
          ]
        }
        
        Begin with an introduction section that provides context. Then create logical sections for each step or topic needed.
        Make your guide practical, specific, and easy to follow. Use simple language and avoid jargon.`,
        messages: [{ role: 'user', content: query }],
      });
      
      // Parse the JSON content from Claude's response
      let parsedContent;
      try {
        const textContent = response.content[0].text;
        // Extract JSON content if wrapped in backticks or code block
        const jsonMatch = textContent.match(/```(?:json)?\s*({[\s\S]*?})\s*```/) || 
                          textContent.match(/\s*({[\s\S]*})\s*/);
        const jsonContent = jsonMatch ? jsonMatch[1] : textContent;
        parsedContent = JSON.parse(jsonContent);
      } catch (error) {
        console.error('Failed to parse JSON from API response:', error);
        return res.status(500).json({ message: 'Failed to parse guide content' });
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
      
      return res.status(200).json({
        guide: {
          id: guide.id,
          query: guide.query,
          title: guide.title,
          content: guide.content,
          createdAt: guide.createdAt,
          slug: guide.slug,
        }
      });
    } catch (error) {
      console.error('Error generating guide:', error);
      return res.status(500).json({ message: 'Failed to generate guide', error: error.message });
    }
  });
  
  // API endpoint to get a guide by slug
  app.get('/api/guides/:slug', async (req, res) => {
    try {
      const { slug } = req.params;
      const guide = await storage.getGuideBySlug(slug);
      
      if (!guide) {
        return res.status(404).json({ message: 'Guide not found' });
      }
      
      return res.status(200).json({ guide });
    } catch (error) {
      console.error('Error fetching guide:', error);
      return res.status(500).json({ message: 'Failed to fetch guide', error: error.message });
    }
  });
  
  // API endpoint to get recent guides
  app.get('/api/guides/recent', async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      const guides = await storage.getRecentGuides(limit);
      
      return res.status(200).json({ guides });
    } catch (error) {
      console.error('Error fetching recent guides:', error);
      return res.status(500).json({ message: 'Failed to fetch recent guides', error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
