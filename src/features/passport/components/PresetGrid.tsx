import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../../app/store';
import { setPhotoRatio, setDPI} from '../passportSlice';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Download, Monitor, Image } from 'lucide-react';

const countries = [
  { name: 'India (Visa)', width: 3.4, height: 4.7, label: '34x47 mm' },
  { name: 'UK / EU', width: 3.5, height: 4.5, label: '35x45 mm' },
  { name: 'US Visa', width: 5.1, height: 5.1, label: '2x2 inch' },
  { name: 'China', width: 3.3, height: 4.8, label: '33x48 mm' },
];

interface PresetGridProps {
  onDownloadAsset: (format: 'jpeg' | 'png' | 'webp') => void;
}

export const PresetGrid: React.FC<PresetGridProps> = ({ onDownloadAsset }) => {
  const dispatch = useDispatch();
  const { selectedPreset, dpi } = useSelector((state: RootState) => state.passport);
  const [downloadFormat, setDownloadFormat] = React.useState<'jpeg' | 'png' | 'webp'>('png');

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
          
          <Card className="p-5 bg-slate-900/40 border-white/5 rounded-[2rem] col-span-2 flex items-center justify-between group hover:border-indigo-500/20 transition-all">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-800/50 flex items-center justify-center border border-white/5">
                   <Monitor className="w-5 h-5 text-indigo-400" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Rendering Precision</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-white">{dpi} DPI</span>
                    <span className="px-1.5 py-0.5 rounded-md bg-indigo-500/10 text-[8px] font-bold text-indigo-400 uppercase tracking-widest border border-indigo-500/20">High Res</span>
                  </div>
                </div>
             </div>
             <div className="flex items-center gap-4 flex-1 max-w-[200px] ml-6 pt-1">
                <input type="range" min="150" max="600" step="50" value={dpi} onChange={e => dispatch(setDPI(Number(e.target.value)))} className="flex-1 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
             </div>
          </Card>

          <Card className="p-6 bg-indigo-500/5 border-indigo-500/10 rounded-[2rem] col-span-2 shadow-2xl shadow-indigo-500/5">
             <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shadow-lg shadow-indigo-500/10">
                      <Image className="w-5 h-5 text-indigo-400" />
                   </div>
                   <div className="flex flex-col">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Instant Asset Export</span>
                      <span className="text-[9px] text-indigo-400/50 font-medium uppercase">Direct snippet isolation</span>
                   </div>
                </div>
             </div>

             <div className="flex items-end gap-3">
                <div className="flex-1 space-y-2">
                   <label className="text-[9px] font-black uppercase text-slate-500 tracking-[0.15em] ml-1">Output Format</label>
                   <select 
                     value={downloadFormat} 
                     onChange={(e) => setDownloadFormat(e.target.value as any)}
                     className="w-full bg-slate-950 border border-white/5 rounded-2xl px-4 py-3 text-[11px] font-bold text-slate-300 focus:ring-1 focus:ring-indigo-500 outline-none transition-all cursor-pointer hover:bg-black"
                   >
                      <option value="png">Lossless PNG</option>
                      <option value="jpeg">Standard JPEG</option>
                      <option value="webp">Modern WebP</option>
                   </select>
                </div>
                <Button 
                  onClick={() => onDownloadAsset(downloadFormat)}
                  className="h-[46px] flex-1 bg-indigo-500 hover:bg-indigo-600 text-white rounded-2xl shadow-[0_8px_20px_-6px_rgba(99,102,241,0.5)] active:scale-95 transition-all flex items-center justify-center gap-2 font-black uppercase text-[11px] tracking-widest"
                >
                   <Download className="w-4 h-4" />
                   Download Image
                </Button>
             </div>
          </Card>
       </div>
    </div>
  );
};
