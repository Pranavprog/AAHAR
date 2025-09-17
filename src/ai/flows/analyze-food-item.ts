
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
    isOrganic: z.boolean().optional().describe(
      "An estimation of whether the food item is organic. Set to `true` ONLY if clear, unambiguous organic labeling (e.g., a 'USDA Organic' seal) is visible in the image. Otherwise, this MUST be `false`."
    ),
    organicReasoning: z.string().optional().describe(
      "Reasoning for the `isOrganic` assessment. If `isOrganic` is true, state which label was identified. If `isOrganic` is false, state that the status is undetermined because no official label was visible."
    ),
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
  description: 'Simulates the analysis of a FOOD ITEM when the AI is uncertain or analysis fails to provide a confident, specific, and visually-grounded direct assessment for that food item. This tool should only be used if the item is confirmed to be food.',
  inputSchema: z.object({
    itemType: z.string().describe('The type of food item (fruit, vegetable, etc.) to simulate.'),
    assumedOrganic: z.boolean().optional().describe('Set to true if simulating an organic item based on seeing an organic label but failing to analyze further. Otherwise, set to false.')
  }),
  outputSchema: AnalyzeFoodItemOutputSchema,
},
async (input) => {
  const isSimulatedOrganic = input.assumedOrganic === true;
  let simulatedResidues: z.infer<typeof ChemicalResidueSchema>[] = [];

  if (isSimulatedOrganic) {
    simulatedResidues = [
      { name: 'Natural Waxes (e.g., Carnauba from organic sources, C24H48O2)', hazardousEffects: 'Generally recognized as safe (GRAS) for consumption, common on organic produce for protection. This is a simulated residue for an assumed organic item.', estimatedPercentage: 0.001 },
      { name: 'Kaolin Clay (trace mineral, Al2Si2O5(OH)4)', estimatedPercentage: 0.005, hazardousEffects: 'Natural mineral, sometimes used in organic farming for pest control. Harmless in trace amounts. Simulated context.'}
    ];
  } else { // Simulate non-organic
    simulatedResidues = [
      { name: 'Simulated Pesticide Alpha (e.g., Organophosphate type, C10H19O6PS2)', estimatedPercentage: 0.03, hazardousEffects: 'Synthetic pesticide. May cause mild irritation if not washed properly. Potential neurotoxic effects with prolonged high exposure. Commonly used on non-organic fruits to control insects. Wash item thoroughly. (Simulated data)' },
      { name: 'Simulated Fungicide Beta (e.g., Triazole type, C15H17Cl2N3)', estimatedPercentage: 0.015, hazardousEffects: 'Synthetic fungicide to prevent spoilage. Potential for endocrine disruption with chronic exposure. Used on various crops. Wash item thoroughly. (Simulated data)' },
      { name: 'Simulated Wax Coating (Petroleum-based derivative)', estimatedPercentage: 0.08, hazardousEffects: 'Commonly used on conventional produce to extend shelf life and improve appearance. Generally considered safe in small amounts but some prefer to avoid. Can be removed by scrubbing. (Simulated data)' }
    ];
  }

  return {
    identification: {
      isFoodItem: true, 
      itemType: input.itemType,
      name: `Simulated ${isSimulatedOrganic ? 'Organic' : 'Conventional'} ${input.itemType}`,
      confidence: 0.55, // Slightly higher simulated confidence if tool is used.
      dominantColors: ['simulated color 1', 'simulated color 2'],
      isOrganic: isSimulatedOrganic, 
      organicReasoning: isSimulatedOrganic ? "Simulated as organic because a label was likely detected but further analysis was inconclusive." : "Simulated as conventionally grown because no organic label was detected. This is a simulated assessment.",
    },
    components: {
      waterPercentage: 80,
      sugarPercentage: isSimulatedOrganic ? 7 : 5, 
      fiberPercentage: 3,
      vitaminsAndMinerals: `Vitamin C, Potassium (Simulated values based on ${input.itemType})`,
    },
    chemicalResidues: simulatedResidues,
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
    *   If it is NOT a food item, set 'isFoodItem' to false. Set the 'name' field in 'identification' to "Non-food item detected" or a more specific description (e.g., "Electronic component detected", "Object identified as a tool"). You MUST leave other food-specific fields empty or undefined.
    *   If it IS a food item, set 'isFoodItem' to true and proceed with the detailed analysis below. Ensure that the 'name' field contains the identified food name.

2.  **Detailed Food Analysis (Only if isFoodItem is true)**:
    Strive for the most accurate and detailed analysis possible, grounding your observations in visual evidence from the image whenever feasible.
    *   **Identification**: Determine the type of food (fruit, vegetable, grain, processed item, etc.) and its common name for the 'name' field. Assess your confidence level (0-1).
    *   **Organic Status Assessment (CRITICAL RULE)**:
        *   Your #1 priority for organic status is to **NEVER guess**. "Organic" is a certification, not just a visual quality.
        *   **Rule A**: Look for clear, legible, official organic labeling on packaging in the image (e.g., "USDA Organic", "Canada Organic", "EU Organic" logos).
        *   If you see such a label, you MUST set \`isOrganic\` to \`true\` and state in \`organicReasoning\` which label you identified (e.g., "Spotted a 'USDA Organic' seal on the packaging.").
        *   **Rule B**: If there is NO visible, legible, official organic label, you MUST set \`isOrganic\` to \`false\`. Your \`organicReasoning\` MUST then be: "Organic status is undetermined from visual inspection alone as no official organic certification label was visible."
        *   **DO NOT** use visual cues like blemishes, color, or uniformity to guess the organic status. This is unreliable and you are instructed to avoid it.
    *   **Color Analysis**: List the dominant colors you observe in the 'dominantColors' array.
    *   **Component Breakdown**: Estimate percentages for water, sugar, and fiber. List notable vitamins and minerals typically found in such an item.
    *   **Chemical Residues**:
        *   If \`isOrganic\` is \`false\` (because no label was seen), provide a list of potential chemical residues commonly associated with **conventionally-grown** versions of this specific food item.
        *   For each residue, provide 'name', 'estimatedPercentage', and 'hazardousEffects'. Be specific.
        *   If \`isOrganic\` is \`true\` (because a label was seen), the list of chemical residues should be much shorter, focusing only on naturally occurring compounds or GRAS (Generally Recognized As Safe) processing aids allowed in organic production.
    *   **Edibility**: Recommend an edibility status: 'Safe to Eat', 'Wash & Eat', or 'Unsafe'.

**Tool Usage**: If the item IS food, but you have low confidence in the identification itself (e.g., < 0.7) or cannot provide a specific analysis for components/residues, you may use the 'simulateResults' tool. When calling the tool, set 'assumedOrganic' based on whether you saw a label or not.

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
        // Fallback to a default non-food response if AI returns nothing.
        return {
          identification: {
            isFoodItem: false,
            name: 'Analysis incomplete. The AI could not process the image.',
          }
        };
      }

      // If the AI determines it's not a food item, return that assessment.
      if (output.identification.isFoodItem === false) {
        console.log('AI determined item is not food, or analysis returned non-food structure.');
        return {
          identification: {
            isFoodItem: false,
            name: output.identification.name || "Non-food item detected or analysis error",
          },
        };
      }

      // At this point, output.identification.isFoodItem should be true.
      // This output could be a direct analysis or from the simulateResultsTool.
      // Ensure critical fields are present and correctly typed.
      return {
        ...output,
        identification: {
          ...output.identification,
          isFoodItem: true, // Ensure this is true
          name: output.identification.name || "Unnamed Food Item", // Ensure name is present
          isOrganic: output.identification.isOrganic ?? false, // Default to false if undefined
          organicReasoning: output.identification.organicReasoning || "Organic status could not be determined from visual inspection.",
        },
      };

    } catch (error) {
      console.error('Error during AI food analysis prompt call:', error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.warn(`Falling back to a default non-food response due to an error: ${errorMessage}`);
      // In case of a catastrophic error in the prompt call, return a clear non-food error state.
      return {
        identification: {
          isFoodItem: false,
          name: 'Analysis failed due to a system error.',
        }
      };
    }
  }
);

