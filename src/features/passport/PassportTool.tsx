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
  Sun, Grid, Sparkles, 
  RotateCw, Eye, EyeOff, Check, Settings, Layout as LayoutIcon,
  Maximize, Upload, ShieldCheck, Zap, Save, Printer, Trash2, RotateCcw, Download,
  Minus, Plus
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

      {/* Compact SaaS Header */}
      <div className="no-print mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
             <LayoutIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-white flex items-center gap-2">
              Passport Studio <span className="text-[10px] font-medium text-slate-500 bg-slate-800/50 px-2 py-0.5 rounded uppercase tracking-wider">v2.4.0</span>
            </h1>
            <p className="text-[11px] text-slate-500 font-medium">Professional grade identity photo generation</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end pr-3 border-r border-slate-800">
            <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest leading-none mb-1">Status</span>
            <span className="text-[10px] font-semibold text-green-500 flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> OPERATIONAL</span>
          </div>
          <Button variant="outline" className="h-9 w-9 p-0 rounded-lg border-slate-800/50">
            <Settings className="w-4 h-4 text-slate-400" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 no-print pb-20">
        
        {/* Left Column: Editor & Specifications */}
        <div className="xl:col-span-8 space-y-8">
          <AnimatePresence mode="wait">
            {!image ? (
              <motion.div
                key="uploader"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="w-full max-w-xl mx-auto"
              >
                <div 
                  {...getRootProps()} 
                  className={`relative group cursor-pointer transition-all duration-300 rounded-3xl overflow-hidden border-2 border-dashed h-[260px] flex flex-col items-center justify-center
                    ${isDragActive ? 'border-indigo-500 bg-indigo-500/5 shadow-2xl shadow-indigo-500/10' : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'}
                  `}
                >
                  <input {...getInputProps()} />
                  <div className="flex flex-col items-center text-center p-6">
                    <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center mb-4 border border-indigo-500/20 group-hover:scale-110 transition-transform duration-500">
                      <Upload className="w-6 h-6 text-indigo-400" />
                    </div>
                    <h2 className="text-2xl font-semibold mb-3 text-white tracking-tight">Upload Session</h2>
                    <p className="text-slate-500 text-sm max-w-[280px] mb-8 leading-relaxed">
                      Drag and drop high-resolution source portraits or click to browse files
                    </p>
                    <div className="flex items-center gap-4 text-[10px] uppercase tracking-widest font-semibold text-slate-600">
                      <span className="flex items-center gap-1.5"><ShieldCheck className="w-3 h-3" /> Encrypted</span>
                      <div className="w-1 h-1 rounded-full bg-slate-800"></div>
                      <span className="flex items-center gap-1.5"><Maximize className="w-3 h-3" /> RAW Support</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="editor-suite"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                {/* Editor Header */}
                <div className="flex items-center justify-between saas-card px-4 py-2 rounded-xl border border-white/5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                      <Sparkles className="w-3 h-3" />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Workspace</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Button 
                      variant={showFaceGuide ? 'primary' : 'outline'} 
                      size="sm" 
                      onClick={() => dispatch(toggleFaceGuide())}
                      className="h-7 text-[10px] px-3 font-medium border-slate-800"
                    >
                      {showFaceGuide ? <Eye className="w-3 h-3 mr-2 text-indigo-400" /> : <EyeOff className="w-3 h-3 mr-2" />}
                      Guide
                    </Button>
                    <div className="w-px h-3 bg-slate-800 mx-1"></div>
                    <Button variant="ghost" size="sm" onClick={clearImage} className="h-7 text-[10px] text-slate-500 hover:text-rose-400 font-medium">
                      Reset
                    </Button>
                  </div>
                </div>

                {/* Main Cropper - Ultra Compact */}
                <Card className="aspect-square max-w-[480px] w-full p-0 overflow-hidden relative group bg-black rounded-3xl border border-white/5 saas-card mx-auto">
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
                        mediaStyle: { filter: `brightness(${brightness}%) contrast(${contrast}%)` },
                        cropAreaStyle: { border: '1px solid rgba(255, 255, 255, 0.4)', boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.7)' }
                      }} 
                    />
                    {showFaceGuide && (
                      <div className="absolute inset-0 pointer-events-none z-10">
                        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                          <ellipse cx="50" cy="45" rx="18" ry="25" fill="none" stroke="white" strokeWidth="0.05" strokeDasharray="1,1" className="opacity-30" />
                          <line x1="50" y1="0" x2="50" y2="100" stroke="white" strokeWidth="0.05" className="opacity-20" />
                          <line x1="0" y1="42" x2="100" y2="42" stroke="white" strokeWidth="0.05" className="opacity-20" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 p-1 bg-black/60 backdrop-blur-xl rounded-xl border border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <button onClick={() => dispatch(setRotation(rotation - 90))} className="p-2.5 text-slate-400 hover:text-white transition-colors"><RotateCcw className="w-4 h-4" /></button>
                    <div className="w-px h-4 bg-white/10 mx-1"></div>
                    <button onClick={() => dispatch(setZoom(Math.max(1, zoom - 0.1)))} className="p-2.5 text-slate-400 hover:text-white transition-colors"><Minus className="w-4 h-4" /></button>
                    <div className="text-[11px] font-semibold text-white w-10 text-center">{zoom.toFixed(1)}x</div>
                    <button onClick={() => dispatch(setZoom(Math.min(4, zoom + 0.1)))} className="p-2.5 text-slate-400 hover:text-white transition-colors"><Plus className="w-4 h-4" /></button>
                    <div className="w-px h-4 bg-white/10 mx-1"></div>
                    <button onClick={() => dispatch(setRotation(rotation + 90))} className="p-2.5 text-slate-400 hover:text-white transition-colors"><RotateCw className="w-4 h-4" /></button>
                  </div>
                </Card>

                {/* Left Side Specifications */}
                <div className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-2 gap-3">
                    {countries.map(c => (
                      <button 
                        key={c.name} 
                        onClick={() => dispatch(setPhotoRatio({ width: c.width, height: c.height, presetName: c.name }))} 
                        className={`px-4 py-4 rounded-2xl border text-left transition-all relative overflow-hidden group
                        ${selectedPreset === c.name 
                          ? 'bg-indigo-500/10 border-indigo-500/40 shadow-xl shadow-indigo-500/5' 
                          : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'}`}
                      >
                        <div className={`text-[12px] font-semibold mb-1 tracking-tight ${selectedPreset === c.name ? 'text-indigo-400' : 'text-slate-200'}`}>{c.name}</div>
                        <div className="text-[10px] text-slate-500 font-medium">{c.label}</div>
                        {selectedPreset === c.name && <div className="absolute top-2 right-2 w-1 h-1 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,1)]"></div>}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="saas-card p-5 rounded-2xl flex items-center justify-between group">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5 leading-none">Custom Area</span>
                          <span className="text-[10px] text-slate-600 font-medium italic">Aspect Matrix</span>
                        </div>
                        <div className="flex items-center gap-3">
                           <div className="flex flex-col items-center">
                               <input 
                                type="number" 
                                value={Math.round(photoRatio.width * 10)} 
                                onChange={(e) => dispatch(setPhotoRatio({ width: Number(e.target.value) / 10, height: photoRatio.height }))}
                                className="w-14 h-9 saas-input rounded-lg text-center text-sm font-semibold text-white focus:outline-none" 
                              />
                              <span className="text-[9px] text-slate-600 mt-1 uppercase font-bold">W</span>
                           </div>
                           <span className="text-slate-800 font-bold mb-4">×</span>
                           <div className="flex flex-col items-center">
                              <input 
                                type="number" 
                                value={Math.round(photoRatio.height * 10)} 
                                onChange={(e) => dispatch(setPhotoRatio({ width: photoRatio.width, height: Number(e.target.value) / 10 }))}
                                className="w-14 h-9 saas-input rounded-lg text-center text-sm font-semibold text-white focus:outline-none" 
                              />

                              <span className="text-[9px] text-slate-600 mt-1 uppercase font-bold">H</span>
                           </div>
                        </div>
                     </div>
                     <div className="saas-card p-5 rounded-2xl flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5 leading-none">Print DPI</span>
                          <span className="text-[10px] text-slate-600 font-medium italic">High Density</span>
                        </div>
                        <div className="flex items-center gap-4 flex-1 max-w-[160px] ml-6">
                           <input 
                             type="range" min="150" max="600" step="50" value={dpi} 
                             onChange={(e) => dispatch(setDPI(Number(e.target.value)))} 
                             className="flex-1" 
                           />
                           <span className="text-sm font-bold text-indigo-400 w-8 text-right underline decoration-indigo-500/20 underline-offset-4">{dpi}</span>
                        </div>
                     </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Column: Adjustments & Preview */}
        <div className="xl:col-span-4">
          <AnimatePresence>
            {image && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                {/* Adjustments Panel */}
                <Card className="p-6 saas-card space-y-7 border-none rounded-3xl overflow-hidden shadow-2xl">
                   <div>
                      <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-2.5">
                           <div className="w-7 h-7 bg-indigo-500/10 rounded-lg flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                             <Sun className="w-3.5 h-3.5" />
                           </div>
                           <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-300">Adjustment Suite</h3>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="space-y-4 pt-1">
                            <div className="flex justify-between items-center px-0.5">
                              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Exposure</span>
                              <span className="text-[11px] font-bold text-indigo-400/80">{brightness}%</span>
                            </div>
                            <input 
                              type="range" min="50" max="150" value={brightness} 
                              onChange={(e) => dispatch(setAdjustment({ type: 'brightness', value: Number(e.target.value) }))} 
                              className="w-full" 
                            />
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center px-0.5">
                              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Tone Contrast</span>
                              <span className="text-[11px] font-bold text-indigo-400/80">{contrast}%</span>
                            </div>
                            <input 
                              type="range" min="50" max="150" value={contrast} 
                              onChange={(e) => dispatch(setAdjustment({ type: 'contrast', value: Number(e.target.value) }))} 
                              className="w-full" 
                            />
                        </div>

                        <div className="pt-2">
                           <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 block mb-3.5">Chroma Background</span>
                           <div className="flex flex-wrap gap-2.5">
                             {presets.map(p => (
                               <button 
                                 key={p.color} 
                                 onClick={() => dispatch(setBgColor(p.color))} 
                                 className={`w-9 h-9 rounded-xl border-2 transition-all relative group
                                   ${bgColor === p.color ? 'border-indigo-500 scale-105 shadow-lg shadow-indigo-500/20' : 'border-slate-800 hover:border-slate-600'}`} 
                                 style={{ backgroundColor: p.color }}
                               >
                                 {bgColor === p.color && <div className="absolute inset-0 flex items-center justify-center"><Check className={`w-3.5 h-3.5 ${p.color === '#ffffff' ? 'text-black' : 'text-white'}`} strokeWidth={3} /></div>}
                               </button>
                             ))}
                             <div className="w-9 h-9 rounded-xl border-2 border-slate-800 bg-slate-900 flex items-center justify-center relative hover:border-slate-600 overflow-hidden">
                               <input type="color" value={bgColor} onChange={(e) => dispatch(setBgColor(e.target.value))} className="absolute inset-0 opacity-0 cursor-pointer" />
                               <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-rose-400 via-indigo-500 to-emerald-400 border border-white/20"></div>
                             </div>
                           </div>
                        </div>

                        <Button 
                          variant="outline"
                          onClick={handleRemoveBG} 
                          isLoading={isRemovingBG}
                          className="w-full h-11 text-[11px] font-bold uppercase tracking-widest border-slate-800 rounded-2xl hover:bg-slate-800/40" 
                          leftIcon={<Sparkles className="w-4 h-4 text-indigo-400" />}
                        >
                          Extract Subject (AI)
                        </Button>
                      </div>
                   </div>

                   <Button 
                     onClick={handleApplyCrop} 
                     className="w-full h-14 bg-indigo-500 hover:bg-indigo-600 text-[11px] font-bold uppercase tracking-[0.2em] rounded-2xl shadow-2xl shadow-indigo-500/20 active:scale-[0.98] transition-all" 
                     leftIcon={<Save className="w-5 h-5 mr-1" />}
                   >
                     Process Artifact
                   </Button>
                </Card>

                {/* Real-time Proofing Panel */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">Master Proof</span>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-900/50 rounded-full border border-slate-800">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                      <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Live Validated</span>
                    </div>
                  </div>

                  <Card className="p-10 bg-[#0A0A0B] border border-white/5 shadow-2xl relative overflow-hidden flex items-center justify-center rounded-3xl min-h-[360px]">
                    <motion.div initial={false} animate={{ scale: finalPhoto ? 1 : 0.96 }} className="relative z-10">
                      <div className="bg-white shadow-[0_20px_80px_rgba(0,0,0,0.6)] rounded-[1px] overflow-hidden transition-all duration-700" style={{ width: pagePx.w, height: pagePx.h }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: `${spacing * previewScale}mm` }}>
                          {Array.from({ length: copies }).map((_, i) => (
                            <div key={i} style={{ 
                              width: `${photoRatio.width * 10 * previewScale}mm`, 
                              height: `${photoRatio.height * 10 * previewScale}mm`, 
                              backgroundColor: bgColor,
                              boxShadow: 'inset 0 0 0 0.5px rgba(0,0,0,0.05)'
                            }}>
                              {finalPhoto ? <img src={finalPhoto} alt="Proof" className="w-full h-full object-cover" /> : <div className="w-full h-full border border-slate-50 opacity-10"></div>}
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                    {!finalPhoto && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px] z-20">
                         <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.3em] animate-pulse">
                            Awaiting Manifest
                         </p>
                      </div>
                    )}
                  </Card>

                  <Card className="p-6 saas-card border-none rounded-3xl space-y-6 shadow-2xl">
                    <div className="space-y-5">
                      <div className="p-1.5 bg-slate-950/50 rounded-xl border border-slate-800/50 flex gap-1">
                        {['A4', 'A5', 'A6', 'single'].map(sz => (
                          <button 
                            key={sz} onClick={() => dispatch(setPaperSize(sz as any))} 
                            className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase transition-all 
                            ${paperSize === sz ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/10' : 'text-slate-600 hover:text-slate-400'}`}
                          >
                            {sz}
                          </button>
                        ))}
                      </div>

                      <div className="space-y-5 px-1 pt-1">
                        <div className="space-y-4">
                          <div className="flex justify-between items-center"><span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Multi-Copy</span><span className="text-sm font-bold text-indigo-400">{copies}x</span></div>
                          <input type="range" min="1" max="50" value={copies} onChange={(e) => dispatch(setCopies(Number(e.target.value)))} className="w-full" />
                        </div>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center"><span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Offset Gap</span><span className="text-sm font-bold text-indigo-400">{spacing}mm</span></div>
                          <input type="range" min="0" max="10" value={spacing} onChange={(e) => dispatch(setSpacing(Number(e.target.value)))} className="w-full" />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-6 border-t border-slate-800">
                      <Button onClick={handlePrint} disabled={!finalPhoto} className="h-12 bg-white text-black hover:bg-slate-200 rounded-2xl text-[11px] font-bold uppercase tracking-wider" leftIcon={<Printer className="w-4 h-4" />}>Print</Button>
                      <Button variant="ghost" onClick={downloadPDF} disabled={!finalPhoto} className="h-12 text-slate-400 hover:text-white rounded-2xl text-[11px] font-bold uppercase tracking-wider border border-slate-800" leftIcon={<Download className="w-4 h-4" />}>PDF</Button>
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
