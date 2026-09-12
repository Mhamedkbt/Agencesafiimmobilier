/**
 * Clean & Crisp Real Estate Image Optimizer
 * Converts images to high-resolution WebP without losing detail.
 */

const MAX_DIMENSION = 1920; // High-definition 1080p/2K resolution
const WEBP_QUALITY = 0.85;   // 85% keeps architectural details sharp

export async function optimizeImage(file: File): Promise<File> {
  // Skip non-images, SVGs, and GIFs
  if (!file.type.startsWith("image/") || file.type === "image/svg+xml" || file.type === "image/gif") {
    return file;
  }

  // If the file is already small (under 250 KB), don't touch it
  if (file.size <= 250 * 1024) {
    return file;
  }

  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;

      // Keep aspect ratio while capping max dimension at 1920px
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

      const ctx = canvas.getContext("2d", { alpha: false });
      if (!ctx) {
        resolve(file);
        return;
      }

      // Turn on high-quality smoothing to keep edges sharp
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      // Fill white background for transparent PNGs
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      // Export as crisp WebP
      canvas.toBlob(
        (blob) => {
          if (!blob || blob.size >= file.size) {
            resolve(file);
            return;
          }

          const fileNameParts = file.name.split(".");
          if (fileNameParts.length > 1) fileNameParts.pop();
          const newFileName = `${fileNameParts.join(".")}.webp`;

          resolve(
            new File([blob], newFileName, {
              type: "image/webp",
              lastModified: Date.now(),
            })
          );
        },
        "image/webp",
        WEBP_QUALITY
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file);
    };

    img.src = objectUrl;
  });
}