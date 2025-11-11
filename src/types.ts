export interface Meal {
  day: number;
  name: string;
  ingredients: string[];
  instructions: string;
  imageUrl?: string; // Generated recipe image
}

export interface MealPlan {
  theme: string;
  meals: Meal[];
}

export interface GroceryItem {
  name: string;
  quantity: string;
  usedInDays: number[];
}

export const CUISINE_THEMES = [
  { id: 'italian', name: 'Italian', emoji: '🇮🇹' },
  { id: 'mexican', name: 'Mexican', emoji: '🇲🇽' },
  { id: 'asian', name: 'Asian', emoji: '🥢' },
  { id: 'mediterranean', name: 'Mediterranean', emoji: '🫒' },
  { id: 'american', name: 'American', emoji: '🍔' },
  { id: 'indian', name: 'Indian', emoji: '🇮🇳' },
] as const;

export type CuisineTheme = typeof CUISINE_THEMES[number]['id'];
