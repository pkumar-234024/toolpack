import React from 'react';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../app/store';
import { Card } from '../../../components/ui/Card';

interface PrintPreviewProps {
  finalPhoto: string | null;
  pagePx: { w: number; h: number };
  previewScale: number;
}

export const PrintPreview: React.FC<PrintPreviewProps> = ({ 
  finalPhoto, pagePx, previewScale 
}) => {
  const { spacing, copies, photoRatio, bgColor } = useSelector((state: RootState) => state.passport);

  return (
    <Card className="p-16 bg-[#080809] border border-white/5 shadow-2xl relative overflow-hidden flex items-center justify-center rounded-[3rem] w-full min-h-[480px]">
       <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent"></div>
       <motion.div initial={false} animate={{ scale: finalPhoto ? 1 : 0.95 }} className="relative z-10">
         <div className="bg-white shadow-[0_30px_100px_rgba(0,0,0,0.7)]" style={{ width: pagePx.w, height: pagePx.h }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: `${spacing * previewScale}mm` }}>
               {Array.from({ length: copies }).map((_, i) => (
                 <div key={i} style={{ width: `${photoRatio.width * 10 * previewScale}mm`, height: `${photoRatio.height * 10 * previewScale}mm`, backgroundColor: bgColor }}>
                    {finalPhoto && <img src={finalPhoto} className="w-full h-full object-cover" alt="" />}
                 </div>
               ))}
            </div>
         </div>
       </motion.div>
       {!finalPhoto && <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-20 text-[10px] font-bold text-slate-600 uppercase tracking-[0.4em]">Awaiting Processed Asset</div>}
    </Card>
  );
};
