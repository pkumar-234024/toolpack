import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Scaling, Layers, Smartphone, FileUp, Smartphone as DeviceMobile, Minimize2, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const presets = [
  { name: 'Passport (India)', width: 3.5, height: 4.5, unit: 'cm' },
  { name: 'Passport (US)', width: 2, height: 2, unit: 'inch' },
  { name: 'ID Card (ISO)', width: 8.56, height: 5.4, unit: 'cm' },
  { name: 'Stamp Size', width: 2, height: 2.5, unit: 'cm' },
  { name: 'Facebook Banner', width: 820, height: 312, unit: 'px' },
  { name: 'Instagram Post', width: 1080, height: 1080, unit: 'px' },
];

export const SizeConverter = () => {
  const [width, setWidth] = useState<string>('3.5');
  const [height, setHeight] = useState<string>('4.5');
  const [unit, setUnit] = useState<'px' | 'cm' | 'inch'>('cm');
  const [dpi, setDpi] = useState<number>(96);
  const [isCopied, setIsCopied] = useState(false);

  const convert = (val: number, from: string, to: string) => {
    if (from === to) return val;
    let inInches = 0;
    
    // from -> inches
    if (from === 'cm') inInches = val / 2.54;
    else if (from === 'px') inInches = val / dpi;
    else inInches = val;

    // inches -> to
    if (to === 'cm') return inInches * 2.54;
    if (to === 'px') return inInches * dpi;
    return inInches;
  };

  const getResults = (val: number) => {
    return {
      px: convert(val, unit, 'px').toFixed(0),
      cm: convert(val, unit, 'cm').toFixed(2),
      inch: convert(val, unit, 'inch').toFixed(2),
    };
  };

  const applyPreset = (p: typeof presets[0]) => {
    setUnit(p.unit as any);
    setWidth(p.width.toString());
    setHeight(p.height.toString());
    toast.success(`${p.name} preset applied`);
  };

  const copyToClipboard = () => {
    const resultsW = getResults(Number(width));
    const resultsH = getResults(Number(height));
    const text = `Size: ${width}${unit} x ${height}${unit}\nPx: ${resultsW.px}x${resultsH.px}\nCm: ${resultsW.cm}x${resultsH.cm}\nInch: ${resultsW.inch}x${resultsH.inch}`;
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
    toast.success('Dimensions copied!');
  };

  return (
    <div className="container mx-auto px-6 py-12 pt-24 max-w-7xl">
      <div className="flex flex-col lg:flex-row gap-12">
        <div className="flex-1 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <Card variant="solid">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-brand-primary">
                <Scaling className="w-5 h-5" /> Input Dimensions
              </h3>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <Input 
                    label="Width" 
                    type="number" 
                    value={width} 
                    onChange={(e) => setWidth(e.target.value)} 
                    placeholder="W" 
                  />
                  <Input 
                    label="Height" 
                    type="number" 
                    value={height} 
                    onChange={(e) => setHeight(e.target.value)} 
                    placeholder="H" 
                  />
                </div>
                <div className="space-y-2">
                  <span className="text-xs font-semibold">Select Input Unit</span>
                  <div className="grid grid-cols-3 gap-2">
                    {['px', 'cm', 'inch'].map((u) => (
                      <button
                        key={u}
                        onClick={() => setUnit(u as any)}
                        className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                          unit === u 
                            ? 'bg-brand-primary border-brand-primary text-white' 
                            : 'bg-transparent border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        {u}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between text-xs font-semibold">
                    <span>PPI/DPI (Screen resolution)</span>
                    <span>{dpi} DPI</span>
                  </div>
                  <input 
                    type="range" min={72} max={600} step={1} value={dpi}
                    onChange={(e) => setDpi(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-primary"
                  />
                  <p className="text-[10px] text-slate-400 italic">Common: Screen = 96, Print = 300, Retina = 220</p>
                </div>
              </div>
            </Card>

            <Card className="bg-brand-primary/5 border-brand-primary/20 sticky top-28">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Layers className="w-5 h-5 text-brand-primary" /> Conversion Results
                </h3>
                <Button variant="ghost" size="sm" onClick={copyToClipboard} className="p-2 h-8 w-8">
                  {isCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
              
              <div className="space-y-4">
                {['px', 'cm', 'inch'].map((u) => (
                  <div key={u} className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-widest text-slate-400 block mb-1">{u}</span>
                      <span className="text-2xl font-black text-slate-800 dark:text-slate-100">
                        {getResults(Number(width))[u as 'px'|'cm'|'inch']} <span className="text-slate-400">×</span> {getResults(Number(height))[u as 'px'|'cm'|'inch']}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-8 border-t border-brand-primary/10">
                <div className="flex items-center gap-4">
                  <div 
                    className="bg-brand-primary/20 rounded-lg border-2 border-brand-primary border-dashed flex items-center justify-center transition-all overflow-hidden"
                    style={{ 
                      width: '60px', 
                      height: `${(Number(height)/Number(width)) * 60}px`,
                      maxHeight: '120px'
                    }}
                  >
                    <Minimize2 className="w-4 h-4 text-brand-primary animate-pulse" />
                  </div>
                  <div>
                    <h5 className="font-bold text-sm">Live Preview Box</h5>
                    <p className="text-xs text-slate-500">Visualization of the ratio</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        <div className="w-full lg:w-96">
          <Card variant="outline">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <DeviceMobile className="w-5 h-5 text-brand-primary" /> Popular Presets
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {presets.map((p) => (
                <button
                  key={p.name}
                  onClick={() => applyPreset(p)}
                  className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950/50 hover:bg-brand-primary/5 hover:border-brand-primary/30 border border-transparent rounded-xl transition-all group"
                >
                  <div className="text-left">
                    <span className="block font-bold truncate group-hover:text-brand-primary transition-colors">{p.name}</span>
                    <span className="text-xs text-slate-500">{p.width}{p.unit} × {p.height}{p.unit}</span>
                  </div>
                  <FileUp className="w-4 h-4 text-slate-300 group-hover:text-brand-primary group-hover:translate-x-1 transition-all" />
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
