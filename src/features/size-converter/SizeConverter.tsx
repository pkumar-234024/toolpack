import { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../app/store';
import { addHistory, setDpi } from './sizeSlice';
import toast from 'react-hot-toast';
import './SizeConverter.css';

// Feature Components
import { UnitConverter } from './components/UnitConverter';
import { ConversionHistory } from './components/ConversionHistory';
import { SizeStats } from './components/SizeStats';

export const SizeConverter = () => {
  const dispatch = useDispatch();
  const { fromValue, fromUnit, toUnit, dpi, history } = useSelector((state: RootState) => state.size);

  const convertedValue = useMemo(() => {
    const val = parseFloat(fromValue);
    if (isNaN(val)) return '0.00';

    // From -> Inches
    let inInches = 0;
    if (fromUnit === 'cm') inInches = val / 2.54;
    else if (fromUnit === 'mm') inInches = val / 25.4;
    else if (fromUnit === 'px') inInches = val / dpi;
    else inInches = val;

    // Inches -> To
    let result = 0;
    if (toUnit === 'cm') result = inInches * 2.54;
    else if (toUnit === 'mm') result = inInches * 25.4;
    else if (toUnit === 'px') result = inInches * dpi;
    else result = inInches;

    return result.toFixed(2);
  }, [fromValue, fromUnit, toUnit, dpi]);

  const handleConvert = () => {
    if (!fromValue || isNaN(parseFloat(fromValue))) return;
    dispatch(addHistory({
      id: Math.random().toString(36).substring(7),
      fromValue,
      fromUnit,
      toValue: convertedValue,
      toUnit,
      timestamp: Date.now(),
    }));
    toast.success('Conversion saved to records');
  };

  return (
    <div className="container mx-auto px-6 py-12 pt-16 max-w-7xl relative min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-16">
        <div>
          <h1 className="text-4xl font-black text-slate-800 dark:text-white uppercase tracking-tighter flex items-center gap-4">
            Size Engine <span className="bg-emerald-500 text-white text-[10px] px-2 py-0.5 rounded-full tracking-widest leading-none">V2.4</span>
          </h1>
          <p className="text-slate-400 text-xs font-black uppercase tracking-widest mt-2 ml-1">Universal Dimension Suite</p>
        </div>
        
        <div className="flex items-center gap-6">
           <div className="flex flex-col items-end">
              <span className="text-[10px] font-black uppercase text-slate-400 leading-none mb-1">Session Data</span>
              <span className="text-xl font-black text-emerald-500 tabular-nums">{history.length}</span>
           </div>
           <div className="w-px h-10 bg-slate-100 dark:bg-slate-800" />
           <div className="flex flex-col items-end">
              <span className="text-[10px] font-black uppercase text-slate-400 leading-none mb-1">Active DPI</span>
              <span className="text-xl font-black text-slate-800 dark:text-white tabular-nums">{dpi}</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
         <div className="lg:col-span-8 space-y-24">
            <UnitConverter onConvert={handleConvert} convertedValue={convertedValue} />
            
            <div className="pt-10 border-t border-slate-100 dark:border-slate-800/50">
               <div className="flex items-center justify-between mb-8">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Adjustment Matrix (DPI Scale)</label>
                  <span className="text-[10px] font-black text-emerald-500 uppercase">{dpi} DPI Profile</span>
               </div>
               <input 
                 type="range" min={72} max={600} step={1} value={dpi}
                 onChange={(e) => dispatch(setDpi(Number(e.target.value)))}
                 className="w-full h-2 bg-slate-100 dark:bg-slate-900 rounded-lg appearance-none cursor-pointer accent-emerald-500"
               />
            </div>

            <ConversionHistory />
         </div>

         <div className="lg:col-span-4">
            <SizeStats historyCount={history.length} />
         </div>
      </div>
    </div>
  );
};
