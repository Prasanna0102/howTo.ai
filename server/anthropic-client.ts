import Anthropic from '@anthropic-ai/sdk';

// the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const MODEL = 'claude-3-7-sonnet-20250219';

export async function generateGuideContent(query: string): Promise<string> {
  try {
    console.log(`Generating guide content for query: ${query}`);
    
    // Use a more concise prompt and lower max_tokens to improve response time
    const message = await anthropic.messages.create({
      max_tokens: 2000, // Reduced from 4000 to improve response time
      temperature: 0.7, // Add some creativity but keep it focused
      model: MODEL,
      system: `Create concise how-to guides as valid JSON with this structure:
{
  "title": "How to [Do Something]",
  "sections": [
    {
      "title": "Introduction",
      "type": "text",
      "content": ["paragraph 1", "paragraph 2"]
    },
    {
      "title": "What You'll Need",
      "type": "list",
      "content": [],
      "items": ["item 1", "item 2"]
    }
  ]
}

Rules:
1. Title starts with "How to"
2. 4-6 sections total including Intro and Conclusion
3. Lists need empty "content" array AND "items" array
4. Text sections need detailed "content" array
5. MUST be valid parseable JSON`,
      messages: [
        {
          role: 'user',
          content: `Create a how-to guide about: ${query}. JSON format only.`
        }
      ],
    });

    // Get the response text safely, handling different response structures
    const contentBlock = message.content[0];
    
    // Type assertion for content blocks
    if (contentBlock && typeof contentBlock === 'object' && 'type' in contentBlock) {
      if (contentBlock.type === 'text') {
        return contentBlock.text;
      }
    }
    
    // Fallback if structure is different
    return JSON.stringify(message.content);
  } catch (error: any) {
    console.error('Error calling Anthropic API:', error);
    throw new Error(`Failed to generate guide: ${error?.message || 'Unknown error'}`);
  }
}