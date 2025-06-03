
'use server';

/**
 * @fileOverview An AI agent for analyzing food items, including identification,
 * component breakdown, and potential chemical residues.
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
    itemType: z.string().describe('The type of food item (fruit, vegetable, etc.).'),
    name: z.string().describe('The name of the identified food item.'),
    confidence: z.number().describe('The confidence level of the identification (0-1).'),
  }),
  components: z.object({
    waterPercentage: z.number().describe('The percentage of water in the food item.'),
    sugarPercentage: z.number().describe('The percentage of sugar in the food item.'),
    fiberPercentage: z.number().describe('The percentage of fiber in the food item.'),
    vitaminsAndMinerals: z.string().describe('A list of vitamins and minerals present.'),
  }),
  chemicalResidues: z
    .array(z.string())
    .describe('A list of potential chemical residues detected.'),
  edibility: z
    .enum(['Safe to Eat', 'Wash & Eat', 'Unsafe'])
    .describe('The edibility status of the food item.'),
});
export type AnalyzeFoodItemOutput = z.infer<typeof AnalyzeFoodItemOutputSchema>;

const simulateResultsTool = ai.defineTool({
  name: 'simulateResults',
  description: 'Simulates the analysis of a food item when the AI is uncertain or analysis fails.',
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
  prompt: `You are an AI expert in food analysis. You will analyze a food item based on a photo and provide a breakdown of its components, potential chemical residues, and edibility status.

  Analyze the following food item:
  Photo: {{media url=photoDataUri}}

  If you are not 100% certain about the analysis, use the simulateResults tool to provide simulated results.
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
        // This case should ideally be handled by Genkit if output schema isn't met,
        // but as a safeguard:
        console.warn('AI prompt returned no output, falling back to simulation for unexpected reason.');
        return await simulateResultsTool({ itemType: 'Food Item (No Output)' });
      }
      return output;
    } catch (error) {
      console.error('Error during AI food analysis prompt call:', error);
      console.warn('Falling back to simulated results due to an error during AI analysis.');
      // Directly call the tool's underlying function as a fallback.
      // Provide a generic itemType since the analysis failed.
      return await simulateResultsTool({ itemType: 'Food Item (Analysis Error)' });
    }
  }
);
