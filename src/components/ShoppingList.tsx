import type { AggregatedIngredient } from '../utils/ingredientParser';
import { formatQuantity } from '../utils/ingredientParser';

interface ShoppingListProps {
  ingredients: AggregatedIngredient[];
  onCopyList: () => void;
}

export function ShoppingList({ ingredients, onCopyList }: ShoppingListProps) {
  if (ingredients.length === 0) {
    return (
      <div className="retro-card p-8 text-center">
        <div className="text-6xl mb-4 emoji">🛒</div>
        <p className="text-xl text-orange-800 font-semibold">
          Your shopping list will appear here once you add recipes
        </p>
      </div>
    );
  }

  return (
    <div className="retro-card p-8 relative overflow-hidden">
      <div className="food-accent"></div>

      <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
        <h2 className="text-4xl font-bold text-orange-900 retro-text-shadow">
          <span className="emoji">🛒</span> Shopping List
        </h2>
        <button
          onClick={onCopyList}
          className="retro-button bg-gradient-to-b from-green-500 to-green-600 text-white px-7 py-3 rounded-full text-lg font-bold hover:from-green-600 hover:to-green-700"
        >
          <span className="emoji">📋</span> Copy List
        </button>
      </div>

      <div className="mb-6 p-5 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-2xl border-3 border-blue-400">
        <p className="text-base text-blue-900 font-bold mb-1">
          <span className="emoji">✨</span> Smart Shopping List
        </p>
        <p className="text-sm text-blue-800 font-medium">
          Ingredients are automatically combined across all recipes with unit conversions.
          Check which recipes use each ingredient!
        </p>
      </div>

      <div className="space-y-3">
        {ingredients.map((item, idx) => (
          <div
            key={idx}
            className="group p-5 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl hover:from-amber-100 hover:to-orange-100 transition-colors border-2 border-orange-200 hover:border-orange-400"
          >
            <div className="flex flex-wrap justify-between items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="font-bold text-orange-900 capitalize text-lg">
                    {item.name}
                  </span>
                  <span className="text-orange-700 text-base font-semibold">
                    {formatQuantity(item.totalQuantity)} {item.unit}
                  </span>
                </div>

                {/* Recipe tags */}
                <div className="flex flex-wrap gap-2 mt-2">
                  {item.usedInRecipes.map((recipeName, recipeIdx) => (
                    <span
                      key={recipeIdx}
                      className="text-xs font-bold text-orange-600 bg-orange-200 px-2 py-1 rounded-full"
                    >
                      {recipeName}
                    </span>
                  ))}
                </div>

                {/* Show original ingredients on hover */}
                <details className="mt-2 group/details">
                  <summary className="text-sm text-orange-600 hover:text-orange-800 cursor-pointer font-medium">
                    Show details ({item.originalIngredients.length} entries)
                  </summary>
                  <ul className="mt-2 space-y-1 text-sm text-orange-700 bg-white/50 p-3 rounded-lg">
                    {item.originalIngredients.map((orig, origIdx) => (
                      <li key={origIdx} className="font-mono">
                        • {orig.raw}
                      </li>
                    ))}
                  </ul>
                </details>
              </div>

              {/* Checkmark for shopping */}
              <div className="flex-shrink-0">
                <input
                  type="checkbox"
                  className="w-6 h-6 text-green-600 rounded-lg border-3 border-orange-300 focus:ring-orange-500 cursor-pointer"
                  aria-label={`Mark ${item.name} as purchased`}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-5 bg-gradient-to-r from-yellow-100 to-amber-100 rounded-2xl border-3 border-yellow-400">
        <p className="text-base text-amber-900 leading-relaxed font-medium">
          <strong>
            <span className="emoji">💡</span> Shopping Tip:
          </strong>{' '}
          Copy this list and paste each item into Walmart.com's search to add to your cart,
          or save this list on your phone for in-store shopping.
        </p>
      </div>

      <div className="mt-4 text-center text-orange-700 text-sm font-medium">
        Total items: {ingredients.length}
      </div>
    </div>
  );
}
