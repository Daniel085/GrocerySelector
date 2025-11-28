/**
 * Ingredient Parser with Unit Conversion and Normalization
 *
 * Handles parsing recipe ingredients, converting units, and normalizing names
 * for intelligent shopping list aggregation.
 */

export interface ParsedIngredient {
  raw: string;              // Original text from recipe
  quantity: number;         // Numeric amount
  unit: string;             // Normalized unit (cups, grams, etc.)
  name: string;             // Normalized ingredient name
  originalUnit?: string;    // Original unit for display
  notes?: string;           // Additional notes (e.g., "chopped", "divided")
}

// Unit conversion constants (all converted to base units)
const VOLUME_CONVERSIONS: Record<string, number> = {
  // To cups
  'cup': 1,
  'cups': 1,
  'c': 1,
  'tablespoon': 1/16,
  'tablespoons': 1/16,
  'tbsp': 1/16,
  'tbs': 1/16,
  'T': 1/16,
  'teaspoon': 1/48,
  'teaspoons': 1/48,
  'tsp': 1/48,
  't': 1/48,
  'fluid ounce': 1/8,
  'fluid ounces': 1/8,
  'fl oz': 1/8,
  'pint': 2,
  'pints': 2,
  'pt': 2,
  'quart': 4,
  'quarts': 4,
  'qt': 4,
  'gallon': 16,
  'gallons': 16,
  'gal': 16,
  // Metric to cups (approximate)
  'milliliter': 0.00422675,
  'milliliters': 0.00422675,
  'ml': 0.00422675,
  'liter': 4.22675,
  'liters': 4.22675,
  'l': 4.22675,
};

const WEIGHT_CONVERSIONS: Record<string, number> = {
  // To grams
  'gram': 1,
  'grams': 1,
  'g': 1,
  'kilogram': 1000,
  'kilograms': 1000,
  'kg': 1000,
  'ounce': 28.3495,
  'ounces': 28.3495,
  'oz': 28.3495,
  'pound': 453.592,
  'pounds': 453.592,
  'lb': 453.592,
  'lbs': 453.592,
};

// Common ingredient aliases for normalization
const INGREDIENT_ALIASES: Record<string, string> = {
  'all-purpose flour': 'flour',
  'ap flour': 'flour',
  'plain flour': 'flour',
  'unsalted butter': 'butter',
  'salted butter': 'butter',
  'olive oil': 'oil',
  'vegetable oil': 'oil',
  'canola oil': 'oil',
  'roma tomatoes': 'tomatoes',
  'cherry tomatoes': 'tomatoes',
  'yellow onion': 'onion',
  'white onion': 'onion',
  'red onion': 'onion',
  'garlic cloves': 'garlic',
  'fresh garlic': 'garlic',
};

/**
 * Parse a fraction string to decimal
 * Handles: "1/2", "1 1/2", "1.5"
 */
function parseFraction(str: string): number {
  str = str.trim();

  // Handle decimal
  if (str.includes('.')) {
    return parseFloat(str);
  }

  // Handle mixed number (e.g., "1 1/2")
  const mixedMatch = str.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (mixedMatch) {
    const whole = parseInt(mixedMatch[1]);
    const numerator = parseInt(mixedMatch[2]);
    const denominator = parseInt(mixedMatch[3]);
    return whole + (numerator / denominator);
  }

  // Handle simple fraction (e.g., "1/2")
  const fractionMatch = str.match(/^(\d+)\/(\d+)$/);
  if (fractionMatch) {
    const numerator = parseInt(fractionMatch[1]);
    const denominator = parseInt(fractionMatch[2]);
    return numerator / denominator;
  }

  // Handle whole number
  const num = parseInt(str);
  return isNaN(num) ? 1 : num;
}

/**
 * Normalize ingredient name
 * - Lowercase
 * - Remove common adjectives
 * - Handle plurals
 */
export function normalizeIngredientName(name: string): string {
  let normalized = name.toLowerCase().trim();

  // Remove common preparation notes
  normalized = normalized
    .replace(/,?\s*(chopped|diced|minced|sliced|cubed|crushed|fresh|dried|ground|whole|large|small|medium)\s*/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Check aliases
  if (INGREDIENT_ALIASES[normalized]) {
    return INGREDIENT_ALIASES[normalized];
  }

  // Handle simple plurals
  if (normalized.endsWith('es')) {
    const singular = normalized.slice(0, -2);
    if (INGREDIENT_ALIASES[singular]) {
      return INGREDIENT_ALIASES[singular];
    }
  } else if (normalized.endsWith('s')) {
    const singular = normalized.slice(0, -1);
    if (INGREDIENT_ALIASES[singular]) {
      return INGREDIENT_ALIASES[singular];
    }
  }

  return normalized;
}

/**
 * Parse an ingredient string into structured data
 *
 * Examples:
 * - "2 cups flour"
 * - "1/2 lb butter, softened"
 * - "3 tablespoons olive oil"
 * - "1 large onion, diced"
 */
export function parseIngredient(ingredientText: string): ParsedIngredient {
  // Ensure we have a string (defensive programming)
  if (typeof ingredientText !== 'string') {
    console.error('[IngredientParser] Received non-string ingredient:', ingredientText);
    ingredientText = String(ingredientText);
  }

  const raw = ingredientText.trim();

  // Pattern: [quantity] [unit] [ingredient] [notes]
  // Handles fractions like 1/2, 1 1/2, decimals like 1.5
  const pattern = /^([\d/.]+(?:\s+\d+\/\d+)?)\s*([a-zA-Z]+)?\s+(.+?)(?:\s*[,(](.+))?$/;
  const match = raw.match(pattern);

  if (match) {
    const quantityStr = match[1];
    const unitStr = match[2]?.toLowerCase() || 'piece';
    const ingredientName = match[3].trim();
    const notes = match[4]?.trim();

    const quantity = parseFraction(quantityStr);
    const normalizedName = normalizeIngredientName(ingredientName);

    return {
      raw,
      quantity,
      unit: unitStr,
      name: normalizedName,
      originalUnit: match[2],
      notes,
    };
  }

  // Fallback: no quantity detected (e.g., "salt to taste", "1 onion")
  const simplePattern = /^(\d+(?:\.\d+)?)\s+(.+)$/;
  const simpleMatch = raw.match(simplePattern);

  if (simpleMatch) {
    const quantity = parseFloat(simpleMatch[1]);
    const ingredientName = simpleMatch[2].trim();

    return {
      raw,
      quantity,
      unit: 'piece',
      name: normalizeIngredientName(ingredientName),
    };
  }

  // Ultimate fallback: treat entire string as ingredient
  return {
    raw,
    quantity: 1,
    unit: 'piece',
    name: normalizeIngredientName(raw),
  };
}

/**
 * Convert units to a common base for aggregation
 * Returns [quantity in base unit, base unit name]
 */
export function convertToBaseUnit(quantity: number, unit: string): [number, string] {
  const normalizedUnit = unit.toLowerCase().trim();

  // Volume conversions (to cups)
  if (normalizedUnit in VOLUME_CONVERSIONS) {
    return [quantity * VOLUME_CONVERSIONS[normalizedUnit], 'cups'];
  }

  // Weight conversions (to grams)
  if (normalizedUnit in WEIGHT_CONVERSIONS) {
    return [quantity * WEIGHT_CONVERSIONS[normalizedUnit], 'grams'];
  }

  // No conversion needed (pieces, cloves, etc.)
  return [quantity, normalizedUnit];
}

/**
 * Format quantity for display (round to reasonable precision)
 */
export function formatQuantity(quantity: number): string {
  // Round to 2 decimal places, but remove trailing zeros
  const rounded = Math.round(quantity * 100) / 100;

  // Convert to fraction if it's a common fraction
  const fractions: Record<number, string> = {
    0.25: '1/4',
    0.33: '1/3',
    0.5: '1/2',
    0.67: '2/3',
    0.75: '3/4',
  };

  const decimal = rounded % 1;
  const whole = Math.floor(rounded);

  if (whole > 0 && fractions[Math.round(decimal * 100) / 100]) {
    return `${whole} ${fractions[Math.round(decimal * 100) / 100]}`;
  }

  if (fractions[rounded]) {
    return fractions[rounded];
  }

  return rounded.toString().replace(/\.0+$/, '');
}

/**
 * Combine ingredients by normalizing names and adding quantities
 */
export interface AggregatedIngredient {
  name: string;
  totalQuantity: number;
  unit: string;
  usedInRecipes: string[];  // Recipe names/IDs
  originalIngredients: ParsedIngredient[];  // Keep originals for reference
}

export function aggregateIngredients(
  ingredients: ParsedIngredient[],
  recipeLabels: string[]
): AggregatedIngredient[] {
  const aggregationMap = new Map<string, AggregatedIngredient>();

  ingredients.forEach((ingredient, index) => {
    const recipeLabel = recipeLabels[index] || 'Unknown Recipe';

    // Convert to base unit for aggregation
    const [baseQuantity, baseUnit] = convertToBaseUnit(ingredient.quantity, ingredient.unit);

    // Create key: normalized name + base unit
    const key = `${ingredient.name}|${baseUnit}`;

    if (aggregationMap.has(key)) {
      const existing = aggregationMap.get(key)!;
      existing.totalQuantity += baseQuantity;
      if (!existing.usedInRecipes.includes(recipeLabel)) {
        existing.usedInRecipes.push(recipeLabel);
      }
      existing.originalIngredients.push(ingredient);
    } else {
      aggregationMap.set(key, {
        name: ingredient.name,
        totalQuantity: baseQuantity,
        unit: baseUnit,
        usedInRecipes: [recipeLabel],
        originalIngredients: [ingredient],
      });
    }
  });

  return Array.from(aggregationMap.values()).sort((a, b) =>
    a.name.localeCompare(b.name)
  );
}
