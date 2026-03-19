import React from 'react';
import { cn } from './Button';
import { motion, type HTMLMotionProps } from 'framer-motion';

interface CardProps extends HTMLMotionProps<'div'> {
  variant?: 'glass' | 'solid' | 'outline';
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className, 
  variant = 'glass', 
  hoverable = true,
  ...props 
}) => {
  const variants = {
    glass: 'bg-white/70 backdrop-blur-md border border-white/20 dark:bg-slate-900/70 dark:border-slate-700/50',
    solid: 'bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800',
    outline: 'border-2 border-slate-100 dark:border-slate-800 bg-transparent',
  };

  return (
    <motion.div
      whileHover={hoverable ? { y: -4, boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)' } : undefined}
      className={cn(
        'rounded-2xl p-6 transition-all duration-300',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
};
