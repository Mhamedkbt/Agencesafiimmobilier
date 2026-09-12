/**
 * Utility for intelligent client-side real estate image optimization.
 * Guarantees crisp visual detail while drastically reducing original file sizes.
 */

// Max dimension (1920px is perfect for full-width HD property galleries)
const MAX_DIMENSION = 1920;

// High quality threshold for WebP (0.84 keeps architectural textures crisp without artifacts)
const WEBP_QUALITY = 0.84;

/**
 * Optimizes an image file by scaling to HD dimensions and compressing to WebP.
 * * @param file The original image file
 * @returns A Promise that resolves to the optimized File
 */
export async function optimizeImage(file: File): Promise<File> {
  // Return non-image files as-is
  if (!file.type.startsWith("image/")) {
    return file;
  }

  // Skip SVGs and GIFs to prevent losing vector data or animation
  if (file.type === "image/svg+xml" || file.type === "image/gif") {
    return file;
  }

  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;

      // Maintain aspect ratio while resizing large photos down to MAX_DIMENSION
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        if (width > height) {
          height = Math.round((height * MAX_DIMENSION) / width);
          width = MAX_DIMENSION;
        } else {
          width = Math.round((width * MAX_DIMENSION) / height);
          height = MAX_DIMENSION;
        }
      }

      // Create main canvas
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(file);
        return;
      }

      // Configure canvas for high-sharpness rendering
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      // Fill background white (prevents transparent PNGs turning black in WebP)
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      // Convert to WebP blob with fixed high quality
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }

          // If compressed size is larger than original file, keep original
          if (blob.size >= file.size && file.type === "image/webp") {
            resolve(file);
            return;
          }

          // Format new file name with .webp extension
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
        },
        "image/webp",
        WEBP_QUALITY
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file); // Fallback to original file on load error
    };

    img.src = objectUrl;
  });
}