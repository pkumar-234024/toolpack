import { useSelector } from 'react-redux';
import type { RootState } from '../../app/store';
import { Card } from '../../components/ui/Card';
import { 
  Command, Info
} from 'lucide-react';
import toast from 'react-hot-toast';
import './SignatureTool.css';

// Feature Components
import { SignatureCanvas } from './components/SignatureCanvas';
import { BrushControls } from './components/BrushControls';
import { SignatureActions } from './components/SignatureActions';

export const SignatureTool = () => {
  const { history, currentIndex } = useSelector((state: RootState) => state.signature);

  const downloadSignature = () => {
    if (currentIndex === -1) {
      toast.error('Write your signature first');
      return;
    }

    const dataUrl = history[currentIndex];
    const link = document.createElement('a');
    link.download = `signature_export_${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
    toast.success('Signature exported with transparency');
  };

  return (
    <div className="container mx-auto px-6 py-8 pt-10 max-w-7xl min-h-screen">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            Signature Studio <span className="bg-brand-accent text-white text-[10px] px-2 py-0.5 rounded-full uppercase tracking-tighter">Pro</span>
          </h1>
          <p className="text-slate-500 text-xs font-medium max-w-md mt-1">
            Draw, refine, and export professional digital signatures with transparent backgrounds.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-slate-900 text-white text-[10px] font-bold px-3 py-1.5 rounded flex items-center gap-2">
            <Command className="w-3 h-3" /> VECTOR ENGINE ACTIVE
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Canvas Area */}
        <div className="lg:col-span-8 space-y-6">
          <SignatureCanvas />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <Card className="p-4 flex items-center gap-4 bg-slate-50 dark:bg-slate-900 border-none">
               <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                  <Info className="w-5 h-5" />
               </div>
               <div>
                  <h4 className="text-[11px] font-black uppercase text-slate-800 dark:text-white">Drawing Tip</h4>
                  <p className="text-[10px] font-medium text-slate-500">For best results, use a tablet or a steady hand on the trackpad.</p>
               </div>
             </Card>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
           <BrushControls />
           <SignatureActions onExport={downloadSignature} />
        </div>
      </div>
    </div>
  );
};
