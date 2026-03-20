import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../app/store';
import { AnimatePresence } from 'framer-motion';
import './PassportTool.css';

// Feature Components
import { PassportUploader } from './components/PassportUploader';
import { ProcessingSuite } from './components/ProcessingSuite';
import { GenerationSuite } from './components/GenerationSuite';
import { HiddenPrintArea } from './components/HiddenPrintArea';

// Custom Hook
import { usePassportActions } from './hooks/usePassportActions';

export const PassportTool = () => {
  const { 
    image, paperSize, photoRatio, copies, spacing, bgColor
  } = useSelector((state: RootState) => state.passport);

  const {
    isRemovingBG, handleRemoveBG, handleApplyCrop, handleDownloadPDF,
    handlePrint, clearImage, onCropComplete, handleDownloadAsset,
    isPrinting, printImage, finalPhoto
  } = usePassportActions();

  // --- Layout Helper ---
  const previewScale = 0.25; 
  const pagePx = useMemo(() => {
    const mmToPx = 3.78; 
    const sizes: Record<string, { w: number; h: number }> = {
      'A4': { w: 210, h: 297 },
      'A5': { w: 148, h: 210 },
      'A6': { w: 105, h: 148 },
      'single': { w: photoRatio.width * 10, h: photoRatio.height * 10 }
    };
    const size = sizes[paperSize] || sizes.A4;
    return { w: size.w * mmToPx * previewScale, h: size.h * mmToPx * previewScale };
  }, [paperSize, photoRatio.width, photoRatio.height]);

  return (
    <div className="container mx-auto max-w-[1400px] relative min-h-screen">
      
      <div className="no-print space-y-20 pb-20">
        <AnimatePresence mode="wait">
          {!image ? (
            <PassportUploader key="uploader" />
          ) : (
            <div className="space-y-2">
              <ProcessingSuite 
                onCropComplete={onCropComplete} 
                clearImage={clearImage} 
                onRemoveBG={handleRemoveBG} 
                onApplyCrop={handleApplyCrop} 
                isRemovingBG={isRemovingBG} 
              />

              <GenerationSuite 
                finalPhoto={finalPhoto} 
                pagePx={pagePx} 
                previewScale={previewScale} 
                onPrint={handlePrint} 
                onDownloadPDF={handleDownloadPDF} 
                onDownloadAsset={handleDownloadAsset}
              />
            </div>
          )}
        </AnimatePresence>
      </div>

      <HiddenPrintArea 
        isPrinting={isPrinting} 
        printImage={printImage} 
        paperSize={paperSize} 
        spacing={spacing} 
        copies={copies} 
        photoRatio={photoRatio} 
        bgColor={bgColor} 
      />
    </div>
  );
};
