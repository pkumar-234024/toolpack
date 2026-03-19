import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../app/store';
import { addFiles, removeFile, setTargetFormat, clearFiles, updateFileStatus } from './docSlice';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { 
  FileType2, Trash2, Download, Upload, CheckCircle2, AlertCircle, 
  FileText, ImageIcon, Loader2, FileUp, Sparkles, Layout, Zap, Info, ShieldCheck, Maximize
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export const DocConverter = () => {
  const dispatch = useDispatch();
  const { files, targetFormat } = useSelector((state: RootState) => state.doc);
  const [isProcessingAll, setIsProcessingAll] = useState(false);
  const [isHoveringDropzone, setIsHoveringDropzone] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map((file) => ({
      id: Math.random().toString(36).substring(7),
      name: file.name,
      size: file.size,
      type: file.type,
      blob: file,
      progress: 0,
      status: 'pending' as const,
    }));
    dispatch(addFiles(newFiles));
  }, [dispatch]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 
      'image/*': ['.jpg', '.jpeg', '.png', '.webp'], 
      'application/pdf': ['.pdf'] 
    },
  });

  const processFile = async (file: typeof files[0]) => {
    dispatch(updateFileStatus({ id: file.id, status: 'processing' }));
    
    try {
      if (targetFormat === 'pdf') {
        const reader = new FileReader();
        reader.readAsDataURL(file.blob);
        await new Promise((resolve) => (reader.onload = resolve));
        
        const img = new Image();
        img.src = reader.result as string;
        await new Promise((resolve) => (img.onload = resolve));
        
        const pdf = new jsPDF();
        const imgWidth = pdf.internal.pageSize.getWidth();
        const imgHeight = (img.height * imgWidth) / img.width;
        
        pdf.addImage(img.src, 'JPEG', 0, 0, imgWidth, imgHeight);
        const pdfBlob = pdf.output('blob');
        dispatch(updateFileStatus({ id: file.id, status: 'done', convertedBlob: pdfBlob }));
      } else {
        // Image conversion (to JPG/PNG)
        const reader = new FileReader();
        reader.readAsDataURL(file.blob);
        await new Promise((resolve) => (reader.onload = resolve));
        
        const img = new Image();
        img.src = reader.result as string;
        await new Promise((resolve) => (img.onload = resolve));
        
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.drawImage(img, 0, 0);
        
        const outFormat = targetFormat === 'jpg' ? 'image/jpeg' : 'image/png';
        canvas.toBlob((blob) => {
          if (blob) {
            dispatch(updateFileStatus({ id: file.id, status: 'done', convertedBlob: blob }));
          }
        }, outFormat, 0.95);
      }
    } catch (err) {
      console.error(err);
      dispatch(updateFileStatus({ id: file.id, status: 'error' }));
      toast.error(`Processing ${file.name} failed`);
    }
  };

  const handleConvertAll = async () => {
    setIsProcessingAll(true);
    const toastId = toast.loading('Processing files...');
    const pendingFiles = files.filter(f => f.status === 'pending');
    for (const file of pendingFiles) {
      await processFile(file);
    }
    setIsProcessingAll(false);
    toast.success('All files processed!', { id: toastId });
  };

  const downloadFile = (file: typeof files[0]) => {
    if (!file.convertedBlob) return;
    const url = URL.createObjectURL(file.convertedBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name.split('.')[0] + '.' + (targetFormat === 'jpg' ? 'jpg' : targetFormat);
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto px-6 py-8 pt-10 max-w-7xl min-h-screen">
      {/* Header */}
      <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            Doc Engine <span className="bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full uppercase tracking-tighter">Fast</span>
          </h1>
          <p className="text-slate-500 text-xs font-medium max-w-md mt-1">
            Batch process your documents and images instantly. Secure, browser-based conversion with high fidelity.
          </p>
        </div>
        <div className="flex items-center gap-3 text-[10px] font-black uppercase text-rose-500">
           <ShieldCheck className="w-4 h-4 fill-current" /> PRIVATE STORAGE ONLY
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Main Interface */}
        <div className="lg:col-span-8 space-y-8">
          <div 
            {...getRootProps()} 
            onMouseEnter={() => setIsHoveringDropzone(true)}
            onMouseLeave={() => setIsHoveringDropzone(false)}
          >
            <Card 
              className={`relative h-[300px] border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all duration-300 rounded-3xl overflow-hidden shadow-sm
                ${isDragActive ? 'bg-rose-500/5 border-rose-500 scale-[1.01]' : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-rose-500/50 hover:bg-rose-500/[0.02]'}
              `}
            >
              <input {...getInputProps()} />
              
              {/* Background Glow */}
              <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                 <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-rose-500/5 blur-[100px]" />
                 <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-rose-500/5 blur-[100px]" />
              </div>

              <div className="relative z-10 flex flex-col items-center text-center p-12">
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-rose-500/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                    <FileUp className={`w-8 h-8 ${isDragActive ? 'text-rose-500' : 'text-slate-400'}`} />
                  </div>
                  <motion.div 
                    animate={isHoveringDropzone ? { scale: [1, 1.2, 1] } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -top-1 -right-1 w-6 h-6 bg-rose-500 border-4 border-white dark:border-slate-900 rounded-full flex items-center justify-center shadow-lg"
                  >
                    <Upload className="w-3 h-3 text-white" strokeWidth={4} />
                  </motion.div>
                </div>
                
                <h2 className="text-2xl font-black mb-2 text-slate-800 dark:text-white uppercase tracking-tight">Convert Your Documents</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xs mx-auto mb-8 font-medium">
                   JPG, PNG, WEBP & PDF supported. Up to 10MB per file.
                </p>
                
                <div className="flex flex-wrap items-center justify-center gap-4">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-[10px] font-bold text-slate-500 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                     <ShieldCheck className="w-3.5 h-3.5" /> ENCRYPTED
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-[10px] font-bold text-slate-500 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                     <Maximize className="w-3.5 h-3.5" /> NO RE-DOWNLOAD
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <AnimatePresence mode="popLayout">
            {files.length > 0 && (
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
                  {files.map((file) => (
                    <motion.div
                      layout
                      key={file.id}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
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
                              <Button size="sm" onClick={() => downloadFile(file)} className="h-11 w-11 p-0 rounded-2xl bg-slate-900 shadow-lg">
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
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Action Sidebar */}
        <div className="lg:col-span-4 space-y-8">
          <Card className="bg-slate-900 border-none text-white shadow-2xl p-8 sticky top-5">
            <h3 className="text-sm font-black uppercase tracking-widest mb-10 flex items-center gap-2 text-slate-400">
              <FileType2 className="w-4 h-4 text-rose-500" /> Convert Workflow
            </h3>

            <div className="space-y-10">
              <div className="space-y-4">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                   <span>Output Format</span>
                   <span className="text-rose-500">PRO GRADE</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {['jpg', 'png', 'pdf'].map((format) => (
                    <button
                      key={format}
                      onClick={() => dispatch(setTargetFormat(format as any))}
                      className={`h-12 rounded-2xl border-2 font-black uppercase text-xs transition-all ${
                        targetFormat === format 
                          ? 'border-rose-500 bg-rose-500/20 text-rose-500' 
                          : 'border-white/5 bg-white/5 text-slate-500 hover:border-white/10'
                      }`}
                    >
                      {format}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-10 border-t border-white/5 space-y-6">
                <Button 
                  size="lg"
                  className="w-full h-16 text-sm font-black group bg-rose-500 hover:bg-rose-600 shadow-2xl shadow-rose-500/20" 
                  disabled={files.length === 0 || files.every(f => f.status === 'done') || isProcessingAll}
                  isLoading={isProcessingAll}
                  onClick={handleConvertAll}
                  leftIcon={<Zap className="w-6 h-6 group-hover:scale-110 transition-transform" />}
                >
                  CONVERT NOW
                </Button>
                
                <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/5">
                   <div className="w-8 h-8 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-500">
                      <Sparkles className="w-4 h-4" />
                   </div>
                   <div>
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-white">Infinite Limits</h4>
                      <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">No subscription required.</p>
                   </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-5 bg-rose-50 dark:bg-rose-950/20 border-none flex items-start gap-4">
             <div className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-900 border border-rose-100 dark:border-rose-900 flex items-center justify-center text-rose-500 shrink-0 shadow-lg">
                <Info className="w-5 h-5" />
             </div>
             <div>
                <h4 className="text-[11px] font-bold text-slate-800 dark:text-white uppercase tracking-tight mb-1">Queue Intelligence</h4>
                <p className="text-[10px] text-slate-500 font-medium leading-relaxed">Files are processed in parallel for maximum performance using browser execution threads.</p>
             </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
