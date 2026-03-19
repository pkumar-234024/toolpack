import React from 'react';
import { Camera, PenTool, Scaling, FileType2, Search, Filter } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';

const tools = [
  {
    id: 'passport',
    title: 'Passport Photo Maker',
    description: 'Upload, crop, and generate grid for passport sized photos.',
    icon: Camera,
    category: 'Photos',
    tags: ['PDF', 'Image', 'Print'],
    color: 'bg-brand-primary',
  },
  {
    id: 'signature',
    title: 'Signature Editor',
    description: 'Draw or upload signature and export it as a transparent PNG.',
    icon: PenTool,
    category: 'Documents',
    tags: ['Signature', 'Digital', 'PNG'],
    color: 'bg- brand-accent',
  },
  {
    id: 'size-converter',
    title: 'Size Converter',
    description: 'Convert between px, cm, and inch for various ID formats.',
    icon: Scaling,
    category: 'Utility',
    tags: ['Units', 'Conversion', 'Dimensions'],
    color: 'bg-emerald-500',
  },
  {
    id: 'doc-converter',
    title: 'Document Converter',
    description: 'Convert between JPG, PNG, and PDF formats instantly.',
    icon: FileType2,
    category: 'Files',
    tags: ['JPG', 'PNG', 'PDF', 'Conversion'],
    color: 'bg-rose-500',
  },
];

export const Tools = () => {
  return (
    <div className="container mx-auto px-6 py-12 pt-24 max-w-7xl">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-extrabold mb-4">Explore Our <span className="text-brand-primary">Toolkit</span></h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            High-performance browser-based utilities to help you with your daily digital tasks. No data ever leaves your device.
          </p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <Input 
            placeholder="Search tools..." 
            className="md:w-64" 
            leftIcon={<Search className="w-4 h-4" />}
          />
          <Button variant="ghost" size="sm" className="px-4 border border-slate-200 dark:border-slate-800 h-11">
            <Filter className="w-4 h-4 mr-2" /> Filter
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {tools.map((tool) => (
          <Link key={tool.id} to={`/tools/${tool.id}`}>
            <Card className="h-full group hover:ring-2 hover:ring-brand-primary transition-all">
              <div className="flex items-start justify-between mb-8">
                <div className={`${tool.color} w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl shadow-brand-primary/10 group-hover:scale-110 transition-transform`}>
                  <tool.icon className="w-8 h-8 text-white" />
                </div>
                <div className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-xs font-bold uppercase tracking-wider text-slate-500">
                  {tool.category}
                </div>
              </div>
              
              <h3 className="text-2xl font-bold mb-3 group-hover:text-brand-primary transition-colors">
                {tool.title}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                {tool.description}
              </p>

              <div className="flex flex-wrap gap-2 mt-auto">
                {tool.tags.map(tag => (
                  <span key={tag} className="text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/50 px-2.5 py-1 rounded-md">
                    {tag}
                  </span>
                ))}
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};
