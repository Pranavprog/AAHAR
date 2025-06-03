
'use server';

/**
 * @fileOverview An AI agent for analyzing food items, including identification,
 * component breakdown, potential chemical residues, and color analysis.
 *
 * - analyzeFoodItem - A function that handles the food item analysis process.
 * - AnalyzeFoodItemInput - The input type for the analyzeFoodItem function.
 * - AnalyzeFoodItemOutput - The return type for the analyzeFoodItem function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeFoodItemInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a food item, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzeFoodItemInput = z.infer<typeof AnalyzeFoodItemInputSchema>;

const AnalyzeFoodItemOutputSchema = z.object({
  identification: z.object({
    itemType: z.string().describe('The type of food item (fruit, vegetable, processed food, etc.).'),
    name: z.string().describe('The name of the identified food item.'),
    confidence: z.number().describe('The confidence level of the identification (0-1).'),
    dominantColors: z.array(z.string()).describe('An array of dominant colors observed in the food item.'),
  }),
  components: z.object({
    waterPercentage: z.number().describe('The estimated percentage of water in the food item.'),
    sugarPercentage: z.number().describe('The estimated percentage of sugar in the food item.'),
    fiberPercentage: z.number().describe('The estimated percentage of fiber in the food item.'),
    vitaminsAndMinerals: z.string().describe('A summary of notable vitamins and minerals likely present.'),
    // Potential future enhancement: ingredients: z.array(z.string()).optional().describe('If identifiable as a processed item, list key ingredients if visually discernible or commonly known.')
  }),
  chemicalResidues: z
    .array(z.string())
    .describe('A list of potential chemical residues or treatments suggested by visual cues or common practices for this item.'),
  edibility: z
    .enum(['Safe to Eat', 'Wash & Eat', 'Unsafe'])
    .describe('The edibility status of the food item based on visual analysis and common knowledge.'),
});
export type AnalyzeFoodItemOutput = z.infer<typeof AnalyzeFoodItemOutputSchema>;

const simulateResultsTool = ai.defineTool({
  name: 'simulateResults',
  description: 'Simulates the analysis of a food item when the AI is uncertain or analysis fails to provide a confident direct assessment.',
  inputSchema: z.object({
    itemType: z.string().describe('The type of food item (fruit, vegetable, etc.).'),
  }),
  outputSchema: AnalyzeFoodItemOutputSchema,
},
async (input) => {
  // Simulate the analysis by providing default or random values.
  return {
    identification: {
      itemType: input.itemType,
      name: `Simulated ${input.itemType}`,
      confidence: 0.5,
      dominantColors: ['brownish', 'greenish'],
    },
    components: {
      waterPercentage: 80,
      sugarPercentage: 5,
      fiberPercentage: 3,
      vitaminsAndMinerals: 'Vitamin C, Potassium (Simulated)',
    },
    chemicalResidues: ['Simulated pesticide A', 'Simulated preservative B'],
    edibility: 'Wash & Eat',
  };
});

export async function analyzeFoodItem(input: AnalyzeFoodItemInput): Promise<AnalyzeFoodItemOutput> {
  return analyzeFoodItemFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeFoodItemPrompt',
  input: {schema: AnalyzeFoodItemInputSchema},
  output: {schema: AnalyzeFoodItemOutputSchema},
  tools: [simulateResultsTool],
  prompt: `You are an AI expert in food analysis. Your task is to analyze a food item based on a provided photo.
  Provide a detailed breakdown of its identification, key components, potential chemical residues, and edibility status.

  Key areas to focus on:
  1.  **Identification**: Determine the type of food (fruit, vegetable, grain, processed item, etc.) and its common name. Assess your confidence level (0-1).
  2.  **Color Analysis**: Pay close attention to the visual characteristics, especially the **color(s)** of the item. List the dominant colors you observe in the 'dominantColors' array.
  3.  **Component Breakdown**: Estimate percentages for water, sugar, and fiber. List notable vitamins and minerals typically found in such an item.
  4.  **Chemical Residues**: Based on visual cues or common agricultural/processing practices for the identified item, list any potential chemical residues.
  5.  **Edibility**: Recommend an edibility status: 'Safe to Eat', 'Wash & Eat', or 'Unsafe'.

  Strive for the most accurate and detailed analysis possible based purely on the provided image.
  **If, after careful analysis of the image, you are not reasonably confident in your primary identification (e.g., confidence < 0.7) or if you cannot make a meaningful assessment of its components or potential safety, you MUST use the 'simulateResults' tool to provide a simulated response.** Do not invent details if the image quality is too poor or the item is too ambiguous for a confident analysis.

  Analyze the following food item:
  Photo: {{media url=photoDataUri}}
  `,
});

const analyzeFoodItemFlow = ai.defineFlow(
  {
    name: 'analyzeFoodItemFlow',
    inputSchema: AnalyzeFoodItemInputSchema,
    outputSchema: AnalyzeFoodItemOutputSchema,
  },
  async (flowInput) => {
    try {
      const {output} = await prompt(flowInput);
      if (!output) {
        console.warn('AI prompt returned no output, falling back to simulation for unexpected reason.');
        return await simulateResultsTool({ itemType: 'Food Item (No Output)' });
      }
      // Check if the AI itself decided to use the tool (output might match tool's structure if tool was called)
      // This is a heuristic; Genkit's tool use mechanism should ideally handle this by returning tool output directly.
      // However, if the LLM generates text *saying* it used the tool, or returns values very similar to simulation:
      if (output.identification.name.startsWith('Simulated') && output.identification.confidence === 0.5) {
         console.log('AI indicated use of simulation tool or returned simulation-like values.');
         return output; // Assume this is already the simulated output
      }
      return output;
    } catch (error) {
      console.error('Error during AI food analysis prompt call:', error);
      console.warn('Falling back to simulated results due to an error during AI analysis.');
      return await simulateResultsTool({ itemType: 'Food Item (Analysis Error)' });
    }
  }
);
