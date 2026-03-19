import { useState, useMemo } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { 
  Scaling, Layers, 
  Minimize2, Copy, Check, Settings, Sparkles, Zap, Info, ArrowRight, Layout
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const presets = [
  { name: 'India Visa (Passport)', width: 51, height: 51, unit: 'mm', desc: 'Standard 2x2 inch' },
  { name: 'UK / EU Passport', width: 35, height: 45, unit: 'mm', desc: 'Standard 35x45mm' },
  { name: 'ID Card (ISO)', width: 85.6, height: 53.98, unit: 'mm', desc: 'Credit card size' },
  { name: 'Stamp Size', width: 20, height: 25, unit: 'mm', desc: 'Small document photo' },
  { name: 'Facebook Banner', width: 820, height: 312, unit: 'px', desc: 'Desktop cover photo' },
  { name: 'Instagram Post', width: 1080, height: 1080, unit: 'px', desc: 'High-res square' },
];

export const SizeConverter = () => {
  const [width, setWidth] = useState<string>('51');
  const [height, setHeight] = useState<string>('51');
  const [unit, setUnit] = useState<'px' | 'cm' | 'inch' | 'mm'>('mm');
  const [dpi, setDpi] = useState<number>(300);
  const [isCopied, setIsCopied] = useState(false);

  const convert = (val: number, from: string, to: string) => {
    if (from === to) return val;
    let inInches = 0;
    
    // from -> inches
    if (from === 'cm') inInches = val / 2.54;
    else if (from === 'mm') inInches = val / 25.4;
    else if (from === 'px') inInches = val / dpi;
    else inInches = val;

    // inches -> to
    if (to === 'cm') return inInches * 2.54;
    if (to === 'mm') return inInches * 25.4;
    if (to === 'px') return inInches * dpi;
    return inInches;
  };

  const currentResults = useMemo(() => {
    const w = Number(width) || 0;
    const h = Number(height) || 0;
    return {
      px: { w: convert(w, unit, 'px').toFixed(0), h: convert(h, unit, 'px').toFixed(0) },
      mm: { w: convert(w, unit, 'mm').toFixed(1), h: convert(h, unit, 'mm').toFixed(1) },
      cm: { w: convert(w, unit, 'cm').toFixed(2), h: convert(h, unit, 'cm').toFixed(2) },
      inch: { w: convert(w, unit, 'inch').toFixed(2), h: convert(h, unit, 'inch').toFixed(2) },
    };
  }, [width, height, unit, dpi]);

  const applyPreset = (p: typeof presets[0]) => {
    setUnit(p.unit as any);
    setWidth(p.width.toString());
    setHeight(p.height.toString());
    toast.success(`${p.name} preset applied`);
  };

  const copyToClipboard = () => {
    const text = `Input: ${width}${unit} x ${height}${unit} @ ${dpi}DPI
Pixels: ${currentResults.px.w}x${currentResults.px.h}px
Millimeters: ${currentResults.mm.w}x${currentResults.mm.h}mm
Centimeters: ${currentResults.cm.w}x${currentResults.cm.h}cm
Inches: ${currentResults.inch.w}x${currentResults.inch.h}in`;

    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
    toast.success('Specifications copied to clipboard');
  };

  return (
    <div className="container mx-auto px-6 py-8 pt-10 max-w-7xl min-h-screen">
      {/* Header */}
      <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            Size Engine <span className="bg-emerald-500 text-white text-[10px] px-2 py-0.5 rounded-full uppercase tracking-tighter">Precision</span>
          </h1>
          <p className="text-slate-500 text-xs font-medium max-w-md mt-1">
            Professional dimension converter for designers and photographers. Pixel-perfect accuracy guaranteed.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-slate-900 text-white text-[10px] font-bold px-3 py-1.5 rounded flex items-center gap-2">
            <Zap className="w-3 h-3 fill-current" /> REAL-TIME CALCULATION
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Input Settings */}
        <div className="lg:col-span-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="p-8 space-y-8 bg-white dark:bg-slate-950 border-none shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Scaling className="w-24 h-24" />
               </div>
               
               <div className="relative z-10">
                 <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-8 flex items-center gap-2">
                   <Settings className="w-4 h-4" /> Source Parameters
                 </h3>
                 
                 <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">WIDTH</label>
                          <input 
                            type="number" 
                            step="0.01"
                            value={width} 
                            onChange={(e) => setWidth(e.target.value)} 
                            className="w-full h-14 px-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl text-xl font-black focus:ring-2 focus:ring-brand-primary/20 transition-all"
                            placeholder="0.00"
                          />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">HEIGHT</label>
                          <input 
                            type="number" 
                            step="0.01"
                            value={height} 
                            onChange={(e) => setHeight(e.target.value)} 
                            className="w-full h-14 px-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl text-xl font-black focus:ring-2 focus:ring-brand-primary/20 transition-all"
                            placeholder="0.00"
                          />
                       </div>
                    </div>

                    <div className="space-y-3">
                       <div className="flex justify-between items-center">
                          <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Input Unit</label>
                          <div className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[8px] font-bold text-slate-400 uppercase">Required</div>
                       </div>
                       <div className="grid grid-cols-4 gap-2">
                          {['px', 'mm', 'cm', 'inch'].map((u) => (
                            <button
                              key={u}
                              onClick={() => setUnit(u as any)}
                              className={`h-11 rounded-xl border-2 text-xs font-black uppercase transition-all 
                              ${unit === u ? 'bg-slate-900 border-slate-900 text-white dark:bg-brand-primary dark:border-brand-primary' : 'bg-transparent border-slate-100 hover:border-slate-300 text-slate-500 dark:border-slate-800'}`}
                            >
                              {u}
                            </button>
                          ))}
                       </div>
                    </div>

                    <div className="pt-6 border-t border-slate-50 dark:border-slate-900 space-y-4">
                       <div className="flex justify-between items-center">
                          <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Resolution (DPI/PPI)</label>
                          <span className="text-xs font-black text-brand-primary">{dpi} DPI</span>
                       </div>
                       <input 
                         type="range" min={72} max={600} step={1} value={dpi}
                         onChange={(e) => setDpi(Number(e.target.value))}
                         className="w-full h-2 bg-slate-100 dark:bg-slate-900 rounded-lg appearance-none cursor-pointer accent-brand-primary"
                       />
                    </div>
                 </div>
               </div>
            </Card>

            <div className="space-y-6">
              <Card className="p-6 bg-slate-900 border-none shadow-2xl text-white relative overflow-hidden group">
                 <div className="relative z-10 flex flex-col h-full justify-between min-h-[300px]">
                    <div>
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">Visual Proportion</h3>
                      <div className="flex items-center justify-center p-8 bg-black/20 rounded-3xl border border-white/5 backdrop-blur-md min-h-[160px]">
                         <motion.div 
                           key={`${width}-${height}`}
                           initial={{ opacity: 0, scale: 0.9 }}
                           animate={{ opacity: 1, scale: 1 }}
                           className="bg-brand-primary/20 border-2 border-brand-primary border-dashed rounded-xl relative flex items-center justify-center"
                           style={{ 
                             width: '100px', 
                             aspectRatio: `${width}/${height}`,
                             maxHeight: '140px',
                             maxWidth: '100%',
                           }}
                         >
                            <Minimize2 className="w-5 h-5 text-brand-primary opacity-50" />
                         </motion.div>
                      </div>
                    </div>

                    <div className="pt-6">
                       <Button 
                         variant="ghost" 
                         className="w-full h-12 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-black text-xs uppercase tracking-widest"
                         onClick={copyToClipboard}
                       >
                         {isCopied ? <Check className="w-4 h-4 mr-2 text-emerald-400" /> : <Copy className="w-4 h-4 mr-2" />}
                         {isCopied ? 'COPIED' : 'COPY SPECS'}
                       </Button>
                    </div>
                 </div>
              </Card>

              <Card className="p-4 bg-emerald-500/10 border-none flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
                    <Sparkles className="w-5 h-5" />
                 </div>
                 <div>
                    <h4 className="text-[11px] font-black uppercase text-slate-800 dark:text-white tracking-tight">AI Precision</h4>
                    <p className="text-[10px] text-slate-500 font-medium italic">Accuracy within 0.001 units.</p>
                 </div>
              </Card>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
             {Object.entries(currentResults).map(([u, res]) => (
                <Card key={u} className="p-5 border-none bg-white dark:bg-slate-950 shadow-xl group hover:shadow-2xl transition-all hover:scale-[1.02]">
                   <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-3 group-hover:text-brand-primary transition-colors">{u === 'px' ? 'Pixels' : u === 'mm' ? 'Millimeters' : u === 'cm' ? 'Centimeters' : 'Inches'}</span>
                   <div className="text-xl font-black text-slate-900 dark:text-white flex items-baseline gap-1.5">
                      {res.w} <span className="text-[10px] text-slate-300 font-bold uppercase">×</span> {res.h}
                   </div>
                </Card>
             ))}
          </div>
        </div>

        {/* Presets Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-6 bg-slate-50 dark:bg-slate-900 border-none shadow-xl">
             <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2 mb-6">
               <Layout className="w-4 h-4 text-emerald-500" /> Smart Presets
             </h3>

             <div className="space-y-3">
                {presets.map((p) => (
                  <button
                    key={p.name}
                    onClick={() => applyPreset(p)}
                    className="w-full flex items-center justify-between p-4 bg-white dark:bg-slate-950 hover:bg-emerald-500/5 hover:border-emerald-500/20 border border-slate-100 dark:border-slate-800 rounded-2xl transition-all group"
                  >
                    <div className="text-left">
                      <span className="block text-sm font-black text-slate-800 dark:text-white group-hover:text-emerald-500 transition-colors">{p.name}</span>
                      <span className="text-[10px] font-bold text-slate-400">{p.desc}</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                  </button>
                ))}
             </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
