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
 * Uses a CORS proxy for browser-based scraping
 */
export async function scrapeRecipeFromUrl(url: string): Promise<ScrapedRecipe> {
  try {
    // For browser-based scraping, we need to handle CORS
    // We'll use a proxy service or extract from the URL directly

    // Option 1: Use allorigins.win as CORS proxy
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;

    const response = await fetch(proxyUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch recipe: ${response.statusText}`);
    }

    const html = await response.text();

    // Try extracting from JSON-LD first (most reliable)
    const jsonLdRecipe = extractFromJsonLd(html);
    if (jsonLdRecipe) {
      return { ...jsonLdRecipe, url };
    }

    // Fallback to parsing HTML patterns
    const htmlRecipe = extractFromHtml(html);
    if (htmlRecipe) {
      return { ...htmlRecipe, url };
    }

    throw new Error('Could not extract recipe data from this URL');
  } catch (error) {
    console.error('Recipe scraping error:', error);
    throw error;
  }
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

    for (const match of matches) {
      try {
        const jsonData = JSON.parse(match[1]);

        // Handle both single objects and arrays
        const recipes = Array.isArray(jsonData) ? jsonData : [jsonData];

        for (const data of recipes) {
          // Check if this is a Recipe or within @graph
          const recipe = data['@type'] === 'Recipe'
            ? data
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            : data['@graph']?.find((item: any) => item['@type'] === 'Recipe');

          if (recipe) {
            const ingredients = Array.isArray(recipe.recipeIngredient)
              ? recipe.recipeIngredient.map((ing: string) => parseIngredient(ing))
              : [];

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
      } catch {
        // Skip invalid JSON blocks
        continue;
      }
    }

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
    ];

    const ingredients: ParsedIngredient[] = [];
    for (const selector of ingredientSelectors) {
      const elements = doc.querySelectorAll(selector);
      if (elements.length > 0) {
        elements.forEach(el => {
          const text = el.textContent?.trim();
          if (text && text.length > 0 && text.length < 200) {
            ingredients.push(parseIngredient(text));
          }
        });
        break;
      }
    }

    if (ingredients.length === 0) {
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
