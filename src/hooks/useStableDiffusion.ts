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
    if (pipelineRef.current) {
      console.log('[StableDiffusion] Already initialized, skipping');
      return;
    }

    console.log('[StableDiffusion] Starting initialization...');
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Dynamic import to avoid loading on initial page load
      console.log('[StableDiffusion] Importing transformers library...');
      const { pipeline } = await import('@huggingface/transformers');
      console.log('[StableDiffusion] Transformers library loaded successfully');

      // Use SDXL-Turbo for faster generation (1-4 steps)
      // This model is optimized for speed and works well in browsers
      setState(prev => ({ ...prev, progress: 'Loading Stable Diffusion model...' }));
      console.log('[StableDiffusion] Creating pipeline for model: Xenova/sd-turbo');

      const pipe = await pipeline(
        'text-to-image' as any, // Type assertion needed as text-to-image is not in standard pipeline types yet
        'Xenova/sd-turbo', // SDXL-Turbo quantized for browser use
        {
          progress_callback: (progress: any) => {
            if (progress.status === 'downloading') {
              const percent = progress.progress?.toFixed(0) || 0;
              console.log(`[StableDiffusion] Download progress: ${percent}%`);
              setState(prev => ({
                ...prev,
                progress: `Downloading model: ${percent}%`,
              }));
            } else if (progress.status === 'initiate') {
              console.log('[StableDiffusion] Initiating download for:', progress.name);
            } else if (progress.status === 'progress') {
              console.log('[StableDiffusion] Loading progress:', progress);
            } else if (progress.status === 'done') {
              console.log('[StableDiffusion] Completed loading:', progress.name);
            }
          },
        }
      );

      pipelineRef.current = pipe;
      console.log('[StableDiffusion] Pipeline created successfully!');

      setState(prev => ({
        ...prev,
        isInitialized: true,
        isLoading: false,
        progress: 'Stable Diffusion ready!',
      }));
      console.log('[StableDiffusion] Initialization complete, ready to generate images');
    } catch (error) {
      console.error('[StableDiffusion] Initialization failed:', error);
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
            imageData.data.set(output.images[0].data);
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
