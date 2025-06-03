
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
    productName: 'Unknown Product - DB Entry',
    ingredients: [],
    allergens: [],
  }
};

const fetchProductInfoByBarcodeTool = ai.defineTool(
  {
    name: 'fetchProductInfoByBarcode',
    description: 'Fetches product information (name, brand, ingredients, allergens) for a given barcode number. This is a simulated tool.',
    inputSchema: z.object({ barcodeNumber: z.string() }),
    outputSchema: AnalyzeBarcodeOutputSchema, // Ensures the tool's output matches the flow's expectations
  },
  async (input): Promise<AnalyzeBarcodeOutput> => { // Explicitly type the promise
    const productInfoFromDb = mockProductDatabase[input.barcodeNumber];

    if (productInfoFromDb && productInfoFromDb.isFound === true) {
      return {
        isFound: true,
        productName: productInfoFromDb.productName || 'N/A',
        brand: productInfoFromDb.brand || 'N/A',
        ingredients: productInfoFromDb.ingredients || [],
        allergens: productInfoFromDb.allergens || [],
        potentialConcerns: [], // Initialize as empty; AI will fill this
        overallAssessment: '',   // Initialize as empty; AI will fill this
      };
    }
    // Product not found in our mockProductDatabase or isFound is false
    return {
      isFound: false,
      productName: productInfoFromDb?.productName || 'Product not found',
      brand: productInfoFromDb?.brand || '',
      ingredients: productInfoFromDb?.ingredients || [],
      allergens: productInfoFromDb?.allergens || [],
      potentialConcerns: [],
      overallAssessment: 'Could not retrieve information for this barcode or product is marked as not found in database.',
    };
  }
);

export async function analyzeBarcode(input: AnalyzeBarcodeInput): Promise<AnalyzeBarcodeOutput> {
  return analyzeBarcodeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeBarcodePrompt',
  input: { schema: z.object({ productInfo: AnalyzeBarcodeOutputSchema }) },
  output: { schema: AnalyzeBarcodeOutputSchema }, 
  tools: [],
  prompt: `You are an AI assistant specialized in analyzing packaged food items based on their ingredients.
You have been provided with product information.

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

IMPORTANT: Only output the 'potentialConcerns' and 'overallAssessment' fields. Do not re-output other fields like productName, brand, ingredients, allergens, or isFound, as those are already known. Your response should only contain these two fields.

If the product was not found (isFound is false in the input to this prompt), or if the ingredients list is empty or not listed, your output for 'potentialConcerns' should be empty and 'overallAssessment' should state that analysis cannot be performed.
Do not invent information not present in the provided product details. Focus on objective analysis of the ingredients.
`,
});

const analyzeBarcodeFlow = ai.defineFlow(
  {
    name: 'analyzeBarcodeFlow',
    inputSchema: AnalyzeBarcodeInputSchema,
    outputSchema: AnalyzeBarcodeOutputSchema,
  },
  async (flowInput): Promise<AnalyzeBarcodeOutput> => {
    const productInfoFromTool = await fetchProductInfoByBarcodeTool(flowInput);

    // If the tool says product not found, or if ingredients are missing (even if found),
    // return the tool's assessment without calling the AI.
    if (!productInfoFromTool.isFound || !productInfoFromTool.ingredients || productInfoFromTool.ingredients.length === 0) {
      return {
        isFound: productInfoFromTool.isFound, // This could be false if not found, or true if found but no ingredients
        productName: productInfoFromTool.productName,
        brand: productInfoFromTool.brand,
        ingredients: productInfoFromTool.ingredients,
        allergens: productInfoFromTool.allergens,
        potentialConcerns: [], // No AI analysis performed
        overallAssessment: productInfoFromTool.overallAssessment || 'Cannot analyze product due to missing information or product not found.',
      };
    }

    // Initialize the result with all data from the tool. This is the base truth.
    const finalResult: AnalyzeBarcodeOutput = {
      isFound: productInfoFromTool.isFound, // Should be true here
      productName: productInfoFromTool.productName,
      brand: productInfoFromTool.brand,
      ingredients: productInfoFromTool.ingredients,
      allergens: productInfoFromTool.allergens,
      potentialConcerns: productInfoFromTool.potentialConcerns, // Should be [] from tool
      overallAssessment: productInfoFromTool.overallAssessment,   // Should be '' from tool
    };

    try {
      // Call the AI to get potentialConcerns and overallAssessment
      const {output: aiAnalysisOutput} = await prompt({ productInfo: productInfoFromTool });

      if (aiAnalysisOutput) {
        // Only update fields the AI is responsible for and if they exist in AI output.
        if (aiAnalysisOutput.potentialConcerns !== undefined) {
          finalResult.potentialConcerns = aiAnalysisOutput.potentialConcerns;
        }
        if (aiAnalysisOutput.overallAssessment !== undefined) {
          finalResult.overallAssessment = aiAnalysisOutput.overallAssessment;
        }
        // Ensure tool's isFound is preserved, AI shouldn't change this.
        finalResult.isFound = productInfoFromTool.isFound; 
      } else {
        // AI analysis failed or returned no structured output for concerns/assessment
        // Keep base product info, update assessment.
        finalResult.overallAssessment = "AI analysis did not provide specific concerns or assessment. Please review ingredients manually.";
      }
    } catch (e) {
        console.error("Error during AI prompt call for barcode analysis:", e);
        // Keep base product info, update assessment.
        finalResult.overallAssessment = "An error occurred during AI analysis of ingredients. Please review ingredients manually.";
    }

    return finalResult;
  }
);
