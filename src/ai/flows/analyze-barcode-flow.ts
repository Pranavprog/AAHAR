
'use server';
/**
 * @fileOverview An AI agent for analyzing product information obtained from a barcode.
 *
 * - analyzeBarcode - A function that handles the barcode data analysis process.
 * - AnalyzeBarcodeInput - The input type for the analyzeBarcode function.
 * - AnalyzeBarcodeOutput - The return type for the analyzeBarcode function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeBarcodeInputSchema = z.object({
  barcodeNumber: z.string().describe('The product barcode number (e.g., UPC, EAN).'),
});
export type AnalyzeBarcodeInput = z.infer<typeof AnalyzeBarcodeInputSchema>;

const AnalyzeBarcodeOutputSchema = z.object({
  productName: z.string().optional().describe('The name of the product.'),
  brand: z.string().optional().describe('The brand of the product.'),
  ingredients: z.array(z.string()).optional().describe('List of ingredients.'),
  allergens: z.array(z.string()).optional().describe('List of potential allergens found or declared.'),
  potentialConcerns: z
    .array(
      z.object({
        concern: z.string().describe('The specific concern identified (e.g., "High Sugar Content", "Contains Artificial Sweeteners").'),
        details: z.string().optional().describe('More details about the concern.'),
      })
    )
    .optional()
    .describe('A list of potential concerns regarding ingredients or nutritional information.'),
  overallAssessment: z.string().optional().describe('A brief overall assessment of the product based on its ingredients.'),
  isFound: z.boolean().describe('Whether product information was found for the barcode.'),
});
export type AnalyzeBarcodeOutput = z.infer<typeof AnalyzeBarcodeOutputSchema>;

// Simulated product database
const mockProductDatabase: Record<string, Partial<AnalyzeBarcodeOutput>> = {
  '123456789012': {
    isFound: true,
    productName: 'Super Sweet Cereal',
    brand: 'KidsCo',
    ingredients: ['Whole Grain Oats', 'Sugar', 'Corn Syrup', 'Artificial Colors (Red 40, Yellow 5)', 'Artificial Flavors', 'Salt', 'Vitamin B12'],
    allergens: ['May contain wheat'],
  },
  '987654321098': {
    isFound: true,
    productName: 'Organic Veggie Crisps',
    brand: 'Healthy Snacks Inc.',
    ingredients: ['Organic Potatoes', 'Organic Sunflower Oil', 'Sea Salt', 'Organic Rosemary Extract'],
    allergens: [],
  },
  '112233445566': {
    isFound: true,
    productName: 'Diet Soda Blast',
    brand: 'ZeroCal',
    ingredients: ['Carbonated Water', 'Caramel Color', 'Aspartame', 'Phosphoric Acid', 'Potassium Benzoate (Preservative)', 'Natural Flavors', 'Caffeine'],
    allergens: [],
  },
   '000000000000': {
    isFound: false,
    productName: 'Unknown Product',
  }
};

const fetchProductInfoByBarcodeTool = ai.defineTool(
  {
    name: 'fetchProductInfoByBarcode',
    description: 'Fetches product information (name, brand, ingredients, allergens) for a given barcode number. This is a simulated tool.',
    inputSchema: z.object({ barcodeNumber: z.string() }),
    outputSchema: AnalyzeBarcodeOutputSchema,
  },
  async (input) => {
    const productInfo = mockProductDatabase[input.barcodeNumber];
    if (productInfo) {
      return {
        isFound: true,
        productName: productInfo.productName || 'N/A',
        brand: productInfo.brand || 'N/A',
        ingredients: productInfo.ingredients || [],
        allergens: productInfo.allergens || [],
        potentialConcerns: [], // AI will fill this
        overallAssessment: '', // AI will fill this
      };
    }
    return {
      isFound: false,
      productName: 'Product not found',
      brand: '',
      ingredients: [],
      allergens: [],
      potentialConcerns: [],
      overallAssessment: 'Could not retrieve information for this barcode.',
    };
  }
);

export async function analyzeBarcode(input: AnalyzeBarcodeInput): Promise<AnalyzeBarcodeOutput> {
  return analyzeBarcodeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeBarcodePrompt',
  input: { schema: z.object({ productInfo: AnalyzeBarcodeOutputSchema }) }, // The input to the prompt is the output of the tool
  output: { schema: AnalyzeBarcodeOutputSchema },
  tools: [], // The tool is called by the flow, not the prompt directly in this setup
  prompt: `You are an AI assistant specialized in analyzing packaged food items based on their ingredients.
You have been provided with product information retrieved using a barcode.

Product Name: {{{productInfo.productName}}}
Brand: {{{productInfo.brand}}}
Ingredients: {{#if productInfo.ingredients}}{{#each productInfo.ingredients}}- {{{this}}}\n{{/each}}{{else}}Not listed.{{/if}}
Declared Allergens: {{#if productInfo.allergens}}{{#each productInfo.allergens}}- {{{this}}}\n{{/each}}{{else}}None listed.{{/if}}

Based ONLY on the ingredients list and declared allergens provided above:
1.  Identify any potential concerns. For each concern, provide a brief 'concern' title and optional 'details'.
    Examples of concerns: "High Sugar Content", "Contains Artificial Sweeteners", "Multiple Preservatives", "Common Allergen Present (e.g., gluten if wheat is an ingredient, even if not explicitly in declared allergens)".
    Be specific. For example, if 'Aspartame' is an ingredient, a concern could be "Contains Artificial Sweetener: Aspartame".
    If sugar or corn syrup are among the first few ingredients, note "High Sugar Content" or "Sweetened with Corn Syrup".
    If Red 40, Yellow 5, etc., are present, note "Contains Artificial Colors".
2.  Provide a brief 'overallAssessment' of the product from a health-conscious perspective, focusing on the ingredients.
3.  Re-iterate the product name, brand, ingredients, and allergens from the input. Ensure 'isFound' remains as provided.

If the product was not found (isFound is false), or if the ingredients list is empty or not listed, state that analysis cannot be performed.
Do not invent information not present in the provided product details.
Focus on objective analysis of the ingredients.
`,
});

const analyzeBarcodeFlow = ai.defineFlow(
  {
    name: 'analyzeBarcodeFlow',
    inputSchema: AnalyzeBarcodeInputSchema,
    outputSchema: AnalyzeBarcodeOutputSchema,
  },
  async (flowInput) => {
    // Step 1: Call the tool to get product information
    const productInfo = await fetchProductInfoByBarcodeTool(flowInput);

    if (!productInfo.isFound || !productInfo.ingredients || productInfo.ingredients.length === 0) {
      return {
        isFound: productInfo.isFound || false,
        productName: productInfo.productName || 'Product not found',
        brand: productInfo.brand,
        ingredients: productInfo.ingredients,
        allergens: productInfo.allergens,
        potentialConcerns: [],
        overallAssessment: productInfo.overallAssessment || 'Cannot analyze product due to missing information or product not found.',
      };
    }

    // Step 2: Call the LLM prompt with the product information
    const {output} = await prompt({ productInfo }); // Pass the tool's output to the prompt

    if (!output) {
        return {
            isFound: productInfo.isFound,
            productName: productInfo.productName,
            brand: productInfo.brand,
            ingredients: productInfo.ingredients,
            allergens: productInfo.allergens,
            potentialConcerns: [],
            overallAssessment: "AI analysis failed to generate a response.",
        };
    }
    
    // Ensure the original product info is preserved and merged with AI's analysis
    return {
      ...productInfo, // Start with what the tool returned (name, brand, ingredients, allergens, isFound)
      ...output, // Override with AI's analysis (potentialConcerns, overallAssessment)
      isFound: productInfo.isFound, // Crucially ensure isFound from the tool isn't overwritten by a potentially missing one from LLM
    };
  }
);
