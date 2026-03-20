import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../../app/store';
import { addToHistory } from '../signatureSlice';
import { Card } from '../../../components/ui/Card';
import { Pen, MousePointer2 } from 'lucide-react';

export const SignatureCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dispatch = useDispatch();
  const { penColor, penWidth, history, currentIndex, showGrid } = useSelector((state: RootState) => state.signature);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    }

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = penColor;
    ctx.lineWidth = penWidth;

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
    const clientX = 'touches' in e ? (e as React.TouchEvent).touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? (e as React.TouchEvent).touches[0].clientY : (e as React.MouseEvent).clientY;
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

  return (
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
  );
};
