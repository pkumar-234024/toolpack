import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../../app/store';
import { setPhotoRatio, setDPI} from '../passportSlice';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Download, Monitor, Image, Ruler, ChevronDown, MoveHorizontal, MoveVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
  const { selectedPreset, dpi, photoRatio } = useSelector((state: RootState) => state.passport);
  const [downloadFormat, setDownloadFormat] = React.useState<'jpeg' | 'png' | 'webp'>('png');
  const [showCustom, setShowCustom] = React.useState(false);

  const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === 'Custom') {
      setShowCustom(true);
      dispatch(setPhotoRatio({ 
        width: photoRatio.width, 
        height: photoRatio.height, 
        presetName: 'Custom' 
      }));
    } else {
      setShowCustom(false);
      const preset = countries.find(c => c.name === val);
      if (preset) {
        dispatch(setPhotoRatio({ 
          width: preset.width, 
          height: preset.height, 
          presetName: preset.name 
        }));
      }
    }
  };

  const updateCustomDimension = (dim: 'width' | 'height', val: string) => {
    // Use an empty string check to allow clearing the input temporarily
    if (val === '') {
      dispatch(setPhotoRatio({ 
        ...photoRatio, 
        [dim]: 0,
        presetName: 'Custom' 
      }));
      return;
    }

    const num = parseFloat(val);
    if (!isNaN(num)) {
      dispatch(setPhotoRatio({ 
        ...photoRatio, 
        [dim]: num,
        presetName: 'Custom' 
      }));
    }
  };

  React.useEffect(() => {
    if (selectedPreset === 'Custom') {
      setShowCustom(true);
    }
  }, [selectedPreset]);

  return (
    <div className="space-y-6">
       <div className="flex flex-col gap-4">
          {/* Preset Selector Card */}
          <Card className="p-6 bg-slate-900/40 border-white/5 rounded-[2rem] overflow-visible">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shadow-lg shadow-indigo-500/10">
                <Ruler className="w-5 h-5 text-indigo-400" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Photo Dimensions</span>
                <span className="text-[9px] text-indigo-400/50 font-medium uppercase tracking-tight">Select preset or set custom size</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="relative group">
                <label className="text-[9px] font-black uppercase text-slate-500 tracking-[0.2em] ml-1 mb-2 block">Specification Preset</label>
                <div className="relative">
                  <select 
                    value={selectedPreset === 'Custom' || !selectedPreset ? 'Custom' : selectedPreset} 
                    onChange={handlePresetChange}
                    className="w-full bg-slate-950 border border-white/5 rounded-2xl px-5 py-4 text-[13px] font-bold text-slate-200 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all cursor-pointer hover:bg-black appearance-none"
                  >
                    {countries.map(c => (
                      <option key={c.name} value={c.name} className="bg-slate-900 border-none py-2">{c.name} ({c.label})</option>
                    ))}
                    <option value="Custom" className="bg-slate-900 border-none py-2 text-indigo-400 font-black">--- Custom Dimensions ---</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none group-hover:text-indigo-400 transition-colors" />
                </div>
              </div>

              <AnimatePresence>
                {showCustom && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0, marginTop: 0 }}
                    animate={{ height: 'auto', opacity: 1, marginTop: 16 }}
                    exit={{ height: 0, opacity: 0, marginTop: 0 }}
                    className="grid grid-cols-2 gap-4 overflow-hidden"
                  >
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase text-slate-400/60 tracking-[0.2em] ml-1 flex items-center gap-2">
                        <MoveHorizontal className="w-3 h-3 text-indigo-400/70" /> Width (cm)
                      </label>
                      <input 
                        type="number" 
                        step="0.1"
                        value={photoRatio.width || ''}
                        onChange={(e) => updateCustomDimension('width', e.target.value)}
                        className="w-full bg-slate-950/50 border border-white/5 rounded-xl px-4 py-3 text-sm font-bold text-white focus:border-indigo-500/50 focus:bg-slate-950 outline-none transition-all placeholder:text-slate-700"
                        placeholder="0.0"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase text-slate-400/60 tracking-[0.2em] ml-1 flex items-center gap-2">
                        <MoveVertical className="w-3 h-3 text-indigo-400/70" /> Height (cm)
                      </label>
                      <input 
                        type="number" 
                        step="0.1"
                        value={photoRatio.height || ''}
                        onChange={(e) => updateCustomDimension('height', e.target.value)}
                        className="w-full bg-slate-950/50 border border-white/5 rounded-xl px-4 py-3 text-sm font-bold text-white focus:border-indigo-500/50 focus:bg-slate-950 outline-none transition-all placeholder:text-slate-700"
                        placeholder="0.0"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Card>
          
          <Card className="p-5 bg-slate-900/40 border-white/5 rounded-[2rem] flex items-center justify-between group hover:border-indigo-500/20 transition-all">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-800/50 flex items-center justify-center border border-white/5 group-hover:bg-indigo-500/10 transition-colors">
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
             <div className="flex items-center gap-4 flex-1 max-w-[160px] ml-6 pt-1">
                <input type="range" min="150" max="600" step="50" value={dpi} onChange={e => dispatch(setDPI(Number(e.target.value)))} className="flex-1 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
             </div>
          </Card>

          <Card className="p-6 bg-indigo-500/5 border-indigo-500/10 rounded-[2rem] shadow-2xl shadow-indigo-500/5 overflow-hidden relative">
             <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-500/10 blur-3xl rounded-full"></div>
             <div className="flex items-center justify-between mb-6 relative">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shadow-lg shadow-indigo-500/10">
                      <Image className="w-5 h-5 text-indigo-400" />
                   </div>
                   <div className="flex flex-col">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Instant Asset Export</span>
                      <span className="text-[9px] text-indigo-400/50 font-medium uppercase tracking-tight">Direct snippet isolation</span>
                   </div>
                </div>
             </div>

             <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-4 relative">
                <div className="flex-1 space-y-2">
                   <label className="text-[9px] font-black uppercase text-slate-500 tracking-[0.2em] ml-1">Output Format</label>
                   <div className="relative group mt-1">
                     <select 
                       value={downloadFormat} 
                       onChange={(e) => setDownloadFormat(e.target.value as any)}
                       className="w-full bg-slate-950 border border-white/5 rounded-2xl px-5 py-4 text-[12px] font-bold text-slate-300 focus:ring-1 focus:ring-indigo-500 outline-none transition-all cursor-pointer hover:bg-black appearance-none"
                     >
                        <option value="png" className="bg-slate-900">Lossless PNG</option>
                        <option value="jpeg" className="bg-slate-900">Standard JPEG</option>
                        <option value="webp" className="bg-slate-900">Modern WebP</option>
                     </select>
                     <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none group-hover:text-indigo-400 transition-colors" />
                   </div>
                </div>
                <Button 
                   onClick={() => onDownloadAsset(downloadFormat)}
                   className="h-[52px] flex-1 bg-indigo-500 hover:bg-indigo-600 text-white rounded-2xl shadow-[0_8px_20px_-6px_rgba(99,102,241,0.5)] active:scale-95 transition-all flex items-center justify-center gap-2 font-extrabold uppercase text-[11px] tracking-widest border border-indigo-400/20"
                >
                   <Download className="w-4 h-4" />
                   Download
                </Button>
             </div>
          </Card>
       </div>
    </div>
  );
};
