
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
    // Step 1: Fetch product info from the Open Food Facts API tool.
    const productInfoFromTool = await fetchProductInfoByBarcodeTool(flowInput);

    // Step 2: If the product wasn't found or has no ingredients, return the tool's result directly.
    // This is more efficient and prevents calling the AI with no data to analyze.
    if (!productInfoFromTool.isFound || !productInfoFromTool.ingredients || productInfoFromTool.ingredients.length === 0) {
      console.log("Product not found or no ingredients. Skipping AI analysis.");
      return {
        ...productInfoFromTool,
        overallAssessment: productInfoFromTool.isFound 
          ? "Product information was found, but ingredient data is missing. Analysis cannot be performed."
          : productInfoFromTool.overallAssessment, // Use original "not found" message
      };
    }

    try {
      // Step 3: If product is found and has ingredients, call the AI for analysis.
      const {output: aiAnalysisResult} = await prompt({ productInfo: productInfoFromTool });

      if (aiAnalysisResult) {
        // Step 4: Reliably merge the AI's analysis with the factual data from the tool.
        // This ensures the original data from the database is preserved.
        return {
            // Factual data from the tool is the source of truth
            isFound: productInfoFromTool.isFound,
            productName: productInfoFromTool.productName,
            brand: productInfoFromTool.brand,
            ingredients: productInfoFromTool.ingredients,
            allergens: productInfoFromTool.allergens,
            imageUrl: productInfoFromTool.imageUrl,
            source: productInfoFromTool.source,

            // Analytical data from the AI
            potentialConcerns: aiAnalysisResult.potentialConcerns || [],
            overallAssessment: aiAnalysisResult.overallAssessment || "AI analysis of ingredients could not be completed.",
        };
      } else {
        // Fallback in case the AI fails to return a structured output.
        console.warn("AI analysis for barcode returned no structured output. Product details from tool will be used.");
        return {
          ...productInfoFromTool,
          overallAssessment: "Product details retrieved, but AI analysis of ingredients could not be completed.",
        };
      }
    } catch (e) {
        console.error("Error during AI prompt call for barcode analysis:", e);
        // Fallback in case of a catastrophic error during the AI call.
        return {
          ...productInfoFromTool,
          overallAssessment: "An error occurred during AI analysis of ingredients. Product details shown, but please review ingredients manually.",
        };
    }
  }
);
