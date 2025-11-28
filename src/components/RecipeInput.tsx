import { useState } from 'react';
import { scrapeRecipeFromUrl, parseRecipeFromText, isValidRecipeUrl } from '../utils/recipeScraper';
import type { Recipe } from '../types';

interface RecipeInputProps {
  onRecipeAdded: (recipe: Recipe) => void;
}

export function RecipeInput({ onRecipeAdded }: RecipeInputProps) {
  const [inputMode, setInputMode] = useState<'url' | 'manual'>('url');
  const [recipeUrl, setRecipeUrl] = useState('');
  const [recipeName, setRecipeName] = useState('');
  const [ingredientText, setIngredientText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!recipeUrl.trim()) {
      setError('Please enter a recipe URL');
      return;
    }

    if (!isValidRecipeUrl(recipeUrl)) {
      setError('Please enter a valid URL (starting with http:// or https://)');
      return;
    }

    setIsLoading(true);

    try {
      const scrapedRecipe = await scrapeRecipeFromUrl(recipeUrl);

      // Ensure all ingredients are strings (defensive programming)
      const ingredients = scrapedRecipe.ingredients
        .map(ing => {
          // Double-check that raw is actually a string
          if (typeof ing.raw === 'string') {
            return ing.raw;
          }
          // Fallback: convert to string if it's not
          console.error('[RecipeInput] Ingredient raw is not a string:', ing);
          return String(ing.raw);
        })
        .filter(ing => ing && ing !== '[object Object]'); // Filter out any that couldn't be converted

      if (ingredients.length === 0) {
        throw new Error('No valid ingredients found in recipe');
      }

      const recipe: Recipe = {
        id: Date.now().toString(),
        name: scrapedRecipe.name,
        url: scrapedRecipe.url,
        ingredients,
        servings: scrapedRecipe.servings,
        prepTime: scrapedRecipe.prepTime,
        cookTime: scrapedRecipe.cookTime,
        imageUrl: scrapedRecipe.imageUrl,
        author: scrapedRecipe.author,
      };

      onRecipeAdded(recipe);
      setRecipeUrl('');
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to fetch recipe. The site may not be supported or may be blocking automated access.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!recipeName.trim()) {
      setError('Please enter a recipe name');
      return;
    }

    if (!ingredientText.trim()) {
      setError('Please enter ingredients (one per line)');
      return;
    }

    try {
      const parsedRecipe = parseRecipeFromText(recipeName, ingredientText);

      const recipe: Recipe = {
        id: Date.now().toString(),
        name: parsedRecipe.name,
        ingredients: parsedRecipe.ingredients.map(ing => ing.raw),
      };

      onRecipeAdded(recipe);
      setRecipeName('');
      setIngredientText('');
      setError(null);
    } catch {
      setError('Failed to parse ingredients. Please check the format.');
    }
  };

  return (
    <div className="retro-card p-6 mb-8 relative overflow-hidden">
      <div className="food-accent"></div>

      <h2 className="text-3xl font-bold text-orange-900 mb-6 retro-text-shadow">
        <span className="emoji">🔗</span> Add Recipe
      </h2>

      {/* Toggle between URL and Manual input */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setInputMode('url')}
          className={`flex-1 px-5 py-3 rounded-xl font-bold text-base transition-all border-3 ${
            inputMode === 'url'
              ? 'bg-gradient-to-b from-orange-500 to-orange-600 text-white border-orange-700'
              : 'bg-gradient-to-b from-amber-100 to-orange-100 text-orange-900 border-orange-300 hover:border-orange-500'
          }`}
        >
          From URL
        </button>
        <button
          onClick={() => setInputMode('manual')}
          className={`flex-1 px-5 py-3 rounded-xl font-bold text-base transition-all border-3 ${
            inputMode === 'manual'
              ? 'bg-gradient-to-b from-orange-500 to-orange-600 text-white border-orange-700'
              : 'bg-gradient-to-b from-amber-100 to-orange-100 text-orange-900 border-orange-300 hover:border-orange-500'
          }`}
        >
          Manual Entry
        </button>
      </div>

      {inputMode === 'url' ? (
        <form onSubmit={handleUrlSubmit} className="space-y-4">
          <div>
            <label htmlFor="recipe-url" className="block text-base font-bold text-orange-900 mb-2">
              Recipe URL
            </label>
            <input
              id="recipe-url"
              type="url"
              value={recipeUrl}
              onChange={(e) => setRecipeUrl(e.target.value)}
              placeholder="https://www.allrecipes.com/recipe/..."
              className="w-full px-4 py-3 rounded-xl border-3 border-orange-300 focus:border-orange-500 focus:outline-none text-base font-medium"
              disabled={isLoading}
            />
            <p className="mt-2 text-sm text-orange-700">
              Supported sites: AllRecipes, Food Network, Simply Recipes, Budget Bytes, and many more
            </p>
          </div>

          {error && (
            <div className="p-4 bg-red-100 rounded-xl border-3 border-red-400">
              <p className="text-base text-red-900 font-semibold whitespace-pre-wrap">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full retro-button bg-gradient-to-b from-orange-500 to-orange-600 text-white px-6 py-4 rounded-full text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Fetching Recipe...' : 'Add Recipe'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleManualSubmit} className="space-y-4">
          <div>
            <label htmlFor="recipe-name" className="block text-base font-bold text-orange-900 mb-2">
              Recipe Name
            </label>
            <input
              id="recipe-name"
              type="text"
              value={recipeName}
              onChange={(e) => setRecipeName(e.target.value)}
              placeholder="e.g., Spaghetti Carbonara"
              className="w-full px-4 py-3 rounded-xl border-3 border-orange-300 focus:border-orange-500 focus:outline-none text-base font-medium"
            />
          </div>

          <div>
            <label htmlFor="ingredients" className="block text-base font-bold text-orange-900 mb-2">
              Ingredients (one per line)
            </label>
            <textarea
              id="ingredients"
              value={ingredientText}
              onChange={(e) => setIngredientText(e.target.value)}
              placeholder="2 cups flour&#10;1/2 cup butter&#10;3 eggs&#10;1 tsp salt"
              rows={8}
              className="w-full px-4 py-3 rounded-xl border-3 border-orange-300 focus:border-orange-500 focus:outline-none text-base font-medium font-mono"
            />
            <p className="mt-2 text-sm text-orange-700">
              Include quantities and units (e.g., "2 cups flour", "1/2 lb butter")
            </p>
          </div>

          {error && (
            <div className="p-4 bg-red-100 rounded-xl border-3 border-red-400">
              <p className="text-base text-red-900 font-semibold whitespace-pre-wrap">{error}</p>
            </div>
          )}

          <button
            type="submit"
            className="w-full retro-button bg-gradient-to-b from-orange-500 to-orange-600 text-white px-6 py-4 rounded-full text-lg font-bold"
          >
            Add Recipe
          </button>
        </form>
      )}
    </div>
  );
}
