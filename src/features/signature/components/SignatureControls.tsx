import React from 'react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Trash2, FileOutput, FilePlus, Download } from 'lucide-react';

interface SignatureControlsProps {
  isEmpty: boolean;
  onClear: () => void;
  onDownloadPNG: () => void;
  onDownloadPDF: () => void;
}

export const SignatureControls: React.FC<SignatureControlsProps> = ({ 
  isEmpty, onClear, onDownloadPNG, onDownloadPDF 
}) => {
  return (
    <Card className="p-8 saas-card-flat bg-white dark:bg-slate-950 border-none shadow-2xl rounded-[3rem] space-y-8">
       <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-900 pb-6 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-400">
             <FileOutput className="w-5 h-5" />
          </div>
          <div>
             <h3 className="text-sm font-black uppercase tracking-[0.2em] leading-none mb-1 text-slate-800 dark:text-white">Export Intelligence</h3>
             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Generate Professional Assets</p>
          </div>
       </div>

       <div className="space-y-4">
          <Button 
            size="lg" 
            onClick={onDownloadPNG} 
            disabled={isEmpty} 
            className="w-full h-16 bg-slate-900 dark:bg-slate-100 text-white dark:text-black font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-slate-800 transition-all border-none"
            leftIcon={<Download className="w-5 h-5" />}
          >
             Save PNG Alpha
          </Button>
          
          <Button 
             size="lg" 
             onClick={onDownloadPDF} 
             disabled={isEmpty} 
             variant="outline" 
             className="w-full h-16 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 font-black uppercase tracking-[0.2em] transition-all text-slate-600 dark:text-slate-400"
             leftIcon={<FilePlus className="w-5 h-5" />}
          >
             Vector PDF Proof
          </Button>
       </div>

       <div className="pt-6 border-t border-slate-100 dark:border-slate-900">
          <Button 
            variant="ghost" 
            onClick={onClear} 
            className="w-full h-12 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 font-black uppercase tracking-[0.2em]"
            leftIcon={<Trash2 className="w-4 h-4" />}
          >
             Reset Workspace
          </Button>
       </div>
       
       <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800/50">
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight leading-relaxed">
             Signatures are encrypted locally. No biometric data is transmitted outside your session.
          </p>
       </div>
    </Card>
  );
};
