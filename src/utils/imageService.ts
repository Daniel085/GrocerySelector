/**
 * Fetches food images from free APIs
 * Using Foodish API - no API key required
 * Fallback to Lorem Picsum for demo purposes
 */

const FOODISH_API = 'https://foodish-api.com/api/';

export async function fetchRecipeImage(mealName: string): Promise<string | null> {
  try {
    console.log(`[ImageService] Fetching image for: ${mealName}`);

    // Try Foodish API first - returns random food images
    const response = await fetch(FOODISH_API, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      console.log(`[ImageService] Foodish API response:`, data);

      if (data.image) {
        console.log(`[ImageService] Successfully fetched image: ${data.image}`);
        return data.image;
      }
    }

    console.warn(`[ImageService] Foodish API failed, using fallback`);
    // Fallback to a generic food placeholder
    return `https://picsum.photos/seed/${encodeURIComponent(mealName)}/800/600`;
  } catch (error) {
    console.error(`[ImageService] Error fetching image:`, error);
    // Return a deterministic placeholder based on meal name
    return `https://picsum.photos/seed/${encodeURIComponent(mealName)}/800/600`;
  }
}

/**
 * Add a small delay between requests to avoid rate limiting
 */
export async function fetchRecipeImagesWithDelay(
  mealNames: string[],
  onProgress?: (current: number, total: number) => void
): Promise<(string | null)[]> {
  const images: (string | null)[] = [];

  for (let i = 0; i < mealNames.length; i++) {
    if (onProgress) {
      onProgress(i + 1, mealNames.length);
    }

    const image = await fetchRecipeImage(mealNames[i]);
    images.push(image);

    // Add 200ms delay between requests to be respectful to the API
    if (i < mealNames.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }

  return images;
}
