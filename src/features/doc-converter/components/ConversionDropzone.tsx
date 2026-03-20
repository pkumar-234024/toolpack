import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useDispatch } from 'react-redux';
import { addFiles } from '../docSlice';
import { Card } from '../../../components/ui/Card';
import { FileUp, Upload, ShieldCheck, Maximize } from 'lucide-react';
import { motion } from 'framer-motion';

export const ConversionDropzone: React.FC = () => {
  const dispatch = useDispatch();
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

  return (
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
  );
};
