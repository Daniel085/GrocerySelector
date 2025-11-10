# 🍽️ Grocery Selector

An AI-powered meal planning web app that generates 5-day dinner plans with smart ingredient reuse to minimize grocery costs. Runs entirely in your browser using WebLLM.

## Features

- **100% In-Browser AI** - No backend, no API keys, complete privacy
- **Smart Meal Planning** - Generates 5-day meal plans based on cuisine themes
- **Ingredient Optimization** - Maximizes ingredient reuse across meals to reduce costs
- **WebGPU Support** - Fast generation on capable devices, falls back to CPU/WASM
- **Grocery List Export** - Automatically generates shopping lists with Walmart-compatible format

## How It Works

1. **Initialize the AI** - Downloads ~2GB Phi-2 model (cached after first use)
2. **Choose a Theme** - Pick from Italian, Mexican, Asian, Mediterranean, American, or Indian
3. **Generate Meals** - AI creates 5 dinner meals optimized for ingredient reuse
4. **Get Your List** - Copy the grocery list for Walmart.com shopping

## Tech Stack

- **React + TypeScript** - Modern UI framework
- **Vite** - Lightning-fast build tool
- **WebLLM** - Browser-based LLM inference with WebGPU/WASM
- **Tailwind CSS** - Utility-first styling
- **Phi-2** - 2.7B parameter language model

## Browser Requirements

- **Best experience:** Chrome/Edge 113+, Safari 18+ (WebGPU support)
- **Works on:** Any modern browser (falls back to CPU)
- **Note:** First load requires ~2GB download

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Usage Tips

### WebGPU vs CPU
- **WebGPU** (GPU): 5-15 seconds per meal plan
- **CPU/WASM**: 30-60 seconds per meal plan

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
│   └── useWebLLM.ts          # WebLLM integration hook
├── utils/
│   ├── mealParser.ts         # Parse LLM responses & aggregate groceries
│   └── prompts.ts            # Prompt templates for meal generation
├── types.ts                  # TypeScript definitions
└── App.tsx                   # Main application component
```

## Limitations

- First load requires ~2GB model download
- Generation time varies by hardware (10-60 seconds)
- No direct Walmart API integration (manual cart filling)
- Ingredient quantity aggregation is simplified (MVP)

## Future Enhancements

- [ ] Browser extension for Walmart auto-fill
- [ ] Multiple model options (smaller/faster or larger/better)
- [ ] User preferences (dietary restrictions, serving sizes)
- [ ] Recipe images using Stable Diffusion (browser-based)
- [ ] Save/share meal plans
- [ ] Price estimation using Walmart API

## Privacy

All processing happens in your browser. No data is sent to external servers. Your meal plans and preferences stay on your device.

## License

MIT
