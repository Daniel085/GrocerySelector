# 🍽️ Grocery Selector - Design Storyboard & Mockups

## Design System

### Color Palette
- **Primary**: Indigo (#4F46E5) - Trust, technology
- **Success**: Green (#10B981) - Fresh, healthy
- **Warning**: Amber (#F59E0B) - Attention
- **Background**: Blue-50 to Indigo-100 gradient
- **Surface**: White (#FFFFFF)
- **Text**: Gray-800 (#1F2937)

### Typography
- **Headers**: Bold, 2xl-5xl
- **Body**: Regular, base-lg
- **Accent**: Semibold

---

## User Journey Storyboard

### Screen 1: Landing / Model Initialization
```
┌─────────────────────────────────────────────────────────────────┐
│                    🍽️ Grocery Selector                          │
│          AI-powered 5-day meal planning with smart              │
│                    ingredient reuse                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  Getting Started                                          │ │
│  │                                                           │ │
│  │  ✓ WebGPU detected - Fast generation available!          │ │
│  │  OR                                                       │ │
│  │  ⚠️ WebGPU not available - Will use CPU (slower but      │ │
│  │     works!)                                               │ │
│  │                                                           │ │
│  │  First-time setup: ~2GB model download                   │ │
│  │  (cached after first use)                                │ │
│  │                                                           │ │
│  │                              ┌──────────────────┐         │ │
│  │                              │  Initialize AI   │         │ │
│  │                              └──────────────────┘         │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  [LOADING STATE - After click]                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ 📥 Downloading model: 847MB / 2048MB (41%)                │ │
│  │ ████████████░░░░░░░░░░░░░░░                               │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

DESIGN NOTES:
- Clean, minimal design on gradient background
- Clear WebGPU status indicator (green/amber)
- Large, inviting CTA button
- Progress bar shows model download status
- Reassuring copy about one-time setup
```

---

### Screen 2: Theme Selection
```
┌─────────────────────────────────────────────────────────────────┐
│                    🍽️ Grocery Selector                          │
│          AI-powered 5-day meal planning with smart              │
│                    ingredient reuse                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │        Choose Your Cuisine Theme                          │ │
│  │                                                           │ │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐         │ │
│  │  │     🇮🇹     │  │     🇲🇽     │  │     🥢     │         │ │
│  │  │            │  │            │  │            │         │ │
│  │  │  Italian   │  │  Mexican   │  │   Asian    │         │ │
│  │  └────────────┘  └────────────┘  └────────────┘         │ │
│  │                                                           │ │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐         │ │
│  │  │     🫒     │  │     🍔     │  │     🇮🇳     │         │ │
│  │  │            │  │            │  │            │         │ │
│  │  │Mediterranean│ │  American  │  │   Indian   │         │ │
│  │  └────────────┘  └────────────┘  └────────────┘         │ │
│  │                        ▲                                 │ │
│  │                        │                                 │ │
│  │                  [SELECTED STATE]                        │ │
│  │              Border: Indigo-600                          │ │
│  │              Background: Indigo-50                       │ │
│  │              Shadow: Large                               │ │
│  │              Scale: 105%                                 │ │
│  │                                                           │ │
│  │               ┌────────────────────────┐                 │ │
│  │               │ Generate 5-Day Meal    │                 │ │
│  │               │      Plan              │                 │ │
│  │               └────────────────────────┘                 │ │
│  │                                                           │ │
│  │    [GENERATING STATE]                                    │ │
│  │    This may take 10-60 seconds depending on your         │ │
│  │    hardware...                                           │ │
│  │    🔄 Generating...                                      │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

DESIGN NOTES:
- Grid layout (2x3 on mobile, 3x2 on desktop)
- Large emoji icons for visual appeal
- Hover effects (border change, shadow)
- Selected state with indigo accent
- Clear visual feedback
- Large generate button appears after selection
- Loading state with spinner and time estimate
```

---

### Screen 3: Meal Plan Display
```
┌─────────────────────────────────────────────────────────────────┐
│                    🍽️ Grocery Selector                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  Your Italian Meal Plan                    [Start Over]   │ │
│  │                                                           │ │
│  │  ▎Day 1: Spaghetti Carbonara                            │ │
│  │  ▎                                                       │ │
│  │  ▎Ingredients:                                           │ │
│  │  ▎ • 1 lb spaghetti                                      │ │
│  │  ▎ • 6 eggs                                              │ │
│  │  ▎ • 1 cup parmesan cheese                               │ │
│  │  ▎ • 8 oz pancetta                                       │ │
│  │  ▎ • 2 cloves garlic                                     │ │
│  │  ▎                                                       │ │
│  │  ▎Instructions: Cook pasta al dente. Fry pancetta       │ │
│  │  ▎with garlic. Mix eggs and parmesan. Combine hot       │ │
│  │  ▎pasta with pancetta, remove from heat, add egg        │ │
│  │  ▎mixture.                                               │ │
│  │  ────────────────────────────────────────────────────    │ │
│  │  ▎Day 2: Frittata with Vegetables                       │ │
│  │  ▎                                                       │ │
│  │  ▎Ingredients:                                           │ │
│  │  ▎ • 6 eggs (using leftover from Day 1)                 │ │
│  │  ▎ • 1 cup parmesan cheese                               │ │
│  │  ▎ • 1 bell pepper                                       │ │
│  │  ▎ • 1 onion                                             │ │
│  │  ▎ • 2 cloves garlic                                     │ │
│  │  ▎                                                       │ │
│  │  ▎Instructions: Sauté vegetables, whisk eggs with       │ │
│  │  ▎cheese, pour over vegetables, bake until set.         │ │
│  │  ────────────────────────────────────────────────────    │ │
│  │  [Days 3-5 continue...]                                  │ │
│  │                                                           │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│                         [SCROLL]                                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

DESIGN NOTES:
- Header with cuisine name and "Start Over" button
- Left border accent (indigo) for each meal card
- Clear day numbering
- Bulleted ingredient lists
- Concise instructions
- Visual separation between days
- Scrollable content area
- Ingredient reuse highlighted in context
```

---

### Screen 4: Grocery List
```
┌─────────────────────────────────────────────────────────────────┐
│  [Continued from Meal Plan - scrolled down]                     │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  📋 Grocery List                        [Copy List]       │ │
│  │                                                           │ │
│  │  ┌─────────────────────────────────────────────────────┐ │ │
│  │  │ Spaghetti - 1 lb                   Days 1            │ │ │
│  │  └─────────────────────────────────────────────────────┘ │ │
│  │  ┌─────────────────────────────────────────────────────┐ │ │
│  │  │ Eggs - 12 eggs                     Days 1, 2         │ │ │
│  │  └─────────────────────────────────────────────────────┘ │ │
│  │  ┌─────────────────────────────────────────────────────┐ │ │
│  │  │ Parmesan cheese - 2 cups           Days 1, 2, 4      │ │ │
│  │  └─────────────────────────────────────────────────────┘ │ │
│  │  ┌─────────────────────────────────────────────────────┐ │ │
│  │  │ Pancetta - 8 oz                    Days 1            │ │ │
│  │  └─────────────────────────────────────────────────────┘ │ │
│  │  ┌─────────────────────────────────────────────────────┐ │ │
│  │  │ Garlic - 10 cloves                 Days 1, 2, 3, 5   │ │ │
│  │  └─────────────────────────────────────────────────────┘ │ │
│  │  ┌─────────────────────────────────────────────────────┐ │ │
│  │  │ Bell pepper - 2 peppers            Days 2, 3         │ │ │
│  │  └─────────────────────────────────────────────────────┘ │ │
│  │  ┌─────────────────────────────────────────────────────┐ │ │
│  │  │ Onion - 3 onions                   Days 2, 3, 4, 5   │ │ │
│  │  └─────────────────────────────────────────────────────┘ │ │
│  │                                                           │ │
│  │  ┌─────────────────────────────────────────────────────┐ │ │
│  │  │ 💡 Walmart Shopping Tip: Copy this list and paste   │ │ │
│  │  │ each item into Walmart.com's search to add to your  │ │ │
│  │  │ cart, or save this list on your phone for in-store  │ │ │
│  │  │ shopping.                                            │ │ │
│  │  └─────────────────────────────────────────────────────┘ │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  Powered by WebLLM - All processing happens in your browser    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

DESIGN NOTES:
- Clean list with hover effects
- Item name (bold) + quantity on left
- Days used (indigo badge) on right
- Green "Copy List" button in header
- Blue info box with Walmart tips
- Footer reinforcing privacy message
- Each item in light gray card that darkens on hover
```

---

## Interaction Flow

```
USER JOURNEY MAP
═══════════════════════════════════════════════════════════════

1. LANDING
   ↓ Click "Initialize AI"
   ↓ (First time: Model downloads with progress bar)
   ↓

2. THEME SELECTION
   ↓ Click cuisine card (visual feedback)
   ↓ Click "Generate 5-Day Meal Plan"
   ↓ (Loading spinner: 10-60 seconds)
   ↓

3. RESULTS VIEW
   ↓ Scroll through 5 daily meals
   ↓ See ingredient reuse across days
   ↓ Scroll to grocery list
   ↓

4. EXPORT
   ↓ Click "Copy List"
   ↓ Use on Walmart.com or in-store
   ↓ Click "Start Over" to plan again

═══════════════════════════════════════════════════════════════
```

---

## Mobile Responsive Design

### Screen Size Adaptations

**Desktop (1024px+)**
- 3-column theme grid
- Side-by-side meal ingredients & instructions
- Wider content max-width (1280px)

**Tablet (768px - 1023px)**
- 2-column theme grid
- Stacked ingredients/instructions
- Medium content max-width (768px)

**Mobile (< 768px)**
- 2-column theme grid (2x3 layout)
- Fully stacked content
- Larger touch targets (min 44px)
- Bottom-fixed "Generate" button when theme selected

---

## Accessibility Features

- **Color Contrast**: WCAG AA compliant
- **Keyboard Navigation**: Full tab support
- **Screen Readers**: ARIA labels on all interactive elements
- **Focus Indicators**: Visible focus rings
- **Loading States**: Descriptive status messages
- **Error States**: Clear error messages with retry options

---

## Animation & Micro-interactions

1. **Theme Selection**
   - Hover: Border color fade, shadow growth, scale 102%
   - Select: Scale to 105%, background fade-in

2. **Button States**
   - Hover: Background darkens 10%, transition 200ms
   - Active: Scale 98%
   - Disabled: Opacity 50%, cursor not-allowed

3. **Loading States**
   - Spinner rotation
   - Progress bar fill animation
   - Pulse effect on text

4. **Content Reveal**
   - Meal cards fade in from bottom (staggered)
   - Grocery items slide in from left (cascading)

5. **Copy Feedback**
   - Button text changes: "Copy List" → "Copied! ✓"
   - Green flash animation
   - Resets after 2 seconds

---

## Error States

### No WebGPU + Failed WASM
```
┌─────────────────────────────────────────┐
│ ⚠️ Unable to Load AI Model              │
│                                         │
│ Your browser doesn't support WebGPU    │
│ and WebAssembly initialization failed.  │
│                                         │
│ Try:                                    │
│ • Updating to latest Chrome/Edge/Safari │
│ • Checking browser compatibility        │
│                                         │
│ [Retry]  [Learn More]                   │
└─────────────────────────────────────────┘
```

### Generation Failed
```
┌─────────────────────────────────────────┐
│ ❌ Generation Failed                     │
│                                         │
│ The AI couldn't generate a meal plan.   │
│ This might be due to browser memory     │
│ limitations.                            │
│                                         │
│ [Try Again]  [Choose Different Theme]   │
└─────────────────────────────────────────┘
```

---

## Visual Hierarchy

**Z-Index Layers:**
1. Background gradient (z-0)
2. Content cards (z-10)
3. Buttons & interactive elements (z-20)
4. Loading overlays (z-30)
5. Modals/tooltips (z-40)

**Spacing System:**
- Extra tight: 0.5rem (8px)
- Tight: 1rem (16px)
- Base: 1.5rem (24px)
- Loose: 2rem (32px)
- Extra loose: 3rem (48px)

---

## Future Enhancement Mockups

### V2 Feature: Dietary Preferences
```
┌─────────────────────────────────────────┐
│ Dietary Preferences (Optional)          │
│                                         │
│ ☐ Vegetarian                            │
│ ☐ Vegan                                 │
│ ☐ Gluten-free                           │
│ ☐ Dairy-free                            │
│ ☐ Low-carb                              │
│                                         │
│ Serving size: [2] people                │
└─────────────────────────────────────────┘
```

### V3 Feature: Price Estimation
```
┌─────────────────────────────────────────┐
│ 📋 Grocery List (Est. $47.23)           │
│                                         │
│ Eggs - 12 eggs         $3.99   Days 1,2 │
│ Parmesan - 2 cups      $8.50   Days 1,2 │
│ ...                                     │
└─────────────────────────────────────────┘
```

---

## Design Principles

1. **Clarity Over Cleverness** - Clear labels, obvious actions
2. **Progressive Disclosure** - Show info when needed
3. **Feedback at Every Step** - Never leave user wondering
4. **Mobile-First** - Works great on all devices
5. **Privacy-Focused** - Reinforce local processing
6. **Performance Aware** - Set expectations for load times

