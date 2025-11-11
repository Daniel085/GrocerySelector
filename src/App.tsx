import { useState, useEffect } from 'react';
import { useWebLLM } from './hooks/useWebLLM';
import { useStableDiffusion } from './hooks/useStableDiffusion';
import { CUISINE_THEMES } from './types';
import type { CuisineTheme, MealPlan, GroceryItem } from './types';
import { generateMealPlanPrompt } from './utils/prompts';
import { parseMealPlan, generateGroceryList, exportGroceryListAsText } from './utils/mealParser';

function App() {
  const { engine, isLoading, error, progress, hasWebGPU, initialize, generate } = useWebLLM();
  const sdState = useStableDiffusion();
  const [selectedTheme, setSelectedTheme] = useState<CuisineTheme | null>(null);
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [groceryList, setGroceryList] = useState<GroceryItem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [enableImages, setEnableImages] = useState(false);
  const [generatingImages, setGeneratingImages] = useState(false);

  // Initialize Stable Diffusion when enabled
  useEffect(() => {
    if (enableImages && !sdState.isInitialized && !sdState.isLoading && engine) {
      sdState.initialize();
    }
  }, [enableImages, sdState, engine]);

  const generateImagesForMeals = async (meals: MealPlan) => {
    if (!enableImages || !sdState.isInitialized) return meals;

    setGeneratingImages(true);

    const mealsWithImages = { ...meals };

    for (let i = 0; i < mealsWithImages.meals.length; i++) {
      const meal = mealsWithImages.meals[i];
      try {
        // Create a detailed prompt for the image
        const imagePrompt = `professional food photography, ${meal.name}, plated dish, appetizing, high quality, restaurant style`;

        const imageUrl = await sdState.generateImage(imagePrompt);
        if (imageUrl) {
          mealsWithImages.meals[i] = { ...meal, imageUrl };
        }
      } catch (err) {
        console.error(`Failed to generate image for ${meal.name}:`, err);
      }
    }

    setGeneratingImages(false);
    return mealsWithImages;
  };

  const handleGenerateMeals = async () => {
    if (!selectedTheme || !engine) return;

    setIsGenerating(true);
    setGenerationError(null);
    setMealPlan(null);
    setGroceryList([]);

    try {
      const prompt = generateMealPlanPrompt(selectedTheme);
      const response = await generate(prompt);

      const parsed = parseMealPlan(response, selectedTheme);
      if (parsed) {
        // Generate images if enabled
        const mealsWithImages = await generateImagesForMeals(parsed);
        setMealPlan(mealsWithImages);
        const groceries = generateGroceryList(mealsWithImages);
        setGroceryList(groceries);
      } else {
        setGenerationError('Failed to parse meal plan. Please try again.');
      }
    } catch (err) {
      setGenerationError(err instanceof Error ? err.message : 'Failed to generate meals');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyGroceryList = () => {
    const text = exportGroceryListAsText(groceryList);
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-3">
            🍽️ Grocery Selector
          </h1>
          <p className="text-lg text-gray-600">
            AI-powered 5-day meal planning with smart ingredient reuse
          </p>
        </header>

        {/* WebGPU Status */}
        {!engine && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                  Getting Started
                </h2>
                <p className="text-gray-600 mb-2">
                  {hasWebGPU ? (
                    <span className="text-green-600 font-medium">
                      ✓ WebGPU detected - Fast generation available!
                    </span>
                  ) : (
                    <span className="text-amber-600 font-medium">
                      ⚠️ WebGPU not available - Will use CPU (slower but works!)
                    </span>
                  )}
                </p>
                <p className="text-sm text-gray-500 mb-3">
                  First-time setup: ~2GB model download (cached after first use)
                </p>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableImages}
                    onChange={(e) => setEnableImages(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-700">
                    Enable AI-generated recipe images (experimental, +500MB download)
                  </span>
                </label>
              </div>
              <button
                onClick={initialize}
                disabled={isLoading}
                className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Loading Model...' : 'Initialize AI'}
              </button>
            </div>
            {isLoading && (
              <div className="mt-4 p-4 bg-blue-50 rounded border border-blue-200">
                <p className="text-sm text-blue-800">{progress}</p>
              </div>
            )}
            {enableImages && sdState.isLoading && (
              <div className="mt-4 p-4 bg-purple-50 rounded border border-purple-200">
                <p className="text-sm text-purple-800">📷 {sdState.progress}</p>
              </div>
            )}
            {enableImages && sdState.isInitialized && (
              <div className="mt-4 p-4 bg-green-50 rounded border border-green-200">
                <p className="text-sm text-green-800">✓ Image generation ready!</p>
              </div>
            )}
            {error && (
              <div className="mt-4 p-4 bg-red-50 rounded border border-red-200">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}
          </div>
        )}

        {/* Theme Selection */}
        {engine && !mealPlan && (
          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
              Choose Your Cuisine Theme
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {CUISINE_THEMES.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => setSelectedTheme(theme.id)}
                  className={`p-6 rounded-lg border-2 transition-all ${
                    selectedTheme === theme.id
                      ? 'border-indigo-600 bg-indigo-50 shadow-lg scale-105'
                      : 'border-gray-200 hover:border-indigo-300 hover:shadow-md'
                  }`}
                >
                  <div className="text-4xl mb-2">{theme.emoji}</div>
                  <div className="text-lg font-semibold text-gray-800">
                    {theme.name}
                  </div>
                </button>
              ))}
            </div>
            {selectedTheme && (
              <div className="mt-8 text-center">
                <button
                  onClick={handleGenerateMeals}
                  disabled={isGenerating}
                  className="bg-indigo-600 text-white px-12 py-4 rounded-lg font-semibold text-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-lg"
                >
                  {isGenerating ? 'Generating Meals...' : 'Generate 5-Day Meal Plan'}
                </button>
                {isGenerating && (
                  <p className="mt-4 text-gray-600">
                    This may take 10-60 seconds depending on your hardware...
                  </p>
                )}
                {generationError && (
                  <div className="mt-4 p-4 bg-red-50 rounded border border-red-200">
                    <p className="text-sm text-red-800">{generationError}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Meal Plan Display */}
        {mealPlan && (
          <>
            <div className="bg-white rounded-lg shadow-md p-8 mb-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800">
                  Your {mealPlan.theme.charAt(0).toUpperCase() + mealPlan.theme.slice(1)} Meal Plan
                </h2>
                <button
                  onClick={() => {
                    setMealPlan(null);
                    setGroceryList([]);
                    setSelectedTheme(null);
                  }}
                  className="text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  Start Over
                </button>
              </div>

              {generatingImages && (
                <div className="mb-6 p-4 bg-purple-50 rounded border border-purple-200">
                  <p className="text-sm text-purple-800">
                    🎨 Generating recipe images... This may take a few minutes.
                  </p>
                </div>
              )}
              <div className="space-y-6">
                {mealPlan.meals.map((meal) => (
                  <div key={meal.day} className="border-l-4 border-indigo-500 pl-6 py-4">
                    <h3 className="text-xl font-bold text-gray-800 mb-3">
                      Day {meal.day}: {meal.name}
                    </h3>
                    {meal.imageUrl && (
                      <div className="mb-4">
                        <img
                          src={meal.imageUrl}
                          alt={meal.name}
                          className="w-full max-w-md rounded-lg shadow-md"
                        />
                      </div>
                    )}
                    <div className="mb-3">
                      <h4 className="font-semibold text-gray-700 mb-1">Ingredients:</h4>
                      <ul className="list-disc list-inside text-gray-600 space-y-1">
                        {meal.ingredients.map((ing, idx) => (
                          <li key={idx}>{ing}</li>
                        ))}
                      </ul>
                    </div>
                    {meal.instructions && (
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-1">Instructions:</h4>
                        <p className="text-gray-600">{meal.instructions}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Grocery List */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800">
                  📋 Grocery List
                </h2>
                <button
                  onClick={handleCopyGroceryList}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  Copy List
                </button>
              </div>

              {groceryList.length > 0 ? (
                <div className="space-y-3">
                  {groceryList.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div>
                        <span className="font-semibold text-gray-800 capitalize">
                          {item.name}
                        </span>
                        <span className="text-gray-600 ml-2">- {item.quantity}</span>
                      </div>
                      <span className="text-sm text-indigo-600 font-medium">
                        Day{item.usedInDays.length > 1 ? 's' : ''} {item.usedInDays.join(', ')}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  No grocery items found. Try regenerating the meal plan.
                </p>
              )}

              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>💡 Walmart Shopping Tip:</strong> Copy this list and paste each item into
                  Walmart.com's search to add to your cart, or save this list on your phone for in-store shopping.
                </p>
              </div>
            </div>
          </>
        )}

        {/* Footer */}
        <footer className="mt-12 text-center text-gray-600 text-sm">
          <p>Powered by WebLLM - All processing happens in your browser</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
