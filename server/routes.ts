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
        // Get content from the response - handle different content block types
        let textContent = "";
        if (response.content[0] && 'text' in response.content[0]) {
          textContent = response.content[0].text;
        } else {
          // If we can't get text directly, try to convert the whole content to a string
          textContent = JSON.stringify(response.content);
        }
        
        const isProduction = process.env.NODE_ENV === 'production';
        if (!isProduction) {
          console.log("Raw API response:", textContent.substring(0, 200) + "...");
        }
        
        // More robust JSON extraction
        let jsonContent = textContent;
        
        // Handle markdown code blocks with language specifier
        if (textContent.includes("```json")) {
          const jsonMatch = textContent.match(/```json\s*([\s\S]*?)\s*```/);
          if (jsonMatch && jsonMatch[1]) {
            jsonContent = jsonMatch[1];
          }
        } 
        // Handle plain markdown code blocks
        else if (textContent.includes("```")) {
          const jsonMatch = textContent.match(/```\s*([\s\S]*?)\s*```/);
          if (jsonMatch && jsonMatch[1]) {
            jsonContent = jsonMatch[1];
          }
        }
        
        // Try to find JSON-like content using broader matching
        if (!jsonContent.trim().startsWith("{")) {
          const jsonMatch = textContent.match(/{[\s\S]*?}/);
          if (jsonMatch) {
            jsonContent = jsonMatch[0];
          }
        }
        
        // Find the largest JSON-like portion as another fallback
        if (!jsonContent.trim().startsWith("{")) {
          const matches = textContent.match(/{[^{}]*({[^{}]*}[^{}]*)*}/g) || [];
          if (matches.length > 0) {
            // Find the longest match that might be our JSON
            jsonContent = matches.reduce((a, b) => a.length > b.length ? a : b);
          }
        }
        
        // Clean and fix the content before parsing
        jsonContent = jsonContent.trim();
        
        // Fix common issues with JSON formatting that might cause parsing errors
        // Remove trailing commas
        jsonContent = jsonContent.replace(/,\s*([}\]])/g, '$1');
        
        // Fix unquoted property names (only if they're causing issues)
        if (jsonContent.match(/[{,]\s*\w+\s*:/)) {
          jsonContent = jsonContent.replace(/([{,])\s*(\w+)\s*:/g, '$1"$2":');
        }
        
        // Fix single quotes used as JSON string delimiters
        jsonContent = jsonContent.replace(/'([^']*)'([,}])/g, '"$1"$2');
        
        // Fix missing quotes on property values
        jsonContent = jsonContent.replace(/:\s*([a-zA-Z0-9_]+)([,}])/g, ':"$1"$2');
        
        if (!isProduction) {
          console.log("Extracted JSON:", jsonContent.substring(0, 200) + "...");
        }
        
        try {
          parsedContent = JSON.parse(jsonContent);
        } catch (parseError) {
          console.error("Initial JSON parse failed, trying additional fixes:", isProduction ? 'Error occurred' : parseError);
          
          // Try more aggressive fixes
          // Replace all single quotes with double quotes, handle nested quotes
          jsonContent = jsonContent.replace(/'/g, '"');
          
          // Try to ensure property names are quoted
          jsonContent = jsonContent.replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":');
          
          // Remove any trailing commas
          jsonContent = jsonContent.replace(/,(\s*[\]}])/g, '$1');
          
          // Try to balance parentheses/brackets/braces
          let openBraces = (jsonContent.match(/{/g) || []).length;
          let closeBraces = (jsonContent.match(/}/g) || []).length;
          
          if (openBraces > closeBraces) {
            jsonContent += "}".repeat(openBraces - closeBraces);
          } else if (closeBraces > openBraces) {
            jsonContent = "{".repeat(closeBraces - openBraces) + jsonContent;
          }
          
          // Try again with the more aggressively fixed JSON
          try {
            parsedContent = JSON.parse(jsonContent);
          } catch (finalError) {
            // If all parsing attempts fail, try to extract sections manually
            console.error("JSON parsing failed after all attempts");
            throw finalError; // Rethrow to be caught by outer catch
          }
        }
        
        // Validate the parsed content structure
        if (!parsedContent.title || !Array.isArray(parsedContent.sections)) {
          throw new Error("Invalid guide structure: missing required properties");
        }
        
        // Ensure all sections have the required properties
        parsedContent.sections = parsedContent.sections.map((section: any, index: number) => {
          const validatedSection: GuideSection = {
            title: section.title || `Section ${index + 1}`,
            type: section.type === 'list' ? 'list' : 'text',
            content: Array.isArray(section.content) ? section.content : [],
          };
          
          if (validatedSection.type === 'list' && Array.isArray(section.items)) {
            validatedSection.items = section.items;
          }
          
          return validatedSection;
        });
        
        console.log("Successfully parsed and validated JSON");
      } catch (err) {
        const error = err as Error;
        console.error('Failed to parse JSON from API response:', error);
        // Create a fallback structure manually
        parsedContent = {
          title: "How to " + query,
          sections: [
            {
              title: "Introduction",
              type: "text",
              content: ["We've prepared a guide on '" + query + "'. However, we're experiencing some technical difficulties formatting it properly."]
            },
            {
              title: "Please Try Again",
              type: "text",
              content: ["Try submitting your question again with more specific details for better results."]
            },
            {
              title: "Alternative Resources",
              type: "text",
              content: ["While waiting, check out our popular guides section below for related content."]
            }
          ]
        };
        console.log("Using fallback content structure");
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
    } catch (err) {
      const error = err as Error;
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
    } catch (err) {
      const error = err as Error;
      console.error('Error fetching guide:', error);
      return res.status(500).json({ message: 'Failed to fetch guide', error: error.message });
    }
  });
  
  // API endpoint to get recent guides
  app.get('/api/guides/recent/list', async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      const guides = await storage.getRecentGuides(limit);
      
      return res.status(200).json({ guides });
    } catch (err) {
      const error = err as Error;
      console.error('Error fetching recent guides:', error);
      return res.status(500).json({ message: 'Failed to fetch recent guides', error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
