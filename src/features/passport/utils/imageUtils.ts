import type { Area } from 'react-easy-crop';

/**
 * Shared Helper for High-Res Image Generation
 */
export const generatePassportSnippet = async (
  imageSrc: string, 
  pixelCrop: Area, 
  rotation = 0, 
  bgColor = '#ffffff', 
  brightness = 100, 
  contrast = 100,
  targetDpi = 300,
  targetWidthMM = 35,
  targetHeightMM = 45,
  format: 'jpeg' | 'png' | 'webp' = 'jpeg'
): Promise<string> => {
  const img = new Image();
  img.src = imageSrc;
  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
  });

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return '';

  const outputWidth = Math.round((targetWidthMM / 25.4) * targetDpi);
  const outputHeight = Math.round((targetHeightMM / 25.4) * targetDpi);
  
  canvas.width = outputWidth;
  canvas.height = outputHeight;

  // Background
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  // Filter
  ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
  
  // Transform
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.translate(-canvas.width / 2, -canvas.height / 2);

  ctx.drawImage(
    img, 
    pixelCrop.x, 
    pixelCrop.y, 
    pixelCrop.width, 
    pixelCrop.height, 
    0, 
    0, 
    canvas.width, 
    canvas.height
  );
  ctx.restore();

  return canvas.toDataURL(`image/${format}`, format === 'jpeg' ? 0.92 : 1.0);
};

// Helper for print dimensions
export const getPageDimensions = (size: string) => {
  if (size === 'A5') return { width: '148mm', height: '210mm' };
  if (size === 'A6') return { width: '105mm', height: '148mm' };
  return { width: '210mm', height: '297mm' };
};
