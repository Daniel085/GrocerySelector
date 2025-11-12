import type { MealPlan, Meal, GroceryItem } from '../types';

/**
 * Validate meal plan for quality issues
 * Returns validation errors or null if valid
 */
function validateMealPlan(plan: MealPlan): string[] {
  const errors: string[] = [];

  // Rule 1: Must have exactly 5 meals
  if (plan.meals.length !== 5) {
    errors.push(`Expected 5 meals, got ${plan.meals.length}`);
  }

  // Rule 2: Check for duplicate meal names (case-insensitive)
  const names = plan.meals.map(m => m.name.toLowerCase().trim());
  const duplicates = names.filter((name, index) => names.indexOf(name) !== index);
  if (duplicates.length > 0) {
    const uniqueDupes = [...new Set(duplicates)];
    errors.push(`Duplicate meals found: ${uniqueDupes.join(', ')}`);
  }

  // Rule 3: Check for similar meal names (e.g., "Chicken Tacos" vs "Beef Tacos")
  for (let i = 0; i < plan.meals.length; i++) {
    for (let j = i + 1; j < plan.meals.length; j++) {
      const name1 = plan.meals[i].name.toLowerCase();
      const name2 = plan.meals[j].name.toLowerCase();

      // Check if meals share the same main dish type
      const dishTypes = ['tacos', 'pasta', 'curry', 'stir fry', 'soup', 'salad', 'pizza', 'rice bowl'];
      for (const dish of dishTypes) {
        if (name1.includes(dish) && name2.includes(dish)) {
          errors.push(`Meals too similar: "${plan.meals[i].name}" and "${plan.meals[j].name}"`);
          break;
        }
      }
    }
  }

  // Rule 4: Each meal must have minimum ingredients
  plan.meals.forEach(meal => {
    if (meal.ingredients.length < 3) {
      errors.push(`Day ${meal.day} "${meal.name}" has only ${meal.ingredients.length} ingredients (minimum 3)`);
    }
  });

  // Rule 5: Each meal must have instructions
  plan.meals.forEach(meal => {
    if (!meal.instructions || meal.instructions.trim().length < 20) {
      errors.push(`Day ${meal.day} "${meal.name}" has insufficient cooking instructions`);
    }
  });

  // Rule 6: Check for empty meal names
  plan.meals.forEach(meal => {
    if (!meal.name || meal.name.trim().length === 0) {
      errors.push(`Day ${meal.day} has an empty meal name`);
    }
  });

  return errors;
}

export function parseMealPlan(text: string, theme: string): MealPlan | null {
  try {
    // Try to extract JSON if the model returns it
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return { theme, meals: parsed.meals || [] };
    }

    // Fallback: parse structured text format
    const meals: Meal[] = [];
    const dayPattern = /Day (\d+):(.*?)(?=Day \d+:|$)/gis;
    const matches = text.matchAll(dayPattern);

    for (const match of matches) {
      const day = parseInt(match[1]);
      const content = match[2];

      const nameMatch = content.match(/(?:Meal|Dish|Recipe):\s*(.+)/i);
      const ingredientsMatch = content.match(/Ingredients?:\s*([\s\S]+?)(?=Instructions?:|$)/i);
      const instructionsMatch = content.match(/Instructions?:\s*([\s\S]+?)$/i);

      if (nameMatch) {
        meals.push({
          day,
          name: nameMatch[1].trim(),
          ingredients: ingredientsMatch
            ? ingredientsMatch[1]
                .split('\n')
                .map(i => i.trim())
                .filter(i => i && i.match(/^[-•*\d.]/))
                .map(i => i.replace(/^[-•*\d.]\s*/, ''))
            : [],
          instructions: instructionsMatch ? instructionsMatch[1].trim() : '',
        });
      }
    }

    if (meals.length === 0) {
      return null;
    }

    const plan = { theme, meals };

    // Validate the meal plan
    const validationErrors = validateMealPlan(plan);
    if (validationErrors.length > 0) {
      console.warn('[MealParser] Validation errors found:');
      validationErrors.forEach((error, i) => {
        console.warn(`  ${i + 1}. ${error}`);
      });
      // Still return the plan but log the issues
      // In production, you might want to reject invalid plans
    } else {
      console.log('[MealParser] ✓ Meal plan validation passed');
    }

    return plan;
  } catch (error) {
    console.error('Failed to parse meal plan:', error);
    return null;
  }
}

export function generateGroceryList(mealPlan: MealPlan): GroceryItem[] {
  const itemMap = new Map<string, { quantity: string; days: Set<number> }>();

  mealPlan.meals.forEach(meal => {
    meal.ingredients.forEach(ingredient => {
      // Extract quantity and item name
      const match = ingredient.match(/^([\d/.\s]+(?:cups?|tbsp|tsp|oz|lbs?|g|kg|pieces?)?)?\s*(.+)$/i);
      const quantity = match?.[1]?.trim() || '1';
      const itemName = match?.[2]?.trim().toLowerCase() || ingredient.toLowerCase();

      if (itemMap.has(itemName)) {
        const existing = itemMap.get(itemName)!;
        existing.days.add(meal.day);
        // Simple quantity aggregation (just concatenate for MVP)
        if (!existing.quantity.includes(quantity)) {
          existing.quantity += `, ${quantity}`;
        }
      } else {
        itemMap.set(itemName, {
          quantity,
          days: new Set([meal.day]),
        });
      }
    });
  });

  return Array.from(itemMap.entries()).map(([name, { quantity, days }]) => ({
    name,
    quantity,
    usedInDays: Array.from(days).sort(),
  }));
}

export function exportGroceryListAsText(items: GroceryItem[]): string {
  let text = 'GROCERY LIST\n';
  text += '='.repeat(50) + '\n\n';

  items.forEach(item => {
    text += `□ ${item.name} - ${item.quantity}\n`;
    text += `  (Used in: Day${item.usedInDays.length > 1 ? 's' : ''} ${item.usedInDays.join(', ')})\n\n`;
  });

  text += '\n' + '='.repeat(50) + '\n';
  text += 'Copy this list to use on Walmart.com\n';

  return text;
}
