import { useState, useEffect, useMemo } from 'react';
import { RecipeInput } from './components/RecipeInput';
import { RecipeList } from './components/RecipeList';
import { ShoppingList } from './components/ShoppingList';
import type { Recipe } from './types';
import { parseIngredient, aggregateIngredients, type AggregatedIngredient } from './utils/ingredientParser';

function App() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [browserInfo, setBrowserInfo] = useState<string>('');

  // Detect browser
  useEffect(() => {
    const ua = navigator.userAgent;
    let browser = 'Unknown';
    if (ua.includes('Chrome') && !ua.includes('Edg')) browser = 'Chrome';
    else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
    else if (ua.includes('Edg')) browser = 'Edge';
    else if (ua.includes('Firefox')) browser = 'Firefox';

    const isMobile = /iPhone|iPad|Android/i.test(ua);
    setBrowserInfo(`${browser}${isMobile ? ' (Mobile)' : ''}`);
  }, []);

  // Load recipes from localStorage on mount
  useEffect(() => {
    const savedRecipes = localStorage.getItem('grocerySelector_recipes');
    if (savedRecipes) {
      try {
        setRecipes(JSON.parse(savedRecipes));
      } catch (e) {
        console.error('Failed to load saved recipes:', e);
      }
    }
  }, []);

  // Save recipes to localStorage whenever they change
  useEffect(() => {
    if (recipes.length > 0) {
      localStorage.setItem('grocerySelector_recipes', JSON.stringify(recipes));
    } else {
      localStorage.removeItem('grocerySelector_recipes');
    }
  }, [recipes]);

  const handleRecipeAdded = (recipe: Recipe) => {
    setRecipes((prev) => [...prev, recipe]);
  };

  const handleRemoveRecipe = (id: string) => {
    setRecipes((prev) => prev.filter((r) => r.id !== id));
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear all recipes? This cannot be undone.')) {
      setRecipes([]);
    }
  };

  // Generate shopping list from all recipes
  const shoppingList: AggregatedIngredient[] = useMemo(() => {
    if (recipes.length === 0) return [];

    // Parse all ingredients from all recipes
    const allParsedIngredients = recipes.flatMap((recipe) =>
      recipe.ingredients.map((ing) => parseIngredient(ing))
    );

    // Create labels for each ingredient (which recipe it comes from)
    const recipeLabels = recipes.flatMap((recipe) =>
      recipe.ingredients.map(() => recipe.name)
    );

    // Aggregate ingredients
    return aggregateIngredients(allParsedIngredients, recipeLabels);
  }, [recipes]);

  const handleCopyShoppingList = () => {
    const text = generateShoppingListText(shoppingList);
    navigator.clipboard.writeText(text).then(
      () => alert('Shopping list copied to clipboard!'),
      () => alert('Failed to copy shopping list')
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 py-8 px-4 retro-dots">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-6xl md:text-7xl font-bold text-orange-900 mb-4 retro-text-shadow">
            <span className="emoji inline-block">🍽️</span> Grocery Selector
          </h1>
          <p className="text-xl md:text-2xl text-orange-800 max-w-3xl mx-auto font-semibold">
            Smart recipe-based shopping lists with automatic ingredient combining
          </p>
          {browserInfo && (
            <p className="text-base text-amber-700 mt-4">
              Running on: <span className="font-medium text-orange-900">{browserInfo}</span>
            </p>
          )}
        </header>

        {/* How It Works */}
        <div className="bg-gradient-to-r from-yellow-100 via-orange-100 to-red-100 rounded-2xl shadow-lg p-6 mb-8 border-4 border-orange-400 retro-stripes">
          <h3 className="text-2xl font-bold text-orange-900 mb-4 flex items-center gap-2 retro-text-shadow">
            <span className="emoji">🎯</span> How It Works
          </h3>
          <div className="grid md:grid-cols-3 gap-6 text-base">
            <div className="space-y-2 bg-white/70 rounded-xl p-4 border-2 border-yellow-300">
              <p className="font-bold text-orange-900 text-lg">1. Add Recipes</p>
              <p className="text-orange-800 font-medium">
                Paste recipe URLs or manually enter ingredients
              </p>
            </div>
            <div className="space-y-2 bg-white/70 rounded-xl p-4 border-2 border-orange-300">
              <p className="font-bold text-orange-900 text-lg">2. Smart Combining</p>
              <p className="text-orange-800 font-medium">
                Ingredients are automatically normalized and combined with unit conversions
              </p>
            </div>
            <div className="space-y-2 bg-white/70 rounded-xl p-4 border-2 border-red-300">
              <p className="font-bold text-orange-900 text-lg">3. Shop Efficiently</p>
              <p className="text-orange-800 font-medium">
                Get a consolidated shopping list for all your recipes
              </p>
            </div>
          </div>
        </div>

        {/* Recipe Input */}
        <RecipeInput onRecipeAdded={handleRecipeAdded} />

        {/* Recipe List */}
        {recipes.length > 0 && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-3xl font-bold text-orange-900 retro-text-shadow">
                Your Recipes
              </h2>
              <button
                onClick={handleClearAll}
                className="px-5 py-2 rounded-full bg-gradient-to-b from-red-400 to-red-500 text-white hover:from-red-500 hover:to-red-600 font-bold text-sm transition-all border-2 border-red-600"
              >
                Clear All
              </button>
            </div>
            <RecipeList recipes={recipes} onRemoveRecipe={handleRemoveRecipe} />
          </div>
        )}

        {/* Shopping List */}
        {recipes.length > 0 && (
          <div className="mb-8">
            <ShoppingList
              ingredients={shoppingList}
              onCopyList={handleCopyShoppingList}
            />
          </div>
        )}

        {/* Footer */}
        <footer className="mt-16 text-center text-amber-800 text-base">
          <p className="mb-2 font-semibold">
            Smart ingredient normalization and unit conversion
          </p>
          <p className="text-sm font-medium">
            All processing happens in your browser - No data sent to servers
          </p>
        </footer>
      </div>
    </div>
  );
}

function generateShoppingListText(ingredients: AggregatedIngredient[]): string {
  let text = 'GROCERY SHOPPING LIST\n';
  text += '='.repeat(60) + '\n\n';

  ingredients.forEach((item) => {
    const quantity = Math.round(item.totalQuantity * 100) / 100;
    text += `☐ ${item.name} - ${quantity} ${item.unit}\n`;
    text += `   Used in: ${item.usedInRecipes.join(', ')}\n\n`;
  });

  text += '\n' + '='.repeat(60) + '\n';
  text += `Total items: ${ingredients.length}\n`;
  text += 'Generated by Grocery Selector\n';

  return text;
}

export default App;
