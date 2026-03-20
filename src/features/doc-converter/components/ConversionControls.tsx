import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../../app/store';
import { setTargetFormat } from '../docSlice';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { FileType2, Zap, Sparkles } from 'lucide-react';

interface ConversionControlsProps {
  onConvertAll: () => void;
  isProcessingAll: boolean;
}

export const ConversionControls: React.FC<ConversionControlsProps> = ({ 
  onConvertAll, isProcessingAll 
}) => {
  const dispatch = useDispatch();
  const { files, targetFormat } = useSelector((state: RootState) => state.doc);

  return (
    <Card className="bg-slate-900 border-none text-white shadow-2xl p-8 sticky top-5">
      <h3 className="text-sm font-black uppercase tracking-widest mb-10 flex items-center gap-2 text-slate-400">
        <FileType2 className="w-4 h-4 text-rose-500" /> Convert Workflow
      </h3>

      <div className="space-y-10">
        <div className="space-y-4">
          <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
             <span>Output Format</span>
             <span className="text-rose-500">PRO GRADE</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {['jpg', 'png', 'pdf'].map((format) => (
              <button
                key={format}
                onClick={() => dispatch(setTargetFormat(format as any))}
                className={`h-12 rounded-2xl border-2 font-black uppercase text-xs transition-all ${
                  targetFormat === format 
                    ? 'border-rose-500 bg-rose-500/20 text-rose-500' 
                    : 'border-white/5 bg-white/5 text-slate-500 hover:border-white/10'
                }`}
              >
                {format}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-10 border-t border-white/5 space-y-6">
          <Button 
            size="lg"
            className="w-full h-16 text-sm font-black group bg-rose-500 hover:bg-rose-600 shadow-2xl shadow-rose-500/20" 
            disabled={files.length === 0 || files.every(f => f.status === 'done') || isProcessingAll}
            isLoading={isProcessingAll}
            onClick={onConvertAll}
            leftIcon={<Zap className="w-6 h-6 group-hover:scale-110 transition-transform" />}
          >
            CONVERT NOW
          </Button>
          
          <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/5">
             <div className="w-8 h-8 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-500">
                <Sparkles className="w-4 h-4" />
             </div>
             <div>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-white">Infinite Limits</h4>
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">No subscription required.</p>
             </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
