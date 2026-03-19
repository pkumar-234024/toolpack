import { useRef, useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../app/store';
import { 
  setPenColor, setPenWidth, addToHistory, undo, redo, clearHistory, toggleGrid 
} from './signatureSlice';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { 
  Download, Trash2, Undo, Redo, Grid, Upload, Pen, 
  Settings, Check, Sparkles, Command, Info, Save, MousePointer2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export const SignatureTool = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dispatch = useDispatch();
  const { penColor, penWidth, history, currentIndex, showGrid } = useSelector((state: RootState) => state.signature);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });

  // Initialize and update canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI screens
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    }

    // Drawing settings
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = penColor;
    ctx.lineWidth = penWidth;

    // Redraw current history state
    if (currentIndex >= 0 && history[currentIndex]) {
      const img = new Image();
      img.src = history[currentIndex];
      img.onload = () => {
        ctx.clearRect(0, 0, rect.width, rect.height);
        ctx.drawImage(img, 0, 0, rect.width, rect.height);
      };
    } else if (currentIndex === -1) {
      ctx.clearRect(0, 0, rect.width, rect.height);
    }
  }, [currentIndex, history, penColor, penWidth]);

  const getPos = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  }, []);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    const pos = getPos(e);
    setLastPos(pos);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const pos = getPos(e);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(lastPos.x, lastPos.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      setLastPos(pos);
    }
  };

  const endDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      dispatch(addToHistory(canvas.toDataURL()));
    }
  };

  const downloadSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas || currentIndex === -1) {
      toast.error('Write your signature first');
      return;
    }

    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `signature_export_${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
    toast.success('Signature exported with transparency');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        dispatch(addToHistory(reader.result as string));
        toast.success('Signature file loaded');
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="container mx-auto px-6 py-8 pt-10 max-w-7xl min-h-screen">
      <style>{`
        .bg-signature-grid {
          background-image: radial-gradient(rgba(0,0,0,0.05) 1px, transparent 1px);
          background-size: 20px 20px;
        }
        .dark .bg-signature-grid {
          background-image: radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px);
        }
      `}</style>

      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            Signature Studio <span className="bg-brand-accent text-white text-[10px] px-2 py-0.5 rounded-full uppercase tracking-tighter">Pro</span>
          </h1>
          <p className="text-slate-500 text-xs font-medium max-w-md mt-1">
            Draw, refine, and export professional digital signatures with transparent backgrounds.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-slate-900 text-white text-[10px] font-bold px-3 py-1.5 rounded flex items-center gap-2">
            <Command className="w-3 h-3" /> VECTOR ENGINE ACTIVE
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Canvas Area */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex gap-1.5">
               <Button 
                variant="outline" 
                size="sm" 
                onClick={() => dispatch(undo())} 
                className="h-9 px-3 border-slate-200 dark:border-slate-800"
                disabled={currentIndex < 0}
               >
                 <Undo className="w-4 h-4 mr-2" /> Undo
               </Button>
               <Button 
                variant="outline" 
                size="sm" 
                onClick={() => dispatch(redo())} 
                className="h-9 px-3 border-slate-200 dark:border-slate-800"
                disabled={currentIndex >= history.length - 1}
               >
                 <Redo className="w-4 h-4 mr-2" /> Redo
               </Button>
            </div>
            <div className="flex gap-1.5">
               <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => dispatch(toggleGrid())} 
                className={`h-9 px-3 ${showGrid ? 'text-brand-primary bg-brand-primary/5' : ''}`}
               >
                 <Grid className="w-4 h-4 mr-2" /> {showGrid ? 'Grid On' : 'Grid Off'}
               </Button>
               <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => dispatch(clearHistory())} 
                className="h-9 px-3 text-red-500 hover:bg-red-50"
               >
                 <Trash2 className="w-4 h-4 mr-2" /> Clear
               </Button>
            </div>
          </div>

          <Card className={`p-0 border-none shadow-2xl relative overflow-hidden bg-white dark:bg-slate-950 min-h-[460px] ${showGrid ? 'bg-studio-grid' : ''}`}>
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-accent/20 to-transparent"></div>
             
             <div className="w-full h-full min-h-[460px] cursor-crosshair relative z-10 transition-colors duration-300">
                <canvas
                  ref={canvasRef}
                  width={800}
                  height={460}
                  className="w-full h-full touch-none"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={endDrawing}
                  onMouseLeave={endDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={endDrawing}
                />
                
                {currentIndex === -1 && (
                  <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center opacity-40 group select-none">
                    <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900 rounded-3xl flex items-center justify-center mb-6 border border-slate-100 dark:border-slate-800">
                       <Pen className="w-8 h-8 text-slate-400" />
                    </div>
                    <p className="text-xl font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest italic animate-pulse">SIGN HERE</p>
                    <div className="mt-4 flex items-center gap-3 text-[10px] font-bold text-slate-400">
                       <MousePointer2 className="w-3 h-3" /> USE MOUSE OR STYLUS
                    </div>
                  </div>
                )}
             </div>

             <div className="absolute top-4 right-4 z-20 opacity-20 hover:opacity-100 transition-opacity">
               <div className="px-2 py-1 bg-black text-white text-[8px] font-black rounded uppercase">800x460 px</div>
             </div>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <Card className="p-4 flex items-center gap-4 bg-slate-50 dark:bg-slate-900 border-none">
               <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                  <Info className="w-5 h-5" />
               </div>
               <div>
                  <h4 className="text-[11px] font-black uppercase text-slate-800 dark:text-white">Drawing Tip</h4>
                  <p className="text-[10px] font-medium text-slate-500">For best results, use a tablet or a steady hand on the trackpad.</p>
               </div>
             </Card>
             <Card className="p-4 flex items-center gap-4 bg-slate-50 dark:bg-slate-900 border-none hover:bg-brand-accent/5 transition-colors cursor-pointer group">
               <label className="flex items-center gap-4 w-full cursor-pointer">
                 <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                 <div className="w-10 h-10 rounded-xl bg-brand-accent/10 flex items-center justify-center text-brand-accent group-hover:scale-110 transition-transform">
                    <Upload className="w-5 h-5" />
                 </div>
                 <div>
                    <h4 className="text-[11px] font-black uppercase text-slate-800 dark:text-white">Import Signature</h4>
                    <p className="text-[10px] font-medium text-slate-500">Pick an existing file to edit or refine.</p>
                 </div>
               </label>
             </Card>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <Card className="p-6 space-y-8 bg-slate-900 border-none text-white shadow-2xl p-8">
            <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-slate-400">
              <Settings className="w-4 h-4" /> Brush Controls
            </h3>

            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider">
                   <span>Ink Palette</span>
                   <span className="text-brand-accent">{penColor.toUpperCase()}</span>
                </div>
                <div className="grid grid-cols-5 gap-3">
                  {['#000000', '#2563eb', '#1e293b', '#cc0000', '#7c3aed'].map((color) => (
                    <button
                      key={color}
                      onClick={() => dispatch(setPenColor(color))}
                      className={`h-9 w-full rounded-xl border-2 transition-all hover:scale-110 ${
                        penColor === color ? 'border-brand-accent scale-110 ring-4 ring-brand-accent/20' : 'border-transparent opacity-80'
                      }`}
                      style={{ backgroundColor: color }}
                    >
                      {penColor === color && <Check className="w-4 h-4 mx-auto text-white drop-shadow-md" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider">
                   <span>Stroke Thickness</span>
                   <span className="text-brand-accent">{penWidth}PX</span>
                </div>
                <div className="px-1">
                  <input 
                    type="range" min={1} max={12} step={1} value={penWidth}
                    onChange={(e) => dispatch(setPenWidth(Number(e.target.value)))}
                    className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-brand-accent"
                  />
                </div>
              </div>

              <div className="pt-4 space-y-4">
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Live Feedback</div>
                <div className="w-full h-24 bg-black/40 rounded-2xl border border-white/10 flex items-center justify-center overflow-hidden relative">
                   {currentIndex >= 0 ? (
                      <motion.img 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        src={history[currentIndex]} 
                        className="max-h-[70%] max-w-[80%] object-contain invert"
                      />
                   ) : (
                      <div className="flex flex-col items-center gap-1 opacity-20">
                         <Pen className="w-6 h-6" />
                         <span className="text-[8px] font-black italic">AWAITING INPUT</span>
                      </div>
                   )}
                </div>
              </div>

              <div className="pt-6">
                <Button 
                  size="lg"
                  className="w-full h-14 font-black shadow-2xl bg-brand-accent hover:bg-brand-accent/90"
                  onClick={downloadSignature}
                  leftIcon={<Save className="w-5 h-5" />}
                >
                  EXPORT FINAL SIGNATURE
                </Button>
              </div>
            </div>
          </Card>

          <Card className="p-4 border-none bg-brand-accent/10 flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-brand-accent text-white flex items-center justify-center shadow-lg shadow-brand-accent/20">
               <Sparkles className="w-5 h-5" />
             </div>
             <div>
               <h4 className="text-[11px] font-black uppercase text-slate-800 dark:text-white tracking-widest">Studio Quality</h4>
               <p className="text-[10px] font-medium text-slate-500">Anti-aliased vector smoothing active.</p>
             </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
