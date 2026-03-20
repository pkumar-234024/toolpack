import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../../app/store';
import { setFromValue, setFromUnit, setToUnit, addHistory } from '../sizeSlice';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { ArrowLeftRight, Zap, Target } from 'lucide-react';
import { motion } from 'framer-motion';

const units = [
  { id: 'cm', name: 'Centimeters', icon: '📏' },
  { id: 'mm', name: 'Millimeters', icon: '📎' },
  { id: 'inch', name: 'Inches', icon: '📐' },
  { id: 'px', name: 'Pixels', icon: '🖥️' }
];

interface UnitConverterProps {
  onConvert: () => void;
  convertedValue: string | number;
}

export const UnitConverter: React.FC<UnitConverterProps> = ({ onConvert, convertedValue }) => {
  const dispatch = useDispatch();
  const { fromValue, fromUnit, toUnit } = useSelector((state: RootState) => state.size);

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 hidden md:block">
           <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-500/40 text-white border-4 border-white dark:border-slate-900">
              <ArrowLeftRight className="w-5 h-5" />
           </div>
        </div>

        {/* Input Side */}
        <Card className="p-8 saas-card-flat border-none space-y-6">
           <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Source Magnitude</span>
              <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded-full">FROM</span>
           </div>
           
           <input 
             type="number" 
             value={fromValue} 
             onChange={(e) => dispatch(setFromValue(e.target.value))}
             placeholder="0.00"
             className="w-full bg-transparent text-5xl font-black text-slate-900 dark:text-white border-none focus:ring-0 p-0 placeholder:text-slate-200 dark:placeholder:text-slate-800"
           />

           <div className="grid grid-cols-2 gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
              {units.map(u => (
                <button 
                  key={u.id}
                  onClick={() => dispatch(setFromUnit(u.id as any))}
                  className={`p-3 rounded-xl text-left border-2 transition-all group ${fromUnit === u.id ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10' : 'border-transparent hover:border-slate-100 dark:hover:border-slate-800'}`}
                >
                  <div className="text-[10px] font-black uppercase text-slate-400 mb-1">{u.name}</div>
                  <div className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                     <span className="text-sm opacity-60">{u.icon}</span> {u.id}
                  </div>
                </button>
              ))}
           </div>
        </Card>

        {/* Output Side */}
        <Card className="p-8 saas-card-flat bg-slate-900 border-none space-y-6">
           <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-slate-700 tracking-[0.2em]">Refined Output</span>
              <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">RESULT</span>
           </div>

           <div className="text-5xl font-black text-white h-[60px] flex items-center tabular-nums">
              {convertedValue}
           </div>

           <div className="grid grid-cols-2 gap-2 pt-4 border-t border-white/5">
              {units.map(u => (
                <button 
                  key={u.id}
                  onClick={() => dispatch(setToUnit(u.id as any))}
                  className={`p-3 rounded-xl text-left border-2 transition-all ${toUnit === u.id ? 'border-emerald-500 bg-emerald-500/10' : 'border-transparent hover:border-white/5'}`}
                >
                  <div className="text-[10px] font-black uppercase text-slate-500 mb-1">{u.name}</div>
                  <div className="font-bold text-white flex items-center gap-2">
                     <span className="text-sm opacity-60">{u.icon}</span> {u.id}
                  </div>
                </button>
              ))}
           </div>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-center gap-6 pt-4">
         <Button 
           size="lg" 
           onClick={onConvert}
           className="w-full md:w-[300px] h-16 bg-slate-900 dark:bg-white text-white dark:text-black font-black uppercase tracking-[0.2em] shadow-2xl hover:scale-[1.02] active:scale-[0.98]"
           leftIcon={<Target className="w-5 h-5" />}
         >
            Save to Records
         </Button>
         
         <div className="flex items-center gap-4 text-slate-400">
            <div className="flex -space-x-2">
               {[1,2,3].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold">U{i}</div>)}
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest leading-none">Precise Transformation</span>
         </div>
      </div>
    </div>
  );
};
