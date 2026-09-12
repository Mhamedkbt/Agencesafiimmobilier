/**
 * Utility for intelligent client-side image optimization.
 * Goal: Smallest practical file size without destroying real estate photo quality.
 */

// Max dimension for real estate photos to balance detail and size
const MAX_DIMENSION = 1600;

// Quality boundaries
const QUALITY_MAX = 0.90;
const QUALITY_MIN = 0.65;
const QUALITY_STEP = 0.05;

// If a file hits this size or lower, we stop instantly because it's already perfectly small.
const TARGET_SMALL_BYTES = 150 * 1024; // 150 KB

// The minimum relative size reduction required to justify dropping the quality further.
// e.g. 0.10 means the file must get at least 10% smaller at the next quality step to be worth it.
const MIN_SIZE_REDUCTION_RATIO = 0.10;

/**
 * Optimizes an image file by resizing it and finding the best WebP compression ratio.
 * 
 * @param file The original image file
 * @returns A Promise that resolves to the optimized File
 */
export async function optimizeImage(file: File): Promise<File> {
  // If it's a video or non-image, return as-is
  if (!file.type.startsWith("image/")) {
    return file;
  }

  // Skip SVGs and GIFs as they might not compress well or lose animation
  if (file.type === "image/svg+xml" || file.type === "image/gif") {
    return file;
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;

      // Calculate new dimensions preserving aspect ratio
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        if (width > height) {
          height = Math.round((height * MAX_DIMENSION) / width);
          width = MAX_DIMENSION;
        } else {
          width = Math.round((width * MAX_DIMENSION) / height);
          height = MAX_DIMENSION;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        // Fallback to original file if canvas is not supported
        resolve(file);
        return;
      }

      // Fill with white background in case of transparent PNG to WebP conversion
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      // Recursive function to test quality steps dynamically
      const attemptCompression = (currentQuality: number, previousBlob: Blob | null) => {

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              finishOptimization(previousBlob || file);
              return;
            }

            // If it's our first try and it's already small enough, stop here.
            if (currentQuality === QUALITY_MAX && blob.size <= TARGET_SMALL_BYTES) {
              finishOptimization(blob);
              return;
            }

            if (previousBlob) {
              // Calculate how much space we saved by dropping the quality this step
              const sizeReduction = previousBlob.size - blob.size;
              const reductionRatio = sizeReduction / previousBlob.size;

              // If the size reduction isn't worth the quality loss, stop and use the PREVIOUS (higher quality) blob
              if (reductionRatio < MIN_SIZE_REDUCTION_RATIO) {
                finishOptimization(previousBlob);
                return;
              }
            }

            const nextQuality = currentQuality - QUALITY_STEP;

            // If we've reached our minimum acceptable visual quality floor, stop here.
            if (nextQuality < QUALITY_MIN) {
              finishOptimization(blob);
              return;
            }

            // Otherwise, keep testing a lower quality
            attemptCompression(nextQuality, blob);
          },
          "image/webp",
          currentQuality
        );
      };

      const finishOptimization = (blob: Blob | File) => {
        // Ensure we don't accidentally return a larger file than the original
        if (blob.size >= file.size && file.type === "image/webp") {
          resolve(file);
          return;
        }

        // We replace the original extension with .webp
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

      // Start the compression testing at our maximum desired quality
      attemptCompression(QUALITY_MAX, null);
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to load image for optimization"));
    };

    img.src = objectUrl;
  });
}
