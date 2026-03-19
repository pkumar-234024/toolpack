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
  ZoomIn, Sun, Grid, Sparkles, 
  RotateCw, Eye, EyeOff, Check, Settings, Layout as LayoutIcon,
  Maximize, Upload, ShieldCheck, Zap, Info, Save, Printer, Trash2, RotateCcw, Download
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
    paperSize, spacing, photoRatio, copies, bgColor, showFaceGuide, dpi 
  } = useSelector((state: RootState) => state.passport);
  
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isRemovingBG, setIsRemovingBG] = useState(false);
  const [printImage, setPrintImage] = useState<string | null>(null);
  const [finalPhoto, setFinalPhoto] = useState<string | null>(null);
  const [isHoveringDropzone, setIsHoveringDropzone] = useState(false);

  // Recalculate pixels for display/info
  const calcPix = useMemo(() => ({
    w: Math.round((photoRatio.width * 10 / 25.4) * dpi),
    h: Math.round((photoRatio.height * 10 / 25.4) * dpi)
  }), [photoRatio.width, photoRatio.height, dpi]);

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
    { name: 'India (Visa)', width: 5.1, height: 5.1, label: '2x2 inch / 51 mm' },
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
    <div className="container mx-auto px-6 py-8 pt-10 max-w-7xl relative min-h-screen">
      <style>{`
        @media print { 
          @page { margin: 0; size: auto; } 
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
        
        .face-guide-overlay {
          background: radial-gradient(ellipse 55% 75% at 50% 45%, transparent 100%, rgba(0,0,0,0.1) 100%);
        }
      `}</style>
      
      {/* Print Layer */}
      {printImage && (
        <div className="print-sheet" style={getPageDimensions(paperSize)}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: `${spacing}mm` }}>
            {Array.from({ length: copies }).map((_, i) => (
              <div key={i} style={{ 
                width: `${photoRatio.width * 10}mm`, 
                height: `${photoRatio.height * 10}mm`, 
                backgroundColor: bgColor,
                overflow: 'hidden'
              }}>
                <img src={printImage} alt="Passport" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="no-print mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            Passport Studio <span className="bg-brand-primary text-white text-[10px] px-2 py-0.5 rounded-full uppercase tracking-tighter">Gold Edition</span>
          </h1>
          <p className="text-slate-500 text-xs font-medium max-w-md mt-1">
            Studio-grade passport & visa photo generation. Compliant with international standards.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex flex-col items-end mr-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">System Status</span>
            <span className="text-[10px] font-bold text-green-500 flex items-center gap-1"><Zap className="w-2 h-2 fill-current" /> ALL SYSTEMS NORMAL</span>
          </div>
          <Button variant="ghost" className="hover:bg-slate-100 dark:hover:bg-slate-800">
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 no-print pb-20">
        {/* Left Column: Input & Editor */}
        <div className="lg:col-span-12 xl:col-span-8 space-y-8">
          
          <AnimatePresence mode="wait">
            {!image ? (
              <motion.div
                key="dropzone"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full"
              >
                <div 
                  {...getRootProps()} 
                  className={`relative group cursor-pointer transition-all duration-300 rounded-3xl overflow-hidden border-2 border-dashed 
                    ${isDragActive ? 'border-brand-primary bg-brand-primary/5' : 'border-slate-200 hover:border-brand-primary/50 bg-white dark:bg-slate-900'}
                  `}
                  onMouseEnter={() => setIsHoveringDropzone(true)}
                  onMouseLeave={() => setIsHoveringDropzone(false)}
                >
                  <input {...getInputProps()} />
                  <div className="aspect-[21/9] flex flex-col items-center justify-center p-12 text-center">
                    <div className="relative mb-6">
                      <div className="w-20 h-20 bg-brand-primary/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                        <Upload className="w-8 h-8 text-brand-primary" />
                      </div>
                      <motion.div 
                        animate={isHoveringDropzone ? { scale: [1, 1.2, 1] } : {}}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 border-4 border-white dark:border-slate-900 rounded-full flex items-center justify-center"
                      >
                        <Check className="w-3 h-3 text-white" strokeWidth={4} />
                      </motion.div>
                    </div>
                    
                    <h2 className="text-2xl font-black mb-2 text-slate-800 dark:text-white">Upload Your Photograph</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xs mx-auto mb-8 font-medium">
                      Drag and drop here, or click to browse. Supports JPG, PNG, WEBP.
                    </p>
                    
                    <div className="flex flex-wrap items-center justify-center gap-3">
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-[10px] font-bold text-slate-500 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        <ShieldCheck className="w-3.5 h-3.5" /> SECURE PROCESSING
                      </div>
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-[10px] font-bold text-slate-500 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        <Maximize className="w-3.5 h-3.5" /> HD QUALITY
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { title: 'Good Lighting', desc: 'Face should be clearly visible', icon: <Sun className="w-4 h-4" /> },
                    { title: 'Front View', desc: 'Look directly at the camera', icon: <Eye className="w-4 h-4" /> },
                    { title: 'Plain Background', desc: 'Simple backgrounds work best', icon: <Grid className="w-4 h-4" /> }
                  ].map((tip, i) => (
                    <Card key={i} className="p-4 flex items-start gap-3 bg-transparent border-slate-100 dark:border-slate-800">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400">
                        {tip.icon}
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-slate-800 dark:text-white">{tip.title}</h4>
                        <p className="text-[10px] text-slate-500 font-medium">{tip.desc}</p>
                      </div>
                    </Card>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="editor"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className="px-3 py-1 bg-brand-primary text-white text-[10px] font-black rounded-md flex items-center gap-2">
                       <Sparkles className="w-3 h-3" /> STEP 1: STUDIO ADJUSTMENT
                    </div>
                    <Button variant="ghost" size="sm" onClick={clearImage} className="text-xs text-red-500 font-bold hover:bg-red-50">
                      <Trash2 className="w-3 h-3 mr-1" /> START OVER
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant={showFaceGuide ? 'primary' : 'outline'} 
                      size="sm" 
                      onClick={() => dispatch(toggleFaceGuide())}
                      className="text-[10px] font-black h-8"
                    >
                      {showFaceGuide ? <Eye className="w-3.5 h-3.5 mr-1" /> : <EyeOff className="w-3.5 h-3.5 mr-1" />}
                      {showFaceGuide ? 'HIDE GUIDE' : 'SHOW GUIDE'}
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  <div className="lg:col-span-7 xl:col-span-8">
                    <Card className="aspect-[4/3] w-full flex items-center justify-center p-0 overflow-hidden relative group bg-slate-100 dark:bg-slate-800/50 shadow-2xl border-none">
                      <div className="absolute inset-0 z-0">
                         {/* Studio Light Effect */}
                         <div className="absolute top-0 left-1/4 w-1/2 h-full bg-white/5 skew-x-12 pointer-events-none blur-3xl opacity-20"></div>
                      </div>
                      
                      <div className="w-full h-full relative" style={{ backgroundColor: bgColor }}>
                        <Cropper 
                          image={image} 
                          crop={crop} 
                          zoom={zoom} 
                          rotation={rotation} 
                          aspect={photoRatio.width / photoRatio.height} 
                          onCropChange={(c) => dispatch(setCrop(c))} 
                          onZoomChange={(z) => dispatch(setZoom(z))} 
                          onRotationChange={(r) => dispatch(setRotation(r))} 
                          onCropComplete={onCropComplete} 
                          style={{ 
                            containerStyle: { background: 'transparent' },
                            cropAreaStyle: { border: '2px solid var(--color-brand-primary)', boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.7)' }
                          }} 
                        />
                        
                        {showFaceGuide && (
                          <div className="absolute inset-0 pointer-events-none z-10">
                            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                              {/* Head Outline */}
                              <ellipse cx="50" cy="45" rx="18" ry="25" fill="none" stroke="var(--color-brand-primary)" strokeWidth="0.5" strokeDasharray="2,2" className="opacity-60" />
                              {/* Eye Line */}
                              <line x1="20" y1="42" x2="80" y2="42" stroke="var(--color-brand-primary)" strokeWidth="0.2" strokeDasharray="3,1" className="opacity-40" />
                              {/* Vertical Center */}
                              <line x1="50" y1="10" x2="50" y2="90" stroke="var(--color-brand-primary)" strokeWidth="0.2" strokeDasharray="3,1" className="opacity-40" />
                              {/* Chin Line */}
                              <line x1="32" y1="70" x2="68" y2="70" stroke="var(--color-brand-primary)" strokeWidth="0.5" className="opacity-60" />
                            </svg>
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/50 text-white text-[8px] font-bold rounded-full backdrop-blur-md">
                              ALIGN FACE WITH OVERLAY
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Floating Control Bar for Quick Edits */}
                      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 p-1.5 bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                         <button onClick={() => dispatch(setRotation(rotation - 90))} className="p-2 text-white hover:bg-white/20 rounded-xl transition-colors"><RotateCcw className="w-4 h-4" /></button>
                         <div className="w-[1px] h-4 bg-white/10 mx-1"></div>
                         <button onClick={() => dispatch(setZoom(zoom - 0.1))} className="p-2 text-white hover:bg-white/20 rounded-xl transition-colors"><Trash2 className="w-4 h-4 rotate-45" /></button> {/* Placeholder for ZoomOut icon if needed */}
                         <button onClick={() => dispatch(setZoom(zoom + 0.1))} className="p-2 text-white hover:bg-white/20 rounded-xl transition-colors"><ZoomIn className="w-4 h-4" /></button>
                         <div className="w-[1px] h-4 bg-white/10 mx-1"></div>
                         <button onClick={() => dispatch(setRotation(rotation + 90))} className="p-2 text-white hover:bg-white/20 rounded-xl transition-colors"><RotateCw className="w-4 h-4" /></button>
                      </div>
                    </Card>
                  </div>

                  {/* Settings Sidebar for the Editor */}
                  <div className="lg:col-span-5 xl:col-span-4 space-y-4">
                    <Card className="p-5 space-y-6 bg-white dark:bg-slate-900 border-none shadow-xl">
                      <div>
                        <h3 className="text-xs font-black uppercase text-slate-400 mb-4 flex items-center gap-2">
                          <Settings className="w-3.5 h-3.5" /> Dimensions Setting
                        </h3>
                        <div className="grid grid-cols-2 gap-2 mb-4">
                          {countries.map(c => (
                            <button 
                              key={c.name} 
                              onClick={() => dispatch(setPhotoRatio({ width: c.width, height: c.height }))} 
                              className={`py-3 px-2 rounded-xl border text-[10px] font-bold text-center transition-all 
                              ${photoRatio.width === c.width ? 'bg-slate-900 border-slate-900 text-white dark:bg-brand-primary dark:border-brand-primary' : 'border-slate-100 hover:border-slate-300 text-slate-500'}`}
                            >
                              {c.name}
                            </button>
                          ))}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 pt-2">
                           <div className="space-y-1.5">
                              <label className="text-[10px] font-black uppercase text-slate-400">Width (mm)</label>
                              <input 
                                type="number" 
                                value={Math.round(photoRatio.width * 10)} 
                                onChange={(e) => dispatch(setPhotoRatio({ ...photoRatio, width: Number(e.target.value) / 10 }))}
                                className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-xs font-black" 
                              />
                           </div>
                           <div className="space-y-1.5">
                              <label className="text-[10px] font-black uppercase text-slate-400">Height (mm)</label>
                              <input 
                                type="number" 
                                value={Math.round(photoRatio.height * 10)} 
                                onChange={(e) => dispatch(setPhotoRatio({ ...photoRatio, height: Number(e.target.value) / 10 }))}
                                className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-xs font-black" 
                              />
                           </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-50 dark:border-slate-800">
                        <h3 className="text-xs font-black uppercase text-slate-400 mb-4 flex items-center gap-2">
                          <Sparkles className="w-3.5 h-3.5" /> Background & Retouch
                        </h3>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {presets.map(p => (
                            <button 
                              key={p.color} 
                              onClick={() => dispatch(setBgColor(p.color))} 
                              className={`w-10 h-10 rounded-xl border-4 transition-all hover:scale-105 ${bgColor === p.color ? 'border-brand-primary shadow-lg' : 'border-slate-100'}`} 
                              style={{ backgroundColor: p.color }}
                            >
                              {bgColor === p.color && <Check className={`w-4 h-4 mx-auto ${p.color === '#ffffff' ? 'text-black' : 'text-white'}`} />}
                            </button>
                          ))}
                          <div className="relative group">
                            <input 
                              type="color" 
                              value={bgColor} 
                              onChange={(e) => dispatch(setBgColor(e.target.value))} 
                              className="w-10 h-10 rounded-xl border-4 border-slate-100 overflow-hidden cursor-pointer" 
                            />
                             <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                               <Check className="w-3 h-3 text-slate-400" />
                             </div>
                          </div>
                        </div>
                        
                        <Button 
                          variant="outline" 
                          className="w-full h-11 text-xs font-black border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800" 
                          onClick={handleRemoveBG} 
                          isLoading={isRemovingBG}
                          leftIcon={<Sparkles className="w-4 h-4 text-brand-primary" />}
                        >
                          AI BACKGROUND REMOVAL
                        </Button>

                        <div className="grid grid-cols-1 gap-4 pt-4">
                          <div className="space-y-2">
                            <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-400">
                              <span>Brightness</span>
                              <span className="text-brand-primary">{brightness}%</span>
                            </div>
                            <input 
                              type="range" min="50" max="150" value={brightness} 
                              onChange={(e) => dispatch(setAdjustment({ type: 'brightness', value: Number(e.target.value) }))} 
                              className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg accent-brand-primary" 
                            />
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-400">
                              <span>Contrast</span>
                              <span className="text-brand-primary">{contrast}%</span>
                            </div>
                            <input 
                              type="range" min="50" max="150" value={contrast} 
                              onChange={(e) => dispatch(setAdjustment({ type: 'contrast', value: Number(e.target.value) }))} 
                              className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg accent-brand-primary" 
                            />
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 space-y-4">
                         <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-slate-400 uppercase">Input DPI</span>
                            <span className="text-[10px] font-black text-brand-primary">{dpi} DPI</span>
                         </div>
                         <input 
                           type="range" 
                           min="150" 
                           max="600" 
                           step="50" 
                           value={dpi} 
                           onChange={(e) => dispatch(setDPI(Number(e.target.value)))} 
                           className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg accent-brand-primary" 
                         />
                         <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 italic">
                            <span>Standard</span>
                            <span>Ultra HD</span>
                         </div>
                      </div>

                      <div className="pt-2">
                        <Button onClick={handleApplyCrop} className="w-full h-12 text-sm font-black shadow-lg shadow-brand-primary/20" leftIcon={<Save className="w-5 h-5" />}>
                           GENERATE STUDIO PHOTO
                        </Button>
                      </div>
                    </Card>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Column (Sidebar for Preview and Layout) */}
        <div className="lg:col-span-12 xl:col-span-4 space-y-6">
          <AnimatePresence>
            {image && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                {/* STEP 2: PREVIEW & LAYOUT */}
                <div className="space-y-4">
                   <div className="flex items-center justify-between">
                     <h2 className="text-xs font-black uppercase text-slate-400 flex items-center gap-2">
                       <LayoutIcon className="w-3.5 h-3.5" /> STEP 2: SHEET LAYOUT
                     </h2>
                     <div className="text-[10px] font-bold text-slate-400 px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded uppercase">Live Preview</div>
                   </div>
                   
                   <Card className="p-6 bg-slate-900 border-none shadow-2xl relative overflow-hidden group">
                      <div className="absolute inset-0 z-0 bg-gradient-to-br from-slate-800 to-black opacity-50"></div>
                      
                      {/* Interactive Preview Container */}
                      <div className="relative z-10 flex items-center justify-center min-h-[300px]">
                        <div 
                          className="bg-white shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-transform duration-500 group-hover:scale-[1.02]" 
                          style={{ 
                            width: pagePx.w, 
                            height: pagePx.h,
                            padding: '0'
                          }}
                        >
                          <div style={{ 
                            display: 'flex', 
                            flexWrap: 'wrap', 
                            gap: `${spacing * previewScale}mm`, 
                            padding: '0' 
                          }}>
                            {Array.from({ length: copies }).map((_, i) => (
                              <div key={i} style={{ 
                                width: `${photoRatio.width * 10 * previewScale}mm`, 
                                height: `${photoRatio.height * 10 * previewScale}mm`, 
                                backgroundColor: bgColor,
                                position: 'relative'
                              }}>
                                {finalPhoto ? (
                                  <img src={finalPhoto} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full border border-slate-100 flex items-center justify-center">
                                    <div className="text-[6px] font-black text-slate-200">#{i+1}</div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        {!finalPhoto && (
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="bg-brand-primary/90 text-white text-[10px] font-black px-4 py-2 rounded-full backdrop-blur-md flex items-center gap-2 animate-bounce">
                               <Info className="w-3 h-3" /> APPLY EDITS TO PREVIEW
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="absolute bottom-4 right-4 z-10">
                        <div className="px-3 py-1.5 bg-brand-primary text-white text-[10px] font-black rounded-lg shadow-lg">
                          {paperSize.toUpperCase()} SHEET
                        </div>
                      </div>
                   </Card>

                   <Card className="p-5 space-y-6 bg-white dark:bg-slate-900 border-none shadow-xl">
                      <div className="space-y-4">
                        <div className="grid grid-cols-4 gap-2">
                           {['A4', 'A5', 'A6', 'single'].map(size => (
                             <button 
                               key={size} 
                               onClick={() => dispatch(setPaperSize(size as any))} 
                               className={`py-2 rounded-xl border text-[10px] font-black transition-all 
                               ${paperSize === size ? 'bg-slate-900 text-white border-slate-900' : 'border-slate-100 hover:border-slate-300 text-slate-500'}`}
                             >
                               {size.toUpperCase()}
                             </button>
                           ))}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 pt-2">
                          <div className="space-y-2">
                             <div className="flex justify-between items-center">
                               <span className="text-[10px] font-black text-slate-400 uppercase">Copies</span>
                               <span className="text-[10px] font-black text-slate-900 dark:text-white px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">{copies}</span>
                             </div>
                             <input 
                               type="range" 
                               min="1" 
                               max="50" 
                               value={copies} 
                               onChange={(e) => dispatch(setCopies(Number(e.target.value)))} 
                               className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg accent-brand-primary" 
                             />
                          </div>
                          <div className="space-y-2">
                             <div className="flex justify-between items-center">
                               <span className="text-[10px] font-black text-slate-400 uppercase">Gap (mm)</span>
                               <span className="text-[10px] font-black text-slate-900 dark:text-white px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">{spacing}</span>
                             </div>
                             <input 
                               type="range" 
                               min="0" 
                               max="10" 
                               value={spacing} 
                               onChange={(e) => dispatch(setSpacing(Number(e.target.value)))} 
                               className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg accent-brand-primary" 
                             />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-4 border-t border-slate-50 dark:border-slate-800">
                        <Button 
                          size="lg" 
                          className="w-full font-black text-sm h-14" 
                          onClick={handlePrint} 
                          disabled={isPrinting || !finalPhoto} 
                          leftIcon={<Printer className="w-5 h-5" />}
                        >
                          PRINT NOW
                        </Button>
                        <Button 
                          size="lg" 
                          variant="secondary"
                          className="w-full font-black text-sm h-14 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white hover:bg-slate-200" 
                          onClick={downloadPDF} 
                          disabled={isGenerating || !finalPhoto} 
                          leftIcon={<Download className="w-5 h-5" />}
                        >
                          EXPORT PDF
                        </Button>
                      </div>
                      
                      {!finalPhoto && (
                        <div className="flex items-center gap-2 p-3 bg-brand-primary/5 rounded-xl border border-brand-primary/20">
                           <Info className="w-4 h-4 text-brand-primary" />
                           <p className="text-[10px] font-bold text-brand-primary uppercase">Click "Generate Studio Photo" to enable print/export</p>
                        </div>
                      )}
                   </Card>
                   
                   <Card className="p-4 bg-slate-50 dark:bg-slate-800/30 border-none">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                          <Check className="w-5 h-5 text-green-500" />
                        </div>
                        <div>
                          <h4 className="text-[11px] font-black text-slate-800 dark:text-white uppercase tracking-tight">Requirement Validated</h4>
                          <p className="text-[10px] text-slate-500 font-medium">Output: {calcPix.w}x{calcPix.h} pixels @ {dpi}dpi</p>
                        </div>
                      </div>
                   </Card>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
