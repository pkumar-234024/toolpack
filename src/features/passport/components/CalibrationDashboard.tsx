import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../../app/store';
import { setAdjustment, setBgColor } from '../passportSlice';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Sun, Sparkles, Check } from 'lucide-react';

interface CalibrationDashboardProps {
  onRemoveBG: () => void;
  onApplyCrop: () => void;
  isRemovingBG: boolean;
}

const presets = [
  { name: 'White', color: '#ffffff' }, 
  { name: 'Studio Blue', color: '#0033aa' }, 
  { name: 'Cloud Blue', color: '#90CAF9' }, 
  { name: 'Red', color: '#D32F2F' }
];

export const CalibrationDashboard: React.FC<CalibrationDashboardProps> = ({ 
  onRemoveBG, onApplyCrop, isRemovingBG 
}) => {
  const dispatch = useDispatch();
  const { brightness, contrast, bgColor } = useSelector((state: RootState) => state.passport);

  return (
    <Card className="p-8 saas-card space-y-8 rounded-[2.5rem] border border-white/5 shadow-xl">
       <div className="flex items-center gap-2 text-indigo-400 font-bold text-[10px] uppercase tracking-widest"><Sun className="w-4 h-4" /> STUDIO CALIBRATION</div>
       <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider">Exposure: {brightness}%</div>
            <input type="range" min="50" max="150" value={brightness} onChange={e => dispatch(setAdjustment({ type: 'brightness', value: Number(e.target.value) }))} className="w-full" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider">Contrast: {contrast}%</div>
            <input type="range" min="50" max="150" value={contrast} onChange={e => dispatch(setAdjustment({ type: 'contrast', value: Number(e.target.value) }))} className="w-full" />
          </div>
          <div className="pt-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase block mb-4 tracking-wider">Chroma Profile</span>
            <div className="flex flex-wrap gap-3">
              {presets.map(p => (
                <button 
                  key={p.color} onClick={() => dispatch(setBgColor(p.color))} 
                  className={`w-9 h-9 rounded-xl border-2 transition-all ${bgColor === p.color ? 'border-indigo-500 scale-110 shadow-lg shadow-indigo-500/30' : 'border-slate-800 hover:border-slate-700'}`} 
                  style={{ backgroundColor: p.color }}
                />
              ))}
              <div className="w-9 h-9 rounded-xl border-2 border-slate-800 bg-slate-900 flex items-center justify-center relative overflow-hidden">
                <input type="color" value={bgColor} onChange={(e) => dispatch(setBgColor(e.target.value))} className="absolute inset-0 opacity-0 cursor-pointer" />
                <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-rose-400 via-indigo-500 to-emerald-400 scale-125"></div>
              </div>
            </div>
          </div>
       </div>
       <div className="pt-6 border-t border-slate-800/50 space-y-4">
          <Button variant="outline" className="w-full h-12 border-slate-800 text-[11px] font-bold uppercase tracking-widest" onClick={onRemoveBG} isLoading={isRemovingBG} leftIcon={<Sparkles className="w-4 h-4" />}>AI Background Clean</Button>
          <Button className="w-full h-16 bg-indigo-500 hover:bg-indigo-600 font-bold uppercase tracking-[0.2em] shadow-2xl shadow-indigo-500/20" onClick={onApplyCrop} leftIcon={<Check className="w-5 h-5" />}>Process Assets</Button>
       </div>
    </Card>
  );
};
