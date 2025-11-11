# TODO: Future Features

## Walmart Grocery Picking Integration

### Goal
Enable users to automatically add generated grocery lists to their Walmart cart for seamless shopping.

### Current State
- ✅ App generates consolidated grocery lists with quantities
- ✅ Users can copy list to clipboard
- ❌ No direct Walmart integration (manual entry required)

### Proposed Solutions

#### Option 1: Browser Extension (Most Reliable)
**Approach**: Build a companion browser extension that:
- Detects when user is on Walmart.com
- Reads the grocery list from Grocery Selector
- Automatically searches and adds items to cart

**Pros**:
- Most reliable and user-friendly
- Can handle Walmart's UI changes
- Works with user's existing Walmart account

**Cons**:
- Requires separate extension installation
- Needs to be published to Chrome/Firefox stores
- Maintenance for Walmart UI changes

#### Option 2: Walmart API Integration
**Approach**: Use Walmart's Affiliate or Partner API

**Status**: Research needed
- Check if Walmart has a cart API for partners
- Investigate authentication requirements
- Determine if available for indie developers

**Pros**:
- No extension needed
- Official integration

**Cons**:
- May not be publicly available
- Likely requires partnership approval
- API access may be limited

#### Option 3: Deep Links
**Approach**: Generate Walmart.com search URLs for each item

**Example**: `https://www.walmart.com/search?q=2%20lbs%20chicken%20breast`

**Pros**:
- Simple to implement
- No extension needed
- Works immediately

**Cons**:
- Requires manual clicking for each item
- Less automated than other solutions

### Implementation Priority
1. **Short-term**: Improve copy/paste UX (formatted for easy search)
2. **Medium-term**: Add deep link generation for each grocery item
3. **Long-term**: Build browser extension for full automation

### Technical Requirements
- Browser extension: Chrome Extension Manifest V3, Firefox WebExtension
- API integration: OAuth 2.0, REST API client
- Deep links: URL encoding, query parameter handling

### Related Files
- `src/utils/mealParser.ts` - Grocery list generation
- `src/App.tsx` - Copy to clipboard functionality

---

## Other Future Features

### Recipe Images (In Progress)
- ✅ Stable Diffusion integration
- ✅ SDXL-Turbo model
- 🔄 Debugging image generation issues
- ⏳ Improve image quality and consistency

### User Preferences
- Dietary restrictions (vegetarian, vegan, gluten-free, etc.)
- Serving size adjustments
- Cuisine preferences
- Allergy warnings

### Save & Share
- Save meal plans to browser localStorage
- Export as PDF
- Share via URL (encode plan in hash)

### Price Estimation
- Integrate Walmart price API if available
- Show estimated total cost
- Compare prices across stores

### Multi-Model Support
- Allow users to choose different AI models
- Smaller/faster models for quick generation
- Larger models for better quality

### Nutrition Information
- Calculate nutritional info per meal
- Daily totals (calories, protein, etc.)
- Macronutrient balance visualization

---

Last updated: 2025-11-11
