
'use server';

/**
 * @fileOverview A flow for translating a JSON content object to a different language.
 *
 * - translateContent - A function that handles the translation of a JSON object.
 * - TranslateContentInput - The input type for the translateContent function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

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
  prompt: `You are an expert translator. Your task is to translate the string values within the provided JSON object to the specified target language.

IMPORTANT INSTRUCTIONS:
1.  Translate all user-facing strings to {{{targetLanguage}}}.
2.  Maintain the EXACT same JSON structure, including all keys, nesting, and data types.
3.  DO NOT translate JSON keys.
4.  DO NOT translate values that are not strings (e.g., numbers, booleans, arrays of non-strings).
5.  For strings that are icon names (e.g., "ShieldCheck", "Users"), do not translate them.
6.  Ensure the output is a valid JSON object.

JSON to translate:
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
    if (!output) {
      throw new Error('AI translation failed to produce an output, likely due to safety filters.');
    }
    
    // The model might wrap the JSON in markdown or add explanatory text.
    // This is a robust way to extract the JSON object from the response string.
    let jsonString = output;
    const jsonMatch = output.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (jsonMatch && jsonMatch[0]) {
      jsonString = jsonMatch[0];
    }

    try {
      return JSON.parse(jsonString.trim());
    } catch (e) {
      console.error("Failed to parse AI translation response:", e);
      console.error("Raw AI output:", output);
      // Throw an error to be caught by the calling UI function
      throw new Error('Failed to parse AI translation response.');
    }
  }
);
