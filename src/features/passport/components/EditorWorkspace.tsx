import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Area } from 'react-easy-crop';
import Cropper from 'react-easy-crop';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../../app/store';
import { setCrop, setZoom, setRotation, toggleFaceGuide } from '../passportSlice';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Eye, EyeOff, RotateCcw, Minus, Plus, RotateCw, Loader2 } from 'lucide-react';

interface EditorWorkspaceProps {
  onCropComplete: (croppedArea: Area, croppedAreaPixels: Area) => void;
  clearImage: () => void;
  isRemovingBG?: boolean;
}

export const EditorWorkspace: React.FC<EditorWorkspaceProps> = ({ onCropComplete, clearImage, isRemovingBG }) => {
  const dispatch = useDispatch();
  const { 
    image, crop, zoom, rotation, photoRatio, bgColor, brightness, contrast, showFaceGuide 
  } = useSelector((state: RootState) => state.passport);

  if (!image) return null;

  return (
    <div className="space-y-3 w-full">
      <div className="flex items-center justify-center gap-6">
        <Button variant={showFaceGuide ? 'primary' : 'outline'} size="sm" onClick={() => dispatch(toggleFaceGuide())} className="h-9 text-[11px] uppercase font-bold tracking-[0.15em] px-6 border-slate-800">
           {showFaceGuide ? <Eye className="w-3.5 h-3.5 mr-2" /> : <EyeOff className="w-3.5 h-3.5 mr-2" />}
           Face Guide
        </Button>
        <div className="w-px h-6 bg-slate-800"></div>
        <Button variant="ghost" size="sm" onClick={clearImage} className="h-9 text-[11px] uppercase font-bold tracking-[0.15em] text-rose-500 hover:bg-rose-500/10">Reset Session</Button>
      </div>

      <Card className="aspect-[4/3] w-full p-0 overflow-hidden relative bg-black rounded-[3rem] border border-white/5 saas-card group shadow-2xl">
        <div className="w-full h-full relative" style={{ backgroundColor: bgColor }}>
          <Cropper 
            image={image} crop={crop} zoom={zoom} rotation={rotation} aspect={photoRatio.width / photoRatio.height} 
            onCropChange={c => dispatch(setCrop(c))} onZoomChange={z => dispatch(setZoom(z))} onRotationChange={r => dispatch(setRotation(r))} onCropComplete={onCropComplete} 
            style={{ containerStyle: { background: 'transparent' }, mediaStyle: { filter: `brightness(${brightness}%) contrast(${contrast}%)` }, cropAreaStyle: { border: '1px solid white', boxShadow: '0 0 0 9999px rgba(0,0,0,0.6)' } }} 
          />
          {showFaceGuide && (
            <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
              <svg className="w-full h-full p-16" viewBox="0 0 100 100" preserveAspectRatio="none">
                <ellipse cx="50" cy="45" rx="16" ry="24" fill="none" stroke="white" strokeWidth="0.08" strokeDasharray="1,1" className="opacity-40" />
                <line x1="50" y1="0" x2="50" y2="100" stroke="white" strokeWidth="0.04" className="opacity-20" />
                <line x1="0" y1="42" x2="100" y2="42" stroke="white" strokeWidth="0.04" className="opacity-20" />
              </svg>
            </div>
          )}

          <AnimatePresence>
            {isRemovingBG && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-50 bg-slate-950/40 backdrop-blur-md flex flex-col items-center justify-center gap-4"
              >
                 <div className="relative">
                   <Loader2 className="w-12 h-12 text-indigo-400 animate-spin" />
                   <div className="absolute inset-0 blur-2xl bg-indigo-500/20 animate-pulse rounded-full" />
                 </div>
                 <span className="text-[10px] font-black uppercase text-indigo-100 tracking-[0.2em] animate-pulse">Removing Background...</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Card>

      <div className="flex items-center justify-between px-8 py-4 bg-slate-900/40 dark:bg-black/20 border border-white/5 rounded-[2.5rem] backdrop-blur-3xl shadow-2xl">
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Canvas Precision</span>
          <span className="text-[10px] font-bold text-indigo-400/50 uppercase tracking-widest">Interactive Transformation</span>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
             <button onClick={() => dispatch(setRotation(rotation - 90))} className="p-3 text-slate-400 hover:text-white transition-all bg-slate-800/40 hover:bg-slate-800/60 rounded-xl border border-white/5"><RotateCcw className="w-4 h-4" /></button>
             <button onClick={() => dispatch(setRotation(rotation + 90))} className="p-3 text-slate-400 hover:text-white transition-all bg-slate-800/40 hover:bg-slate-800/60 rounded-xl border border-white/5"><RotateCw className="w-4 h-4" /></button>
          </div>
          
          <div className="h-8 w-px bg-slate-800/50"></div>
          
          <div className="flex items-center gap-3 bg-slate-800/40 rounded-2xl p-1.5 px-4 border border-white/5">
             <button onClick={() => dispatch(setZoom(Math.max(1, zoom - 0.1)))} className="p-2 text-slate-400 hover:text-white transition-colors group">
               <Minus className="w-4 h-4 group-hover:scale-110 active:scale-90 transition-transform" />
             </button>
             <div className="text-[14px] font-black text-white w-14 text-center tabular-nums bg-slate-950/50 py-1.5 rounded-lg border border-white/5">{zoom.toFixed(1)}x</div>
             <button onClick={() => dispatch(setZoom(Math.min(4, zoom + 0.1)))} className="p-2 text-slate-400 hover:text-white transition-colors group">
               <Plus className="w-4 h-4 group-hover:scale-110 active:scale-90 transition-transform" />
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};
