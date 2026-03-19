import { useState, useCallback, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import Cropper from 'react-easy-crop';
import type { Area } from 'react-easy-crop';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../app/store';
import { 
  setImage, setCrop, setZoom, setRotation, setAdjustment, 
  setPaperSize, setSpacing, setCopies, setBgColor, 
  setPhotoRatio, setDPI, toggleFaceGuide
} from './passportSlice';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { 
  Sun, Sparkles, Eye, EyeOff, Check, Settings, Layout as LayoutIcon,
  Upload, Printer, RotateCcw, RotateCw, Download, Minus, Plus
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import toast from 'react-hot-toast';
import { removeBackground } from '@imgly/background-removal';
import { motion, AnimatePresence } from 'framer-motion';

// --- Shared Helper for High-Res Image Generation ---
const generatePassportSnippet = async (
  imageSrc: string, 
  pixelCrop: Area, 
  rotation = 0, 
  bgColor = '#ffffff', 
  brightness = 100, 
  contrast = 100,
  targetDpi = 300,
  targetWidthMM = 35,
  targetHeightMM = 45
): Promise<string> => {
  const img = new Image();
  img.src = imageSrc;
  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
  });

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return '';

  const outputWidth = Math.round((targetWidthMM / 25.4) * targetDpi);
  const outputHeight = Math.round((targetHeightMM / 25.4) * targetDpi);
  
  canvas.width = outputWidth;
  canvas.height = outputHeight;

  // Background
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  // Filter
  ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
  
  // Transform
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.translate(-canvas.width / 2, -canvas.height / 2);

  ctx.drawImage(
    img, 
    pixelCrop.x, 
    pixelCrop.y, 
    pixelCrop.width, 
    pixelCrop.height, 
    0, 
    0, 
    canvas.width, 
    canvas.height
  );
  ctx.restore();

  return canvas.toDataURL('image/jpeg', 0.92);
};

export const PassportTool = () => {
  const dispatch = useDispatch();
  const { 
    image, crop, zoom, rotation, brightness, contrast, 
    paperSize, spacing, photoRatio, copies, bgColor, showFaceGuide, dpi, selectedPreset
  } = useSelector((state: RootState) => state.passport);
  
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isRemovingBG, setIsRemovingBG] = useState(false);
  const [printImage, setPrintImage] = useState<string | null>(null);
  const [finalPhoto, setFinalPhoto] = useState<string | null>(null);

  // Preview Scale
  const previewScale = 0.25; 
  const pagePx = useMemo(() => {
    const mmToPx = 3.78; 
    const sizes: Record<string, { w: number; h: number }> = {
      'A4': { w: 210, h: 297 },
      'A5': { w: 148, h: 210 },
      'A6': { w: 105, h: 148 },
      'single': { w: photoRatio.width * 10, h: photoRatio.height * 10 }
    };
    const size = sizes[paperSize] || sizes.A4;
    return { w: size.w * mmToPx * previewScale, h: size.h * mmToPx * previewScale };
  }, [paperSize, photoRatio.width, photoRatio.height]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => dispatch(setImage(reader.result as string));
    reader.readAsDataURL(file);
  }, [dispatch]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop, 
    accept: { 'image/*': [] }, 
    multiple: false 
  });

  const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const clearImage = () => {
    dispatch(setImage(null));
    setPrintImage(null);
    setFinalPhoto(null);
  };

  const handleRemoveBG = async () => {
    if (!image) return;
    setIsRemovingBG(true);
    const toastId = toast.loading('Removing background...');
    try {
      const result = await removeBackground(image);
      const reader = new FileReader();
      reader.onload = () => {
        dispatch(setImage(reader.result as string));
        toast.success('Background removed!', { id: toastId });
      };
      reader.readAsDataURL(result);
    } catch (e) { 
      console.error(e);
      toast.error('AI Processing failed. Check your connection.', { id: toastId }); 
    } finally { 
      setIsRemovingBG(false); 
    }
  };

  const countries = [
    { name: 'India (Visa)', width: 3.4, height: 4.7, label: '34x47 mm' },
    { name: 'UK / EU', width: 3.5, height: 4.5, label: '35x45 mm' },
    { name: 'US Visa', width: 5.1, height: 5.1, label: '2x2 inch' },
    { name: 'China', width: 3.3, height: 4.8, label: '33x48 mm' },
  ];

  const presets = [
    { name: 'White', color: '#ffffff' }, 
    { name: 'Studio Blue', color: '#0033aa' }, 
    { name: 'Cloud Blue', color: '#90CAF9' }, 
    { name: 'Red', color: '#D32F2F' }
  ];

  const getPageDimensions = (size: string) => {
    const w = size === 'single' ? photoRatio.width * 10 : (size === 'A5' ? 148 : (size === 'A6' ? 105 : 210));
    const h = size === 'single' ? photoRatio.height * 10 : (size === 'A5' ? 210 : (size === 'A6' ? 148 : 297));
    return { width: `${w}mm`, height: `${h}mm` };
  };

  const handleApplyCrop = async () => {
    if (!image || !croppedAreaPixels) return;
    const toastId = toast.loading('Applying requirements...');
    try {
      const croppedImg = await generatePassportSnippet(
        image, 
        croppedAreaPixels, 
        rotation, 
        bgColor, 
        brightness, 
        contrast, 
        dpi, 
        photoRatio.width * 10, 
        photoRatio.height * 10
      );
      setFinalPhoto(croppedImg);
      toast.success('Requirements applied!', { id: toastId });
    } catch { 
      toast.error('Failed to apply edits'); 
    }
  };

  const downloadPDF = async () => {
    if (!image || !croppedAreaPixels) return;
    setIsGenerating(true);
    const toastId = toast.loading('Generating HD PDF...');
    try {
      const croppedImg = finalPhoto || await generatePassportSnippet(
        image, croppedAreaPixels, rotation, bgColor, brightness, contrast, dpi, photoRatio.width * 10, photoRatio.height * 10
      );
      const pdf = new jsPDF({ 
        orientation: 'p', 
        unit: 'mm', 
        format: paperSize === 'single' ? [photoRatio.width * 10, photoRatio.height * 10] : paperSize 
      });
      
      const photoWidth = photoRatio.width * 10;
      const photoHeight = photoRatio.height * 10;
      
      if (paperSize === 'single') { 
        pdf.addImage(croppedImg, 'JPEG', 0, 0, photoWidth, photoHeight); 
      } else {
        const cols = Math.floor(pdf.internal.pageSize.getWidth() / (photoWidth + spacing));
        const rows = Math.floor(pdf.internal.pageSize.getHeight() / (photoHeight + spacing));
        let count = 0;
        for (let r = 0; r < rows && count < copies; r++) {
          for (let c = 0; c < cols && count < copies; c++) {
            pdf.addImage(
              croppedImg, 
              'JPEG', 
              c * (photoWidth + spacing), 
              r * (photoHeight + spacing), 
              photoWidth, 
              photoHeight
            );
            count++;
          }
        }
      }
      pdf.save(`passport_photo_${Date.now()}.pdf`);
      toast.success('Document ready!', { id: toastId });
    } catch { 
      toast.error('PDF generation failed'); 
    } finally { 
      setIsGenerating(false); 
    }
  };

  const handlePrint = async () => {
    if (!image || !croppedAreaPixels) return;
    setIsPrinting(true);
    try {
      const imgToUse = finalPhoto || await generatePassportSnippet(
        image, croppedAreaPixels, rotation, bgColor, brightness, contrast, dpi, photoRatio.width * 10, photoRatio.height * 10
      );
      setPrintImage(imgToUse);
      setTimeout(() => { 
        window.print(); 
        setIsPrinting(false); 
      }, 800);
    } catch { 
      setIsPrinting(false); 
    }
  };

  return (
    <div className="container mx-auto px-6 py-12 pt-16 max-w-[1400px] relative min-h-screen">
      <style>{`
        @page { margin: 0; size: auto; }
        @media print { 
          body { margin: 0; padding: 0; overflow: visible !important; } 
          nav, footer, .no-print, header, aside { display: none !important; } 
          .print-sheet { 
            display: block !important; 
            position: fixed; 
            left: 0; 
            top: 0; 
            width: 100%; 
            height: 100%; 
            padding: 0; 
            margin: 0; 
            background: white; 
            z-index: 99999; 
          } 
        } 
        .print-sheet { display: none; }
        
        .saas-card {
          background: rgba(23, 23, 26, 0.4);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.05);
          box-shadow: 0 4px 24px -1px rgba(0, 0, 0, 0.2);
        }

        .saas-input {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          transition: all 0.2s cubic-bezier(0, 0, 0.2, 1);
        }

        .saas-input:focus {
          border-color: rgba(99, 102, 241, 0.5);
          background: rgba(255, 255, 255, 0.05);
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
        }

        input[type="range"] {
          -webkit-appearance: none;
          background: transparent;
        }

        input[type="range"]::-webkit-slider-runnable-track {
          width: 100%;
          height: 4px;
          background: rgba(255, 255, 255, 0.08);
          border-radius: 2px;
        }

        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          height: 12px;
          width: 12px;
          border-radius: 50%;
          background: #6366f1;
          margin-top: -4px;
          cursor: pointer;
          box-shadow: 0 0 10px rgba(99, 102, 241, 0.4);
        }
      `}</style>
      
      

      {/* Compact SaaS Header */}
      

      <div className="no-print space-y-20 pb-20">
        {/* Section 01: Edit & Specifications */}
        <section className="space-y-8">
           <div className="flex items-center gap-3 px-1">
              <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-[10px] font-bold text-white">01</div>
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Edit & Enhance Suite</h2>
              <div className="h-px bg-slate-800/50 flex-1 ml-4"></div>
           </div>

           <div className="flex flex-col gap-10">
              {/* Entire Display: Editor Workspace */}
              <div className="w-full">
                <AnimatePresence mode="wait">
                  {!image ? (
                    <motion.div key="uploader" exit={{ opacity: 0 }} className="w-full max-w-2xl mx-auto">
                      <div {...getRootProps()} className="relative rounded-[2.5rem] border-2 border-dashed h-[300px] flex flex-col items-center justify-center border-slate-800 bg-slate-900/40 hover:border-slate-700 cursor-pointer transition-all">
                        <input {...getInputProps()} />
                        <Upload className="w-10 h-10 text-indigo-400 mb-4" />
                        <h3 className="text-xl font-semibold text-white">Drop Portrait Here</h3>
                        <p className="text-slate-500 text-[11px] uppercase tracking-[0.2em] mt-2">Professional RAW / PNG / JPG Engine</p>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div key="editor" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
                      <div className="flex items-center justify-center gap-6">
                        <Button variant={showFaceGuide ? 'primary' : 'outline'} size="sm" onClick={() => dispatch(toggleFaceGuide())} className="h-9 text-[11px] uppercase font-bold tracking-[0.15em] px-6 border-slate-800">
                           {showFaceGuide ? <Eye className="w-3.5 h-3.5 mr-2" /> : <EyeOff className="w-3.5 h-3.5 mr-2" />}
                           Face Guide
                        </Button>
                        <div className="w-px h-6 bg-slate-800"></div>
                        <Button variant="ghost" size="sm" onClick={clearImage} className="h-9 text-[11px] uppercase font-bold tracking-[0.15em] text-rose-500 hover:bg-rose-500/10">Reset Session</Button>
                      </div>

                      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-start">
                         {/* Large Panoramic Workspace */}
                         <div className="xl:col-span-8">
                            <Card className="aspect-[4/3] w-full p-0 overflow-hidden relative bg-black rounded-[3rem] border border-white/5 saas-card group shadow-2xl">
                              <div className="w-full h-full relative" style={{ backgroundColor: bgColor }}>
                                <Cropper 
                                  image={image} crop={crop} zoom={zoom} rotation={rotation} aspect={photoRatio.width / photoRatio.height} 
                                  onCropChange={c => dispatch(setCrop(c))} onZoomChange={z => dispatch(setZoom(z))} onRotationChange={r => dispatch(setRotation(r))} onCropComplete={onCropComplete} 
                                  style={{ containerStyle: { background: 'transparent' }, mediaStyle: { filter: `brightness(${brightness}%) contrast(${contrast}%)` }, cropAreaStyle: { border: '1px solid white', boxShadow: '0 0 0 9999px rgba(0,0,0,0.6)' } }} 
                                />
                                {showFaceGuide && (
                                  <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
                                    <svg className="w-full h-full p-16" viewBox="0 0 100 100" preserveAspectRatio="none">
                                      <ellipse cx="50" cy="45" rx="16" ry="24" fill="none" stroke="white" strokeWidth="0.08" strokeDasharray="1,1" className="opacity-40" />
                                      <line x1="50" y1="0" x2="50" y2="100" stroke="white" strokeWidth="0.04" className="opacity-20" />
                                      <line x1="0" y1="42" x2="100" y2="42" stroke="white" strokeWidth="0.04" className="opacity-20" />
                                    </svg>
                                  </div>
                                )}
                              </div>
                              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 p-2 bg-black/60 backdrop-blur-2xl rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 border border-white/10 shadow-2xl">
                                <button onClick={() => dispatch(setRotation(rotation - 90))} className="p-3 text-white/50 hover:text-white transition-colors hover:bg-white/5 rounded-xl"><RotateCcw className="w-5 h-5" /></button>
                                <div className="w-px h-6 bg-white/10"></div>
                                <div className="flex items-center gap-2 px-2">
                                   <button onClick={() => dispatch(setZoom(Math.max(1, zoom - 0.1)))} className="p-2 text-white/50 hover:text-white"><Minus className="w-4 h-4" /></button>
                                   <div className="text-[14px] font-bold text-white w-12 text-center tabular-nums">{zoom.toFixed(1)}x</div>
                                   <button onClick={() => dispatch(setZoom(Math.min(4, zoom + 0.1)))} className="p-2 text-white/50 hover:text-white"><Plus className="w-4 h-4" /></button>
                                </div>
                                <div className="w-px h-6 bg-white/10"></div>
                                <button onClick={() => dispatch(setRotation(rotation + 90))} className="p-3 text-white/50 hover:text-white transition-colors hover:bg-white/5 rounded-xl"><RotateCw className="w-5 h-5" /></button>
                              </div>
                            </Card>
                         </div>

                         {/* Control Dashboard */}
                         <div className="xl:col-span-4 space-y-6">
                            <Card className="p-8 saas-card space-y-8 rounded-[2.5rem] border border-white/5 shadow-xl">
                               <div className="flex items-center gap-2 text-indigo-400 font-bold text-[10px] uppercase tracking-widest"><Sun className="w-4 h-4" /> STUDIO CALIBRATION</div>
                               <div className="space-y-6">
                                  <div className="space-y-3">
                                    <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider">Exposure: {brightness}%</div>
                                    <input type="range" min="50" max="150" value={brightness} onChange={e => dispatch(setAdjustment({ type: 'brightness', value: Number(e.target.value) }))} className="w-full" />
                                  </div>
                                  <div className="space-y-3">
                                    <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider">Contrast: {contrast}%</div>
                                    <input type="range" min="50" max="150" value={contrast} onChange={e => dispatch(setAdjustment({ type: 'contrast', value: Number(e.target.value) }))} className="w-full" />
                                  </div>
                                  <div className="pt-2">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase block mb-4 tracking-wider">Chroma Profile</span>
                                    <div className="flex flex-wrap gap-3">
                                      {presets.map(p => (
                                        <button 
                                          key={p.color} onClick={() => dispatch(setBgColor(p.color))} 
                                          className={`w-9 h-9 rounded-xl border-2 transition-all ${bgColor === p.color ? 'border-indigo-500 scale-110 shadow-lg shadow-indigo-500/30' : 'border-slate-800 hover:border-slate-700'}`} 
                                          style={{ backgroundColor: p.color }}
                                        />
                                      ))}
                                      <div className="w-9 h-9 rounded-xl border-2 border-slate-800 bg-slate-900 flex items-center justify-center relative overflow-hidden">
                                        <input type="color" value={bgColor} onChange={(e) => dispatch(setBgColor(e.target.value))} className="absolute inset-0 opacity-0 cursor-pointer" />
                                        <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-rose-400 via-indigo-500 to-emerald-400 scale-125"></div>
                                      </div>
                                    </div>
                                  </div>
                               </div>
                               <div className="pt-6 border-t border-slate-800/50 space-y-4">
                                  <Button variant="outline" className="w-full h-12 border-slate-800 text-[11px] font-bold uppercase tracking-widest" onClick={handleRemoveBG} isLoading={isRemovingBG} leftIcon={<Sparkles className="w-4 h-4" />}>AI Background Clean</Button>
                                  <Button className="w-full h-16 bg-indigo-500 hover:bg-indigo-600 font-bold uppercase tracking-[0.2em] shadow-2xl shadow-indigo-500/20" onClick={handleApplyCrop} leftIcon={<Check className="w-5 h-5" />}>Process Assets</Button>
                               </div>
                            </Card>
                         </div>
                      </div>

                      <div className="space-y-8">
                         <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {countries.map(c => (
                              <button 
                                key={c.name} onClick={() => dispatch(setPhotoRatio({ width: c.width, height: c.height, presetName: c.name }))}
                                className={`p-4 rounded-2xl border text-left flex flex-col transition-all relative overflow-hidden group min-h-[80px] ${selectedPreset === c.name ? 'border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-500/10' : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'}`}
                              >
                                <span className={`text-[12px] font-bold tracking-tight mb-1 ${selectedPreset === c.name ? 'text-indigo-400' : 'text-slate-100'}`}>{c.name}</span>
                                <span className="text-[10px] text-slate-500 uppercase tracking-wider">{c.label}</span>
                                {selectedPreset === c.name && <div className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,1)]"></div>}
                              </button>
                            ))}
                            <Card className="p-4 bg-slate-900/20 border-slate-800 rounded-2xl flex items-center justify-between col-span-2">
                               <div className="flex flex-col">
                                 <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none mb-1">Custom Resolution</span>
                                 <span className="text-[9px] text-slate-600 font-medium">{dpi} DPI Rendering Profile</span>
                               </div>
                               <div className="flex items-center gap-4 flex-1 max-w-[180px] ml-6 pt-1">
                                  <input type="range" min="150" max="600" step="50" value={dpi} onChange={e => dispatch(setDPI(Number(e.target.value)))} className="flex-1" />
                               </div>
                            </Card>
                         </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
           </div>
        </section>

        {/* Section 02: Layout & Print */}
        <section className={`space-y-8 transition-all duration-700 ${!finalPhoto ? 'opacity-20 pointer-events-none grayscale' : ''}`}>
           <div className="flex items-center gap-3 px-1">
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-400">02</div>
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Layout & Generation Suite</h2>
              <div className="h-px bg-slate-800/50 flex-1 ml-4"></div>
           </div>

           <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
              {/* Preview Master Proof */}
              <div className="xl:col-span-8 flex flex-col items-center">
                 <Card className="p-16 bg-[#080809] border border-white/5 shadow-2xl relative overflow-hidden flex items-center justify-center rounded-[3rem] w-full min-h-[480px]">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent"></div>
                    <motion.div initial={false} animate={{ scale: finalPhoto ? 1 : 0.95 }} className="relative z-10">
                      <div className="bg-white shadow-[0_30px_100px_rgba(0,0,0,0.7)]" style={{ width: pagePx.w, height: pagePx.h }}>
                         <div style={{ display: 'flex', flexWrap: 'wrap', gap: `${spacing * previewScale}mm` }}>
                            {Array.from({ length: copies }).map((_, i) => (
                              <div key={i} style={{ width: `${photoRatio.width * 10 * previewScale}mm`, height: `${photoRatio.height * 10 * previewScale}mm`, backgroundColor: bgColor }}>
                                 {finalPhoto && <img src={finalPhoto} className="w-full h-full object-cover" />}
                              </div>
                            ))}
                         </div>
                      </div>
                    </motion.div>
                    {!finalPhoto && <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-20 text-[10px] font-bold text-slate-600 uppercase tracking-[0.4em]">Awaiting Processed Asset</div>}
                 </Card>
              </div>

              {/* Print Side Settings */}
              <div className="xl:col-span-4">
                 {finalPhoto && (
                   <Card className="p-8 saas-card space-y-8 rounded-3xl">
                      <div className="space-y-6">
                        <div className="p-1 bg-slate-950/80 rounded-xl flex gap-1 border border-white/5">
                           {['A4', 'A5', 'A6', 'single'].map(sz => (
                             <button key={sz} onClick={() => dispatch(setPaperSize(sz as any))} className={`flex-1 py-2 text-[10px] font-bold uppercase rounded-lg ${paperSize === sz ? 'bg-indigo-500 text-white shadow-xl shadow-indigo-500/10' : 'text-slate-600 hover:text-slate-400'}`}>{sz}</button>
                           ))}
                        </div>
                        <div className="space-y-5">
                           <div className="space-y-4">
                              <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest">Multi-Copies: {copies}x</div>
                              <input type="range" min="1" max="50" value={copies} onChange={e => dispatch(setCopies(Number(e.target.value)))} className="w-full" />
                           </div>
                           <div className="space-y-4">
                              <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest">Offset Gap: {spacing}mm</div>
                              <input type="range" min="0" max="10" value={spacing} onChange={e => dispatch(setSpacing(Number(e.target.value)))} className="w-full" />
                           </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 pt-6 border-t border-slate-800/40">
                         <Button onClick={handlePrint} className="h-14 bg-white text-black font-bold uppercase tracking-[0.15em] hover:bg-slate-200" leftIcon={<Printer className="w-5 h-5" />}>Print</Button>
                         <Button variant="outline" onClick={downloadPDF} className="h-14 border-slate-800 text-slate-400 font-bold uppercase tracking-[0.15em] hover:text-white hover:bg-slate-800" leftIcon={<Download className="w-5 h-5" />}>Save PDF</Button>
                      </div>
                   </Card>
                 )}
              </div>
           </div>
        </section>
      </div>
    </div>
  );
};
