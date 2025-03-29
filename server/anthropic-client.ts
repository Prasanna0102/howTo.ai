import Anthropic from '@anthropic-ai/sdk';

// the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const MODEL = 'claude-3-7-sonnet-20250219';

export async function generateGuideContent(query: string): Promise<string> {
  try {
    console.log(`Generating guide content for query: ${query}`);
    
    const message = await anthropic.messages.create({
      max_tokens: 4000,
      model: MODEL,
      system: `You are an expert at creating comprehensive, well-structured how-to guides.
      
Format your response as a valid JSON object with the following structure:
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
    },
    // Add more sections as needed
  ]
}

Important rules:
1. Title should be concise and start with "How to"
2. Include at least 4-6 sections including Introduction and Conclusion
3. For list-type sections, include both the empty "content" array AND the "items" array
4. For text-type sections, include detailed paragraphs in the "content" array
5. Make sure to escape all quotes and special characters properly
6. The entire response must be valid JSON that can be parsed with JSON.parse()`,
      messages: [
        {
          role: 'user',
          content: `Create a detailed how-to guide about: ${query}. 
          Make sure to format your response exactly as JSON following the structure in your instructions.`
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
  } catch (error) {
    console.error('Error calling Anthropic API:', error);
    throw error;
  }
}