
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

const ChemicalResidueSchema = z.object({
  name: z.string().describe('The name of the identified chemical residue (e.g., "Calcium Carbonate (CaCO3)").'),
  estimatedPercentage: z.number().optional().describe('An estimated percentage of this residue on the item. This is an estimation and might be very low or trace if applicable.'),
  hazardousEffects: z.string().optional().describe('Potential hazardous effects if this residue is consumed in significant quantities or by sensitive individuals.'),
});

const AnalyzeFoodItemOutputSchema = z.object({
  identification: z.object({
    isFoodItem: z.boolean().describe('Whether the AI identifies the subject of the image as a food item.'),
    itemType: z.string().optional().describe('The type of food item (fruit, vegetable, processed food, etc.). Only if isFoodItem is true.'),
    name: z.string().optional().describe('If isFoodItem is true, the name of the identified food item. If false, a message like "Non-food item detected".'),
    confidence: z.number().optional().describe('The confidence level of the food identification (0-1). Only if isFoodItem is true.'),
    dominantColors: z.array(z.string()).optional().describe('An array of dominant colors observed in the item. Only if isFoodItem is true and colors are identifiable.'),
  }),
  components: z.object({
    waterPercentage: z.number().optional().describe('The estimated percentage of water in the food item.'),
    sugarPercentage: z.number().optional().describe('The estimated percentage of sugar in the food item.'),
    fiberPercentage: z.number().optional().describe('The estimated percentage of fiber in the food item.'),
    vitaminsAndMinerals: z.string().optional().describe('A summary of notable vitamins and minerals likely present.'),
  }).optional(),
  chemicalResidues: z
    .array(ChemicalResidueSchema)
    .optional()
    .describe('A list of potential chemical residues, their estimated percentages, and potential hazardous effects. Only if isFoodItem is true and residues are identified.'),
  edibility: z
    .enum(['Safe to Eat', 'Wash & Eat', 'Unsafe'])
    .optional()
    .describe('The edibility status of the food item. Only if isFoodItem is true.'),
});
export type AnalyzeFoodItemOutput = z.infer<typeof AnalyzeFoodItemOutputSchema>;

const simulateResultsTool = ai.defineTool({
  name: 'simulateResults',
  description: 'Simulates the analysis of a FOOD ITEM when the AI is uncertain or analysis fails to provide a confident direct assessment for that food item. This tool should only be used if the item is confirmed to be food.',
  inputSchema: z.object({
    itemType: z.string().describe('The type of food item (fruit, vegetable, etc.) to simulate.'),
  }),
  outputSchema: AnalyzeFoodItemOutputSchema,
},
async (input) => {
  // Simulate the analysis by providing default or random values FOR A FOOD ITEM.
  return {
    identification: {
      isFoodItem: true, // CRITICAL: Tool simulates a food item
      itemType: input.itemType,
      name: `Simulated ${input.itemType}`,
      confidence: 0.5, // Confidence for the *simulated food identification*
      dominantColors: ['simulated color 1', 'simulated color 2'],
    },
    components: {
      waterPercentage: 80,
      sugarPercentage: 5,
      fiberPercentage: 3,
      vitaminsAndMinerals: 'Vitamin C, Potassium (Simulated)',
    },
    chemicalResidues: [
      { name: 'Simulated Pesticide Alpha', estimatedPercentage: 0.05, hazardousEffects: 'May cause mild irritation if not washed properly. Generally considered low risk at trace levels.' },
      { name: 'Simulated Preservative Beta', hazardousEffects: 'Some individuals may experience sensitivity. Commonly used in food processing.' }
    ],
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
  prompt: `You are an AI expert in food analysis. Your primary task is to determine if the item in the provided photo is a food item.

1.  **Is it Food?**: First, analyze the image and determine if the subject is a food item.
    *   If it is NOT a food item, set 'isFoodItem' to false. Set the 'name' field in 'identification' to "Non-food item detected" or a more specific description (e.g., "Electronic component detected", "Object identified as a tool"). You MUST leave other food-specific fields (like itemType, confidence, dominantColors, components, chemicalResidues, edibility) empty or undefined.
    *   If it IS a food item, set 'isFoodItem' to true and proceed with the detailed analysis below. Ensure that the 'name' field contains the identified food name.

2.  **Detailed Food Analysis (Only if isFoodItem is true)**:
    *   **Identification**: Determine the type of food (fruit, vegetable, grain, processed item, etc.) and its common name for the 'name' field. Assess your confidence level (0-1) for the 'confidence' field.
    *   **Color Analysis**: Pay close attention to the visual characteristics, especially the color(s) of the item. List the dominant colors you observe in the 'dominantColors' array.
    *   **Component Breakdown**: Estimate percentages for water, sugar, and fiber. List notable vitamins and minerals typically found in such an item.
    *   **Chemical Residues**: Based on visual cues or common agricultural/processing practices for the identified item, list any potential chemical residues. For each residue, provide:
        *   'name': The name of the chemical (e.g., "Calcium Carbonate (CaCO3)", "Generic Pesticide Type A").
        *   'estimatedPercentage': An estimated percentage of this residue on the item. This is an estimation and may not always be determinable from visual cues alone; if so, you can omit this field or state that it's trace. If you do provide a percentage, ensure it is a number.
        *   'hazardousEffects': A brief description of potential hazardous effects if this residue is consumed in significant quantities or by sensitive individuals (e.g., "May cause stomach upset if ingested in large amounts," "Generally recognized as safe (GRAS) but wash item," "Commonly used, wash thoroughly to minimize exposure").
    *   **Edibility**: Recommend an edibility status: 'Safe to Eat', 'Wash & Eat', or 'Unsafe'.

Strive for the most accurate and detailed analysis possible based purely on the provided image.
**If the item IS identified as food (isFoodItem is true) but you are not reasonably confident in your detailed analysis (e.g., food identification confidence < 0.7), or if you cannot make a meaningful assessment of its components or potential safety, you MAY use the 'simulateResults' tool to provide a simulated response for that specific food item.** Do not use the 'simulateResults' tool if the item is clearly not food.

Analyze the following item:
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
        console.warn('AI prompt returned no output. This is unexpected.');
        return {
          identification: {
            isFoodItem: false,
            name: 'Analysis incomplete. The AI could not process the image.',
          }
        };
      }

      // If the AI determines it's not a food item, return that assessment.
      if (output.identification.isFoodItem === false) {
        console.log('AI determined item is not food.');
        return {
          identification: {
            isFoodItem: false,
            name: output.identification.name || "Non-food item detected",
          },
        };
      }

      // At this point, output.identification.isFoodItem is true.
      // The AI believes it's food. The 'output' could be a direct analysis or from the simulateResultsTool
      // if the AI decided to use it based on the prompt instructions.
      // Ensure 'isFoodItem' is true, especially if it came from the simulation tool.
      return {
        ...output,
        identification: {
          ...output.identification,
          isFoodItem: true,
          name: output.identification.name || "Unnamed Food Item", // Ensure name is present for food
        },
      };

    } catch (error) {
      console.error('Error during AI food analysis prompt call:', error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.warn(`Falling back to a default non-food response due to an error: ${errorMessage}`);
      return {
        identification: {
          isFoodItem: false,
          name: 'Analysis failed due to a system error.',
        }
      };
    }
  }
);
