import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../../app/store';
import { setPenColor, setPenWidth } from '../signatureSlice';
import { Card } from '../../../components/ui/Card';
import { Sparkles, Droplets } from 'lucide-react';

const colors = [
  { id: 'black', value: '#000000', label: 'Classic Onyx' },
  { id: 'blue', value: '#1e40af', label: 'Royal Cerulean' },
  { id: 'custom', value: 'custom', label: 'Refined Palette' }
];

export const PencilSettings: React.FC = () => {
  const dispatch = useDispatch();
  const { penColor, penWidth } = useSelector((state: RootState) => state.signature);

  return (
    <Card className="p-8 saas-card-flat bg-brand-primary text-white border-none shadow-2xl relative overflow-hidden group mb-8">
      <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-all duration-700 pointer-events-none">
         <Sparkles className="w-16 h-16" />
      </div>
      
      <div className="relative z-10 space-y-10">
         <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-md">
               <Droplets className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-black uppercase tracking-[0.2em] leading-none mb-1">Chroma Calibration</h3>
         </div>

         <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3">
               {colors.map(c => (
                 c.value !== 'custom' ? (
                   <button
                     key={c.id}
                     onClick={() => dispatch(setPenColor(c.value))}
                     className={`flex items-center gap-2 p-3 rounded-2xl border-2 transition-all ${penColor === c.value ? 'bg-white border-white text-brand-primary' : 'bg-white/5 border-white/10 text-white/60 hover:border-white/20'}`}
                   >
                     <div className="w-4 h-4 rounded-full border-2 border-white/20 shadow-inner" style={{ backgroundColor: c.value }} />
                     <span className="text-[10px] font-black uppercase tracking-tight">{c.label}</span>
                   </button>
                 ) : (
                   <div key={c.id} className="relative group">
                     <button className={`w-full flex items-center gap-2 p-3 rounded-2xl border-2 transition-all ${!['#000000', '#1e40af'].includes(penColor) ? 'bg-white border-white text-brand-primary' : 'bg-white/5 border-white/10 text-white/60 hover:border-white/20'}`}>
                        <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-rose-400 via-indigo-400 to-emerald-400" />
                        <span className="text-[10px] font-black uppercase tracking-tight">{c.label}</span>
                     </button>
                     <input 
                       type="color" value={penColor} 
                       onChange={(e) => dispatch(setPenColor(e.target.value))} 
                       className="absolute inset-0 opacity-0 cursor-pointer" 
                     />
                   </div>
                 )
               ))}
            </div>

            <div className="pt-8 border-t border-white/10 space-y-4">
               <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-2">
                  <span>Pencil Magnitude</span>
                  <span className="text-white">{penWidth}PX BASE</span>
               </div>
               <input 
                 type="range" min="1" max="10" step="0.5" value={penWidth} 
                 onChange={(e) => dispatch(setPenWidth(Number(e.target.value)))} 
                 className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white" 
               />
            </div>
         </div>
      </div>
    </Card>
  );
};
