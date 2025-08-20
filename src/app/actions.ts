"use server";
import { generateCaption, type GenerateCaptionInput, type GenerateCaptionOutput } from '@/ai/flows/generate-caption';

type ActionResult = 
  | { success: true; data: GenerateCaptionOutput }
  | { success: false; error: string };

export async function generateSocialPost(input: GenerateCaptionInput): Promise<ActionResult> {
  if (!input.photoDataUris || input.photoDataUris.length === 0) {
    return { success: false, error: 'Image data is missing.' };
  }

  try {
    const result = await generateCaption(input);
    return { success: true, data: result };
  } catch (e) {
    const error = e instanceof Error ? e.message : 'An unknown error occurred.';
    console.error('AI generation failed:', error);
    return { success: false, error: 'Failed to generate content from the image. Please try a different image or try again later.' };
  }
}
