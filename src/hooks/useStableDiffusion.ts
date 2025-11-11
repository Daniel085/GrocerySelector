import { useState, useCallback, useRef } from 'react';

interface StableDiffusionState {
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  progress: string;
}

export function useStableDiffusion() {
  const [state, setState] = useState<StableDiffusionState>({
    isInitialized: false,
    isLoading: false,
    error: null,
    progress: '',
  });

  const pipelineRef = useRef<any>(null);

  const initialize = useCallback(async () => {
    if (pipelineRef.current) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Dynamic import to avoid loading on initial page load
      const { pipeline } = await import('@huggingface/transformers');

      // Use SDXL-Turbo for faster generation (1-4 steps)
      // This model is optimized for speed and works well in browsers
      setState(prev => ({ ...prev, progress: 'Loading Stable Diffusion model...' }));

      const pipe = await pipeline(
        'text-to-image' as any, // Type assertion needed as text-to-image is not in standard pipeline types yet
        'Xenova/sd-turbo', // SDXL-Turbo quantized for browser use
        {
          progress_callback: (progress: any) => {
            if (progress.status === 'downloading') {
              const percent = progress.progress?.toFixed(0) || 0;
              setState(prev => ({
                ...prev,
                progress: `Downloading model: ${percent}%`,
              }));
            }
          },
        }
      );

      pipelineRef.current = pipe;

      setState(prev => ({
        ...prev,
        isInitialized: true,
        isLoading: false,
        progress: 'Stable Diffusion ready!',
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load Stable Diffusion',
      }));
    }
  }, []);

  const generateImage = useCallback(
    async (prompt: string): Promise<string | null> => {
      if (!pipelineRef.current) {
        throw new Error('Stable Diffusion not initialized');
      }

      try {
        setState(prev => ({ ...prev, progress: `Generating image...` }));

        // Generate image with optimized settings for speed
        const output = await pipelineRef.current(prompt, {
          num_inference_steps: 2, // SDXL-Turbo works well with just 2 steps
          guidance_scale: 0, // Turbo doesn't use guidance scale
          width: 512,
          height: 512,
        });

        setState(prev => ({ ...prev, progress: '' }));

        // Convert output to data URL
        if (output && output.images && output.images[0]) {
          // The output is a RawImage, convert to base64 data URL
          const canvas = document.createElement('canvas');
          canvas.width = output.images[0].width;
          canvas.height = output.images[0].height;
          const ctx = canvas.getContext('2d');

          if (ctx) {
            const imageData = ctx.createImageData(canvas.width, canvas.height);
            imageData.data.set(output.images[0].data);
            ctx.putImageData(imageData, 0, 0);
            return canvas.toDataURL('image/png');
          }
        }

        return null;
      } catch (error) {
        console.error('Image generation failed:', error);
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Image generation failed',
        }));
        return null;
      }
    },
    []
  );

  return {
    ...state,
    initialize,
    generateImage,
  };
}
