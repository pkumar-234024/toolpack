import React from 'react';
import { PrintPreview } from './PrintPreview';
import { PrintSettings } from './PrintSettings';

interface GenerationSuiteProps {
  finalPhoto: string | null;
  pagePx: { w: number; h: number };
  previewScale: number;
  onPrint: () => void;
  onDownloadPDF: () => void;
}

export const GenerationSuite: React.FC<GenerationSuiteProps> = ({
  finalPhoto, pagePx, previewScale, onPrint, onDownloadPDF
}) => {
  return (
    <section id="generation-suite" className={`space-y-8 transition-all duration-700 ${!finalPhoto ? 'opacity-20 pointer-events-none grayscale' : ''}`}>
      <div className="flex items-center gap-3 px-1">
        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-400">02</div>
        <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Layout & Generation Suite</h2>
        <div className="h-px bg-slate-800/50 flex-1 ml-4"></div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <div className="xl:col-span-8 flex flex-col items-center">
          <PrintPreview finalPhoto={finalPhoto} pagePx={pagePx} previewScale={previewScale} />
        </div>

        <div className="xl:col-span-4">
          <PrintSettings onPrint={onPrint} onDownloadPDF={onDownloadPDF} finalPhoto={finalPhoto} />
        </div>
      </div>
    </section>
  );
};
