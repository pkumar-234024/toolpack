import React, { useRef, useEffect, useState} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../app/store';
import { setPenColor, setPenWidth, addToHistory, undo, redo, clearHistory, toggleGrid } from './signatureSlice';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Download, Trash2, Undo, Redo, Grid, Eye, Upload, Pen, Square } from 'lucide-react';
import toast from 'react-hot-toast';

export const SignatureTool = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dispatch = useDispatch();
  const { penColor, penWidth, history, currentIndex, showGrid } = useSelector((state: RootState) => state.signature);
  const [isDrawing, setIsDrawing] = useState(false);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set drawing settings
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = penColor;
    ctx.lineWidth = penWidth;

    // Load current history state
    if (currentIndex >= 0 && history[currentIndex]) {
      const img = new Image();
      img.src = history[currentIndex];
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      };
    } else if (currentIndex === -1) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, [currentIndex, history, penColor, penWidth]);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    const pos = getPos(e);
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
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
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

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const downloadSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Check if canvas is empty
    const isEmpty = currentIndex === -1;
    if (isEmpty) {
        toast.error('Draw something first!');
        return;
    }

    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `signature-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
    toast.success('Signature downloaded!');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        dispatch(addToHistory(reader.result as string));
        toast.success('Signature uploaded');
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="container mx-auto px-6 py-12 pt-24 max-w-7xl">
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Workspace */}
        <div className="flex-1 space-y-8">
          <Card 
            className={`min-h-[400px] flex items-center justify-center relative overflow-hidden bg-white dark:bg-slate-900 border-2 ${showGrid ? 'bg-grid-slate-100 dark:bg-grid-slate-800' : ''}`}
            style={{ 
              backgroundImage: showGrid ? 'radial-gradient(#e2e8f0 1px, transparent 1px)' : 'none',
              backgroundSize: '20px 20px'
            }}
          >
            <canvas
              ref={canvasRef}
              width={800}
              height={400}
              className="w-full h-full cursor-crosshair touch-none"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={endDrawing}
              onMouseLeave={endDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={endDrawing}
            />
            {currentIndex === -1 && (
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center opacity-30 select-none">
                <Pen className="w-12 h-12 mb-4" />
                <p className="text-xl font-bold">Write your signature here</p>
              </div>
            )}
          </Card>

          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => dispatch(undo())} disabled={currentIndex < 0}>
                <Undo className="w-4 h-4 mr-2" /> Undo
              </Button>
              <Button variant="outline" size="sm" onClick={() => dispatch(redo())} disabled={currentIndex >= history.length - 1}>
                <Redo className="w-4 h-4 mr-2" /> Redo
              </Button>
              <Button variant="outline" size="sm" onClick={() => dispatch(clearHistory())} className="text-rose-500 hover:bg-rose-50 border-rose-100 group">
                <Trash2 className="w-4 h-4 mr-2" /> Clear
              </Button>
            </div>
            
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => dispatch(toggleGrid())} className={showGrid ? 'text-brand-primary' : ''}>
                <Grid className="w-4 h-4 mr-2" /> Grid
              </Button>
              <label className="cursor-pointer">
                <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                <Button variant="ghost" size="sm" as="div">
                  <Upload className="w-4 h-4 mr-2" /> Upload Image
                </Button>
              </label>
            </div>
          </div>
        </div>

        {/* Action Sidebar */}
        <div className="w-full lg:w-96 space-y-8">
          <Card variant="solid">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Square className="w-5 h-5 text-brand-primary" /> Brush Settings
            </h3>
            
            <div className="space-y-6">
              <div className="space-y-3">
                <span className="text-sm font-semibold">Pen Color</span>
                <div className="grid grid-cols-5 gap-2">
                  {['#000000', '#2563eb', '#dc2626', '#16a34a', '#7c3aed'].map((color) => (
                    <button
                      key={color}
                      onClick={() => dispatch(setPenColor(color))}
                      className={`w-full aspect-square rounded-lg border-2 transition-all ${
                        penColor === color ? 'border-brand-primary scale-110 shadow-lg' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm font-semibold">
                  <span>Line Thickness</span>
                  <span>{penWidth}px</span>
                </div>
                <input 
                  type="range" min={1} max={10} step={1} value={penWidth}
                  onChange={(e) => dispatch(setPenWidth(Number(e.target.value)))}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-primary"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
                <Button 
                    className="w-full py-4 text-base font-bold shadow-xl" 
                    onClick={downloadSignature}
                    leftIcon={<Download className="w-5 h-5" />}
                >
                    Download Signature
                </Button>
                <p className="text-xs text-center text-slate-500">
                    Exports as transparent <span className="font-bold text-slate-700 dark:text-slate-300">PNG</span>
                </p>
              </div>
            </div>
          </Card>

          <Card variant="outline" className="bg-emerald-500/5 border-emerald-500/20">
            <h4 className="text-sm font-bold mb-3 flex items-center gap-2 text-emerald-600">
              <Eye className="w-4 h-4" /> Live Preview
            </h4>
            <div className="w-full aspect-video bg-white dark:bg-slate-900 rounded-xl overflow-hidden relative flex items-center justify-center border border-emerald-100 dark:border-emerald-800/50">
              {currentIndex >= 0 && history[currentIndex] ? (
                <img src={history[currentIndex]} alt="Preview" className="max-w-[80%] max-h-[80%] object-contain" />
              ) : (
                <span className="text-xs text-slate-400 italic">No signature found</span>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
