
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
    // Request specific fields to keep response size manageable
    const apiUrl = `https://world.openfoodfacts.org/api/v2/product/${barcodeNumber}.json?fields=product_name,brands,ingredients_text,allergens_tags,image_url,product_name_en,ingredients_text_en`;

    try {
      const response = await fetch(apiUrl, {
        headers: {
          'User-Agent': 'ScanBiteApp/1.0 (Firebase Studio Prototype; +https://your-app-url-or-contact.com)', // Be a good API citizen
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
          overallAssessment: `Could not retrieve information from Open Food Facts. API returned status ${response.status}.`,
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
          overallAssessment: 'Product information not found in the Open Food Facts database for this barcode.',
          source: 'Open Food Facts API',
        };
      }

      const product = data.product;
      // Prefer English names if available, fallback to default product_name
      const productName = product.product_name_en || product.product_name || 'N/A';
      // Prefer English ingredients text if available
      const ingredientsString = product.ingredients_text_en || product.ingredients_text || '';
      
      // Basic split for ingredients. This can be complex due to nested ingredients, percentages, etc.
      // A more robust parser might be needed for production.
      const ingredientsArray = ingredientsString
        .split(/[,;](?![^(]*\))(?![^[]*\])/g) // Split by comma or semicolon, respecting parentheses and brackets
        .map(ing => ing.replace(/_/g, '').trim()) // Remove underscores used in OFF and trim
        .filter(ing => ing);


      // Allergens from Open Food Facts are often prefixed (e.g., "en:nuts"). Strip prefixes.
      const allergensArray = (product.allergens_tags || [])
        .map((tag: string) => tag.replace(/^[a-z]{2}:/, '').replace(/-/g, ' ').trim())
        .filter(allergen => allergen);

      return {
        isFound: true,
        productName: productName,
        brand: product.brands || 'N/A',
        ingredients: ingredientsArray.length > 0 ? ingredientsArray : (ingredientsString ? [ingredientsString] : []),
        allergens: allergensArray,
        potentialConcerns: [], // To be filled by AI
        overallAssessment: '',   // To be filled by AI
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
        overallAssessment: 'An error occurred while trying to fetch product information from Open Food Facts.',
        source: 'Open Food Facts API (Error)',
      };
    }
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
  prompt: `You are an AI assistant specialized in analyzing packaged food items based on their ingredients and declared allergens.
You have been provided with product information fetched from a database.

Product Name: {{{productInfo.productName}}}
Brand: {{{productInfo.brand}}}
Ingredients: {{#if productInfo.ingredients.length}}{{#each productInfo.ingredients}}- {{{this}}}\n{{/each}}{{else}}Not listed.{{/if}}
Declared Allergens: {{#if productInfo.allergens.length}}{{#each productInfo.allergens}}- {{{this}}}\n{{/each}}{{else}}None listed.{{/if}}
Data Source: {{{productInfo.source}}}
Image URL: {{{productInfo.imageUrl}}}
Is Found: {{{productInfo.isFound}}}


Based ONLY on the ingredients list and declared allergens provided above:
1.  Identify any potential concerns. For each concern, provide a brief 'concern' title and optional 'details'.
    Examples of concerns: "High Sugar Content", "Contains Artificial Sweeteners", "Multiple Preservatives", "Common Allergen Present (e.g., gluten if wheat is an ingredient, even if not explicitly in declared allergens)".
    Be specific. For example, if 'Aspartame' is an ingredient, a concern could be "Contains Artificial Sweetener: Aspartame".
    If sugar or corn syrup are among the first few ingredients, note "High Sugar Content" or "Sweetened with Corn Syrup".
    If Red 40, Yellow 5, etc., are present, note "Contains Artificial Colors".
2.  Provide a brief 'overallAssessment' of the product from a health-conscious perspective, focusing on the ingredients.

IMPORTANT: Your primary role is to provide the 'potentialConcerns' and 'overallAssessment' fields.
You MUST preserve ALL other fields from the input 'productInfo' object (productName, brand, ingredients, allergens, isFound, imageUrl, source) and include them verbatim in your output.
Your response structure MUST exactly match the AnalyzeBarcodeOutputSchema.

If the 'productInfo.isFound' field is false, or if the 'productInfo.ingredients' list is empty or not listed, your 'potentialConcerns' should be an empty array, and the 'overallAssessment' should state that analysis cannot be performed due to missing ingredient data.
In this specific case (not found or no ingredients), you must still return all other fields from 'productInfo' as they were provided to you.
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
    // return the tool's assessment directly. The AI prompt is designed to handle this.
    // The AI will still be called to ensure the output structure is consistent and to state that analysis cannot be performed.

    try {
      // Call the AI to get potentialConcerns and overallAssessment,
      // and to ensure the full structure including original data is returned.
      const {output: aiAnalysisResult} = await prompt({ productInfo: productInfoFromTool });

      if (aiAnalysisResult) {
        // The AI is expected to return the full structure.
        // We just ensure critical fields like isFound, which AI shouldn't alter, are from the tool.
        return {
            ...aiAnalysisResult,
            isFound: productInfoFromTool.isFound,
            productName: productInfoFromTool.productName || aiAnalysisResult.productName,
            brand: productInfoFromTool.brand || aiAnalysisResult.brand,
            ingredients: productInfoFromTool.ingredients && productInfoFromTool.ingredients.length > 0 ? productInfoFromTool.ingredients : aiAnalysisResult.ingredients,
            allergens: productInfoFromTool.allergens && productInfoFromTool.allergens.length > 0 ? productInfoFromTool.allergens : aiAnalysisResult.allergens,
            imageUrl: productInfoFromTool.imageUrl || aiAnalysisResult.imageUrl,
            source: productInfoFromTool.source || aiAnalysisResult.source,
        };
      } else {
        // AI analysis failed or returned no structured output.
        // Fallback to tool's data with a note about analysis failure.
        console.warn("AI analysis for barcode returned no structured output. Product details from tool will be used.");
        return {
          ...productInfoFromTool, // Spread all fields from the tool
          potentialConcerns: productInfoFromTool.potentialConcerns || [], // Ensure it's an array
          overallAssessment: productInfoFromTool.overallAssessment || "Product details retrieved, but AI analysis of ingredients could not be completed.",
        };
      }
    } catch (e) {
        console.error("Error during AI prompt call for barcode analysis:", e);
        // In case of error during AI call, return the tool's data with an error message for assessment.
        return {
          ...productInfoFromTool, // Spread all fields from the tool
          potentialConcerns: productInfoFromTool.potentialConcerns || [], // Ensure it's an array
          overallAssessment: "An error occurred during AI analysis of ingredients. Product details shown, but please review ingredients manually.",
        };
    }
  }
);
