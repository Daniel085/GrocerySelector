/**
 * Device detection and capability checking for iPhone support
 */

export interface DeviceCapabilities {
  isSupported: boolean;
  tier: 'desktop' | 'tier1' | 'unsupported';
  deviceName: string;
  recommendedModel: string;
  errorMessage?: string;
}

/**
 * Detect if running on iOS
 */
function isIOS(): boolean {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

/**
 * Detect iPhone model based on screen dimensions and GPU
 * Note: This is approximate - exact model detection is not possible from web
 */
function detectiPhoneModel(): string | null {
  if (!isIOS()) return null;

  const width = window.screen.width;
  const height = window.screen.height;
  const pixelRatio = window.devicePixelRatio;

  // iPhone 16 Pro Max (6.9" - 1320x2868 @460ppi, 3x)
  if ((width === 440 && height === 956 && pixelRatio === 3) ||
      (width === 956 && height === 440 && pixelRatio === 3)) {
    return 'iPhone 16 Pro Max';
  }

  // iPhone 16 Pro (6.3" - 1206x2622 @460ppi, 3x)
  if ((width === 402 && height === 874 && pixelRatio === 3) ||
      (width === 874 && height === 402 && pixelRatio === 3)) {
    return 'iPhone 16 Pro';
  }

  // iPhone 16 Plus (6.7" - 1290x2796 @460ppi, 3x)
  if ((width === 430 && height === 932 && pixelRatio === 3) ||
      (width === 932 && height === 430 && pixelRatio === 3)) {
    return 'iPhone 16 Plus';
  }

  // iPhone 16 (6.1" - 1179x2556 @460ppi, 3x)
  if ((width === 393 && height === 852 && pixelRatio === 3) ||
      (width === 852 && height === 393 && pixelRatio === 3)) {
    return 'iPhone 16';
  }

  // iPhone 15 Pro Max (6.7" - 1290x2796 @460ppi, 3x)
  if ((width === 430 && height === 932 && pixelRatio === 3) ||
      (width === 932 && height === 430 && pixelRatio === 3)) {
    return 'iPhone 15 Pro Max';
  }

  // iPhone 15 Pro (6.1" - 1179x2556 @460ppi, 3x)
  if ((width === 393 && height === 852 && pixelRatio === 3) ||
      (width === 852 && height === 393 && pixelRatio === 3)) {
    return 'iPhone 15 Pro';
  }

  // Fallback for other iPhones
  return 'iPhone (Unknown Model)';
}

/**
 * Check if device is iPhone 15 Pro or better (Tier 1 support)
 */
function isTier1iPhone(): boolean {
  const model = detectiPhoneModel();
  if (!model) return false;

  const tier1Models = [
    'iPhone 16 Pro Max',
    'iPhone 16 Pro',
    'iPhone 16 Plus',
    'iPhone 16',
    'iPhone 15 Pro Max',
    'iPhone 15 Pro'
  ];

  return tier1Models.some(m => model.includes(m));
}

/**
 * Detect device capabilities and determine support level
 */
export function detectDeviceCapabilities(): DeviceCapabilities {
  // Desktop/Laptop - full support
  if (!isIOS()) {
    return {
      isSupported: true,
      tier: 'desktop',
      deviceName: 'Desktop/Laptop',
      recommendedModel: 'Phi-3-mini-4k-instruct-q4f16_1-MLC'
    };
  }

  const iPhoneModel = detectiPhoneModel();

  // iPhone 15 Pro+ (Tier 1) - use same model as desktop
  // Note: iPhone 15 Pro has 8GB RAM which should handle Phi-3-mini
  if (isTier1iPhone()) {
    return {
      isSupported: true,
      tier: 'tier1',
      deviceName: iPhoneModel || 'iPhone 15 Pro+',
      recommendedModel: 'Phi-3-mini-4k-instruct-q4f16_1-MLC' // Same as desktop for now
    };
  }

  // All other iOS devices - not supported
  return {
    isSupported: false,
    tier: 'unsupported',
    deviceName: iPhoneModel || 'iPhone',
    recommendedModel: '',
    errorMessage: `This app requires an iPhone 15 Pro or newer to run AI locally in your browser. Your device (${iPhoneModel}) does not have sufficient GPU memory for on-device inference.`
  };
}

/**
 * Check if WebGPU is available (required for Tier 1 iPhone support)
 */
export async function checkWebGPUSupport(): Promise<boolean> {
  if (!('gpu' in navigator)) {
    return false;
  }

  try {
    const adapter = await (navigator as any).gpu.requestAdapter();
    return adapter !== null;
  } catch (error) {
    console.error('[DeviceDetection] WebGPU check failed:', error);
    return false;
  }
}

/**
 * Get user-friendly device info for display
 */
export function getDeviceDisplayInfo(): string {
  const capabilities = detectDeviceCapabilities();

  if (capabilities.tier === 'desktop') {
    return 'Desktop/Laptop (Full support)';
  } else if (capabilities.tier === 'tier1') {
    return `${capabilities.deviceName} (Mobile support)`;
  } else {
    return `${capabilities.deviceName} (Not supported)`;
  }
}
