
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
  imageUrl: z.string().optional().describe('URL of the product image, if available.'),
  source: z.string().optional().describe('Data source (e.g., Open Food Facts).')
});
export type AnalyzeBarcodeOutput = z.infer<typeof AnalyzeBarcodeOutputSchema>;


const fetchProductInfoByBarcodeTool = ai.defineTool(
  {
    name: 'fetchProductInfoByBarcode',
    description: 'Fetches product information (name, brand, ingredients, allergens, image) for a given barcode number using the Open Food Facts API.',
    inputSchema: z.object({ barcodeNumber: z.string() }),
    outputSchema: AnalyzeBarcodeOutputSchema,
  },
  async (input): Promise<AnalyzeBarcodeOutput> => {
    const { barcodeNumber } = input;
    const apiUrl = `https://world.openfoodfacts.org/api/v2/product/${barcodeNumber}.json?fields=product_name,brands,ingredients_text,allergens_tags,image_url,product_name_en,ingredients_text_en`;

    try {
      const response = await fetch(apiUrl, {
        headers: {
          'User-Agent': 'AAHAR-Food-Analysis-App/1.0 (Firebase Studio; contact: no-reply@example.com) - Product Data powered by Open Food Facts - https://world.openfoodfacts.org/', 
        }
      });

      if (!response.ok) {
        console.error(`Open Food Facts API request failed with status: ${response.status} for barcode: ${barcodeNumber}`);
        return {
          isFound: false,
          productName: 'Product not found or API error',
          brand: '',
          ingredients: [],
          allergens: [],
          potentialConcerns: [],
          overallAssessment: `Could not retrieve information from Open Food Facts. The API returned status ${response.status}. This could be due to an invalid barcode or a temporary issue with the service.`,
          source: 'Open Food Facts API',
        };
      }

      const data = await response.json();

      if (data.status === 0 || !data.product) {
        console.log(`Product not found in Open Food Facts for barcode: ${barcodeNumber}`);
        return {
          isFound: false,
          productName: 'Product not found',
          brand: '',
          ingredients: [],
          allergens: [],
          potentialConcerns: [],
          overallAssessment: 'Product information not found in the Open Food Facts database for this barcode. Please check if the number is correct.',
          source: 'Open Food Facts API',
        };
      }

      const product = data.product;
      const productName = product.product_name_en || product.product_name || 'N/A';
      const ingredientsString = product.ingredients_text_en || product.ingredients_text || '';
      
      const ingredientsArray = ingredientsString
          .replace(/_/g, '') // remove underscores
          .split(/[,;]\s*/) // split by comma or semicolon followed by optional space
          .map(ing => ing.trim()) // trim whitespace
          .filter(ing => ing); // remove any empty strings

      const allergensArray = (product.allergens_tags || [])
        .map((tag: string) => tag.replace(/^[a-z]{2}:/, '').replace(/-/g, ' ').trim())
        .filter(allergen => allergen);

      return {
        isFound: true,
        productName: productName,
        brand: product.brands || 'N/A',
        ingredients: ingredientsArray.length > 0 ? ingredientsArray : (ingredientsString ? [ingredientsString] : []),
        allergens: allergensArray,
        imageUrl: product.image_url || undefined,
        source: 'Open Food Facts API',
      };

    } catch (error) {
      console.error('Error fetching or processing data from Open Food Facts API:', error);
      return {
        isFound: false,
        productName: 'Error during API request',
        brand: '',
        ingredients: [],
        allergens: [],
        potentialConcerns: [],
        overallAssessment: 'An error occurred while trying to fetch product information from Open Food Facts. Please check your internet connection.',
        source: 'Open Food Facts API (Error)',
      };
    }
  }
);

export async function analyzeBarcode(input: AnalyzeBarcodeInput): Promise<AnalyzeBarcodeOutput> {
  return analyzeBarcodeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeBarcodeIngredientsPrompt',
  input: { schema: z.object({ ingredients: z.array(z.string()) }) }, 
  output: { schema: z.object({
    potentialConcerns: AnalyzeBarcodeOutputSchema.shape.potentialConcerns,
    overallAssessment: AnalyzeBarcodeOutputSchema.shape.overallAssessment
  })},
  tools: [],
  prompt: `You are an AI assistant specialized in analyzing packaged food items based on their ingredients list.

You have been provided with a list of ingredients.
Ingredients: 
{{#each ingredients}}- {{{this}}}\n{{/each}}

Based ONLY on this ingredients list:
1.  Identify any potential concerns. For each concern, provide a brief 'concern' title and optional 'details'.
    Examples of concerns: "High Sugar Content", "Contains Artificial Sweeteners", "Multiple Preservatives", "Contains Artificial Colors".
    Be specific. For example, if 'Aspartame' is an ingredient, a concern could be "Contains Artificial Sweetener: Aspartame".
    If sugar or corn syrup are among the first few ingredients, note "High Sugar Content" or "Sweetened with Corn Syrup".
2.  Provide a brief 'overallAssessment' of the product from a health-conscious perspective, focusing on the ingredients.

IMPORTANT: Your response MUST only contain the 'potentialConcerns' and 'overallAssessment' fields.
Do not invent information not present in the provided ingredients list. Focus on objective analysis.
`,
});

const analyzeBarcodeFlow = ai.defineFlow(
  {
    name: 'analyzeBarcodeFlow',
    inputSchema: AnalyzeBarcodeInputSchema,
    outputSchema: AnalyzeBarcodeOutputSchema,
  },
  async (flowInput): Promise<AnalyzeBarcodeOutput> => {
    // Step 1: Fetch product info from the Open Food Facts API tool.
    const productInfo = await fetchProductInfoByBarcodeTool(flowInput);

    // Step 2: If the product wasn't found or has no ingredients, return the tool's result directly.
    if (!productInfo.isFound || !productInfo.ingredients || productInfo.ingredients.length === 0) {
      console.log("Product not found or no ingredients. Skipping AI analysis.");
      return {
        ...productInfo,
        overallAssessment: productInfo.isFound 
          ? "Product information was found, but ingredient data is missing. Analysis cannot be performed."
          : productInfo.overallAssessment, // Use original "not found" or error message from the tool
      };
    }

    try {
      // Step 3: Call the AI for analysis with only the ingredients.
      const {output: aiAnalysisResult} = await prompt({ ingredients: productInfo.ingredients });

      // Step 4: Reliably merge the AI's analysis with the factual data from the tool.
      return {
          ...productInfo, // The source of truth for product data
          potentialConcerns: aiAnalysisResult?.potentialConcerns || [], // Add AI analysis
          overallAssessment: aiAnalysisResult?.overallAssessment || "AI analysis of ingredients could not be completed.", // Add AI analysis
      };

    } catch (e) {
        console.error("Error during AI prompt call for barcode analysis:", e);
        // Fallback in case of a catastrophic error during the AI call.
        return {
          ...productInfo,
          overallAssessment: "An error occurred during AI analysis of ingredients. Product details shown, but please review ingredients manually.",
        };
    }
  }
);
