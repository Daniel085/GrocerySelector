/**
 * Recipe URL Scraper
 *
 * Extracts recipe information from URLs using:
 * 1. JSON-LD structured data (schema.org Recipe format)
 * 2. Microdata fallback
 * 3. Common HTML patterns as last resort
 */

import { parseIngredient, type ParsedIngredient } from './ingredientParser';

export interface ScrapedRecipe {
  name: string;
  url: string;
  ingredients: ParsedIngredient[];
  servings?: number;
  prepTime?: string;
  cookTime?: string;
  imageUrl?: string;
  author?: string;
}

/**
 * Fetch and parse recipe from URL
 * Uses multiple CORS proxy services for reliability
 */
export async function scrapeRecipeFromUrl(url: string): Promise<ScrapedRecipe> {
  // Try multiple CORS proxies for better reliability
  const proxies = [
    `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
    `https://corsproxy.io/?${encodeURIComponent(url)}`,
  ];

  let lastError: Error | null = null;

  for (const proxyUrl of proxies) {
    try {
      console.log(`[RecipeScraper] Trying to fetch from: ${proxyUrl.substring(0, 100)}...`);

      const response = await fetch(proxyUrl, {
        headers: {
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const html = await response.text();
      console.log(`[RecipeScraper] Fetched ${html.length} characters of HTML`);

      // Try extracting from JSON-LD first (most reliable)
      const jsonLdRecipe = extractFromJsonLd(html);
      if (jsonLdRecipe) {
        console.log('[RecipeScraper] Successfully extracted via JSON-LD');
        return { ...jsonLdRecipe, url };
      }

      // Fallback to parsing HTML patterns
      const htmlRecipe = extractFromHtml(html);
      if (htmlRecipe) {
        console.log('[RecipeScraper] Successfully extracted via HTML parsing');
        return { ...htmlRecipe, url };
      }

      throw new Error('No recipe data found in response');
    } catch (error) {
      console.warn(`[RecipeScraper] Failed with proxy:`, error);
      lastError = error instanceof Error ? error : new Error(String(error));
      continue; // Try next proxy
    }
  }

  // All proxies failed
  throw new Error(
    `Could not fetch recipe. This may be due to:\n` +
    `• The site blocking automated access\n` +
    `• CORS restrictions\n` +
    `• Invalid URL or missing recipe data\n\n` +
    `Try using "Manual Entry" mode instead.\n\n` +
    `Error: ${lastError?.message || 'Unknown error'}`
  );
}

/**
 * Extract recipe from JSON-LD structured data
 * Most recipe sites use schema.org Recipe format
 */
function extractFromJsonLd(html: string): Omit<ScrapedRecipe, 'url'> | null {
  try {
    // Find all JSON-LD script tags
    const jsonLdPattern = /<script[^>]+type=["']application\/ld\+json["'][^>]*>(.*?)<\/script>/gis;
    const matches = html.matchAll(jsonLdPattern);

    let jsonBlockCount = 0;
    for (const match of matches) {
      try {
        jsonBlockCount++;
        const jsonData = JSON.parse(match[1]);
        console.log(`[RecipeScraper] JSON-LD block ${jsonBlockCount}:`, jsonData);

        // Handle both single objects and arrays
        const recipes = Array.isArray(jsonData) ? jsonData : [jsonData];

        for (const data of recipes) {
          // Check if @type is Recipe (can be string or array)
          const types = Array.isArray(data['@type']) ? data['@type'] : [data['@type']];
          const isRecipe = types.includes('Recipe');

          let recipe = null;

          if (isRecipe) {
            recipe = data;
          } else if (data['@graph']) {
            // Look for Recipe in @graph
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            recipe = data['@graph'].find((item: any) => {
              const itemTypes = Array.isArray(item['@type']) ? item['@type'] : [item['@type']];
              return itemTypes.includes('Recipe');
            });
          }

          if (recipe && recipe.recipeIngredient) {
            console.log('[RecipeScraper] Found recipe:', recipe.name);
            console.log('[RecipeScraper] Ingredients count:', recipe.recipeIngredient?.length);
            console.log('[RecipeScraper] First ingredient sample:', recipe.recipeIngredient?.[0]);

            const ingredients = Array.isArray(recipe.recipeIngredient)
              ? recipe.recipeIngredient.map((ing: string | { name?: string; text?: string }) => {
                  // Handle both string and object formats
                  if (typeof ing === 'string') {
                    return parseIngredient(ing);
                  } else if (typeof ing === 'object') {
                    // Some sites use objects like { "@id": "...", "name": "2 cups flour" }
                    const text = ing.name || ing.text || '';
                    if (text) {
                      return parseIngredient(text);
                    }
                  }
                  return null;
                })
                .filter((ing: ParsedIngredient | null): ing is ParsedIngredient => ing !== null)
              : [];

            if (ingredients.length === 0) {
              console.warn('[RecipeScraper] Recipe found but has no valid ingredients');
              continue;
            }

            console.log('[RecipeScraper] Successfully parsed', ingredients.length, 'ingredients');

            return {
              name: recipe.name || 'Unnamed Recipe',
              ingredients,
              servings: recipe.recipeYield ? parseInt(recipe.recipeYield) : undefined,
              prepTime: recipe.prepTime,
              cookTime: recipe.cookTime,
              imageUrl: Array.isArray(recipe.image) ? recipe.image[0] : recipe.image,
              author: recipe.author?.name || recipe.author,
            };
          }
        }
      } catch (parseError) {
        console.warn('[RecipeScraper] Failed to parse JSON-LD block:', parseError);
        continue;
      }
    }

    console.warn(`[RecipeScraper] Checked ${jsonBlockCount} JSON-LD blocks, no recipe found`);
    return null;
  } catch (error) {
    console.error('JSON-LD parsing error:', error);
    return null;
  }
}

/**
 * Extract recipe from HTML patterns (fallback)
 * Looks for common CSS classes and structure
 */
function extractFromHtml(html: string): Omit<ScrapedRecipe, 'url'> | null {
  try {
    console.log('[RecipeScraper] Attempting HTML fallback parsing...');

    // Create a temporary DOM parser
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Try to find recipe name
    const nameSelectors = [
      'h1.recipe-title',
      'h1[itemprop="name"]',
      '.recipe-header h1',
      'h1',
    ];

    let name = 'Unnamed Recipe';
    for (const selector of nameSelectors) {
      const element = doc.querySelector(selector);
      if (element?.textContent?.trim()) {
        name = element.textContent.trim();
        console.log(`[RecipeScraper] Found recipe name via ${selector}:`, name);
        break;
      }
    }

    // Try to find ingredients
    const ingredientSelectors = [
      '[itemprop="recipeIngredient"]',
      '.ingredient',
      '.recipe-ingredient',
      'li[itemprop="ingredients"]',
      '.ingredients li',
      'ul.ingredients li',
      '.recipe-ingredients li',
    ];

    const ingredients: ParsedIngredient[] = [];
    for (const selector of ingredientSelectors) {
      const elements = doc.querySelectorAll(selector);
      console.log(`[RecipeScraper] Selector ${selector} found ${elements.length} elements`);

      if (elements.length > 0) {
        elements.forEach(el => {
          const text = el.textContent?.trim();
          if (text && text.length > 0 && text.length < 200) {
            ingredients.push(parseIngredient(text));
          }
        });

        if (ingredients.length > 0) {
          console.log(`[RecipeScraper] Extracted ${ingredients.length} ingredients via ${selector}`);
          break;
        }
      }
    }

    if (ingredients.length === 0) {
      console.warn('[RecipeScraper] HTML fallback found no ingredients');
      return null;
    }

    return {
      name,
      ingredients,
    };
  } catch (error) {
    console.error('HTML parsing error:', error);
    return null;
  }
}

/**
 * Extract recipe from plain text ingredient list
 * For manual paste functionality
 */
export function parseRecipeFromText(
  recipeName: string,
  ingredientText: string
): ScrapedRecipe {
  const lines = ingredientText
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

  const ingredients = lines.map(line => parseIngredient(line));

  return {
    name: recipeName,
    url: '',
    ingredients,
  };
}

/**
 * Validate recipe URL
 */
export function isValidRecipeUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Common recipe site domains for quick validation
 */
export const KNOWN_RECIPE_SITES = [
  'allrecipes.com',
  'foodnetwork.com',
  'simplyrecipes.com',
  'seriouseats.com',
  'bonappetit.com',
  'epicurious.com',
  'bettycrocker.com',
  'tasteofhome.com',
  'delish.com',
  'thekitchn.com',
  'budgetbytes.com',
  'recipetineats.com',
];

export function isSupportedRecipeSite(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return KNOWN_RECIPE_SITES.some(site => urlObj.hostname.includes(site));
  } catch {
    return false;
  }
}
