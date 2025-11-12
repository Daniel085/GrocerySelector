# iPhone 15+ Safari Compatibility Plan

**Document Version:** 1.0
**Date:** 2025-11-12
**Target:** iPhone 15 Pro / 15 Pro Max and newer running Safari 26+ (iOS 18.2+)

---

## Executive Summary

### TL;DR: FEASIBLE WITH SIGNIFICANT COMPROMISES

**Recommendation:** Proceed with a tiered approach

**Current Status (as of November 2025):**
- WebGPU is NOW available in Safari 26 on iOS 18.2+
- iPhone 15 Pro can theoretically run the app
- Significant UX compromises required for acceptable performance

**Three-Tier Strategy:**

1. **Tier 1 - Full Feature (iPhone 15 Pro+)**: Limited support with smaller model
   - Use 1.8GB quantized Phi-3-mini instead of 3.7GB
   - Disable Stable Diffusion (too much memory overhead)
   - Expected to work on iPhone 15 Pro/Max, 16 series

2. **Tier 2 - Lightweight (iPhone 15 base)**: Ultra-light model
   - Use SmolLM2-1.7B (~1GB) or Llama 3.2 1B
   - Text-only meal plans
   - May work on iPhone 15 base model

3. **Tier 3 - Hybrid Cloud**: Fallback for older devices
   - Detect insufficient capabilities
   - Offer cloud API option (OpenAI/Anthropic)
   - Maintain privacy-focused messaging

**Key Challenges:**
- Model download size (2-3.7GB) over cellular network
- Storage eviction after 7 days of inactivity (iOS policy)
- Memory constraints (~2-2.5GB WebGPU buffer limit on iPhone 15)
- Battery drain and thermal throttling during inference
- Initial load time: 5-15 minutes on WiFi, prohibitive on cellular

**Go/No-Go Decision Points:**
- ✅ Technical feasibility: YES (with Safari 26+)
- ⚠️ User experience: ACCEPTABLE (with proper expectations)
- ✅ Performance: ADEQUATE (15-60 seconds generation time)
- ⚠️ Market reach: LIMITED (requires latest iOS and iPhone Pro models)

---

## Section A: Feasibility Assessment

### Can It Work?

**YES, but with constraints** - The app can work on iPhone 15 Pro and newer models running Safari 26 (iOS 18.2+) with the following conditions:

### Detailed Reasoning

#### 1. WebGPU Support Status

**Current State (November 2025):**
- ✅ Safari 26 officially ships with WebGPU enabled by default
- ✅ Available on iOS 18.2+ (released in late 2024)
- ✅ Uses Metal backend for GPU acceleration
- ⚠️ Was behind feature flag in iOS 17.4 - 18.1 (experimental)

**What This Means:**
- Users on iOS 18.2+ get GPU acceleration automatically
- Users on iOS 17.4 - 18.1 can enable via Settings > Safari > Advanced > Feature Flags > WebGPU
- Users on iOS 17.3 or earlier: NO SUPPORT, must use WASM CPU fallback (extremely slow)

#### 2. Memory Analysis

**iPhone 15 Series Specifications:**
- iPhone 15: 6GB RAM (A16 Bionic, 5-core GPU)
- iPhone 15 Pro: 8GB RAM (A17 Pro, 6-core GPU) ✅
- iPhone 15 Pro Max: 8GB RAM (A17 Pro, 6-core GPU) ✅

**WebGPU Memory Limits (Based on Research):**
- iPhone 16 Pro Max: ~2.5GB WebGPU buffer limit (tested)
- iPhone 15 Pro/Max: Estimated ~2GB WebGPU buffer limit
- iPhone 15 base: Estimated ~1.5GB WebGPU buffer limit
- Historical Safari limit: 256MB-993MB (older devices)

**Current Model Sizes:**
- Phi-3-mini-4k-instruct-q4f16_1-MLC: ~3.67GB (TOO LARGE)
- Phi-3-mini-4k-instruct (q4 GGUF): ~1.8GB (WORKABLE)
- SmolLM2-1.7B: ~1GB (SAFE)
- Llama 3.2 1B: ~650MB (VERY SAFE)

**Storage Constraints:**
- IndexedDB quota: 500MB - 1GB (depends on free disk space)
- Cache API: Historically 50MB, increased to 1GB in iOS 13+
- Combined quota: ~1GB for script-writable storage
- **CRITICAL**: 7-day eviction policy - if app not used for 7 days, storage cleared

**Verdict on Memory:**
- ❌ Current 3.67GB model: TOO LARGE for iPhone 15 series
- ⚠️ 1.8GB quantized model: BORDERLINE for iPhone 15 Pro/Max
- ✅ 1GB models: SAFE for iPhone 15 Pro and newer

#### 3. Performance Expectations

**Generation Times (Based on Research):**

**WebGPU (GPU-accelerated):**
- Desktop Chrome: 5-15 seconds for meal plan
- iPhone A17 Pro: ~15-30 seconds estimated (5× slower than desktop)
- iPhone A16: ~30-60 seconds estimated

**WASM CPU Fallback:**
- Desktop: 30-60 seconds
- iPhone: 2-5 minutes (15-17× slower than GPU)
- **NOT RECOMMENDED** for production use

**Thermal Throttling:**
- First generation: 15-30 seconds
- After 2-3 generations: Performance degrades 20-40% due to thermal throttling
- Sustained use: May trigger aggressive throttling, reaching 60-120 seconds per generation

#### 4. Battery Impact

**Power Consumption:**
- Single meal plan generation: ~5-10% battery drain (estimated)
- With image generation: ~15-25% battery drain
- Thermal profile: Phone will get warm/hot during generation
- Background tab behavior: iOS may suspend/kill WebGPU processes

**Mitigation:**
- Disable Stable Diffusion on mobile (saves battery and memory)
- Recommend WiFi charging during use
- Show battery warning before generation

### Device Compatibility Matrix

| Device | WebGPU Support | Recommended Model | Expected Performance | Verdict |
|--------|---------------|-------------------|---------------------|----------|
| iPhone 16 Pro/Max | ✅ Full (Safari 26+) | Phi-3-mini 1.8GB | 15-30s generation | ✅ SUPPORTED |
| iPhone 16/Plus | ✅ Full (Safari 26+) | SmolLM2 1GB | 20-40s generation | ✅ SUPPORTED |
| iPhone 15 Pro/Max | ✅ Full (Safari 26+) | Phi-3-mini 1.8GB | 20-40s generation | ⚠️ SUPPORTED* |
| iPhone 15/Plus | ⚠️ Limited | SmolLM2 1GB | 30-60s generation | ⚠️ LIMITED |
| iPhone 14 Pro/Max | ⚠️ Experimental | SmolLM2 1GB | 40-90s generation | ⚠️ EXPERIMENTAL |
| iPhone 14/13 | ❌ WASM only | N/A | 2-5 min generation | ❌ NOT RECOMMENDED |

*Requires iOS 18.2+ with Safari 26

### Deal-Breakers and Blockers

#### Hard Blockers (Cannot Overcome):
1. **iOS version < 18.2**: WebGPU not available by default
2. **Device < iPhone 13**: Insufficient RAM for models
3. **No WiFi + Cellular data caps**: 2GB download is prohibitive

#### Soft Blockers (Can Mitigate):
1. **Storage eviction**: Re-download after 7 days of inactivity → Warn users
2. **Thermal throttling**: Performance degrades → Recommend breaks between generations
3. **Battery drain**: Heavy power usage → Show warnings, recommend charging
4. **Memory pressure**: iOS may kill app → Implement save/resume functionality

#### User Experience Concerns:
1. **First load time**: 10-30 minutes on WiFi, 30-60 minutes on LTE
2. **Storage space**: Users need 2-4GB free space
3. **Network costs**: 2GB download on cellular = expensive in many countries
4. **Reliability**: IndexedDB corruption issues on iOS Safari (historical)

---

## Section B: Technical Requirements

### iOS Version Requirements

**Minimum Requirements:**
- iOS 18.2+ (Safari 26) - WebGPU enabled by default
- iOS 17.4 - 18.1 - WebGPU available via feature flag (experimental)

**Recommended:**
- iOS 18.2 or later
- Latest Safari updates installed

**Detection Strategy:**
```javascript
// Detect iOS version
const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
const iOSVersion = parseFloat(
  navigator.userAgent.match(/OS (\d+)_(\d+)/)?.[1] + '.' +
  navigator.userAgent.match(/OS (\d+)_(\d+)/)?.[2]
);

// iOS 18.2+ has WebGPU by default
// iOS 17.4-18.1 might have it via flag
// iOS < 17.4 does not support WebGPU
```

### Safari Feature Requirements

**Required:**
- WebGPU API (`navigator.gpu`)
- WebAssembly (fallback)
- IndexedDB (model caching)
- Service Workers (optional, for offline support)

**Optional but Recommended:**
- Cache API (for app assets)
- Web App Manifest (PWA support)
- Persistent Storage API (prevent eviction)

**Feature Detection:**
```javascript
const capabilities = {
  webgpu: 'gpu' in navigator,
  webassembly: typeof WebAssembly !== 'undefined',
  indexeddb: 'indexedDB' in window,
  serviceWorker: 'serviceWorker' in navigator,
  persistentStorage: 'storage' in navigator && 'persist' in navigator.storage
};
```

### Hardware Requirements

#### Minimum Specifications:
- **RAM**: 6GB (iPhone 15 base with lightweight model)
- **GPU**: A16 Bionic or newer (5-core GPU minimum)
- **Storage**: 3GB free space (2GB model + 1GB overhead)
- **Battery**: 40%+ recommended for generation

#### Recommended Specifications:
- **RAM**: 8GB (iPhone 15 Pro or newer)
- **GPU**: A17 Pro or newer (6-core GPU)
- **Storage**: 5GB free space
- **Battery**: 60%+ or plugged in

#### Detection Strategy:
```javascript
// Estimate available memory (inexact on iOS)
const memory = (performance as any).memory?.jsHeapSizeLimit || 0;
const isProModel = /iPhone15,\d+/.test(navigator.userAgent) && memory > 2e9;

// Request storage estimate
const estimate = await navigator.storage?.estimate();
const availableSpace = (estimate?.quota || 0) - (estimate?.usage || 0);
const hasEnoughSpace = availableSpace > 2e9; // 2GB
```

### Network Requirements

#### Initial Model Download:
- **Size**: 1.8GB - 3.7GB (depending on model choice)
- **Recommended**: WiFi connection
- **Cellular**: Warn user of data usage
- **Time**: 5-30 minutes (WiFi), 30-120 minutes (LTE)

#### Subsequent Use:
- **Fully offline** after model cached
- **Network optional** unless cache evicted

#### Implementation:
```javascript
// Detect connection type
const connection = (navigator as any).connection;
const isWiFi = connection?.type === 'wifi';
const isCellular = connection?.effectiveType === '4g' ||
                   connection?.effectiveType === '3g';

if (isCellular && !userConfirmedCellularDownload) {
  showWarning('2GB download over cellular - may incur data charges');
}
```

---

## Section C: Implementation Strategy

### Strategy 1: Full WebGPU Support (Safari 26+)

**Target**: iPhone 15 Pro/Max, iPhone 16 series with iOS 18.2+

#### Detection and Fallback:
```typescript
// Enhanced WebGPU detection in useWebLLM.ts
const checkWebGPU = async () => {
  if (!('gpu' in navigator)) {
    return { supported: false, reason: 'WebGPU API not available' };
  }

  try {
    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) {
      return { supported: false, reason: 'No GPU adapter found' };
    }

    // Check for sufficient limits
    const limits = adapter.limits;
    const maxBufferSize = limits.maxBufferSize || 0;

    // We need at least 1.8GB for smaller model
    if (maxBufferSize < 1.8e9) {
      return {
        supported: false,
        reason: `Insufficient GPU memory (${(maxBufferSize / 1e9).toFixed(1)}GB available, 1.8GB required)`
      };
    }

    return {
      supported: true,
      maxBufferSize,
      adapterInfo: await adapter.requestAdapterInfo?.()
    };
  } catch (error) {
    return {
      supported: false,
      reason: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};
```

#### Configuration Changes:
```typescript
// Update model selection based on device capabilities
const selectModelForDevice = (capabilities: DeviceCapabilities) => {
  const isIOS = /iPhone|iPad/.test(navigator.userAgent);
  const isProDevice = capabilities.maxBufferSize > 2e9;

  if (isIOS) {
    if (isProDevice) {
      // iPhone 15 Pro/Max, 16 Pro/Max
      return {
        modelId: 'Phi-3-mini-4k-instruct-q4f16_1-MLC',
        size: '1.8GB',
        performance: 'good'
      };
    } else {
      // iPhone 15, 16 base
      return {
        modelId: 'SmolLM2-1.7B-Instruct-q4f16_1-MLC',
        size: '1GB',
        performance: 'acceptable'
      };
    }
  }

  // Desktop - use full model
  return {
    modelId: 'Phi-3-mini-4k-instruct-q4f16_1-MLC',
    size: '3.7GB',
    performance: 'excellent'
  };
};
```

#### Performance Expectations:
- **Generation time**: 15-40 seconds
- **Battery impact**: 5-10% per generation
- **Thermal**: Phone gets warm during generation
- **Consistency**: First 2-3 generations fast, then thermal throttling kicks in

### Strategy 2: WebAssembly Fallback (CPU-only)

**Target**: Devices without WebGPU or insufficient GPU memory

#### How to Enable WASM Backend:
WebLLM automatically falls back to WASM when WebGPU is unavailable, but we need to manage expectations:

```typescript
// In useWebLLM.ts initialization
const initialize = async () => {
  const gpuCheck = await checkWebGPU();

  if (!gpuCheck.supported) {
    // Show warning before WASM initialization
    setWarning(
      `WebGPU not available (${gpuCheck.reason}). ` +
      `Falling back to CPU mode. Generation will take 2-5 minutes.`
    );
  }

  const engine = await webllm.CreateMLCEngine(
    selectedModel,
    {
      initProgressCallback: (progress) => {
        setState(prev => ({ ...prev, progress: progress.text }));
      },
      // WASM automatically used if WebGPU unavailable
    }
  );
};
```

#### Performance Degradation:
- **WebGPU**: 15-30 seconds
- **WASM**: 2-5 minutes (100× slower in worst case, 15-17× average)
- **Recommendation**: NOT SUITABLE for production on mobile

#### Memory Optimization for WASM:
```typescript
// Use smallest possible model for WASM
const WASM_MODEL = 'Llama-3.2-1B-Instruct-q4f16_1-MLC'; // ~650MB

// More aggressive memory management
const optimizeForWASM = {
  batchSize: 1, // Process one request at a time
  maxTokens: 1024, // Reduce from 2048
  temperature: 0.7, // Slightly lower for faster sampling
};
```

### Strategy 3: Lighter Model Approach

**Target**: Maximize compatibility across iPhone 15+ series

#### Recommended Lightweight Models:

**Option 1: SmolLM2-1.7B (~1GB)**
- Best quality-to-size ratio for mobile
- Fits comfortably on iPhone 15 base
- Still produces decent meal plans

**Option 2: Llama 3.2 1B (~650MB)**
- Smallest viable model
- Optimized for edge devices
- May have reduced quality for complex tasks

**Option 3: Phi-3.5-mini-instruct (~1.8GB)**
- Best quality for mobile
- Requires iPhone 15 Pro or better
- "Pound for pound champion" - quality of 7B model in 2GB package

#### Implementation:
```typescript
// Model tier system
interface ModelTier {
  id: string;
  name: string;
  size: string;
  sizeBytes: number;
  minRAM: number;
  quality: 'excellent' | 'good' | 'acceptable';
  devices: string[];
}

const MODEL_TIERS: ModelTier[] = [
  {
    id: 'Phi-3.5-mini-instruct-q4f16_1-MLC',
    name: 'Phi-3.5 Mini',
    size: '1.8GB',
    sizeBytes: 1.8e9,
    minRAM: 8,
    quality: 'excellent',
    devices: ['iPhone 15 Pro', 'iPhone 16 Pro', 'Desktop']
  },
  {
    id: 'SmolLM2-1.7B-Instruct-q4f16_1-MLC',
    name: 'SmolLM2',
    size: '1GB',
    sizeBytes: 1e9,
    minRAM: 6,
    quality: 'good',
    devices: ['iPhone 15', 'iPhone 16', 'iPhone 15 Pro']
  },
  {
    id: 'Llama-3.2-1B-Instruct-q4f16_1-MLC',
    name: 'Llama 3.2 1B',
    size: '650MB',
    sizeBytes: 650e6,
    minRAM: 4,
    quality: 'acceptable',
    devices: ['iPhone 14', 'iPhone 15', 'Older devices']
  }
];

// Automatic selection
const selectBestModel = async (): Promise<ModelTier> => {
  const capabilities = await detectDeviceCapabilities();

  for (const tier of MODEL_TIERS) {
    if (capabilities.availableRAM >= tier.minRAM * 1e9 &&
        capabilities.availableStorage >= tier.sizeBytes * 1.2) {
      return tier;
    }
  }

  // Fallback to smallest model
  return MODEL_TIERS[MODEL_TIERS.length - 1];
};
```

#### Trade-offs:

| Model | Quality | Speed | Size | Compatibility |
|-------|---------|-------|------|---------------|
| Phi-3.5-mini | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 1.8GB | iPhone 15 Pro+ |
| SmolLM2 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 1GB | iPhone 15+ |
| Llama 3.2 1B | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 650MB | iPhone 14+ |

### Strategy 4: Progressive Enhancement

**Philosophy**: Detect capabilities and provide best experience possible

#### Mobile Detection:
```typescript
// src/utils/deviceDetection.ts
export interface DeviceInfo {
  isIOS: boolean;
  isMobile: boolean;
  modelName: string;
  osVersion: number;
  hasWebGPU: boolean;
  estimatedRAM: number;
  batteryLevel: number | null;
  isCharging: boolean;
  connectionType: string;
}

export const detectDevice = async (): Promise<DeviceInfo> => {
  const ua = navigator.userAgent;
  const isIOS = /iPhone|iPad|iPod/.test(ua);
  const isMobile = /iPhone|iPad|Android/i.test(ua);

  // Parse iOS version
  const match = ua.match(/OS (\d+)_(\d+)/);
  const osVersion = match ? parseFloat(`${match[1]}.${match[2]}`) : 0;

  // Detect iPhone model (approximate)
  let modelName = 'Unknown';
  if (ua.includes('iPhone15,2')) modelName = 'iPhone 14 Pro';
  if (ua.includes('iPhone15,3')) modelName = 'iPhone 14 Pro Max';
  if (ua.includes('iPhone15,4')) modelName = 'iPhone 15';
  if (ua.includes('iPhone15,5')) modelName = 'iPhone 15 Plus';
  if (ua.includes('iPhone16,1')) modelName = 'iPhone 15 Pro';
  if (ua.includes('iPhone16,2')) modelName = 'iPhone 15 Pro Max';
  if (ua.includes('iPhone17,1')) modelName = 'iPhone 16 Pro';
  if (ua.includes('iPhone17,2')) modelName = 'iPhone 16 Pro Max';

  // Check WebGPU
  const gpuCheck = await checkWebGPU();

  // Estimate RAM (very rough)
  const memory = (performance as any).memory;
  const estimatedRAM = memory?.jsHeapSizeLimit || 0;

  // Battery status
  const battery = await (navigator as any).getBattery?.();

  // Connection
  const connection = (navigator as any).connection;

  return {
    isIOS,
    isMobile,
    modelName,
    osVersion,
    hasWebGPU: gpuCheck.supported,
    estimatedRAM,
    batteryLevel: battery?.level * 100 || null,
    isCharging: battery?.charging || false,
    connectionType: connection?.effectiveType || 'unknown'
  };
};
```

#### Show Appropriate Warnings:
```typescript
// src/components/MobileWarning.tsx
export const MobileWarning: React.FC<{ device: DeviceInfo }> = ({ device }) => {
  if (!device.isMobile) return null;

  const warnings = [];

  // Battery warning
  if (device.batteryLevel && device.batteryLevel < 40 && !device.isCharging) {
    warnings.push({
      level: 'error',
      message: `Battery at ${device.batteryLevel.toFixed(0)}%. Please charge your device before using AI generation.`
    });
  }

  // Connection warning
  if (device.connectionType !== 'wifi' && device.connectionType !== 'ethernet') {
    warnings.push({
      level: 'warning',
      message: 'You are not on WiFi. Model download will use 1-2GB of cellular data.'
    });
  }

  // WebGPU warning
  if (!device.hasWebGPU) {
    warnings.push({
      level: 'error',
      message: 'WebGPU not available. Generation will be very slow (2-5 minutes).'
    });
  }

  // OS version warning
  if (device.osVersion < 18.2) {
    warnings.push({
      level: 'warning',
      message: `iOS ${device.osVersion.toFixed(1)} detected. WebGPU requires iOS 18.2+. Please update for best experience.`
    });
  }

  return (
    <div className="space-y-2 mb-4">
      {warnings.map((warning, i) => (
        <div
          key={i}
          className={`p-4 rounded-xl border-3 ${
            warning.level === 'error'
              ? 'bg-red-100 border-red-500 text-red-900'
              : 'bg-yellow-100 border-yellow-500 text-yellow-900'
          }`}
        >
          {warning.message}
        </div>
      ))}
    </div>
  );
};
```

#### Graceful Degradation:
```typescript
// Feature availability matrix
const features = {
  imageGeneration: !device.isMobile, // Disable on all mobile
  fullModel: !device.isMobile || device.modelName.includes('Pro'),
  autoSave: device.hasWebGPU && device.isIOS,
  offlineMode: 'serviceWorker' in navigator
};

// Adjust UI based on features
if (!features.imageGeneration) {
  // Hide image generation checkbox
  setEnableImages(false);
  setImageGenerationAvailable(false);
}

if (!features.fullModel) {
  // Show lighter model selection
  showModelSelectionDialog();
}
```

---

## Section D: Code Changes Required

### 1. Mobile Detection and Capability Assessment

**File**: `/home/user/GrocerySelector/src/utils/deviceDetection.ts` (NEW)

```typescript
export interface DeviceCapabilities {
  // Platform
  isIOS: boolean;
  isMobile: boolean;
  modelName: string;
  osVersion: number;

  // Features
  hasWebGPU: boolean;
  hasServiceWorker: boolean;
  hasPersistentStorage: boolean;

  // Resources
  estimatedRAM: number;
  availableStorage: number;
  maxGPUBufferSize: number;

  // Battery & Network
  batteryLevel: number | null;
  isCharging: boolean;
  connectionType: 'wifi' | 'cellular' | 'unknown';
  effectiveType: '4g' | '3g' | '2g' | 'slow-2g' | 'unknown';
}

export const detectDeviceCapabilities = async (): Promise<DeviceCapabilities> => {
  const ua = navigator.userAgent;
  const isIOS = /iPhone|iPad|iPod/.test(ua);
  const isMobile = /iPhone|iPad|Android/i.test(ua);

  // iOS version parsing
  const iosMatch = ua.match(/OS (\d+)_(\d+)/);
  const osVersion = iosMatch ? parseFloat(`${iosMatch[1]}.${iosMatch[2]}`) : 0;

  // Model detection (approximate from user agent)
  let modelName = 'Unknown iOS Device';
  const modelMap: Record<string, string> = {
    'iPhone16,1': 'iPhone 15 Pro',
    'iPhone16,2': 'iPhone 15 Pro Max',
    'iPhone15,4': 'iPhone 15',
    'iPhone15,5': 'iPhone 15 Plus',
    'iPhone17,1': 'iPhone 16 Pro',
    'iPhone17,2': 'iPhone 16 Pro Max',
    'iPhone17,3': 'iPhone 16',
    'iPhone17,4': 'iPhone 16 Plus',
  };

  for (const [key, name] of Object.entries(modelMap)) {
    if (ua.includes(key)) {
      modelName = name;
      break;
    }
  }

  // WebGPU check
  let hasWebGPU = false;
  let maxGPUBufferSize = 0;

  if ('gpu' in navigator) {
    try {
      const adapter = await navigator.gpu.requestAdapter();
      if (adapter) {
        hasWebGPU = true;
        maxGPUBufferSize = adapter.limits.maxBufferSize || 0;
      }
    } catch (e) {
      console.warn('WebGPU check failed:', e);
    }
  }

  // Storage estimate
  const storageEstimate = await navigator.storage?.estimate();
  const availableStorage = (storageEstimate?.quota || 0) - (storageEstimate?.usage || 0);

  // Memory estimate (rough)
  const memory = (performance as any).memory;
  const estimatedRAM = memory?.jsHeapSizeLimit || 0;

  // Battery API
  let batteryLevel = null;
  let isCharging = false;
  try {
    const battery = await (navigator as any).getBattery?.();
    if (battery) {
      batteryLevel = battery.level * 100;
      isCharging = battery.charging;
    }
  } catch (e) {
    // Battery API not available
  }

  // Network information
  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
  const connectionType = connection?.type === 'wifi' ? 'wifi' :
                        connection?.type === 'cellular' ? 'cellular' : 'unknown';
  const effectiveType = connection?.effectiveType || 'unknown';

  return {
    isIOS,
    isMobile,
    modelName,
    osVersion,
    hasWebGPU,
    hasServiceWorker: 'serviceWorker' in navigator,
    hasPersistentStorage: 'storage' in navigator && 'persist' in navigator.storage,
    estimatedRAM,
    availableStorage,
    maxGPUBufferSize,
    batteryLevel,
    isCharging,
    connectionType,
    effectiveType
  };
};

export const recommendModelForDevice = (caps: DeviceCapabilities): string => {
  // Desktop or non-iOS - use full model
  if (!caps.isIOS) {
    return 'Phi-3-mini-4k-instruct-q4f16_1-MLC';
  }

  // iPhone 15 Pro, 16 Pro (8GB RAM, powerful GPU)
  if (caps.modelName.includes('Pro') && caps.maxGPUBufferSize >= 2e9) {
    return 'Phi-3.5-mini-instruct-q4f16_1-MLC'; // 1.8GB
  }

  // iPhone 15/16 base (6GB RAM)
  if (caps.maxGPUBufferSize >= 1.5e9) {
    return 'SmolLM2-1.7B-Instruct-q4f16_1-MLC'; // 1GB
  }

  // Older devices
  return 'Llama-3.2-1B-Instruct-q4f16_1-MLC'; // 650MB
};

export const shouldWarnUser = (caps: DeviceCapabilities): string[] => {
  const warnings: string[] = [];

  if (caps.osVersion < 18.2 && caps.isIOS) {
    warnings.push(`iOS ${caps.osVersion.toFixed(1)} detected. WebGPU requires iOS 18.2+ for best performance.`);
  }

  if (!caps.hasWebGPU) {
    warnings.push('WebGPU not available. Generation will be significantly slower (2-5 minutes).');
  }

  if (caps.batteryLevel !== null && caps.batteryLevel < 40 && !caps.isCharging) {
    warnings.push(`Battery at ${caps.batteryLevel.toFixed(0)}%. Recommend charging before AI generation.`);
  }

  if (caps.connectionType === 'cellular') {
    warnings.push('Cellular connection detected. Model download will use 1-2GB of data.');
  }

  if (caps.availableStorage < 3e9) {
    warnings.push(`Only ${(caps.availableStorage / 1e9).toFixed(1)}GB storage available. Recommend 3GB+ free space.`);
  }

  return warnings;
};
```

### 2. Memory-Aware Model Loading

**File**: `/home/user/GrocerySelector/src/hooks/useWebLLM.ts` (MODIFY)

```typescript
import { useState, useCallback, useEffect } from 'react';
import * as webllm from '@mlc-ai/web-llm';
import { detectDeviceCapabilities, recommendModelForDevice, shouldWarnUser } from '../utils/deviceDetection';

interface WebLLMState {
  engine: webllm.MLCEngine | null;
  isLoading: boolean;
  error: string | null;
  progress: string;
  hasWebGPU: boolean;
  deviceInfo: DeviceCapabilities | null;
  selectedModel: string;
  warnings: string[];
}

export function useWebLLM() {
  const [state, setState] = useState<WebLLMState>({
    engine: null,
    isLoading: false,
    error: null,
    progress: '',
    hasWebGPU: false,
    deviceInfo: null,
    selectedModel: '',
    warnings: []
  });

  useEffect(() => {
    // Enhanced device detection
    const detectCapabilities = async () => {
      try {
        const caps = await detectDeviceCapabilities();
        const recommended = recommendModelForDevice(caps);
        const warnings = shouldWarnUser(caps);

        setState(prev => ({
          ...prev,
          hasWebGPU: caps.hasWebGPU,
          deviceInfo: caps,
          selectedModel: recommended,
          warnings
        }));

        console.log('Device capabilities:', caps);
        console.log('Recommended model:', recommended);
        console.log('Warnings:', warnings);
      } catch (error) {
        console.error('Capability detection failed:', error);
        setState(prev => ({
          ...prev,
          hasWebGPU: false,
          selectedModel: 'Phi-3-mini-4k-instruct-q4f16_1-MLC' // Safe default
        }));
      }
    };

    detectCapabilities();
  }, []);

  const initialize = useCallback(async () => {
    if (state.engine) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const modelToUse = state.selectedModel || 'Phi-3-mini-4k-instruct-q4f16_1-MLC';

      console.log(`Initializing WebLLM with model: ${modelToUse}`);
      console.log(`WebGPU available: ${state.hasWebGPU}`);

      const engine = await webllm.CreateMLCEngine(
        modelToUse,
        {
          initProgressCallback: (progress) => {
            setState(prev => ({ ...prev, progress: progress.text }));
          },
        }
      );

      setState(prev => ({
        ...prev,
        engine,
        isLoading: false,
        progress: 'Model loaded successfully!',
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load model',
      }));
    }
  }, [state.engine, state.selectedModel, state.hasWebGPU]);

  const generate = useCallback(
    async (prompt: string): Promise<string> => {
      if (!state.engine) {
        throw new Error('Engine not initialized');
      }

      try {
        // Reduce max_tokens on mobile to save memory
        const maxTokens = state.deviceInfo?.isMobile ? 1536 : 2048;

        const response = await state.engine.chat.completions.create({
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.8,
          max_tokens: maxTokens,
        });

        return response.choices[0]?.message?.content || '';
      } catch (error) {
        throw new Error(
          error instanceof Error ? error.message : 'Generation failed'
        );
      }
    },
    [state.engine, state.deviceInfo]
  );

  return {
    ...state,
    initialize,
    generate,
  };
}
```

### 3. iOS Safari Feature Detection

**File**: `/home/user/GrocerySelector/src/utils/featureDetection.ts` (NEW)

```typescript
export interface BrowserFeatures {
  webgpu: boolean;
  webassembly: boolean;
  indexeddb: boolean;
  serviceWorker: boolean;
  cacheAPI: boolean;
  persistentStorage: boolean;
  batteryAPI: boolean;
  networkInfo: boolean;
  webp: boolean;
  webm: boolean;
}

export const detectBrowserFeatures = (): BrowserFeatures => {
  return {
    webgpu: 'gpu' in navigator,
    webassembly: typeof WebAssembly !== 'undefined',
    indexeddb: 'indexedDB' in window,
    serviceWorker: 'serviceWorker' in navigator,
    cacheAPI: 'caches' in window,
    persistentStorage: 'storage' in navigator && 'persist' in navigator.storage,
    batteryAPI: 'getBattery' in navigator,
    networkInfo: 'connection' in navigator,
    webp: document.createElement('canvas').toDataURL('image/webp').startsWith('data:image/webp'),
    webm: document.createElement('video').canPlayType('video/webm') !== ''
  };
};

export const requestPersistentStorage = async (): Promise<boolean> => {
  if ('storage' in navigator && 'persist' in navigator.storage) {
    try {
      const isPersisted = await navigator.storage.persist();
      console.log(`Persistent storage ${isPersisted ? 'granted' : 'denied'}`);
      return isPersisted;
    } catch (e) {
      console.warn('Failed to request persistent storage:', e);
      return false;
    }
  }
  return false;
};
```

### 4. PWA Manifest for iOS

**File**: `/home/user/GrocerySelector/public/manifest.json` (NEW/MODIFY)

```json
{
  "name": "Grocery Selector - AI Meal Planner",
  "short_name": "Grocery Selector",
  "description": "AI-powered 5-day meal planning with smart ingredient reuse",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#F4F1DE",
  "theme_color": "#264653",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "categories": ["food", "lifestyle", "utilities"],
  "prefer_related_applications": false,
  "scope": "/",
  "shortcuts": [
    {
      "name": "Generate Meal Plan",
      "short_name": "Generate",
      "description": "Start generating a new meal plan",
      "url": "/?action=generate",
      "icons": [{ "src": "/icon-96.png", "sizes": "96x96" }]
    }
  ]
}
```

**File**: `/home/user/GrocerySelector/index.html` (MODIFY)

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />

    <!-- PWA -->
    <link rel="manifest" href="/manifest.json" />
    <meta name="theme-color" content="#264653" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="apple-mobile-web-app-title" content="Grocery Selector" />

    <!-- iOS Icons -->
    <link rel="apple-touch-icon" href="/icon-180.png" />
    <link rel="apple-touch-icon" sizes="152x152" href="/icon-152.png" />
    <link rel="apple-touch-icon" sizes="167x167" href="/icon-167.png" />
    <link rel="apple-touch-icon" sizes="180x180" href="/icon-180.png" />

    <!-- Splash Screens for iOS -->
    <link rel="apple-touch-startup-image" href="/splash-2048x2732.png" media="(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" />
    <link rel="apple-touch-startup-image" href="/splash-1668x2388.png" media="(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" />
    <link rel="apple-touch-startup-image" href="/splash-1290x2796.png" media="(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" />

    <title>Grocery Selector - AI Meal Planner</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

### 5. Service Worker for Caching

**File**: `/home/user/GrocerySelector/public/sw.js` (NEW)

```javascript
const CACHE_NAME = 'grocery-selector-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

// Install event - cache app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching app shell');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
```

**File**: `/home/user/GrocerySelector/src/main.tsx` (MODIFY)

```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Register service worker for PWA support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(
      (registration) => {
        console.log('ServiceWorker registered:', registration);
      },
      (error) => {
        console.log('ServiceWorker registration failed:', error);
      }
    );
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

### 6. Touch-Friendly UI Adjustments

**File**: `/home/user/GrocerySelector/src/App.tsx` (MODIFY)

Add touch-friendly styles and mobile-specific UI:

```typescript
// Add to imports
import { detectDeviceCapabilities } from './utils/deviceDetection';
import { requestPersistentStorage } from './utils/featureDetection';

// Add to state
const [deviceInfo, setDeviceInfo] = useState<DeviceCapabilities | null>(null);
const [showMobileWarnings, setShowMobileWarnings] = useState(false);

// Add useEffect for device detection
useEffect(() => {
  const loadDeviceInfo = async () => {
    const info = await detectDeviceCapabilities();
    setDeviceInfo(info);

    // Request persistent storage on mobile
    if (info.isMobile && info.hasPersistentStorage) {
      await requestPersistentStorage();
    }

    // Show warnings for mobile users
    if (info.isMobile && shouldWarnUser(info).length > 0) {
      setShowMobileWarnings(true);
    }
  };

  loadDeviceInfo();
}, []);

// Add mobile warning component before main content
{showMobileWarnings && deviceInfo && (
  <div className="mb-8 p-6 bg-yellow-100 rounded-2xl border-4 border-yellow-500">
    <h3 className="text-xl font-bold text-yellow-900 mb-4">
      Mobile Device Detected
    </h3>
    <div className="space-y-2">
      {shouldWarnUser(deviceInfo).map((warning, i) => (
        <p key={i} className="text-base text-yellow-900">⚠️ {warning}</p>
      ))}
    </div>
    <div className="mt-4">
      <button
        onClick={() => setShowMobileWarnings(false)}
        className="px-6 py-2 bg-yellow-500 text-white rounded-full font-bold hover:bg-yellow-600"
      >
        I Understand
      </button>
    </div>
  </div>
)}

// Disable image generation on mobile
useEffect(() => {
  if (deviceInfo?.isMobile) {
    setEnableImages(false);
    // Hide the checkbox
  }
}, [deviceInfo]);

// Update button styles for better touch targets (minimum 44x44px)
// In all button elements, ensure:
className="... px-8 py-4 min-h-[44px] min-w-[44px] ..."
```

**File**: `/home/user/GrocerySelector/src/index.css` (ADD)

```css
/* Mobile-specific touch improvements */
@media (max-width: 768px) {
  /* Larger touch targets */
  button, a, input[type="checkbox"] {
    min-height: 44px;
    min-width: 44px;
  }

  /* Prevent zoom on input focus (iOS Safari) */
  input, textarea, select {
    font-size: 16px !important;
  }

  /* Prevent pull-to-refresh interference */
  body {
    overscroll-behavior-y: contain;
  }

  /* Better scrolling on iOS */
  * {
    -webkit-overflow-scrolling: touch;
  }

  /* Prevent text selection on buttons */
  button {
    -webkit-user-select: none;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
  }
}

/* iOS safe area handling */
@supports (padding: env(safe-area-inset-top)) {
  .safe-top {
    padding-top: env(safe-area-inset-top);
  }

  .safe-bottom {
    padding-bottom: env(safe-area-inset-bottom);
  }
}
```

---

## Section E: User Experience Considerations

### Loading Time Expectations

#### First-Time Load (Model Download):

**WiFi (50 Mbps average):**
- 1.8GB model: 5-8 minutes
- 1GB model: 3-5 minutes
- 650MB model: 2-3 minutes

**LTE (10 Mbps average):**
- 1.8GB model: 25-30 minutes
- 1GB model: 15-20 minutes
- 650MB model: 10-15 minutes

**5G (100 Mbps):**
- 1.8GB model: 2-4 minutes
- 1GB model: 1-2 minutes
- 650MB model: 1 minute

**Recommendations:**
1. Show estimated download time based on connection speed
2. Allow background download (don't block UI)
3. Show progress bar with MB downloaded and percentage
4. Warn cellular users about data costs
5. Allow cancellation and resume

#### Subsequent Loads (Cached):
- App shell: 1-2 seconds
- Model loaded from IndexedDB: 10-30 seconds
- Total time to ready: 15-45 seconds

### Battery Drain Warnings

**Expected Battery Impact:**

| Activity | Battery Drain | Duration |
|----------|---------------|----------|
| Model download | 2-5% | 5-15 min |
| Single generation (WebGPU) | 5-10% | 20-40 sec |
| 5 generations | 20-40% | 2-5 min |
| WASM CPU mode | 15-25% per generation | 2-5 min |

**UI Implementation:**
```typescript
// Show battery warning before initialization
if (deviceInfo.batteryLevel < 40 && !deviceInfo.isCharging) {
  return (
    <div className="p-6 bg-red-100 rounded-xl border-4 border-red-500">
      <h3 className="text-xl font-bold text-red-900 mb-3">
        ⚡ Low Battery Warning
      </h3>
      <p className="text-base text-red-900 mb-4">
        Your battery is at {deviceInfo.batteryLevel.toFixed(0)}%.
        AI generation uses significant power (5-10% per meal plan).
        We recommend charging your device before proceeding.
      </p>
      <button
        onClick={handleProceedAnyway}
        className="px-6 py-3 bg-red-500 text-white rounded-full font-bold"
      >
        Proceed Anyway
      </button>
    </div>
  );
}

// Show live battery drain during generation
{isGenerating && deviceInfo.batteryLevel && (
  <div className="text-sm text-gray-600 mt-2">
    Battery: {deviceInfo.batteryLevel.toFixed(0)}%
    {!deviceInfo.isCharging && ' (recommend plugging in)'}
  </div>
)}
```

### Thermal Throttling Considerations

**Expected Thermal Behavior:**
- First generation: Full speed (15-30 seconds)
- Generations 2-3: Slight slowdown (20-40 seconds)
- Generations 4+: Significant throttling (40-90 seconds)
- After cooldown (5-10 min): Returns to normal

**UI Recommendations:**
```typescript
// Track generation count
const [generationCount, setGenerationCount] = useState(0);
const [lastGenerationTime, setLastGenerationTime] = useState(Date.now());

// Warn about thermal throttling
if (generationCount >= 3 && Date.now() - lastGenerationTime < 5 * 60 * 1000) {
  return (
    <div className="p-4 bg-orange-100 rounded-xl border-3 border-orange-500 mb-4">
      <p className="text-base text-orange-900">
        🌡️ Your device may be warming up. Generation might be slower due to thermal throttling.
        Consider taking a 5-minute break for optimal performance.
      </p>
    </div>
  );
}
```

### Storage Space Warnings

**Required Space:**
- Model: 1.8GB
- App cache: 50-100MB
- IndexedDB overhead: 200-500MB
- Total: 2.5-3GB recommended

**UI Implementation:**
```typescript
// Check storage before download
if (deviceInfo.availableStorage < 3e9) {
  return (
    <div className="p-6 bg-yellow-100 rounded-xl border-4 border-yellow-500">
      <h3 className="text-xl font-bold text-yellow-900 mb-3">
        💾 Storage Warning
      </h3>
      <p className="text-base text-yellow-900 mb-4">
        Available storage: {(deviceInfo.availableStorage / 1e9).toFixed(1)}GB
        <br />
        Required: 3GB minimum
        <br />
        Please free up space before downloading the AI model.
      </p>
    </div>
  );
}
```

### Offline Capability

**What Works Offline:**
- ✅ App shell (UI)
- ✅ Meal generation (if model cached)
- ✅ Grocery list export
- ✅ All features except model download

**What Requires Internet:**
- ❌ Initial model download
- ❌ Re-download if cache evicted (after 7 days)
- ❌ App updates

**iOS 7-Day Cache Eviction:**
```typescript
// Track last usage
const LAST_USAGE_KEY = 'grocerySelector_lastUsage';

useEffect(() => {
  const lastUsage = localStorage.getItem(LAST_USAGE_KEY);
  const now = Date.now();

  if (lastUsage) {
    const daysSinceLastUse = (now - parseInt(lastUsage)) / (1000 * 60 * 60 * 24);

    if (daysSinceLastUse >= 7) {
      // Warn user that cache may have been evicted
      setWarning(
        'It has been 7+ days since your last use. iOS may have cleared the cached model. ' +
        'You may need to re-download (~2GB).'
      );
    }
  }

  // Update last usage
  localStorage.setItem(LAST_USAGE_KEY, now.toString());
}, []);
```

**Offline Detection:**
```typescript
// Monitor online/offline status
useEffect(() => {
  const handleOnline = () => {
    setIsOnline(true);
    console.log('Network connection restored');
  };

  const handleOffline = () => {
    setIsOnline(false);
    console.log('Network connection lost');
  };

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}, []);

// Show offline indicator
{!isOnline && (
  <div className="fixed top-0 left-0 right-0 bg-gray-800 text-white px-4 py-2 text-center z-50">
    📡 Offline Mode - Using cached model
  </div>
)}
```

---

## Section F: Testing Strategy

### Testing Without Physical iPhone

#### 1. Safari Technology Preview (macOS)

```bash
# Download Safari Technology Preview
# https://developer.apple.com/safari/technology-preview/

# Test WebGPU features
# Enable responsive design mode
# Use iPhone 15 Pro viewport (393x852)
```

**Limitations:**
- Cannot test thermal throttling
- Cannot test battery API accurately
- Different GPU (Mac vs iPhone)
- Cannot test iOS-specific cache eviction

#### 2. iOS Simulator (Xcode)

```bash
# Install Xcode from Mac App Store
# Open Simulator
xcode-select --install
open -a Simulator

# Limitations:
# - No WebGPU support in Simulator
# - No GPU acceleration
# - Cannot test real performance
# - Good for UI/layout testing only
```

**What You Can Test:**
- ✅ UI layout and responsiveness
- ✅ Touch interactions
- ✅ PWA manifest
- ✅ Service worker caching
- ❌ WebGPU/AI functionality
- ❌ Performance metrics
- ❌ Battery/thermal behavior

#### 3. BrowserStack / LambdaTest

**Recommended Service:** BrowserStack (has real iPhone devices)

```javascript
// BrowserStack configuration
{
  "browserstack.user": "YOUR_USERNAME",
  "browserstack.key": "YOUR_ACCESS_KEY",
  "device": "iPhone 15 Pro",
  "os_version": "18",
  "real_mobile": true
}
```

**What You Can Test:**
- ✅ Real Safari on real iOS
- ✅ WebGPU support
- ⚠️ Limited performance testing (remote latency)
- ❌ Battery/thermal (readings not available)
- ❌ Long-running tests (session time limits)

**Cost:**
- BrowserStack: $39/month (Starter plan)
- LambdaTest: $15/month (Lite plan)
- Free trials available

#### 4. Remote Debugging (Safari Web Inspector)

If you have access to a physical iPhone:

```bash
# On iPhone:
# Settings > Safari > Advanced > Web Inspector (Enable)

# On Mac:
# Safari > Preferences > Advanced > Show Develop menu
# Develop > [Your iPhone] > [Page]
```

**Benefits:**
- Real-time debugging
- Console logs
- Network monitoring
- Performance profiling
- Memory analysis

### Real Device Testing Checklist

#### Pre-Testing Setup:
- [ ] iPhone 15 Pro or newer
- [ ] iOS 18.2+ installed
- [ ] At least 4GB free storage
- [ ] WiFi connection
- [ ] Battery at 60%+ or plugged in
- [ ] Safari Web Inspector enabled

#### Test Scenarios:

**1. First-Time Installation**
- [ ] Open app URL in Safari
- [ ] Check "Add to Home Screen" prompt
- [ ] Add to home screen
- [ ] Verify icon appears
- [ ] Launch from home screen
- [ ] Verify standalone mode (no Safari UI)

**2. WebGPU Detection**
- [ ] Check for WebGPU availability message
- [ ] Verify correct model selected (Pro vs base)
- [ ] Review any warnings shown

**3. Model Download**
- [ ] Click "Initialize AI"
- [ ] Verify progress bar shows percentage
- [ ] Monitor download time (note: X minutes on WiFi/cellular)
- [ ] Check storage usage in Settings > General > iPhone Storage
- [ ] Verify download completes successfully

**4. Meal Generation**
- [ ] Select cuisine theme
- [ ] Click "Generate Meal Plan"
- [ ] Time the generation (should be 15-60 seconds)
- [ ] Verify meal plan displays correctly
- [ ] Check grocery list generation
- [ ] Test "Copy List" button

**5. Performance Testing**
- [ ] Generate 1st meal plan - record time: _____ seconds
- [ ] Generate 2nd meal plan - record time: _____ seconds
- [ ] Generate 3rd meal plan - record time: _____ seconds
- [ ] Note any thermal throttling (phone warmth, slower speeds)
- [ ] Monitor battery drain: Start: ____%, End: ____%, Drain: ____%

**6. Offline Mode**
- [ ] Enable Airplane Mode
- [ ] Close and reopen app
- [ ] Verify model still cached
- [ ] Generate meal plan offline
- [ ] Verify all features work

**7. Cache Persistence**
- [ ] Note current date: _________
- [ ] Wait 7+ days without opening app
- [ ] Re-open app
- [ ] Check if model still cached or needs re-download

**8. Memory Pressure**
- [ ] Open 5+ Safari tabs
- [ ] Switch between apps
- [ ] Return to Grocery Selector
- [ ] Verify state preserved
- [ ] Generate meal plan

**9. Rotation & Viewport**
- [ ] Test portrait mode
- [ ] Rotate to landscape
- [ ] Verify layout adapts
- [ ] Rotate back to portrait

**10. Edge Cases**
- [ ] Start generation, then lock screen - does it continue?
- [ ] Start generation, switch apps - does it crash?
- [ ] Low battery (< 20%) - are warnings shown?
- [ ] Cellular connection - are data warnings shown?

#### Bug Reporting Template:

```markdown
**Device:** iPhone 15 Pro / 15 Pro Max / 16 Pro
**iOS Version:** 18.x
**Safari Version:** (check in Settings > Safari)
**Connection:** WiFi / LTE / 5G
**Battery Level:** X%

**Steps to Reproduce:**
1.
2.
3.

**Expected Result:**

**Actual Result:**

**Console Logs:**
(from Safari Web Inspector)

**Screenshots:**
(attach)
```

---

## Section G: Alternatives (If Not Directly Feasible)

### Alternative 1: Cloud Inference Option

**Concept:** Offer cloud-based inference as a fallback or premium option

#### Implementation:

```typescript
// New hook: useCloudLLM.ts
import { useState, useCallback } from 'react';

interface CloudProvider {
  name: string;
  endpoint: string;
  apiKeyRequired: boolean;
}

const PROVIDERS: Record<string, CloudProvider> = {
  openai: {
    name: 'OpenAI GPT-4',
    endpoint: 'https://api.openai.com/v1/chat/completions',
    apiKeyRequired: true
  },
  anthropic: {
    name: 'Anthropic Claude',
    endpoint: 'https://api.anthropic.com/v1/messages',
    apiKeyRequired: true
  }
};

export function useCloudLLM(provider: string) {
  const [apiKey, setApiKey] = useState('');

  const generate = async (prompt: string): Promise<string> => {
    const config = PROVIDERS[provider];

    if (provider === 'openai') {
      const response = await fetch(config.endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4-turbo',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 2048,
          temperature: 0.8
        })
      });

      const data = await response.json();
      return data.choices[0].message.content;
    }

    // Similar for other providers...
    throw new Error('Provider not implemented');
  };

  return { generate, setApiKey };
}
```

#### UI Changes:

```typescript
// In App.tsx - add mode selection
const [inferenceMode, setInferenceMode] = useState<'local' | 'cloud'>('local');

{!engine && (
  <div className="mb-6">
    <h3 className="text-xl font-bold mb-4">Choose Inference Mode</h3>
    <div className="grid grid-cols-2 gap-4">
      <button
        onClick={() => setInferenceMode('local')}
        className={`p-6 rounded-xl border-4 ${
          inferenceMode === 'local' ? 'border-green-500 bg-green-100' : 'border-gray-300'
        }`}
      >
        <div className="text-4xl mb-2">💻</div>
        <div className="font-bold">Local AI</div>
        <div className="text-sm mt-2">
          • 100% Private<br />
          • 2GB Download<br />
          • Free Forever
        </div>
      </button>

      <button
        onClick={() => setInferenceMode('cloud')}
        className={`p-6 rounded-xl border-4 ${
          inferenceMode === 'cloud' ? 'border-blue-500 bg-blue-100' : 'border-gray-300'
        }`}
      >
        <div className="text-4xl mb-2">☁️</div>
        <div className="font-bold">Cloud AI</div>
        <div className="text-sm mt-2">
          • Instant Start<br />
          • No Download<br />
          • Requires API Key
        </div>
      </button>
    </div>
  </div>
)}
```

**Pros:**
- ✅ Works on all devices
- ✅ No model download
- ✅ Fast and consistent performance
- ✅ No battery/thermal concerns

**Cons:**
- ❌ Requires API key and costs money
- ❌ Loses privacy advantage
- ❌ Requires internet connection
- ❌ Against original vision of "100% local"

### Alternative 2: Hybrid Approach

**Concept:** Use local inference for simple queries, cloud for complex ones

#### Implementation:

```typescript
interface QueryComplexity {
  simple: boolean; // Yes/no, ingredient check
  medium: boolean; // Single meal generation
  complex: boolean; // Full 5-day plan
}

const analyzeQueryComplexity = (type: string): QueryComplexity => {
  return {
    simple: type === 'ingredient_check',
    medium: type === 'single_meal',
    complex: type === 'full_plan'
  };
};

const generateWithStrategy = async (
  prompt: string,
  type: string
): Promise<string> => {
  const complexity = analyzeQueryComplexity(type);
  const hasLocalModel = !!engine;
  const isOnline = navigator.onLine;

  // Strategy decision tree
  if (complexity.simple && hasLocalModel) {
    // Always use local for simple queries
    return await localLLM.generate(prompt);
  }

  if (complexity.complex && !deviceInfo.isProModel) {
    // Use cloud for complex queries on non-Pro devices
    if (isOnline && cloudAPIKey) {
      return await cloudLLM.generate(prompt);
    } else {
      throw new Error('Complex generation requires cloud API or Pro device');
    }
  }

  // Default: use local if available, cloud as fallback
  if (hasLocalModel) {
    return await localLLM.generate(prompt);
  } else if (isOnline && cloudAPIKey) {
    return await cloudLLM.generate(prompt);
  } else {
    throw new Error('No inference method available');
  }
};
```

**Pros:**
- ✅ Best of both worlds
- ✅ Optimization for device capabilities
- ✅ Fallback options
- ✅ Still privacy-first for simple queries

**Cons:**
- ⚠️ Complexity in implementation
- ⚠️ Confusing for users
- ⚠️ Requires API key for full functionality

### Alternative 3: Partner API Integration (Free Tier)

**Concept:** Use free API tiers to avoid model download

#### Providers with Free Tiers:

| Provider | Free Tier | Limits |
|----------|-----------|--------|
| Groq | Free | 14,400 requests/day |
| Together AI | $25 credit | ~5,000 generations |
| Hugging Face | Free | Rate limited |
| Replicate | Free tier | Limited

#### Implementation:

```typescript
// Use Groq's free tier with Llama
const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';

const generateWithGroq = async (prompt: string): Promise<string> => {
  const response = await fetch(GROQ_ENDPOINT, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 2048
    })
  });

  const data = await response.json();
  return data.choices[0].message.content;
};
```

**Pros:**
- ✅ Free for users (up to limits)
- ✅ No model download
- ✅ Very fast inference
- ✅ Works on all devices

**Cons:**
- ❌ Requires internet
- ❌ Not truly "local"
- ❌ Rate limits
- ❌ Privacy concerns (data sent to third party)

### Alternative 4: Progressive Web App with Offline-First Cloud

**Concept:** Hybrid PWA that works offline with cached results

#### Architecture:

1. **First use:** Generate via cloud API
2. **Cache results:** Store meal plans in IndexedDB
3. **Offline use:** Browse cached meal plans
4. **Sync when online:** Generate new plans, update cache

```typescript
// Meal plan cache
interface CachedMealPlan {
  id: string;
  theme: string;
  timestamp: number;
  meals: MealPlan;
}

const cacheMealPlan = async (plan: MealPlan) => {
  const db = await openDB('grocery-selector', 1, {
    upgrade(db) {
      db.createObjectStore('mealPlans', { keyPath: 'id' });
    }
  });

  await db.add('mealPlans', {
    id: crypto.randomUUID(),
    theme: plan.theme,
    timestamp: Date.now(),
    meals: plan
  });
};

const getCachedPlans = async (theme?: string): Promise<CachedMealPlan[]> => {
  const db = await openDB('grocery-selector', 1);
  const plans = await db.getAll('mealPlans');

  if (theme) {
    return plans.filter(p => p.theme === theme);
  }
  return plans;
};
```

**UI:**

```typescript
{!navigator.onLine && (
  <div className="p-6 bg-blue-100 rounded-xl border-4 border-blue-500 mb-6">
    <h3 className="text-xl font-bold text-blue-900 mb-3">
      📡 Offline Mode
    </h3>
    <p className="text-base text-blue-900 mb-4">
      You are offline. Browse your {cachedPlanCount} previously generated meal plans:
    </p>
    <div className="space-y-2">
      {cachedPlans.map(plan => (
        <button
          key={plan.id}
          onClick={() => loadCachedPlan(plan)}
          className="w-full p-4 bg-white rounded-xl border-2 border-blue-300 text-left hover:bg-blue-50"
        >
          <div className="font-bold">{plan.theme} Meal Plan</div>
          <div className="text-sm text-gray-600">
            Generated {new Date(plan.timestamp).toLocaleDateString()}
          </div>
        </button>
      ))}
    </div>
  </div>
)}
```

**Pros:**
- ✅ Works offline (with cached content)
- ✅ Fast when online (cloud API)
- ✅ No large downloads
- ✅ Good user experience

**Cons:**
- ⚠️ Limited offline functionality (can't generate new)
- ❌ Requires API for new generations
- ❌ Not fully "local AI"

---

## Recommendation Summary

### For iPhone 15 Pro / 16 Pro Users:
**Proceed with local AI using lighter model**
- Use Phi-3.5-mini (1.8GB) or SmolLM2 (1GB)
- Disable Stable Diffusion
- Implement all mobile warnings
- Expected performance: 20-40 seconds per generation
- **Status:** FEASIBLE

### For iPhone 15 Base Users:
**Use lighter model with warnings**
- Use SmolLM2 (1GB) or Llama 3.2 1B (650MB)
- Clear expectations about performance
- Recommend charging during use
- **Status:** LIMITED SUPPORT

### For Older iPhones (14, 13):
**Offer hybrid or cloud option**
- Local AI via WASM too slow
- Recommend cloud API option
- Or use cached meal plans
- **Status:** NOT RECOMMENDED for local AI

### Long-Term Strategy:
1. **Phase 1 (Now):** Launch with mobile detection and warnings
2. **Phase 2 (Q2 2025):** Add model selection UI for users to choose size/quality trade-off
3. **Phase 3 (Q3 2025):** Implement optional cloud fallback
4. **Phase 4 (Q4 2025):** Monitor WebGPU adoption, optimize based on real-world data

---

## Appendix: Model Size Reference

| Model | Full Size | Quantized (q4f16_1) | Quality | Speed | Mobile-Ready |
|-------|-----------|---------------------|---------|-------|--------------|
| Phi-3-mini-4k | ~7GB | ~1.8GB | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | iPhone 15 Pro+ |
| Phi-3.5-mini | ~7GB | ~1.8GB | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | iPhone 15 Pro+ |
| SmolLM2-1.7B | ~3.4GB | ~1GB | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | iPhone 15+ |
| Llama-3.2-1B | ~2.5GB | ~650MB | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | iPhone 14+ |
| Llama-3.2-3B | ~6GB | ~1.8GB | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | iPhone 15 Pro+ |

---

**END OF DOCUMENT**
