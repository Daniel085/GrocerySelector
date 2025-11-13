import { useState, useCallback, useEffect } from 'react';
import * as webllm from '@mlc-ai/web-llm';
import { detectDeviceCapabilities } from '../utils/deviceDetection';

interface WebLLMState {
  engine: webllm.MLCEngine | null;
  isLoading: boolean;
  error: string | null;
  progress: string;
  hasWebGPU: boolean;
  deviceTier: 'desktop' | 'tier1' | 'unsupported';
  deviceName: string;
}

export function useWebLLM() {
  // Detect device capabilities once
  const deviceCapabilities = detectDeviceCapabilities();

  const [state, setState] = useState<WebLLMState>({
    engine: null,
    isLoading: false,
    error: null,
    progress: '',
    hasWebGPU: false,
    deviceTier: deviceCapabilities.tier,
    deviceName: deviceCapabilities.deviceName,
  });

  useEffect(() => {
    // Check for WebGPU support
    const checkWebGPU = async () => {
      try {
        if ('gpu' in navigator) {
          try {
            const adapter = await (navigator as any).gpu.requestAdapter();
            setState(prev => ({ ...prev, hasWebGPU: !!adapter }));
          } catch {
            setState(prev => ({ ...prev, hasWebGPU: false }));
          }
        } else {
          setState(prev => ({ ...prev, hasWebGPU: false }));
        }
      } catch (error) {
        console.error('WebGPU check failed:', error);
        setState(prev => ({ ...prev, hasWebGPU: false }));
      }
    };
    checkWebGPU();
  }, []);

  const initialize = useCallback(async () => {
    if (state.engine) return;

    // Don't allow initialization on unsupported devices
    if (deviceCapabilities.tier === 'unsupported') {
      setState(prev => ({
        ...prev,
        error: deviceCapabilities.errorMessage || 'Device not supported',
      }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Select model based on device tier
      const modelId = deviceCapabilities.recommendedModel;
      console.log(`[WebLLM] Device detected:`, {
        tier: deviceCapabilities.tier,
        deviceName: deviceCapabilities.deviceName,
        modelId,
        hasWebGPU: state.hasWebGPU,
        userAgent: navigator.userAgent,
        screenSize: `${window.screen.width}x${window.screen.height}`,
        pixelRatio: window.devicePixelRatio
      });

      const engine = await webllm.CreateMLCEngine(
        modelId,
        {
          initProgressCallback: (progress) => {
            console.log(`[WebLLM] Init progress:`, progress);
            setState(prev => ({ ...prev, progress: progress.text }));
          },
        }
      );

      console.log(`[WebLLM] Model loaded successfully!`);
      setState(prev => ({
        ...prev,
        engine,
        isLoading: false,
        progress: `Model loaded successfully! (${deviceCapabilities.deviceName})`,
      }));
    } catch (error) {
      console.error(`[WebLLM] Model initialization failed:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load model';
      console.error(`[WebLLM] Error details:`, {
        message: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
        deviceTier: deviceCapabilities.tier,
        modelId: deviceCapabilities.recommendedModel
      });
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: `${errorMessage} (Device: ${deviceCapabilities.deviceName})`,
      }));
    }
  }, [state.engine, deviceCapabilities]);

  const generate = useCallback(
    async (prompt: string): Promise<string> => {
      if (!state.engine) {
        throw new Error('Engine not initialized');
      }

      try {
        const response = await state.engine.chat.completions.create({
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.8,
          max_tokens: 2048,
        });

        return response.choices[0]?.message?.content || '';
      } catch (error) {
        throw new Error(
          error instanceof Error ? error.message : 'Generation failed'
        );
      }
    },
    [state.engine]
  );

  return {
    ...state,
    initialize,
    generate,
  };
}
