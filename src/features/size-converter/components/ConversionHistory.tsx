import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../../app/store';
import { clearHistory } from '../sizeSlice';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { History, X, Trash2, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const ConversionHistory: React.FC = () => {
  const dispatch = useDispatch();
  const { history } = useSelector((state: RootState) => state.size);

  if (history.length === 0) return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center px-2">
        <h3 className="text-sm font-black uppercase tracking-[0.2em] flex items-center gap-3 text-slate-800 dark:text-white">
          <History className="w-5 h-5 text-indigo-500" /> Session History
        </h3>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => dispatch(clearHistory())} 
          className="text-[10px] font-black uppercase text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 h-8"
        >
           Wipe Records
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {history.map((item) => (
            <motion.div
              layout
              key={item.id}
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <Card className="p-8 border-none saas-card-flat bg-white dark:bg-slate-950 shadow-2xl group hover:shadow-indigo-500/5 transition-all">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-400 group-hover:text-indigo-500 transition-colors">
                     <Clock className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-black text-slate-300 dark:text-slate-800">#{item.id.slice(0, 4)}</span>
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase text-slate-400 mb-1">{item.fromUnit}</span>
                    <span className="text-2xl font-black text-slate-800 dark:text-slate-200 tabular-nums">{item.fromValue}</span>
                  </div>
                  <X className="w-4 h-4 text-slate-200 dark:text-slate-800" />
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase text-indigo-500 mb-1">{item.toUnit}</span>
                    <span className="text-2xl font-black text-indigo-500 tabular-nums">{item.toValue}</span>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
