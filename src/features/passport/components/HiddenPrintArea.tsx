import React from 'react';
import { getPageDimensions } from '../utils/imageUtils';

interface HiddenPrintAreaProps {
  isPrinting: boolean;
  printImage: string | null;
  paperSize: string;
  spacing: number;
  copies: number;
  photoRatio: { width: number; height: number };
  bgColor: string;
}

export const HiddenPrintArea: React.FC<HiddenPrintAreaProps> = ({
  isPrinting, printImage, paperSize, spacing, copies, photoRatio, bgColor
}) => {
  if (!isPrinting || !printImage) return null;

  return (
    <div className="print-only" style={{ ...getPageDimensions(paperSize) }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: `${spacing}mm` }}>
        {Array.from({ length: copies }).map((_, i) => (
          <div key={i} style={{ width: `${photoRatio.width * 10}mm`, height: `${photoRatio.height * 10}mm`, backgroundColor: bgColor }}>
            <img src={printImage} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
          </div>
        ))}
      </div>
    </div>
  );
};
