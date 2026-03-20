import { useDispatch, useSelector } from 'react-redux';
import type  { RootState } from '../../../app/store';
import { removeFile, clearFiles } from '../docSlice';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { 
  Layout, Trash2, FileText, ImageIcon, Loader2, Download, CheckCircle2, AlertCircle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FileQueueProps {
  onDownloadFile: (file: any) => void;
}

export const FileQueue: React.FC<FileQueueProps> = ({ onDownloadFile }) => {
  const dispatch = useDispatch();
  const { files } = useSelector((state: RootState) => state.doc);

  if (files.length === 0) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex justify-between items-center px-4">
        <span className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-2">
          <Layout className="w-3.5 h-3.5" /> {files.length} Files Queue
        </span>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => dispatch(clearFiles())} 
          className="text-xs font-black text-rose-500 hover:bg-rose-50 h-8 uppercase tracking-widest"
        >
            Clear All
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3">
        <AnimatePresence mode="popLayout">
          {files.map((file) => (
            <motion.div
              layout
              key={file.id}
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="p-4 flex items-center gap-4 group bg-white dark:bg-slate-950 border-none shadow-xl hover:shadow-2xl transition-all">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center relative shadow-inner overflow-hidden
                  ${file.type.includes('pdf') ? 'bg-rose-100 text-rose-600' : 'bg-brand-primary/10 text-brand-primary'}
                `}>
                    {file.type.includes('pdf') ? <FileText className="w-7 h-7" /> : <ImageIcon className="w-7 h-7" />}
                    {file.status === 'processing' && (
                       <motion.div 
                         animate={{ width: '100%', left: 0 }}
                         initial={{ width: 0, left: 0 }}
                         className="absolute bottom-0 h-1 bg-current opacity-30"
                       />
                    )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h5 className="font-black text-slate-800 dark:text-slate-100 truncate pr-4 text-sm uppercase tracking-tight">{file.name}</h5>
                  <div className="flex items-center gap-3 mt-1 text-[10px] font-bold text-slate-400">
                     <span>{(file.size / 1024).toFixed(1)} KB</span>
                     <span className="w-1 h-1 rounded-full bg-slate-200" />
                     <span className="uppercase">{file.type.split('/')[1]?.toUpperCase()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex flex-col items-end mr-2">
                       {file.status === 'processing' && <span className="text-[8px] font-black text-brand-primary uppercase tracking-widest">Processing</span>}
                       {file.status === 'done' && <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Completed</span>}
                       {file.status === 'pending' && <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Waiting</span>}
                    </div>

                    {file.status === 'processing' && <Loader2 className="w-5 h-5 text-brand-primary animate-spin" />}
                    {file.status === 'done' && <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500"><CheckCircle2 className="w-5 h-5" /></div>}
                    {file.status === 'error' && <AlertCircle className="w-5 h-5 text-rose-500" />}
                    
                    {file.status === 'done' ? (
                      <Button size="sm" onClick={() => onDownloadFile(file)} className="h-11 w-11 p-0 rounded-2xl bg-slate-900 shadow-lg">
                        <Download className="w-5 h-5" />
                      </Button>
                    ) : (
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => dispatch(removeFile(file.id))} 
                        className="h-11 w-11 p-0 rounded-2xl text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all border border-slate-50 dark:border-slate-800"
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    )}
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
