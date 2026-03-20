import React from 'react';
import type { Area } from 'react-easy-crop';
import Cropper from 'react-easy-crop';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../../app/store';
import { setCrop, setZoom, setRotation, toggleFaceGuide } from '../passportSlice';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Eye, EyeOff, RotateCcw, Minus, Plus, RotateCw } from 'lucide-react';

interface EditorWorkspaceProps {
  onCropComplete: (croppedArea: Area, croppedAreaPixels: Area) => void;
  clearImage: () => void;
}

export const EditorWorkspace: React.FC<EditorWorkspaceProps> = ({ onCropComplete, clearImage }) => {
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
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 p-2 bg-black/60 backdrop-blur-2xl rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 border border-white/10 shadow-2xl">
          <button onClick={() => dispatch(setRotation(rotation - 90))} className="p-3 text-white/50 hover:text-white transition-colors hover:bg-white/5 rounded-xl"><RotateCcw className="w-5 h-5" /></button>
          <div className="w-px h-6 bg-white/10"></div>
          <div className="flex items-center gap-2 px-2">
             <button onClick={() => dispatch(setZoom(Math.max(1, zoom - 0.1)))} className="p-2 text-white/50 hover:text-white"><Minus className="w-4 h-4" /></button>
             <div className="text-[14px] font-bold text-white w-12 text-center tabular-nums">{zoom.toFixed(1)}x</div>
             <button onClick={() => dispatch(setZoom(Math.min(4, zoom + 0.1)))} className="p-2 text-white/50 hover:text-white"><Plus className="w-4 h-4" /></button>
          </div>
          <div className="w-px h-6 bg-white/10"></div>
          <button onClick={() => dispatch(setRotation(rotation + 90))} className="p-3 text-white/50 hover:text-white transition-colors hover:bg-white/5 rounded-xl"><RotateCw className="w-5 h-5" /></button>
        </div>
      </Card>
    </div>
  );
};
