import React from 'react';
import { EditorWorkspace } from './EditorWorkspace';
import { CalibrationDashboard } from './CalibrationDashboard';
import { PresetGrid } from './PresetGrid';
import type { Area } from 'react-easy-crop';

interface ProcessingSuiteProps {
  onCropComplete: (_croppedArea: Area, croppedAreaPixels: Area) => void;
  clearImage: () => void;
  onRemoveBG: () => void;
  onApplyCrop: () => void;
  isRemovingBG: boolean;
  onDownloadAsset: (format: 'jpeg' | 'png' | 'webp') => void;
}

export const ProcessingSuite: React.FC<ProcessingSuiteProps> = ({
  onCropComplete, clearImage, onRemoveBG, onApplyCrop, isRemovingBG, onDownloadAsset
}) => {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-3 px-1">
        <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-[10px] font-bold text-white">01</div>
        <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Edit & Enhance Suite</h2>
        <div className="h-px bg-slate-800/50 flex-1 ml-4"></div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-16 gap-8 items-start">
        <div className="xl:col-span-6">
          <EditorWorkspace onCropComplete={onCropComplete} clearImage={clearImage} isRemovingBG={isRemovingBG} />
        </div>
        <div className="xl:col-span-4 self-center">
          <CalibrationDashboard onRemoveBG={onRemoveBG} onApplyCrop={onApplyCrop} isRemovingBG={isRemovingBG} />
        </div>
        <div className="xl:col-span-6">
          <PresetGrid onDownloadAsset={onDownloadAsset} />
        </div>
      </div>
    </section>
  );
};
