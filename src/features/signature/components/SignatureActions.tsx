import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../../app/store';
import { undo, redo, toggleGrid, clearHistory, addToHistory } from '../signatureSlice';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { 
  Trash2, Undo, Redo, Grid, Upload, Save, Sparkles 
} from 'lucide-react';
import toast from 'react-hot-toast';

interface SignatureActionsProps {
  onExport: () => void;
}

export const SignatureActions: React.FC<SignatureActionsProps> = ({ onExport }) => {
  const dispatch = useDispatch();
  const { history, currentIndex, showGrid } = useSelector((state: RootState) => state.signature);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        dispatch(addToHistory(reader.result as string));
        toast.success('Signature file loaded');
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex gap-1.5">
           <Button 
            variant="outline" 
            size="sm" 
            onClick={() => dispatch(undo())} 
            className="h-9 px-3 border-slate-200 dark:border-slate-800"
            disabled={currentIndex < 0}
           >
             <Undo className="w-4 h-4 mr-2" /> Undo
           </Button>
           <Button 
            variant="outline" 
            size="sm" 
            onClick={() => dispatch(redo())} 
            className="h-9 px-3 border-slate-200 dark:border-slate-800"
            disabled={currentIndex >= history.length - 1}
           >
             <Redo className="w-4 h-4 mr-2" /> Redo
           </Button>
        </div>
        <div className="flex gap-1.5">
           <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => dispatch(toggleGrid())} 
            className={`h-9 px-3 ${showGrid ? 'text-brand-primary bg-brand-primary/5' : ''}`}
           >
             <Grid className="w-4 h-4 mr-2" /> {showGrid ? 'Grid On' : 'Grid Off'}
           </Button>
           <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => dispatch(clearHistory())} 
            className="h-9 px-3 text-red-500 hover:bg-red-50"
           >
             <Trash2 className="w-4 h-4 mr-2" /> Clear
           </Button>
        </div>
      </div>

      <div className="pt-6">
        <Button 
          size="lg"
          className="w-full h-14 font-black shadow-2xl bg-brand-accent hover:bg-brand-accent/90 text-white"
          onClick={onExport}
          leftIcon={<Save className="w-5 h-5" />}
        >
          EXPORT FINAL SIGNATURE
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
         <Card className="p-4 flex items-center gap-4 bg-slate-50 dark:bg-slate-900 border-none hover:bg-brand-accent/5 transition-colors cursor-pointer group">
           <label className="flex items-center gap-4 w-full cursor-pointer">
             <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
             <div className="w-10 h-10 rounded-xl bg-brand-accent/10 flex items-center justify-center text-brand-accent group-hover:scale-110 transition-transform">
                <Upload className="w-5 h-5" />
             </div>
             <div>
                <h4 className="text-[11px] font-black uppercase text-slate-800 dark:text-white">Import Signature</h4>
                <p className="text-[10px] font-medium text-slate-500">Pick an existing file to edit or refine.</p>
             </div>
           </label>
         </Card>
      </div>

      <Card className="p-4 border-none bg-brand-accent/10 flex items-center gap-3">
         <div className="w-10 h-10 rounded-full bg-brand-accent text-white flex items-center justify-center shadow-lg shadow-brand-accent/20">
           <Sparkles className="w-5 h-5" />
         </div>
         <div>
           <h4 className="text-[11px] font-black uppercase text-slate-800 dark:text-white tracking-widest">Studio Quality</h4>
           <p className="text-[10px] font-medium text-slate-500">Anti-aliased vector smoothing active.</p>
         </div>
      </Card>
    </div>
  );
};
