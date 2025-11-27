import type { Recipe } from '../types';

interface RecipeListProps {
  recipes: Recipe[];
  onRemoveRecipe: (id: string) => void;
}

export function RecipeList({ recipes, onRemoveRecipe }: RecipeListProps) {
  if (recipes.length === 0) {
    return (
      <div className="retro-card p-8 text-center">
        <div className="text-6xl mb-4 emoji">📝</div>
        <p className="text-xl text-orange-800 font-semibold">
          No recipes added yet. Add a recipe above to get started!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-3xl font-bold text-orange-900 retro-text-shadow">
          <span className="emoji">📚</span> Your Recipes ({recipes.length})
        </h2>
      </div>

      {recipes.map((recipe) => (
        <div
          key={recipe.id}
          className="retro-card p-6 relative overflow-hidden hover:shadow-xl transition-shadow"
        >
          <div className="flex flex-col md:flex-row gap-6">
            {/* Recipe Image */}
            {recipe.imageUrl && (
              <div className="flex-shrink-0">
                <img
                  src={recipe.imageUrl}
                  alt={recipe.name}
                  className="w-full md:w-48 h-48 object-cover rounded-xl border-3 border-orange-300"
                />
              </div>
            )}

            {/* Recipe Details */}
            <div className="flex-1">
              <div className="flex justify-between items-start gap-4 mb-3">
                <div>
                  <h3 className="text-2xl font-bold text-orange-900 mb-1">
                    {recipe.name}
                  </h3>
                  {recipe.url && (
                    <a
                      href={recipe.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-orange-600 hover:text-orange-800 hover:underline font-medium"
                    >
                      View original recipe →
                    </a>
                  )}
                  {recipe.author && (
                    <p className="text-sm text-orange-700 mt-1">
                      By {recipe.author}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => onRemoveRecipe(recipe.id)}
                  className="px-4 py-2 rounded-full bg-gradient-to-b from-red-400 to-red-500 text-white hover:from-red-500 hover:to-red-600 font-bold text-sm transition-all border-2 border-red-600"
                  aria-label="Remove recipe"
                >
                  Remove
                </button>
              </div>

              {/* Recipe Meta */}
              {(recipe.servings || recipe.prepTime || recipe.cookTime) && (
                <div className="flex flex-wrap gap-3 mb-4">
                  {recipe.servings && (
                    <div className="px-3 py-1 bg-orange-100 rounded-full border-2 border-orange-300">
                      <span className="text-sm font-bold text-orange-900">
                        <span className="emoji">🍽️</span> {recipe.servings} servings
                      </span>
                    </div>
                  )}
                  {recipe.prepTime && (
                    <div className="px-3 py-1 bg-blue-100 rounded-full border-2 border-blue-300">
                      <span className="text-sm font-bold text-blue-900">
                        <span className="emoji">⏱️</span> Prep: {formatDuration(recipe.prepTime)}
                      </span>
                    </div>
                  )}
                  {recipe.cookTime && (
                    <div className="px-3 py-1 bg-green-100 rounded-full border-2 border-green-300">
                      <span className="text-sm font-bold text-green-900">
                        <span className="emoji">🔥</span> Cook: {formatDuration(recipe.cookTime)}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Ingredients */}
              <div>
                <h4 className="font-bold text-orange-900 mb-2 text-base">
                  Ingredients ({recipe.ingredients.length}):
                </h4>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {recipe.ingredients.slice(0, 6).map((ingredient, idx) => (
                    <li
                      key={idx}
                      className="text-orange-800 text-sm font-medium bg-orange-50 px-3 py-2 rounded-lg"
                    >
                      • {ingredient}
                    </li>
                  ))}
                </ul>
                {recipe.ingredients.length > 6 && (
                  <p className="text-sm text-orange-700 mt-2 font-medium">
                    ... and {recipe.ingredients.length - 6} more
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Format ISO 8601 duration to human-readable string
 * PT1H30M -> "1h 30m"
 */
function formatDuration(duration: string): string {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return duration;

  const hours = match[1] ? `${match[1]}h` : '';
  const minutes = match[2] ? `${match[2]}m` : '';

  return `${hours} ${minutes}`.trim() || duration;
}
