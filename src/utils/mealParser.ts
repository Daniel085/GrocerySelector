import type { MealPlan, Meal, GroceryItem } from '../types';

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

    return meals.length > 0 ? { theme, meals } : null;
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
