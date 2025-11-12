import type { CuisineTheme } from '../types';

export function generateMealPlanPrompt(theme: CuisineTheme): string {
  return `You are a meal planning assistant. Generate a 5-day dinner meal plan with a ${theme} cuisine theme.

MANDATORY RULES (you MUST follow ALL of these):
1. Generate EXACTLY 5 meals (Day 1, Day 2, Day 3, Day 4, Day 5)
2. Each meal name MUST be completely unique - NO REPEATING MEALS
3. Each meal MUST have at least 5 specific ingredients with quantities
4. Each meal MUST include detailed cooking instructions (minimum 3 sentences)
5. Maximize ingredient reuse across different meals to minimize costs
6. Each meal should take under 45 minutes to prepare

IMPORTANT - AVOID DUPLICATES:
- "Chicken Tacos" and "Beef Tacos" are TOO SIMILAR ❌
- "Chicken Tacos" and "Chicken Alfredo Pasta" are DIFFERENT ✓
- Each day should feature a COMPLETELY DIFFERENT DISH

EXAMPLE MEAL (follow this format exactly):

Day 1:
Meal: Garlic Butter Shrimp Pasta
Ingredients:
- 1 lb shrimp, peeled and deveined
- 12 oz linguine pasta
- 4 cloves garlic, minced
- 3 tbsp butter
- 2 tbsp olive oil
- 1/4 cup white wine
- Salt and pepper to taste
- 1/4 cup fresh parsley, chopped
Instructions: Bring a large pot of salted water to boil and cook linguine according to package directions. While pasta cooks, heat butter and olive oil in a large skillet over medium heat. Add minced garlic and sauté for 1 minute until fragrant. Add shrimp and cook for 3-4 minutes until pink and cooked through. Add white wine and let simmer for 1 minute. Drain pasta and add to the skillet, tossing to coat with the garlic butter sauce. Season with salt and pepper, garnish with fresh parsley, and serve immediately.

Now generate your 5-day ${theme} meal plan following the EXACT format above:`;
}
