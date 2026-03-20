import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../../app/store';
import { setPaperSize, setCopies, setSpacing } from '../passportSlice';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Printer, Download, ImageDown } from 'lucide-react';

interface PrintSettingsProps {
  onPrint: () => void;
  onDownloadPDF: () => void;
  onDownloadAsset: (format: 'jpeg' | 'png' | 'webp') => void;
  finalPhoto: string | null;
}

export const PrintSettings: React.FC<PrintSettingsProps> = ({ 
  onPrint, onDownloadPDF, onDownloadAsset, finalPhoto 
}) => {
  const dispatch = useDispatch();
  const { paperSize, copies, spacing } = useSelector((state: RootState) => state.passport);

  if (!finalPhoto) return null;

  return (
    <Card className="p-8 saas-card space-y-8 rounded-3xl">
       <div className="space-y-6">
          <div className="space-y-4">
             <span className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] flex items-center gap-2 mb-2">
               <ImageDown className="w-3.5 h-3.5" /> Export Individual Asset
             </span>
             <div className="flex gap-2">
                {[
                  { label: 'JPG', format: 'jpeg' },
                  { label: 'PNG', format: 'png' },
                  { label: 'WebP', format: 'webp' }
                ].map(f => (
                  <Button 
                    key={f.format} 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => onDownloadAsset(f.format as any)}
                    className="flex-1 bg-slate-900/50 hover:bg-slate-800 border border-white/5 text-[10px] h-10 font-bold"
                  >
                    {f.label}
                  </Button>
                ))}
             </div>
          </div>

          <div className="h-px bg-slate-800/40"></div>
          
         <div className="p-1 bg-slate-950/80 rounded-xl flex gap-1 border border-white/5">
            {['A4', 'A5', 'A6', 'single'].map(sz => (
              <button 
                key={sz} onClick={() => dispatch(setPaperSize(sz as any))} 
                className={`flex-1 py-2 text-[10px] font-bold uppercase rounded-lg ${paperSize === sz ? 'bg-indigo-500 text-white shadow-xl shadow-indigo-500/10' : 'text-slate-600 hover:text-slate-400'}`}
              >
                {sz}
              </button>
            ))}
         </div>
         <div className="space-y-5">
            <div className="space-y-4">
               <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest">Multi-Copies: {copies}x</div>
               <input type="range" min="1" max="50" value={copies} onChange={e => dispatch(setCopies(Number(e.target.value)))} className="w-full" />
            </div>
            <div className="space-y-4">
               <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest">Offset Gap: {spacing}mm</div>
               <input type="range" min="0" max="10" value={spacing} onChange={e => dispatch(setSpacing(Number(e.target.value)))} className="w-full" />
            </div>
         </div>
       </div>
       <div className="grid grid-cols-2 gap-3 pt-6 border-t border-slate-800/40">
          <Button onClick={onPrint} className="h-14 bg-white text-black font-bold uppercase tracking-[0.15em] hover:bg-slate-200" leftIcon={<Printer className="w-5 h-5" />}>Print</Button>
          <Button variant="outline" onClick={onDownloadPDF} className="h-14 border-slate-800 text-slate-400 font-bold uppercase tracking-[0.15em] hover:text-white hover:bg-slate-800" leftIcon={<Download className="w-5 h-5" />}>Save PDF</Button>
       </div>
    </Card>
  );
};
