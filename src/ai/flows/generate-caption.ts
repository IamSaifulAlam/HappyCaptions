'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating social media captions and hashtags based on an uploaded image.
 *
 * - generateCaption - A function that takes an image data URI and generates a caption and hashtags.
 * - GenerateCaptionInput - The input type for the generateCaption function.
 * - GenerateCaptionOutput - The return type for the generateCaption function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateCaptionInputSchema = z.object({
  photoDataUris: z
    .array(z.string())
    .describe(
      "Photos to generate a social media caption and hashtags for, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  channelName: z.string().optional().describe("The user's page, profile, or channel name."),
  aboutPage: z.string().optional().describe('A description of the user\'s page, profile, or channel.'),
  aboutPost: z.string().optional().describe('Specific details or context about the post being created.'),
  postType: z.string().optional().describe('The type or style of the post, e.g., "Sale Post", "Artist Showcase", "Poem".'),
  tone: z.string().optional().describe('The desired tone of voice for the post, e.g., "Excited", "Professional", "Witty".'),
  outputLanguage: z.string().optional().describe('The language for the generated output.'),
  numVariations: z.number().optional().default(1).describe('The number of caption variations to generate.'),
});
export type GenerateCaptionInput = z.infer<typeof GenerateCaptionInputSchema>;

const GenerateCaptionOutputSchema = z.object({
  captions: z.array(z.string()).describe('The generated social media captions. Do not include hashtags here.'),
  hashtags: z.string().describe('A single string of all relevant, SEO-optimized hashtags, separated by spaces.'),
});
export type GenerateCaptionOutput = z.infer<typeof GenerateCaptionOutputSchema>;

export async function generateCaption(input: GenerateCaptionInput): Promise<GenerateCaptionOutput> {
  return generateCaptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCaptionPrompt',
  model: 'googleai/gemini-1.5-flash-latest',
  input: { schema: GenerateCaptionInputSchema },
  output: { schema: GenerateCaptionOutputSchema },
  prompt: `You are a social media expert. Your task is to generate captions and hashtags based on user inputs.

  **Core Instructions**
  1.  **Understand Intent:** First, analyze all inputs to understand the user's goal:
      -   Image(s): {{#each photoDataUris as |photoDataUri|}}Image: {{media url=photoDataUri}}{{/each}}
      -   Post Type: {{postType}}
      -   Tone: {{tone}}
      -   Page Name: {{channelName}}
      -   About Page: {{aboutPage}}
      -   About Post: {{aboutPost}}
      -   Output Language: {{outputLanguage}}
      -   Number of Captions: {{numVariations}}
  2.  **Extract Core Concept:** Before writing, determine the central message, emotion, and intent.
  3.  **Generate Captions:** Create exactly {{numVariations}} unique caption variations. Captions must NOT contain hashtags.
  4.  **Generate Hashtags:** Create a single, space-separated string of relevant, optimized hashtags.

  **Language-Specific Instructions**

  *   **English:** Write fluently and naturally, matching the specified tone.
  *   **Non-English (e.g., Bangla, Hindi, Urdu):**
      -   Write like a native speaker. Avoid literal, word-for-word translations.
      -   Capture the authentic emotion, idioms, and style of the target language.
  *   **Mixed/Transliterated (e.g., Banglish, Hinglish, Roman Urdu):**
      -   Preserve the core meaning and tone, but write using the English alphabet as a native speaker would.
      -   Reflect local accents and writing styles. Hashtags should also be in the transliterated style (e.g., #valobasha, #bhalobasa).

  **Hashtag Strategy**
  -   Hashtags should be primarily in **English** for maximum reach.
  -   Use **transliterated** hashtags for cultural or local relevance where appropriate.
  -   Use native script hashtags (e.g., #ভালবাসা) **rarely**, only if natural for the platform and context.

  **Critical Rules & Restrictions**
  -  **Always sound natural and human-like.**
  -  **Adapt hashtags for the best reach while staying authentic.**
  -  **Do NOT use emojis.**
  -  **Do NOT insert hashtags directly into the captions.**
  -  **Do NOT create unrelated, generic, or empty hashtags (#love, #life).**
  -  **Do NOT literally translate idioms or slang.**

  Your final output must be structured according to the defined output schema.`,
});

const generateCaptionFlow = ai.defineFlow(
  {
    name: 'generateCaptionFlow',
    inputSchema: GenerateCaptionInputSchema,
    outputSchema: GenerateCaptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
