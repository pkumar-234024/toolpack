import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../../app/store';
import { setPenColor, setPenWidth } from '../signatureSlice';
import { Card } from '../../../components/ui/Card';
import { Check, Settings, Pen } from 'lucide-react';
import { motion } from 'framer-motion';

export const BrushControls: React.FC = () => {
  const dispatch = useDispatch();
  const { penColor, penWidth, history, currentIndex } = useSelector((state: RootState) => state.signature);

  return (
    <Card className="p-6 space-y-8 bg-slate-900 border-none text-white shadow-2xl p-8">
      <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-slate-400">
        <Settings className="w-4 h-4" /> Brush Controls
      </h3>

      <div className="space-y-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider">
             <span>Ink Palette</span>
             <span className="text-brand-accent">{penColor.toUpperCase()}</span>
          </div>
          <div className="grid grid-cols-5 gap-3">
            {['#000000', '#2563eb', '#1e293b', '#cc0000', '#7c3aed'].map((color) => (
              <button
                key={color}
                onClick={() => dispatch(setPenColor(color))}
                className={`h-9 w-full rounded-xl border-2 transition-all hover:scale-110 ${
                  penColor === color ? 'border-brand-accent scale-110 ring-4 ring-brand-accent/20' : 'border-transparent opacity-80'
                }`}
                style={{ backgroundColor: color }}
              >
                {penColor === color && <Check className="w-4 h-4 mx-auto text-white drop-shadow-md" />}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider">
             <span>Stroke Thickness</span>
             <span className="text-brand-accent">{penWidth}PX</span>
          </div>
          <div className="px-1">
            <input 
              type="range" min={1} max={12} step={1} value={penWidth}
              onChange={(e) => dispatch(setPenWidth(Number(e.target.value)))}
              className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-brand-accent"
            />
          </div>
        </div>

        <div className="pt-4 space-y-4">
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Live Feedback</div>
          <div className="w-full h-24 bg-black/40 rounded-2xl border border-white/10 flex items-center justify-center overflow-hidden relative">
             {currentIndex >= 0 ? (
                <motion.img 
                  key={currentIndex}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  src={history[currentIndex]} 
                  className="max-h-[70%] max-w-[80%] object-contain invert"
                />
             ) : (
                <div className="flex flex-col items-center gap-1 opacity-20">
                   <Pen className="w-6 h-6" />
                   <span className="text-[8px] font-black italic">AWAITING INPUT</span>
                </div>
             )}
          </div>
        </div>
      </div>
    </Card>
  );
};
