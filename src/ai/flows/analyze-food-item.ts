
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
      'An estimation of whether the food item appears to be organic based *solely* on visual cues from the image. This is highly speculative and not a definitive certification. True if visually leaning organic, false if visually leaning conventional or if organic status is undetermined from visual inspection.'
    ),
    organicReasoning: z.string().optional().describe(
      'Brief reasoning for the `isOrganic` estimation, emphasizing visual cues and the speculative nature of this assessment. For example, "Appears conventionally grown due to high uniformity and glossy finish." or "May be organic due to natural blemishes, but visual assessment is inconclusive." If `isOrganic` is false because status is undetermined, this field should clarify that.'
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
    assumedOrganic: z.boolean().optional().describe('Whether to simulate an organic item (true) or a conventionally grown item (false/undefined). This should be based on the AI\'s initial, less confident visual assessment if available.')
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
      organicReasoning: isSimulatedOrganic ? 'Simulated as organic based on tool input; typically implies adherence to organic farming standards. This is a simulated assessment.' : 'Simulated as conventionally grown based on tool input; often involves synthetic pesticides and fertilizers. This is a simulated assessment.',
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
    *   If it is NOT a food item, set 'isFoodItem' to false. Set the 'name' field in 'identification' to "Non-food item detected" or a more specific description (e.g., "Electronic component detected", "Object identified as a tool"). You MUST leave other food-specific fields (like itemType, confidence, dominantColors, components, chemicalResidues, edibility, isOrganic, organicReasoning) empty or undefined.
    *   If it IS a food item, set 'isFoodItem' to true and proceed with the detailed analysis below. Ensure that the 'name' field contains the identified food name.

2.  **Detailed Food Analysis (Only if isFoodItem is true)**:
    Strive for the most accurate and detailed analysis possible, grounding your observations in visual evidence from the image whenever feasible. Your direct analysis should be specific and avoid overly broad or generic statements.
    *   **Identification**: Determine the type of food (fruit, vegetable, grain, processed item, etc.) and its common name for the 'name' field. Assess your confidence level (0-1) for the 'confidence' field.
    *   **Organic Status Estimation (Visual Assessment Only)**:
        *   Based *solely* on visual cues (e.g., appearance, uniformity, blemishes, any visible packaging/labels if present in the image), estimate if the item appears to be \\\`isOrganic\\\` (true/false).
        *   **This is a highly speculative estimation, not a definitive certification.** Organic status is primarily determined by farming practices, which are often not visually identifiable.
        *   If you set \\\`isOrganic\\\` to true or false, provide a brief \\\`organicReasoning\\\`. Use cautious language. For example:
            *   If leaning towards organic (and setting \\\`isOrganic: true\\\`): "May be organic due to observed natural blemishes and less uniform shape, which *can sometimes suggest* less intensive farming methods. However, this is a visual guess and not a certification."
            *   If leaning towards conventional (and setting \\\`isOrganic: false\\\`): "Appears conventionally grown due to high uniformity and glossy finish, which *are often typical* of mass-market produce. This is a visual assessment and not a certainty."
            *   If truly unsure visually: Set \\\`isOrganic: false\\\` and state in \\\`organicReasoning\\\`: "Organic status is undetermined from visual inspection alone. No clear indicators are present to suggest either organic or conventional farming practices."
        *   **If the image contains clear and unambiguous organic labeling (e.g., a "USDA Organic" seal on packaging), then you can be more confident in setting \\\`isOrganic\\\` to true and MUST mention the label in \\\`organicReasoning\\\`.** Otherwise, maintain a high degree of caution in your visual assessment.
    *   **Color Analysis**: Pay close attention to the visual characteristics, especially the color(s) of the item. List the dominant colors you observe in the 'dominantColors' array.
    *   **Component Breakdown**: Estimate percentages for water, sugar, and fiber. List notable vitamins and minerals typically found in such an item. Be specific if visual cues suggest ripeness or condition that might affect these (e.g. a very ripe banana likely higher sugar).
    *   **Chemical Residues**:
        *   If the item is assessed as likely **non-organic (isOrganic: false)**, or if its **organic status is undetermined** (meaning \\\`isOrganic: false\\\` and reasoning indicates uncertainty), provide a more thorough list of potential chemical residues commonly associated with non-organic farming/processing for this specific food item.
        *   For each residue, provide:
            *   'name': The specific name of the chemical. Be as detailed as possible, including common chemical formulas if appropriate (e.g., "Calcium Carbonate (CaCO3)", "Chlorpyrifos (Organophosphate Pesticide, C9H11Cl3NO3PS)").
            *   'estimatedPercentage': Provide an estimated percentage (numeric value, e.g., 0.05 for 0.05%) for this residue. If you believe a residue is present, even in trace amounts common for conventionally grown items, estimate a small but non-zero percentage (e.g., 0.01, 0.05). Avoid using 0% unless you are highly confident the residue is entirely absent or far below typical levels for such items based on visual/contextual analysis.
            *   'hazardousEffects': A detailed description of potential hazardous effects if this residue is consumed in significant quantities or by sensitive individuals. If known, also include context for its presence (e.g., "Used as a systemic pesticide on non-organic apples to control codling moth", "Common preservative (E220) to prevent browning and microbial growth in dried fruits or wine, can cause reactions in sulfite-sensitive individuals").
        *   If the item is assessed as likely **organic (isOrganic: true)**, the list of chemical residues may be shorter, focusing on naturally occurring compounds, GRAS (Generally Recognized As Safe) processing aids allowed in organic production, or residues that might be present due to environmental factors (with appropriate caveats).
    *   **Edibility**: Recommend an edibility status: 'Safe to Eat', 'Wash & Eat', or 'Unsafe'.

**Crucially, if the item IS identified as food (isFoodItem is true), but you find that your direct analysis for components, organic status (especially if you cannot make a reasonably confident visual estimation even with cautious language and it defaults to 'undetermined'), or chemical residues would be overly generic, speculative without visual grounding, or if your confidence in the detailed food identification itself is low (e.g., < 0.7), then you MUST use the 'simulateResults' tool.** When calling the tool, set the 'assumedOrganic' parameter in the tool input based on your initial, less confident visual assessment if you have one (e.g., if visually it leans slightly conventional despite low confidence, pass \\\`assumedOrganic: false\\\`). Do not use the 'simulateResults' tool if the item is clearly not food.

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
          isOrganic: output.identification.isOrganic !== undefined ? output.identification.isOrganic : false, // Default to false if undefined, reasoning should clarify
          organicReasoning: output.identification.organicReasoning || (output.identification.isOrganic === undefined ? "Organic status could not be determined from visual inspection." : undefined),
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
