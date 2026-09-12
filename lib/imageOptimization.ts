/**
 * Utility for intelligent client-side image optimization.
 * Goal: Smallest practical file size while maintaining crisp, professional real estate photo quality.
 */

// Max dimension for real estate photos (1920px retains high-definition display on modern screens)
const MAX_DIMENSION = 1920;

// Quality boundaries
const QUALITY_MAX = 0.85;
const QUALITY_MIN = 0.70;
const QUALITY_STEP = 0.05;

// Stop optimization if file drops below 200 KB as it is already small enough
const TARGET_SMALL_BYTES = 200 * 1024;

// Minimum 8% size reduction required to justify dropping quality step
const MIN_SIZE_REDUCTION_RATIO = 0.08;

/**
 * Resizes a canvas iteratively (step-down) to ensure maximum sharpness 
 * and avoid the blurring caused by single-step downscaling.
 */
function resizeCanvasStepDown(
  sourceCanvas: HTMLCanvasElement,
  targetWidth: number,
  targetHeight: number
): HTMLCanvasElement {
  let currentCanvas = sourceCanvas;
  let currentWidth = sourceCanvas.width;
  let currentHeight = sourceCanvas.height;

  // Half the dimensions until we get close to the target size
  while (currentWidth / 2 >= targetWidth && currentHeight / 2 >= targetHeight) {
    const nextWidth = Math.floor(currentWidth / 2);
    const nextHeight = Math.floor(currentHeight / 2);

    const stepCanvas = document.createElement("canvas");
    stepCanvas.width = nextWidth;
    stepCanvas.height = nextHeight;

    const ctx = stepCanvas.getContext("2d");
    if (ctx) {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(currentCanvas, 0, 0, currentWidth, currentHeight, 0, 0, nextWidth, nextHeight);
    }

    currentCanvas = stepCanvas;
    currentWidth = nextWidth;
    currentHeight = nextHeight;
  }

  // Final render step to exact target dimensions
  if (currentWidth !== targetWidth || currentHeight !== targetHeight) {
    const finalCanvas = document.createElement("canvas");
    finalCanvas.width = targetWidth;
    finalCanvas.height = targetHeight;

    const ctx = finalCanvas.getContext("2d");
    if (ctx) {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(currentCanvas, 0, 0, currentWidth, currentHeight, 0, 0, targetWidth, targetHeight);
    }
    return finalCanvas;
  }

  return currentCanvas;
}

/**
 * Optimizes an image file by resizing it cleanly and finding the best WebP compression ratio.
 * * @param file The original image file
 * @returns A Promise that resolves to the optimized File
 */
export async function optimizeImage(file: File): Promise<File> {
  // Return non-image files as-is
  if (!file.type.startsWith("image/")) {
    return file;
  }

  // Skip SVGs and GIFs to prevent losing animations or vector data
  if (file.type === "image/svg+xml" || file.type === "image/gif") {
    return file;
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;

      // Preserve aspect ratio while enforcing maximum dimension limit
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        if (width > height) {
          height = Math.round((height * MAX_DIMENSION) / width);
          width = MAX_DIMENSION;
        } else {
          width = Math.round((width * MAX_DIMENSION) / height);
          height = MAX_DIMENSION;
        }
      }

      // Draw original image to full canvas first
      const fullCanvas = document.createElement("canvas");
      fullCanvas.width = img.width;
      fullCanvas.height = img.height;

      const fullCtx = fullCanvas.getContext("2d");
      if (!fullCtx) {
        resolve(file);
        return;
      }

      fullCtx.fillStyle = "#FFFFFF";
      fullCtx.fillRect(0, 0, img.width, img.height);
      fullCtx.drawImage(img, 0, 0);

      // Perform crisp step-down resizing
      const canvas = resizeCanvasStepDown(fullCanvas, width, height);

      // Dynamic quality compression testing loop
      const attemptCompression = (currentQuality: number, previousBlob: Blob | null) => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              finishOptimization(previousBlob || file);
              return;
            }

            // Stop early if the first high-quality output is already under 200KB
            if (currentQuality === QUALITY_MAX && blob.size <= TARGET_SMALL_BYTES) {
              finishOptimization(blob);
              return;
            }

            if (previousBlob) {
              const sizeReduction = previousBlob.size - blob.size;
              const reductionRatio = sizeReduction / previousBlob.size;

              // If quality reduction yields negligible file size savings (< 8%), use the previous higher quality blob
              if (reductionRatio < MIN_SIZE_REDUCTION_RATIO) {
                finishOptimization(previousBlob);
                return;
              }
            }

            const nextQuality = currentQuality - QUALITY_STEP;

            // Stop when hitting the minimum acceptable visual quality limit
            if (nextQuality < QUALITY_MIN) {
              finishOptimization(blob);
              return;
            }

            attemptCompression(nextQuality, blob);
          },
          "image/webp",
          currentQuality
        );
      };

      const finishOptimization = (blob: Blob | File) => {
        // Return original file if WebP result is somehow larger than the original
        if (blob.size >= file.size && file.type === "image/webp") {
          resolve(file);
          return;
        }

        const fileNameParts = file.name.split(".");
        if (fileNameParts.length > 1) {
          fileNameParts.pop();
        }
        const newFileName = `${fileNameParts.join(".")}.webp`;

        const optimizedFile = new File([blob], newFileName, {
          type: "image/webp",
          lastModified: Date.now(),
        });

        resolve(optimizedFile);
      };

      attemptCompression(QUALITY_MAX, null);
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to load image for optimization"));
    };

    img.src = objectUrl;
  });
}