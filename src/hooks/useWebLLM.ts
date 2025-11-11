import { useState, useCallback, useEffect } from 'react';
import * as webllm from '@mlc-ai/web-llm';

interface WebLLMState {
  engine: webllm.MLCEngine | null;
  isLoading: boolean;
  error: string | null;
  progress: string;
  hasWebGPU: boolean;
}

export function useWebLLM() {
  const [state, setState] = useState<WebLLMState>({
    engine: null,
    isLoading: false,
    error: null,
    progress: '',
    hasWebGPU: false,
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

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const engine = await webllm.CreateMLCEngine(
        // Use Phi-3-mini for good balance of quality and speed
        // Falls back to CPU/WASM if WebGPU unavailable
        'Phi-3-mini-4k-instruct-q4f16_1-MLC',
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
  }, [state.engine]);

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
