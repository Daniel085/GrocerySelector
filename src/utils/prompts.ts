import type { CuisineTheme } from '../types';

export function generateMealPlanPrompt(theme: CuisineTheme): string {
  return `You are a meal planning assistant. Create a 5-day dinner meal plan with a ${theme} theme.

IMPORTANT REQUIREMENTS:
1. Maximize ingredient reuse across all 5 days to minimize grocery costs
2. For example, if Day 1 uses tomatoes, try to use them in Days 2-5 as well
3. Use common staples (rice, pasta, onions, garlic) across multiple meals
4. Each meal should be practical and take under 45 minutes to prepare
5. Provide realistic ingredient quantities

Format your response EXACTLY like this:

Day 1:
Meal: [Meal Name]
Ingredients:
- [quantity] [ingredient name]
- [quantity] [ingredient name]
Instructions: [Brief cooking instructions in 2-3 sentences]

Day 2:
Meal: [Meal Name]
Ingredients:
- [quantity] [ingredient name]
- [quantity] [ingredient name]
Instructions: [Brief cooking instructions in 2-3 sentences]

[Continue for Days 3, 4, and 5]

Remember: Prioritize ingredient reuse! If Day 1 uses bell peppers, find ways to use them in other days too.`;
}
