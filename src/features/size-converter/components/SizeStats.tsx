import React from 'react';
import { Card } from '../../../components/ui/Card';
import { ShieldCheck, Info, Sparkles } from 'lucide-react';

interface SizeStatsProps {
  historyCount: number;
}

export const SizeStats: React.FC<SizeStatsProps> = ({ historyCount }) => {
  return (
    <div className="space-y-6">
       <Card className="p-8 saas-card-flat bg-brand-primary text-white border-none shadow-2xl relative overflow-hidden group">
          <div className="absolute -top-1/4 -right-1/4 w-1/2 h-full bg-white/10 blur-[80px] group-hover:bg-white/20 transition-all duration-700" />
          
          <div className="relative z-10 flex flex-col gap-6">
             <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-white scale-110">
                <ShieldCheck className="w-6 h-6" />
             </div>
             
             <div>
                <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-2 leading-none">Record Audit</h3>
                <p className="text-[10px] text-brand-primary-light font-bold uppercase tracking-widest leading-relaxed">
                   {historyCount} Units transformed this session. Total session volume recorded for reference.
                </p>
             </div>
             
             <div className="flex items-center gap-3 pt-6 border-t border-white/10">
                <span className="text-[10px] font-black uppercase tracking-widest">PRO STATUS</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,1)]" />
             </div>
          </div>
       </Card>

       <Card className="p-6 saas-card-flat bg-white dark:bg-slate-950 border-none flex items-start gap-4 shadow-xl">
          <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-400 shrink-0">
             <Info className="w-5 h-5" />
          </div>
          <div>
             <h4 className="text-[10px] font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight mb-1 leading-none">Precision Notice</h4>
             <p className="text-[9px] text-slate-500 font-medium leading-[1.6]">Values are calculated with 2 decimal precision. Pixel ratios assume standard 96 PPI baseline.</p>
          </div>
       </Card>

       <div className="px-2 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
             <Sparkles className="w-3.5 h-3.5 text-indigo-500" /> TOP TRANSFORMS
          </div>
          <div className="flex flex-wrap gap-2">
             {['CM to IN', 'MM to PX', 'PX to MM'].map(t => (
               <span key={t} className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-[9px] font-black text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">{t}</span>
             ))}
          </div>
       </div>
    </div>
  );
};
