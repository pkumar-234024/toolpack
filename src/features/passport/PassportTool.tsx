import { useState, useCallback, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import Cropper from 'react-easy-crop';
import type { Area } from 'react-easy-crop';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../app/store';
import { 
  setImage, setCrop, setZoom, setRotation, setAdjustment, 
  setPaperSize, setSpacing, setCopies, setBgColor, 
  setPhotoRatio, setDPI, toggleFaceGuide, resetPassport 
} from './passportSlice';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { 
  Camera, Download, Trash2, Printer, RotateCcw, 
  ZoomIn, Sun, Contrast, Grid, Sparkles, Copy, 
  RotateCw, Eye, EyeOff, Check, Command, Settings, Layout as LayoutIcon
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import toast from 'react-hot-toast';
import { removeBackground } from '@imgly/background-removal';

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
  await new Promise((resolve) => (img.onload = resolve));

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const outputWidth = Math.round((targetWidthMM / 25.4) * targetDpi);
  const outputHeight = Math.round((targetHeightMM / 25.4) * targetDpi);
  
  canvas.width = outputWidth;
  canvas.height = outputHeight;

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.translate(-canvas.width / 2, -canvas.height / 2);

  ctx.drawImage(img, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', 1.0);
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

  const calcPix = useMemo(() => ({
    w: Math.round((photoRatio.width * 10 / 25.4) * dpi),
    h: Math.round((photoRatio.height * 10 / 25.4) * dpi)
  }), [photoRatio.width, photoRatio.height, dpi]);

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
    const reader = new FileReader();
    reader.onload = () => dispatch(setImage(reader.result as string));
    reader.readAsDataURL(file);
  }, [dispatch]);

  const { getRootProps, getInputProps } = useDropzone({ onDrop, accept: { 'image/*': [] }, multiple: false });

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
        toast.success('Done!', { id: toastId });
      };
      reader.readAsDataURL(result);
    } catch { toast.error('Failed', { id: toastId }); } finally { setIsRemovingBG(false); }
  };

  const countries = [
    { name: 'India (Visa/Passport)', width: 5.1, height: 5.1, label: '2x2 inch / 51 mm' },
    { name: 'UK / EU', width: 3.5, height: 4.5, label: '35x45 mm' },
    { name: 'China', width: 3.3, height: 4.8, label: '33x48 mm' },
  ];

  const presets = [{ name: 'White', color: '#ffffff' }, { name: 'Blue', color: '#0033aa' }, { name: 'Sky Blue', color: '#88ccff' }, { name: 'Red', color: '#cc0000' }];

  const getPageDimensions = (size: string) => {
    const w = size === 'single' ? photoRatio.width * 10 : (size === 'A5' ? 148 : (size === 'A6' ? 105 : 210));
    const h = size === 'single' ? photoRatio.height * 10 : (size === 'A5' ? 210 : (size === 'A6' ? 148 : 297));
    return { width: `${w}mm`, height: `${h}mm` };
  };

  const handleApplyCrop = async () => {
    if (!image || !croppedAreaPixels) return;
    const toastId = toast.loading('Applying requirements...');
    try {
      const croppedImg = await generatePassportSnippet(image, croppedAreaPixels, rotation, bgColor, brightness, contrast, dpi, photoRatio.width * 10, photoRatio.height * 10);
      setFinalPhoto(croppedImg);
      toast.success('Done!', { id: toastId });
    } catch { toast.error('Failed'); }
  };

  const downloadPDF = async () => {
    if (!image || !croppedAreaPixels) return;
    setIsGenerating(true);
    const toastId = toast.loading('Generating PDF...');
    try {
      const croppedImg = finalPhoto || await generatePassportSnippet(image, croppedAreaPixels, rotation, bgColor, brightness, contrast, dpi, photoRatio.width * 10, photoRatio.height * 10);
      const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: paperSize === 'single' ? [photoRatio.width * 10, photoRatio.height * 10] : paperSize });
      const photoWidth = photoRatio.width * 10;
      const photoHeight = photoRatio.height * 10;
      if (paperSize === 'single') { pdf.addImage(croppedImg, 'JPEG', 0, 0, photoWidth, photoHeight); } 
      else {
        const cols = Math.floor(pdf.internal.pageSize.getWidth() / (photoWidth + spacing));
        const rows = Math.floor(pdf.internal.pageSize.getHeight() / (photoHeight + spacing));
        let count = 0;
        for (let r = 0; r < rows && count < copies; r++) {
          for (let c = 0; c < cols && count < copies; c++) {
            pdf.addImage(croppedImg, 'JPEG', c * (photoWidth + spacing), r * (photoHeight + spacing), photoWidth, photoHeight);
            count++;
          }
        }
      }
      pdf.save(`passport-${dpi}dpi.pdf`);
      toast.success('Success!', { id: toastId });
    } catch { toast.error('Fail'); } finally { setIsGenerating(false); }
  };

  const handlePrint = async () => {
    if (!image || !croppedAreaPixels) return;
    setIsPrinting(true);
    try {
      const imgToUse = finalPhoto || await generatePassportSnippet(image, croppedAreaPixels, rotation, bgColor, brightness, contrast, dpi, photoRatio.width * 10, photoRatio.height * 10);
      setPrintImage(imgToUse);
      setTimeout(() => { window.print(); setIsPrinting(false); }, 800);
    } catch { setIsPrinting(false); }
  };

  return (
    <div className="container mx-auto px-6 py-8 pt-8 max-w-7xl">
      <style>{`@media print { @page { margin: 0; size: auto; } body { margin: 0; padding: 0; overflow: visible !important; } nav, footer, .no-print, header, aside { display: none !important; } .print-sheet { display: block !important; position: fixed; left: 0; top: 0; width: 100%; height: 100%; padding: 0; margin: 0; background: white; z-index: 99999; } } .print-sheet { display: none; }`}</style>
      
      {printImage && (
        <div className="print-sheet" style={getPageDimensions(paperSize)}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: `${spacing}mm` }}>
            {Array.from({ length: copies }).map((_, i) => (
              <div key={i} style={{ width: `${photoRatio.width * 10}mm`, height: `${photoRatio.height * 10}mm`, backgroundColor: bgColor }}>
                <img src={printImage} alt="P" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="no-print mb-6 border-b pb-4 flex justify-between items-center">
        <div><h1 className="text-2xl font-black">Passport Studio <span className="text-brand-primary">v2</span></h1><p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">Official Document Formatter</p></div>
        <div className="flex items-center gap-2 px-3 py-1 bg-slate-900 text-white text-[10px] font-bold uppercase rounded"><Command className="w-3 h-3" /> PRO SUITE</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 no-print">
        <div className="lg:col-span-6 space-y-6">
          {/* STEP 1: ADJUST */}
          <div className="space-y-3">
            <div className="flex justify-between items-center"><h2 className="text-xs font-black uppercase text-slate-400 flex items-center gap-2">STEP 1: ADJUST</h2>{image && <Button size="sm" onClick={handleApplyCrop} leftIcon={<Check className="w-4 h-4" />}>APPLY EDITS</Button>}</div>
            <Card className="min-h-[360px] max-w-lg mx-auto w-full flex items-center justify-center p-0 overflow-hidden relative shadow-inner">
              {!image ? (
                <div {...getRootProps()} className="w-full h-full flex flex-col items-center justify-center p-8 cursor-pointer border-2 border-dashed rounded-xl hover:bg-slate-50 transition-colors"><input {...getInputProps()} /><div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mb-3"><Camera className="w-6 h-6 text-slate-400" /></div><p className="font-bold text-sm">Drop Passport Photo</p></div>
              ) : (
                <div className="w-full h-[360px] relative" style={{ backgroundColor: bgColor }}>
                  <Cropper image={image} crop={crop} zoom={zoom} rotation={rotation} aspect={photoRatio.width / photoRatio.height} onCropChange={(c) => dispatch(setCrop(c))} onZoomChange={(z) => dispatch(setZoom(z))} onRotationChange={(r) => dispatch(setRotation(r))} onCropComplete={onCropComplete} style={{ containerStyle: { background: 'transparent' } }} />
                  {showFaceGuide && <div className="absolute inset-0 pointer-events-none opacity-25"><svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none"><ellipse cx="50" cy="45" rx="20" ry="28" fill="none" stroke="#2563eb" strokeWidth="0.5" strokeDasharray="3,3" /><line x1="10" y1="45" x2="90" y2="45" stroke="#2563eb" strokeWidth="0.1" /></svg></div>}
                  <Button variant="danger" size="sm" className="absolute top-3 right-3 h-8 shadow-lg" onClick={clearImage} leftIcon={<Trash2 className="w-4 h-4" />}>Clear</Button>
                </div>
              )}
            </Card>
          </div>

          {/* SPECS & DIMENSIONS (Moved here from sidebar) */}
          {image && (
            <div className="space-y-3">
              <Card className="p-4 space-y-4 border-none shadow-lg bg-white dark:bg-slate-900 border-t-4 border-brand-primary">
                <h4 className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-2 mb-2"><Settings className="w-3 h-3" /> SPECS & DIMENSIONS</h4>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {countries.map(c => <button key={c.name} onClick={() => dispatch(setPhotoRatio({ width: c.width, height: c.height }))} className={`py-2 px-1 rounded border text-[9px] font-bold text-center transition-all ${photoRatio.width === c.width ? 'bg-brand-primary border-brand-primary text-white scale-[1.05]' : 'hover:border-brand-primary/40 text-slate-500'}`}>{c.name.split(' (')[0]}</button>)}
                </div>
                <div className="grid grid-cols-2 gap-4 border-t pt-4">
                  <div className="space-y-1"><label className="text-[9px] font-bold uppercase text-slate-500">Width (mm)</label><input type="number" step="0.1" value={Math.round(photoRatio.width * 10)} onChange={(e) => dispatch(setPhotoRatio({ ...photoRatio, width: Number(e.target.value) / 10 }))} className="w-full h-8 px-2 rounded border bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-black accent-brand-primary" /></div>
                  <div className="space-y-1"><label className="text-[9px] font-bold uppercase text-slate-500">Height (mm)</label><input type="number" step="0.1" value={Math.round(photoRatio.height * 10)} onChange={(e) => dispatch(setPhotoRatio({ ...photoRatio, height: Number(e.target.value) / 10 }))} className="w-full h-8 px-2 rounded border bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-black accent-brand-primary" /></div>
                  <div className="space-y-1"><label className="text-[9px] font-bold uppercase text-slate-500">Custom DPI</label><input type="number" value={dpi} onChange={(e) => dispatch(setDPI(Number(e.target.value)))} className="w-full h-8 px-2 rounded border bg-brand-primary/5 text-brand-primary text-xs font-black border-brand-primary/20" /></div>
                  <div className="space-y-1"><label className="text-[9px] font-bold uppercase text-brand-primary italic">Output Pixels</label><div className="h-8 px-2 flex items-center rounded border bg-brand-primary/5 text-[10px] font-mono font-bold text-brand-primary">{calcPix.w} x {calcPix.h}</div></div>
                </div>
              </Card>
            </div>
          )}

          {/* STEP 2: PREVIEW */}
          {image && (
            <div className="space-y-3">
              <h2 className="text-xs font-black uppercase text-slate-400">STEP 2: PREVIEW</h2>
              <Card className="p-4 bg-slate-900 min-h-[220px] flex items-center justify-center max-w-lg mx-auto overflow-hidden">
                <div className="bg-white overflow-hidden shadow-2xl" style={{ width: pagePx.w, height: pagePx.h }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: `${spacing * previewScale}mm`, padding: '0px' }}>
                    {Array.from({ length: copies }).map((_, i) => (
                      <div key={i} style={{ width: `${photoRatio.width * 10 * previewScale}mm`, height: `${photoRatio.height * 10 * previewScale}mm`, backgroundColor: bgColor }}>
                        {finalPhoto ? <img src={finalPhoto} alt="R" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[5px] text-slate-200">#{i+1}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
              <div className="grid grid-cols-2 gap-3"><Button size="lg" className="font-black" onClick={handlePrint} disabled={isPrinting} leftIcon={<Printer className="w-5 h-5" />}>PRINT</Button><Button size="lg" variant="outline" className="font-black" onClick={downloadPDF} disabled={isGenerating} leftIcon={<Download className="w-5 h-5" />}>EXPORT PDF</Button></div>
            </div>
          )}
        </div>

        <div className="lg:col-span-6 space-y-4">
          {image && (
            <div className="sticky top-5 space-y-4">
              {/* BACKGROUND & EFFECTS (Stays on sidebar) */}
              <Card className="p-4 space-y-4 border-none shadow-lg bg-white dark:bg-slate-900">
                <h4 className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-2 mb-2"><Sparkles className="w-3 h-3" /> BACKGROUND & EFFECTS</h4>
                <div className="flex gap-1.5 pb-2">
                  {presets.map(p => <button key={p.color} onClick={() => dispatch(setBgColor(p.color))} className={`w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 ${bgColor === p.color ? 'ring-4 ring-brand-primary/10 border-brand-primary' : 'border-slate-100'}`} style={{ backgroundColor: p.color }}>{bgColor === p.color && <Check className={`w-3 h-3 mx-auto ${p.color === '#ffffff' ? 'text-black' : 'text-white'}`} />}</button>)}
                  <input type="color" value={bgColor} onChange={(e) => dispatch(setBgColor(e.target.value))} className="w-7 h-7 rounded-full border-2 border-slate-100 overflow-hidden cursor-pointer p-0" />
                </div>
                <Button variant="outline" size="sm" className="w-full h-8 font-black text-[10px]" onClick={handleRemoveBG} isLoading={isRemovingBG} leftIcon={<Sparkles className="w-3 h-3" />}>AI BACKGROUND REMOVAL</Button>
                <div className="grid grid-cols-2 gap-4 border-t pt-4">
                  <div className="space-y-1"><span className="text-[9px] font-bold text-slate-400 uppercase flex justify-between">Brightness <span>{brightness}%</span></span><input type="range" min="50" max="150" value={brightness} onChange={(e) => dispatch(setAdjustment({ type: 'brightness', value: Number(e.target.value) }))} className="w-full h-1 accent-brand-primary" /></div>
                  <div className="space-y-1"><span className="text-[9px] font-bold text-slate-400 uppercase flex justify-between">Contrast <span>{contrast}%</span></span><input type="range" min="50" max="150" value={contrast} onChange={(e) => dispatch(setAdjustment({ type: 'contrast', value: Number(e.target.value) }))} className="w-full h-1 accent-brand-primary" /></div>
                </div>
              </Card>

              {/* SHEET LAYOUT */}
              <Card className="p-4 space-y-4 border-none shadow-lg bg-white dark:bg-slate-900">
                <h4 className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-2 mb-2"><LayoutIcon className="w-3 h-3" /> SHEET LAYOUT</h4>
                <div className="grid grid-cols-4 gap-2">
                   {['A4', 'A5', 'A6', 'single'].map(size => <button key={size} onClick={() => dispatch(setPaperSize(size as any))} className={`py-1 rounded border text-[9px] font-black transition-all ${paperSize === size ? 'bg-slate-900 text-white border-slate-900' : 'border-slate-100'}`}>{size.toUpperCase()}</button>)}
                </div>
                <div className="grid grid-cols-2 gap-4 border-t pt-4">
                  <div className="space-y-1"><span className="text-[9px] font-bold text-slate-400 uppercase flex justify-between">Copies <span>{copies}</span></span><input type="range" min="1" max="50" value={copies} onChange={(e) => dispatch(setCopies(Number(e.target.value)))} className="w-full h-1 accent-brand-primary" /></div>
                  <div className="space-y-1"><span className="text-[9px] font-bold text-slate-400 uppercase flex justify-between">Gap <span>{spacing}mm</span></span><input type="range" min="0" max="10" value={spacing} onChange={(e) => dispatch(setSpacing(Number(e.target.value)))} className="w-full h-1 accent-brand-primary" /></div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
