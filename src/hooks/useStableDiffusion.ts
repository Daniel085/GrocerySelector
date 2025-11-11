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
      console.log('[StableDiffusion] Starting image generation with prompt:', prompt);

      if (!pipelineRef.current) {
        console.error('[StableDiffusion] Pipeline not initialized!');
        throw new Error('Stable Diffusion not initialized');
      }

      try {
        console.log('[StableDiffusion] Pipeline ready, generating with settings:', {
          steps: 2,
          width: 512,
          height: 512,
        });
        setState(prev => ({ ...prev, progress: `Generating image...` }));

        // Generate image with optimized settings for speed
        const output = await pipelineRef.current(prompt, {
          num_inference_steps: 2, // SDXL-Turbo works well with just 2 steps
          guidance_scale: 0, // Turbo doesn't use guidance scale
          width: 512,
          height: 512,
        });

        console.log('[StableDiffusion] Generation complete, output:', output);
        setState(prev => ({ ...prev, progress: '' }));

        // Convert output to data URL
        if (output && output.images && output.images[0]) {
          console.log('[StableDiffusion] Converting image to data URL, dimensions:',
            output.images[0].width, 'x', output.images[0].height);

          // The output is a RawImage, convert to base64 data URL
          const canvas = document.createElement('canvas');
          canvas.width = output.images[0].width;
          canvas.height = output.images[0].height;
          const ctx = canvas.getContext('2d');

          if (ctx) {
            const imageData = ctx.createImageData(canvas.width, canvas.height);
            const rgbData = output.images[0].data;

            // Convert RGB to RGBA by adding alpha channel
            // RawImage provides RGB (3 channels), but ImageData expects RGBA (4 channels)
            for (let i = 0, j = 0; i < rgbData.length; i += 3, j += 4) {
              imageData.data[j] = rgbData[i];         // R
              imageData.data[j + 1] = rgbData[i + 1]; // G
              imageData.data[j + 2] = rgbData[i + 2]; // B
              imageData.data[j + 3] = 255;            // A (fully opaque)
            }

            ctx.putImageData(imageData, 0, 0);
            const dataUrl = canvas.toDataURL('image/png');
            console.log('[StableDiffusion] Image converted successfully, data URL length:', dataUrl.length);
            return dataUrl;
          } else {
            console.error('[StableDiffusion] Failed to get canvas 2d context');
          }
        } else {
          console.error('[StableDiffusion] Invalid output format:', {
            hasOutput: !!output,
            hasImages: !!(output && output.images),
            imageCount: output?.images?.length
          });
        }

        return null;
      } catch (error) {
        console.error('[StableDiffusion] Image generation failed:', error);
        console.error('[StableDiffusion] Error details:', {
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
        });
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
