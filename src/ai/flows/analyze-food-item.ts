
'use server';

/**
 * @fileOverview An AI agent for analyzing food items, including identification,
 * component breakdown, potential chemical residues, organic status, and color analysis.
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
  name: z.string().describe('The specific name of the identified chemical residue. Be as detailed as possible, including common chemical formulas if appropriate (e.g., "Calcium Carbonate (CaCO3)", "Chlorpyrifos (Organophosphate Pesticide)").'),
  estimatedPercentage: z.number().optional().describe('An estimated percentage (numeric value, e.g., 0.05 for 0.05%) of this residue on the item. If present but in trace amounts, estimate a small non-zero value (e.g., 0.01). Only use 0 if you believe it is absolutely not present or below any detectable limit for visual/contextual estimation.'),
  hazardousEffects: z.string().optional().describe('Potential hazardous effects if this residue is consumed in significant quantities or by sensitive individuals. If known, also include context for its presence (e.g., "Used as a pesticide on non-organic apples", "Preservative to extend shelf life").'),
});

const AnalyzeFoodItemOutputSchema = z.object({
  identification: z.object({
    isFoodItem: z.boolean().describe('Whether the AI identifies the subject of the image as a food item.'),
    itemType: z.string().optional().describe('The type of food item (fruit, vegetable, processed food, etc.). Only if isFoodItem is true.'),
    name: z.string().optional().describe('If isFoodItem is true, the name of the identified food item. If false, a message like "Non-food item detected".'),
    confidence: z.number().optional().describe('The confidence level of the food identification (0-1). Only if isFoodItem is true.'),
    dominantColors: z.array(z.string()).optional().describe('An array of dominant colors observed in the item. Only if isFoodItem is true and colors are identifiable.'),
    isOrganic: z.boolean().optional().describe('An estimation of whether the food item appears to be organic based on visual cues. This is not a definitive certification.'),
    organicReasoning: z.string().optional().describe('Brief reasoning if an organic determination is made. Only if isFoodItem is true and isOrganic is set.'),
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
    .describe('A list of potential chemical residues. If the item is determined to be non-organic or its organic status is unclear, provide a more detailed list of chemicals commonly associated with conventional farming/processing for this item. For each, include specific name (with formula if common), estimated percentage, and detailed hazardous effects/context. Only if isFoodItem is true and residues are identified.'),
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
    assumedOrganic: z.boolean().optional().describe('Whether to simulate an organic item (true) or a conventionally grown item (false/undefined).')
  }),
  outputSchema: AnalyzeFoodItemOutputSchema,
},
async (input) => {
  const isSimulatedOrganic = input.assumedOrganic === true;
  let simulatedResidues: z.infer<typeof ChemicalResidueSchema>[] = [];

  if (isSimulatedOrganic) {
    simulatedResidues = [
      { name: 'Natural Waxes (e.g., Carnauba from organic sources)', hazardousEffects: 'Generally recognized as safe (GRAS) for consumption, common on organic produce for protection.', estimatedPercentage: 0.001 },
      { name: 'Kaolin Clay (trace)', estimatedPercentage: 0.01, hazardousEffects: 'Natural mineral, sometimes used in organic farming for pest control. Harmless in trace amounts.'}
    ];
  } else { // Simulate non-organic
    simulatedResidues = [
      { name: 'Simulated Pesticide Alpha (e.g., Organophosphate type)', estimatedPercentage: 0.05, hazardousEffects: 'Synthetic pesticide. May cause mild irritation if not washed properly. Potential neurotoxic effects with prolonged high exposure. Wash item thoroughly.' },
      { name: 'Simulated Fungicide Beta (e.g., Triazole type)', estimatedPercentage: 0.02, hazardousEffects: 'Synthetic fungicide to prevent spoilage. Potential for endocrine disruption. Wash item thoroughly.' },
      { name: 'Simulated Wax Coating (Petroleum-based)', estimatedPercentage: 0.1, hazardousEffects: 'Commonly used on conventional produce to extend shelf life and improve appearance. Generally considered safe in small amounts but some prefer to avoid.' }
    ];
  }

  return {
    identification: {
      isFoodItem: true, 
      itemType: input.itemType,
      name: `Simulated ${isSimulatedOrganic ? 'Organic' : 'Conventional'} ${input.itemType}`,
      confidence: 0.5, 
      dominantColors: ['simulated color 1', 'simulated color 2'],
      isOrganic: isSimulatedOrganic, 
      organicReasoning: isSimulatedOrganic ? 'Simulated as organic based on tool input.' : 'Simulated as conventionally grown based on tool input; exhibits typical appearance for such items.',
    },
    components: {
      waterPercentage: 80,
      sugarPercentage: isSimulatedOrganic ? 7 : 5, // Slightly different for variation
      fiberPercentage: 3,
      vitaminsAndMinerals: 'Vitamin C, Potassium (Simulated)',
    },
    chemicalResidues: simulatedResidues,
    edibility: 'Wash & Eat', // Default, could be varied
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
    *   If it is NOT a food item, set 'isFoodItem' to false. Set the 'name' field in 'identification' to "Non-food item detected" or a more specific description (e.g., "Electronic component detected", "Object identified as a tool"). You MUST leave other food-specific fields (like itemType, confidence, dominantColors, components, chemicalResidues, edibility, isOrganic, organicReasoning) empty or undefined.
    *   If it IS a food item, set 'isFoodItem' to true and proceed with the detailed analysis below. Ensure that the 'name' field contains the identified food name.

2.  **Detailed Food Analysis (Only if isFoodItem is true)**:
    *   **Identification**: Determine the type of food (fruit, vegetable, grain, processed item, etc.) and its common name for the 'name' field. Assess your confidence level (0-1) for the 'confidence' field.
    *   **Organic Status Estimation**: Based on visual cues (e.g., appearance, uniformity, blemishes, visible packaging or labels if any), estimate if the item appears to be 'isOrganic' (true/false). This is an estimation, not a definitive certification. If you make a determination, provide a brief 'organicReasoning' (e.g., "Appears conventionally grown due to high uniformity and glossy finish," "No clear indicators of organic or non-organic status from visual inspection," "Possible organic due to natural blemishes and less uniform shape").
    *   **Color Analysis**: Pay close attention to the visual characteristics, especially the color(s) of the item. List the dominant colors you observe in the 'dominantColors' array.
    *   **Component Breakdown**: Estimate percentages for water, sugar, and fiber. List notable vitamins and minerals typically found in such an item.
    *   **Chemical Residues**:
        *   If the item is assessed as likely **non-organic**, or if its **organic status is undetermined** (implying conventional practices might have been used), provide a more thorough list of potential chemical residues commonly associated with non-organic farming/processing for this specific food item.
        *   For each residue, provide:
            *   'name': The specific name of the chemical. Be as detailed as possible, including common chemical formulas if appropriate (e.g., "Calcium Carbonate (CaCO3)", "Chlorpyrifos (Organophosphate Pesticide)").
            *   'estimatedPercentage': Provide an estimated percentage (numeric value, e.g., 0.05 for 0.05%) for this residue. If you believe a residue is present, even in trace amounts common for conventionally grown items, estimate a small but non-zero percentage (e.g., 0.01, 0.05). Avoid using 0% unless you are highly confident the residue is entirely absent or far below typical levels for such items.
            *   'hazardousEffects': A detailed description of potential hazardous effects if this residue is consumed in significant quantities or by sensitive individuals. If known, also include context for its presence (e.g., "Used as a systemic pesticide on non-organic apples to control codling moth", "Common preservative (E220) to prevent browning and microbial growth in dried fruits or wine, can cause reactions in sulfite-sensitive individuals").
        *   If the item is assessed as likely **organic**, the list of chemical residues may be shorter, focusing on naturally occurring compounds, GRAS (Generally Recognized As Safe) processing aids allowed in organic production, or residues that might be present due to environmental factors (with appropriate caveats).
    *   **Edibility**: Recommend an edibility status: 'Safe to Eat', 'Wash & Eat', or 'Unsafe'.

Strive for the most accurate and detailed analysis possible based purely on the provided image.
**If the item IS identified as food (isFoodItem is true) but you are not reasonably confident in your detailed analysis (e.g., food identification confidence < 0.7), or if you cannot make a meaningful assessment of its components or potential safety, you MAY use the 'simulateResults' tool to provide a simulated response for that specific food item.** When using the tool, you can specify if the simulation should assume an organic or conventional item if you have a lean towards one. Do not use the 'simulateResults' tool if the item is clearly not food.

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
      // The 'output' could be a direct analysis or from the simulateResultsTool
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
