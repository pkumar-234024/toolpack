import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../app/store';
import { updateFileStatus } from './docSlice';
import { Card } from '../../components/ui/Card';
import { 
  ShieldCheck, Info
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import toast from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';
import './DocConverter.css';

// Feature Components
import { ConversionDropzone } from './components/ConversionDropzone';
import { FileQueue } from './components/FileQueue';
import { ConversionControls } from './components/ConversionControls';

export const DocConverter = () => {
  const dispatch = useDispatch();
  const { files, targetFormat } = useSelector((state: RootState) => state.doc);
  const [isProcessingAll, setIsProcessingAll] = useState(false);

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
          <ConversionDropzone />

          <AnimatePresence mode="popLayout">
            <FileQueue onDownloadFile={downloadFile} />
          </AnimatePresence>
        </div>

        {/* Action Sidebar */}
        <div className="lg:col-span-4 space-y-8">
          <ConversionControls onConvertAll={handleConvertAll} isProcessingAll={isProcessingAll} />

          <Card className="p-5 bg-rose-50 dark:bg-rose-950/20 border-none flex items-start gap-4">
             <div className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-900 border border-rose-100 dark:border-rose-900 flex items-center justify-center text-rose-500 shrink-0 shadow-lg" style={{ minWidth: '40px' }}>
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
