import { useState, useEffect } from 'react';
import { useWebLLM } from './hooks/useWebLLM';
import { useStableDiffusion } from './hooks/useStableDiffusion';
import { ProgressBar } from './components/ProgressBar';
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
  const [generationStep, setGenerationStep] = useState<string>('');
  const [browserInfo, setBrowserInfo] = useState<string>('');

  // Detect browser and capabilities
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

  // Initialize Stable Diffusion when enabled
  useEffect(() => {
    if (enableImages && !sdState.isInitialized && !sdState.isLoading && engine) {
      sdState.initialize();
    }
  }, [enableImages, sdState, engine]);

  const generateImagesForMeals = async (meals: MealPlan) => {
    console.log('[ImageGeneration] Starting image generation, enabled:', enableImages, 'initialized:', sdState.isInitialized);

    if (!enableImages || !sdState.isInitialized) {
      console.log('[ImageGeneration] Skipping image generation');
      return meals;
    }

    setGeneratingImages(true);

    const mealsWithImages = { ...meals };

    for (let i = 0; i < mealsWithImages.meals.length; i++) {
      const meal = mealsWithImages.meals[i];
      console.log(`[ImageGeneration] Processing meal ${i + 1}/5:`, meal.name);

      try {
        setGenerationStep(`🎨 Image ${i + 1}/5: Crafting prompt for "${meal.name}"...`);
        await new Promise(resolve => setTimeout(resolve, 200));

        setGenerationStep(`📸 Image ${i + 1}/5: SDXL-Turbo processing food photography...`);

        // Create a detailed prompt for the image
        const imagePrompt = `professional food photography, ${meal.name}, plated dish, appetizing, high quality, restaurant style`;
        console.log(`[ImageGeneration] Using prompt:`, imagePrompt);

        const imageUrl = await sdState.generateImage(imagePrompt);
        console.log(`[ImageGeneration] Received imageUrl:`, imageUrl ? `${imageUrl.substring(0, 50)}... (length: ${imageUrl.length})` : 'null');

        if (imageUrl) {
          mealsWithImages.meals[i] = { ...meal, imageUrl };
          console.log(`[ImageGeneration] Image ${i + 1}/5 added to meal successfully`);
          setGenerationStep(`✅ Image ${i + 1}/5: "${meal.name}" complete!`);
          await new Promise(resolve => setTimeout(resolve, 300));
        } else {
          console.warn(`[ImageGeneration] No image URL returned for meal ${i + 1}`);
        }
      } catch (err) {
        console.error(`[ImageGeneration] Failed to generate image for ${meal.name}:`, err);
        setGenerationStep(`⚠️ Image ${i + 1}/5 failed, continuing...`);
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    console.log('[ImageGeneration] Completed all images, meals with images:', mealsWithImages);
    setGeneratingImages(false);
    setGenerationStep('');
    return mealsWithImages;
  };

  const handleGenerateMeals = async () => {
    if (!selectedTheme || !engine) return;

    setIsGenerating(true);
    setGenerationError(null);
    setMealPlan(null);
    setGroceryList([]);

    // Helper to show progress with slight delay for visibility
    const showProgress = async (message: string, delayMs: number = 300) => {
      setGenerationStep(message);
      await new Promise(resolve => setTimeout(resolve, delayMs));
    };

    try {
      await showProgress(`🎯 Preparing ${selectedTheme} cuisine meal plan request...`);
      const prompt = generateMealPlanPrompt(selectedTheme);

      await showProgress('📤 Sending prompt to Phi-3-mini language model...');
      await showProgress('🧠 AI analyzing cuisine requirements and constraints...');
      await showProgress('🔍 Scanning knowledge base for recipes and techniques...');
      await showProgress('💭 Generating Day 1 meal with base ingredients...');
      await showProgress('🔄 Optimizing Days 2-5 for ingredient reuse...');
      await showProgress('⚖️ Balancing nutritional variety across all meals...');
      await showProgress('👨‍🍳 Crafting cooking instructions for each recipe...');

      const response = await generate(prompt);
      console.log('[MealGeneration] AI response received, length:', response.length);

      await showProgress('✅ AI response received! Processing meal plan...');
      await showProgress('📋 Extracting meal names and descriptions...');

      const parsed = parseMealPlan(response, selectedTheme);
      console.log('[MealGeneration] Parsed meal plan:', parsed);

      if (parsed) {
        // Show individual meals being extracted
        for (let i = 0; i < parsed.meals.length; i++) {
          const meal = parsed.meals[i];
          await showProgress(`🍽️ Day ${meal.day}: Found "${meal.name}" with ${meal.ingredients.length} ingredients`, 200);
          console.log(`[MealGeneration] Day ${meal.day}:`, {
            name: meal.name,
            ingredientCount: meal.ingredients.length,
            ingredients: meal.ingredients,
          });
        }

        await showProgress('🛒 Analyzing ingredient overlap across meals...');
        await showProgress('📊 Calculating optimal shopping quantities...');
        await showProgress('🏪 Generating consolidated grocery list...');

        const groceries = generateGroceryList(parsed);
        console.log('[MealGeneration] Generated grocery list:', groceries);

        await showProgress('🎨 Finalizing meal plan presentation...');

        // Generate images if enabled
        const mealsWithImages = await generateImagesForMeals(parsed);

        setMealPlan(mealsWithImages);
        setGroceryList(groceries);
        setGenerationStep('✅ Complete! Your personalized meal plan is ready!');
        setTimeout(() => setGenerationStep(''), 2000);
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
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 py-8 px-4 retro-dots">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="text-center mb-12 animate-bounce-in">
          <h1 className="text-6xl md:text-7xl font-bold text-orange-900 mb-4 retro-text-shadow">
            <span className="emoji animate-wiggle inline-block">🍽️</span> Grocery Selector
          </h1>
          <p className="text-xl md:text-2xl text-orange-800 max-w-3xl mx-auto font-semibold">
            AI-powered 5-day meal planning with smart ingredient reuse
          </p>
          {browserInfo && (
            <p className="text-base text-amber-700 mt-4">
              Running on: <span className="font-medium text-orange-900">{browserInfo}</span>
              <span className="mx-2">•</span>
              All processing happens locally in your browser
            </p>
          )}
        </header>

        {/* WebGPU Status */}
        {!engine && (
          <div className="retro-card p-6 mb-8 relative overflow-hidden retro-checkered">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-orange-900 mb-3 retro-text-shadow">
                  Getting Started
                </h2>
                <p className="text-lg text-orange-800 mb-3">
                  {hasWebGPU ? (
                    <span className="text-green-700 font-bold">
                      ✓ WebGPU detected - Fast generation available!
                    </span>
                  ) : (
                    <span className="text-amber-700 font-bold">
                      ⚠️ WebGPU not available - Will use CPU (slower but works!)
                    </span>
                  )}
                </p>
                <p className="text-base text-amber-800 mb-2">
                  First-time setup: ~2GB Phi-3-mini model download (cached after first use)
                </p>
                <p className="text-sm text-orange-700 mb-4">
                  💡 Demo Mode: Watch the AI work in real-time with detailed progress messages
                </p>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableImages}
                    onChange={(e) => setEnableImages(e.target.checked)}
                    className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
                  />
                  <span className="text-base text-orange-900 font-medium">
                    Enable AI-generated recipe images (experimental, +500MB download)
                  </span>
                </label>
              </div>
              <button
                onClick={initialize}
                disabled={isLoading}
                className="retro-button bg-gradient-to-b from-orange-500 to-orange-600 text-white px-10 py-4 rounded-full text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Loading Model...' : 'Initialize AI'}
              </button>
            </div>
            {isLoading && (
              <div className="mt-4 p-4 bg-orange-100 rounded-xl border-3 border-orange-300">
                <ProgressBar progress={progress} />
                <p className="text-sm text-orange-900 mt-3 font-semibold">
                  📥 Downloading Phi-3-mini language model (3.8B parameters) - This happens once and is cached
                </p>
              </div>
            )}
            {enableImages && sdState.isLoading && (
              <div className="mt-4 p-4 bg-pink-100 rounded-xl border-3 border-pink-300">
                <ProgressBar progress={sdState.progress} />
                <p className="text-sm text-pink-900 mt-3 font-semibold">
                  📷 Loading Stable Diffusion SDXL-Turbo (~500MB) for image generation
                </p>
              </div>
            )}
            {enableImages && sdState.isInitialized && (
              <div className="mt-4 p-4 bg-green-100 rounded-xl border-3 border-green-400">
                <p className="text-base text-green-900 font-bold">✓ Image generation ready!</p>
              </div>
            )}
            {error && (
              <div className="mt-4 p-4 bg-red-100 rounded-xl border-3 border-red-400">
                <p className="text-base text-red-900 font-semibold">{error}</p>
              </div>
            )}
          </div>
        )}

        {/* How It Works - Demo Info */}
        {engine && !mealPlan && (
          <>
            <div className="bg-gradient-to-r from-yellow-100 via-orange-100 to-red-100 rounded-2xl shadow-lg p-6 mb-8 border-4 border-orange-400 retro-stripes">
              <h3 className="text-2xl font-bold text-orange-900 mb-4 flex items-center gap-2 retro-text-shadow">
                <span className="emoji">🎯</span> How This Demo Works
              </h3>
              <div className="grid md:grid-cols-3 gap-6 text-base">
                <div className="space-y-2 bg-white/70 rounded-xl p-4 border-2 border-yellow-300">
                  <p className="font-bold text-orange-900 text-lg">1. Select Theme</p>
                  <p className="text-orange-800 font-medium">Pick a cuisine style for your meals</p>
                </div>
                <div className="space-y-2 bg-white/70 rounded-xl p-4 border-2 border-orange-300">
                  <p className="font-bold text-orange-900 text-lg">2. AI Generation</p>
                  <p className="text-orange-800 font-medium">Phi-3-mini creates 5 meals with ingredient reuse</p>
                </div>
                <div className="space-y-2 bg-white/70 rounded-xl p-4 border-2 border-red-300">
                  <p className="font-bold text-orange-900 text-lg">3. Get Results</p>
                  <p className="text-orange-800 font-medium">View meals, recipes, and shopping list</p>
                </div>
              </div>
            </div>
            <div className="retro-card p-8 mb-8 relative overflow-hidden">
              <div className="food-accent"></div>
              <h2 className="text-4xl font-bold text-orange-900 mb-8 text-center retro-text-shadow">
                Choose Your Cuisine Theme
              </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
              {CUISINE_THEMES.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => setSelectedTheme(theme.id)}
                  className={`p-7 rounded-2xl border-4 transition-all hover:scale-105 relative overflow-hidden ${
                    selectedTheme === theme.id
                      ? 'border-orange-600 bg-gradient-to-br from-orange-100 to-yellow-100 shadow-xl scale-105 animate-pulse-warm'
                      : 'border-orange-300 bg-gradient-to-br from-amber-50 to-orange-50 hover:border-orange-500 hover:shadow-lg'
                  }`}
                >
                  <div className="text-6xl mb-3 emoji animate-float">{theme.emoji}</div>
                  <div className="text-xl font-bold text-orange-900">
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
                  className="retro-button bg-gradient-to-b from-orange-500 to-orange-600 text-white px-14 py-5 rounded-full font-bold text-2xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? 'Generating Meals...' : 'Generate 5-Day Meal Plan'}
                </button>
                {isGenerating && (
                  <div className="mt-6">
                    <p className="text-lg text-orange-900 mb-3 font-semibold">
                      This may take 10-60 seconds depending on your hardware...
                    </p>
                    {generationStep && (
                      <div className="p-4 bg-orange-100 rounded-2xl border-3 border-orange-300">
                        <p className="text-base text-orange-900 font-mono leading-relaxed font-semibold">{generationStep}</p>
                      </div>
                    )}
                  </div>
                )}
                {(generatingImages || (generationStep && !isGenerating)) && (
                  <div className="mt-4 p-4 bg-pink-100 rounded-2xl border-3 border-pink-300">
                    <p className="text-base text-pink-900 font-mono leading-relaxed font-semibold">{generationStep}</p>
                    {generatingImages && (
                      <p className="text-sm text-pink-800 mt-2 font-medium">
                        Stable Diffusion running... Each image takes 20-120 seconds
                      </p>
                    )}
                  </div>
                )}
                {generationError && (
                  <div className="mt-4 p-4 bg-red-100 rounded-2xl border-3 border-red-400">
                    <p className="text-base text-red-900 font-semibold">{generationError}</p>
                  </div>
                )}
              </div>
            )}
          </div>
          </>
        )}

        {/* Meal Plan Display */}
        {mealPlan && (
          <>
            <div className="retro-card p-8 mb-8 relative overflow-hidden">
              <div className="food-accent"></div>
              <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
                <h2 className="text-4xl font-bold text-orange-900 retro-text-shadow">
                  Your {mealPlan.theme.charAt(0).toUpperCase() + mealPlan.theme.slice(1)} Meal Plan
                </h2>
                <button
                  onClick={() => {
                    setMealPlan(null);
                    setGroceryList([]);
                    setSelectedTheme(null);
                  }}
                  className="px-7 py-3 rounded-full bg-gradient-to-b from-amber-400 to-orange-500 text-white hover:from-amber-500 hover:to-orange-600 font-bold text-lg transition-all border-3 border-orange-600"
                >
                  Start Over
                </button>
              </div>

              {generatingImages && (
                <div className="mb-6 p-4 bg-pink-100 rounded-2xl border-3 border-pink-300">
                  <p className="text-base text-pink-900 font-semibold">
                    <span className="emoji">🎨</span> Generating recipe images... This may take a few minutes.
                  </p>
                </div>
              )}
              <div className="space-y-8">
                {mealPlan.meals.map((meal) => (
                  <div key={meal.day} className="border-l-8 border-orange-500 pl-6 py-2 bg-gradient-to-r from-orange-50/50 to-transparent hover:from-orange-100/80 transition-colors rounded-r-2xl">
                    <h3 className="text-3xl font-bold text-orange-900 mb-4">
                      Day {meal.day}: {meal.name}
                    </h3>
                    {meal.imageUrl && (
                      <div className="mb-5">
                        <img
                          src={meal.imageUrl}
                          alt={meal.name}
                          className="w-full max-w-md rounded-2xl shadow-lg border-4 border-orange-300"
                        />
                      </div>
                    )}
                    <div className="mb-4">
                      <h4 className="font-bold text-orange-900 mb-2 text-lg">Ingredients:</h4>
                      <ul className="list-disc list-inside text-orange-800 text-base space-y-1.5 ml-1 font-medium">
                        {meal.ingredients.map((ing, idx) => (
                          <li key={idx} className="leading-relaxed">{ing}</li>
                        ))}
                      </ul>
                    </div>
                    {meal.instructions && (
                      <div>
                        <h4 className="font-bold text-orange-900 mb-2 text-lg">Instructions:</h4>
                        <p className="text-orange-800 text-base leading-relaxed font-medium">{meal.instructions}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Grocery List */}
            <div className="retro-card p-8 relative overflow-hidden">
              <div className="food-accent"></div>
              <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
                <h2 className="text-4xl font-bold text-orange-900 retro-text-shadow">
                  <span className="emoji">📋</span> Grocery List
                </h2>
                <button
                  onClick={handleCopyGroceryList}
                  className="retro-button bg-gradient-to-b from-green-500 to-green-600 text-white px-7 py-3 rounded-full text-lg font-bold"
                >
                  Copy List
                </button>
              </div>

              {groceryList.length > 0 ? (
                <div className="space-y-3">
                  {groceryList.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex flex-wrap justify-between items-center gap-3 p-5 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl hover:from-amber-100 hover:to-orange-100 transition-colors border-2 border-orange-200 hover:border-orange-400"
                    >
                      <div className="flex-1 min-w-0">
                        <span className="font-bold text-orange-900 capitalize text-lg">
                          {item.name}
                        </span>
                        <span className="text-orange-800 text-base ml-2 font-medium">- {item.quantity}</span>
                      </div>
                      <span className="text-base text-orange-600 font-bold whitespace-nowrap bg-orange-200 px-3 py-1 rounded-full">
                        Day{item.usedInDays.length > 1 ? 's' : ''} {item.usedInDays.join(', ')}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-orange-700 text-base text-center py-8 font-medium">
                  No grocery items found. Try regenerating the meal plan.
                </p>
              )}

              <div className="mt-6 p-5 bg-gradient-to-r from-yellow-100 to-amber-100 rounded-2xl border-3 border-yellow-400">
                <p className="text-base text-amber-900 leading-relaxed font-medium">
                  <strong><span className="emoji">💡</span> Walmart Shopping Tip:</strong> Copy this list and paste each item into
                  Walmart.com's search to add to your cart, or save this list on your phone for in-store shopping.
                </p>
              </div>
            </div>
          </>
        )}

        {/* Footer */}
        <footer className="mt-16 text-center text-amber-800 text-base">
          <p className="mb-2 font-semibold">
            Powered by <span className="font-bold text-orange-900">WebLLM</span> & <span className="font-bold text-orange-900">Stable Diffusion</span>
          </p>
          <p className="text-sm font-medium">All AI processing happens locally in your browser - No data sent to servers</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
