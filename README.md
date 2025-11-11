# 🍽️ Grocery Selector

An AI-powered meal planning web app that generates 5-day dinner plans with smart ingredient reuse to minimize grocery costs. Runs entirely in your browser using WebLLM.

## 🚀 Live Demo

**[Try it now!](https://daniel085.github.io/GrocerySelector/)**

> Note: First load will download ~2GB of AI models (cached for future visits)

## Features

- **100% In-Browser AI** - No backend, no API keys, complete privacy
- **Smart Meal Planning** - Generates 5-day meal plans based on cuisine themes
- **AI-Generated Recipe Images** - Optional Stable Diffusion image generation for each meal (experimental)
- **Ingredient Optimization** - Maximizes ingredient reuse across meals to reduce costs
- **WebGPU Support** - Fast generation on capable devices, falls back to CPU/WASM
- **Grocery List Export** - Automatically generates shopping lists with Walmart-compatible format

## How It Works

1. **Initialize the AI** - Downloads ~2GB Phi-2 model (cached after first use)
   - Optionally enable AI-generated recipe images (+500MB Stable Diffusion model)
2. **Choose a Theme** - Pick from Italian, Mexican, Asian, Mediterranean, American, or Indian
3. **Generate Meals** - AI creates 5 dinner meals optimized for ingredient reuse
   - If images are enabled, beautiful recipe photos are generated for each meal
4. **Get Your List** - Copy the grocery list for Walmart.com shopping

## Tech Stack

- **React + TypeScript** - Modern UI framework
- **Vite** - Lightning-fast build tool
- **WebLLM** - Browser-based LLM inference with WebGPU/WASM
- **Transformers.js** - Browser-based Stable Diffusion for image generation
- **Tailwind CSS** - Utility-first styling
- **Phi-2** - 2.7B parameter language model
- **SDXL-Turbo** - Fast text-to-image model (optional)

## Browser Requirements

- **Best experience:** Chrome/Edge 113+, Safari 18+ (WebGPU support)
- **Works on:** Any modern browser (falls back to CPU)
- **Note:** First load requires ~2GB download (~2.5GB with image generation enabled)

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Deployment

### GitHub Pages (Automatic)

This project is configured for automatic deployment to GitHub Pages via GitHub Actions.

**Setup:**
1. Go to your repository Settings → Pages
2. Under "Source", select **GitHub Actions**
3. Push to the `main` branch to trigger automatic deployment
4. Your app will be live at: `https://[username].github.io/GrocerySelector/`

### Manual Deployment

```bash
# Deploy to GitHub Pages manually
npm run deploy
```

This will build the project and push it to the `gh-pages` branch.

## Usage Tips

### WebGPU vs CPU
- **WebGPU** (GPU): 5-15 seconds per meal plan
- **CPU/WASM**: 30-60 seconds per meal plan

### AI-Generated Recipe Images (Experimental)
- Enable the checkbox during initialization to add beautiful AI-generated images to each meal
- Requires additional ~500MB model download (one-time, cached)
- Image generation adds 2-5 minutes to total processing time (5 images total)
- Uses SDXL-Turbo for fast, high-quality food photography-style images
- Completely optional - meal planning works great without images

### Walmart Integration
The app generates a formatted grocery list. To use it:
1. Click "Copy List" button
2. Paste items one-by-one into Walmart.com search
3. Add results to your cart

**Future Enhancement:** Browser extension for automatic cart filling

## Project Structure

```
src/
├── hooks/
│   ├── useWebLLM.ts          # WebLLM integration hook
│   └── useStableDiffusion.ts # Stable Diffusion image generation hook
├── utils/
│   ├── mealParser.ts         # Parse LLM responses & aggregate groceries
│   └── prompts.ts            # Prompt templates for meal generation
├── types.ts                  # TypeScript definitions
└── App.tsx                   # Main application component
```

## Limitations

- First load requires ~2GB model download (~2.5GB with images)
- Generation time varies by hardware (10-60 seconds for meals, +2-5 minutes for images)
- No direct Walmart API integration (manual cart filling)
- Ingredient quantity aggregation is simplified (MVP)
- Image generation is experimental and may occasionally produce unexpected results

## Future Enhancements

- [ ] Browser extension for Walmart auto-fill
- [ ] Multiple model options (smaller/faster or larger/better)
- [ ] User preferences (dietary restrictions, serving sizes)
- [x] Recipe images using Stable Diffusion (browser-based) ✨ **NEW!**
- [ ] Save/share meal plans
- [ ] Price estimation using Walmart API
- [ ] Improve image generation quality and consistency

## Privacy

All processing happens in your browser. No data is sent to external servers. Your meal plans and preferences stay on your device.

## License

MIT
