'use server';

/**
 * @fileOverview A flow for translating a JSON content object to a different language.
 *
 * - translateContent - A function that handles the translation of a JSON object.
 * - TranslateContentInput - The input type for the translateContent function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const TranslateContentInputSchema = z.object({
  jsonContent: z.any().describe('The JSON object with content to be translated.'),
  targetLanguage: z.string().describe('The target language for translation (e.g., "Spanish", "French").'),
});
export type TranslateContentInput = z.infer<typeof TranslateContentInputSchema>;

// The output is dynamic, so we expect any valid JSON structure.
const TranslateContentOutputSchema = z.any();
export type TranslateContentOutput = z.infer<typeof TranslateContentOutputSchema>;

export async function translateContent(input: TranslateContentInput): Promise<TranslateContentOutput> {
  return translateContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'translateContentPrompt',
  input: { schema: TranslateContentInputSchema },
  output: { format: 'json' },
  prompt: `You are an expert translator. Your task is to translate all user-facing string values within the provided JSON object to {{{targetLanguage}}}.

Follow these critical rules:
- **Preserve Structure**: Your output MUST be a valid JSON object with the exact same structure, keys, and nesting as the input.
- **Do Not Translate Keys**: You must not translate the JSON keys.
- **Leave Specific Phrases Untranslated**: The English phrases "Sugar Daddy" and "Sugar Baby" are proper names for this site. You MUST leave them in English. Do not translate them.
- **Translate All Other Text**: All other user-facing text must be translated accurately.
- **Ignore Non-Text**: Do not translate numbers, booleans, or strings that are clearly identifiers (like icon names, e.g., 'ShieldCheck').

Return ONLY the translated JSON object, with no other text, explanations, or markdown formatting.

Here is the JSON object to translate:
\`\`\`json
{{{jsonStringify jsonContent}}}
\`\`\`
`,
  helpers: {
    jsonStringify: (context) => JSON.stringify(context, null, 2),
  },
  config: {
    safetySettings: [
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_CIVIC_INTEGRITY', threshold: 'BLOCK_NONE' },
    ],
  },
});

const translateContentFlow = ai.defineFlow(
  {
    name: 'translateContentFlow',
    inputSchema: TranslateContentInputSchema,
    outputSchema: TranslateContentOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    
    if (!output || typeof output !== 'string' || output.trim() === '') {
      console.error("AI translation failed: The model returned an empty or invalid response.");
      throw new Error('AI translation failed to produce an output, likely due to safety filters.');
    }
    
    // The model might wrap the JSON in markdown or add explanatory text.
    // This is a robust way to extract the JSON object from the response string.
    let jsonString = output;
    const jsonMatch = output.match(/\{[\s\S]*\}/); // Look for the first complete JSON object
    if (jsonMatch && jsonMatch[0]) {
      jsonString = jsonMatch[0];
    }

    try {
      return JSON.parse(jsonString.trim());
    } catch (e) {
      console.error("Failed to parse AI translation response as JSON.", e);
      console.error("Raw AI output:", output);
      // Throw an error to be caught by the calling UI function
      throw new Error('The AI returned a response, but it was not valid JSON.');
    }
  }
);
