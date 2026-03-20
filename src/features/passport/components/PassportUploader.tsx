import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useDispatch } from 'react-redux';
import { setImage } from '../passportSlice';
import { Upload } from 'lucide-react';
import { motion } from 'framer-motion';

export const PassportUploader: React.FC = () => {
  const dispatch = useDispatch();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => dispatch(setImage(reader.result as string));
    reader.readAsDataURL(file);
  }, [dispatch]);

  const { getRootProps, getInputProps } = useDropzone({ 
    onDrop, 
    accept: { 'image/*': [] }, 
    multiple: false 
  });

  return (
    <motion.div key="uploader" exit={{ opacity: 0 }} className="w-full max-w-2xl mx-auto">
      <div {...getRootProps()} className="relative rounded-[2.5rem] border-2 border-dashed h-[300px] flex flex-col items-center justify-center border-slate-800 bg-slate-900/40 hover:border-slate-700 cursor-pointer transition-all">
        <input {...getInputProps()} />
        <Upload className="w-10 h-10 text-indigo-400 mb-4" />
        <h3 className="text-xl font-semibold text-white uppercase tracking-tighter">Drop Portrait Here</h3>
        <p className="text-slate-500 text-[10px] uppercase tracking-[0.2em] mt-2 font-black">Professional Image Intelligence Engine</p>
      </div>
    </motion.div>
  );
};
