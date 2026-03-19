import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../app/store';
import { addFiles, removeFile, setTargetFormat, clearFiles, updateFileStatus } from './docSlice';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { FileType2, Trash2, Download, Upload, CheckCircle2, AlertCircle, FileText, ImageIcon, Loader2 } from 'lucide-react';
import { jsPDF } from 'jspdf';
import toast from 'react-hot-toast';

export const DocConverter = () => {
  const dispatch = useDispatch();
  const { files, targetFormat } = useSelector((state: RootState) => state.doc);
  const [isProcessingAll, setIsProcessingAll] = useState(false);

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
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'], 'application/pdf': ['.pdf'] },
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
        ctx?.drawImage(img, 0, 0);
        
        const outFormat = targetFormat === 'jpg' ? 'image/jpeg' : 'image/png';
        canvas.toBlob((blob) => {
          if (blob) {
            dispatch(updateFileStatus({ id: file.id, status: 'done', convertedBlob: blob }));
          }
        }, outFormat, 0.95);
      }
    } catch (err) {
      dispatch(updateFileStatus({ id: file.id, status: 'error' }));
      toast.error(`Failed to process ${file.name}`);
    }
  };

  const handleConvertAll = async () => {
    setIsProcessingAll(true);
    const pendingFiles = files.filter(f => f.status === 'pending');
    for (const file of pendingFiles) {
      await processFile(file);
    }
    setIsProcessingAll(false);
    toast.success('All files processed!');
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
    <div className="container mx-auto px-6 py-12 pt-24 max-w-7xl">
      <div className="flex flex-col lg:flex-row gap-12">
        <div className="flex-1 space-y-8">
          <div {...getRootProps()}>
            <Card className={`p-12 border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${isDragActive ? 'bg-brand-primary/5 border-brand-primary' : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 group'}`}>
              <input {...getInputProps()} />
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${isDragActive ? 'bg-brand-primary/20' : 'bg-slate-100 dark:bg-slate-800'}`}>
                <Upload className={`w-10 h-10 ${isDragActive ? 'text-brand-primary' : 'text-slate-400'}`} />
              </div>
              <h3 className="text-2xl font-bold mb-2">Select files to convert</h3>
              <p className="text-slate-500 text-center max-w-sm">
                  Drop your images or PDFs here. Supports JPG, PNG, WEBP, PDF.
              </p>
            </Card>
          </div>

          {files.length > 0 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center px-4">
                <span className="text-sm font-bold text-slate-500">{files.length} Files Selected</span>
                <Button variant="ghost" size="sm" onClick={() => dispatch(clearFiles())} className="text-rose-500 hover:bg-rose-50 border border-slate-100 dark:border-slate-800 h-9">
                    Clear List
                </Button>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {files.map((file) => (
                  <Card key={file.id} variant="solid" className="p-4 flex items-center gap-4 group">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${file.type.includes('pdf') ? 'bg-rose-100 text-rose-600' : 'bg-brand-primary/10 text-brand-primary'}`}>
                        {file.type.includes('pdf') ? <FileText className="w-6 h-6" /> : <ImageIcon className="w-6 h-6" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="font-bold text-slate-800 dark:text-slate-200 truncate pr-4">{file.name}</h5>
                      <span className="text-xs text-slate-400">{(file.size / 1024).toFixed(1)} KB • {file.type.split('/')[1]?.toUpperCase()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        {file.status === 'processing' && <Loader2 className="w-5 h-5 text-brand-primary animate-spin" />}
                        {file.status === 'done' && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                        {file.status === 'error' && <AlertCircle className="w-5 h-5 text-rose-500" />}
                        
                        {file.status === 'done' ? (
                          <Button size="sm" variant="ghost" onClick={() => downloadFile(file)} className="p-2 h-10 w-10 text-brand-primary hover:bg-brand-primary/5">
                            <Download className="w-5 h-5" />
                          </Button>
                        ) : (
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => dispatch(removeFile(file.id))} 
                            className="p-2 h-10 w-10 text-slate-400 hover:text-rose-500 hover:bg-rose-50"
                          >
                            <Trash2 className="w-5 h-5" />
                          </Button>
                        )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="w-full lg:w-96 space-y-8">
          <Card className="bg-slate-900 border-none text-white sticky top-28">
            <h3 className="text-xl font-bold mb-8 flex items-center gap-2">
              <FileType2 className="w-6 h-6 text-brand-primary" /> Conversion Options
            </h3>

            <div className="space-y-6">
              <div className="space-y-3">
                <span className="text-sm font-bold text-slate-400">Target Format</span>
                <div className="grid grid-cols-3 gap-2">
                  {['jpg', 'png', 'pdf'].map((format) => (
                    <button
                      key={format}
                      onClick={() => dispatch(setTargetFormat(format as any))}
                      className={`px-4 py-3 rounded-xl border-2 font-black uppercase text-xs transition-all ${
                        targetFormat === format 
                          ? 'border-brand-primary bg-brand-primary/20 text-brand-primary' 
                          : 'border-white/5 bg-white/5 text-slate-500 hover:border-white/10'
                      }`}
                    >
                      {format}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-8 border-t border-white/5 space-y-4">
                <Button 
                  className="w-full py-4 text-lg font-black group shadow-2xl" 
                  disabled={files.length === 0 || files.every(f => f.status === 'done') || isProcessingAll}
                  isLoading={isProcessingAll}
                  onClick={handleConvertAll}
                >
                  <span className="mr-2">Convert Files</span>
                  <FileType2 className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                </Button>
                <p className="text-[10px] text-center text-slate-500 italic">Fastest browser conversion. Quality guaranteed.</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
