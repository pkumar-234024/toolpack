import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../../app/store';
import { setPhotoRatio, setDPI } from '../passportSlice';
import { Card } from '../../../components/ui/Card';

const countries = [
  { name: 'India (Visa)', width: 3.4, height: 4.7, label: '34x47 mm' },
  { name: 'UK / EU', width: 3.5, height: 4.5, label: '35x45 mm' },
  { name: 'US Visa', width: 5.1, height: 5.1, label: '2x2 inch' },
  { name: 'China', width: 3.3, height: 4.8, label: '33x48 mm' },
];

export const PresetGrid: React.FC = () => {
  const dispatch = useDispatch();
  const { selectedPreset, dpi } = useSelector((state: RootState) => state.passport);

  return (
    <div className="space-y-8">
       <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-2 gap-4">
          {countries.map(c => (
            <button 
              key={c.name} onClick={() => dispatch(setPhotoRatio({ width: c.width, height: c.height, presetName: c.name }))}
              className={`p-4 rounded-2xl border text-left flex flex-col transition-all relative overflow-hidden group min-h-[80px] ${selectedPreset === c.name ? 'border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-500/10' : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'}`}
            >
              <span className={`text-[12px] font-bold tracking-tight mb-1 ${selectedPreset === c.name ? 'text-indigo-400' : 'text-slate-100'}`}>{c.name}</span>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider">{c.label}</span>
              {selectedPreset === c.name && <div className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,1)]"></div>}
            </button>
          ))}
          <Card className="p-4 bg-slate-900/20 border-slate-800 rounded-2xl flex items-center justify-between col-span-2">
             <div className="flex flex-col">
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none mb-1">Custom Resolution</span>
               <span className="text-[9px] text-slate-600 font-medium">{dpi} DPI Rendering Profile</span>
             </div>
             <div className="flex items-center gap-4 flex-1 max-w-[180px] ml-6 pt-1">
                <input type="range" min="150" max="600" step="50" value={dpi} onChange={e => dispatch(setDPI(Number(e.target.value)))} className="flex-1" />
             </div>
          </Card>
       </div>
    </div>
  );
};
