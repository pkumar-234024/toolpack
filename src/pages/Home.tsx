import React from 'react';
import { motion } from 'framer-motion';
import { Camera, PenTool, Scaling, FileType2, ArrowRight, Shield, Zap, Sparkles, Layout } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Link } from 'react-router-dom';

const features = [
  {
    title: 'Passport Photo Maker',
    description: 'Create professional passport photos with ease. Crop, adjust, and generate grids for printing.',
    icon: Camera,
    color: 'bg-brand-primary',
    link: '/tools/passport',
  },
  {
    title: 'Signature Editor',
    description: 'Draw or upload your signature. Export with transparent background for digital documents.',
    icon: PenTool,
    color: 'bg- brand-accent',
    link: '/tools/signature',
  },
  {
    title: 'Size Converter',
    description: 'Instantly convert dimensions between pixels, cm, and inches for forms and documents.',
    icon: Scaling,
    color: 'bg-emerald-500',
    link: '/tools/size-converter',
  },
  {
    title: 'Document Converter',
    description: 'Convert images to PDF and more. High speed, high quality, and completely secure.',
    icon: FileType2,
    color: 'bg-rose-500',
    link: '/tools/doc-converter',
  },
];

const stats = [
  { label: 'Active Users', value: '50k+', icon: Shield },
  { label: 'Files Processed', value: '1M+', icon: Zap },
  { label: 'Satisfaction', value: '99.9%', icon: Sparkles },
];

export const Home = () => {
  return (
    <div className="relative overflow-hidden pt-20">
      {/* Hero Section */}
      <section className="container mx-auto px-6 text-center max-w-4xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary/10 text-brand-primary rounded-full mb-8"
        >
          <Sparkles className="w-4 h-4" />
          <span className="text-sm font-semibold tracking-wide uppercase">AI-Powered Tools</span>
        </motion.div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight tracking-tight">
          Tools for Every <span className="bg-gradient-to-r from-brand-primary via-brand-accent to-brand-secondary bg-clip-text text-transparent">Creator</span>
        </h1>
        
        <p className="text-xl text-slate-600 dark:text-slate-400 mb-10 leading-relaxed max-w-2xl mx-auto">
          Simplifying your document and photo workflows with powerful, privacy-first browser-based tools. No signup, no fees, no limits.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link to="/tools">
            <Button size="lg" className="w-full sm:w-auto text-lg h-14" rightIcon={<ArrowRight />}>
              Explore Tools
            </Button>
          </Link>
          <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg h-14 border-slate-200 dark:border-slate-800">
            Learn More
          </Button>
        </div>

        {/* Floating Decorative Elements */}
        <div className="absolute top-20 left-0 -translate-x-1/2 w-64 h-64 bg-brand-primary/20 rounded-full blur-3xl -z-10 animate-pulse" />
        <div className="absolute bottom-40 right-0 translate-x-1/2 w-80 h-80 bg-brand-accent/20 rounded-full blur-3xl -z-10 animate-pulse delay-700" />
      </section>

      {/* Feature Grid */}
      <section className="container mx-auto px-6 py-24 sm:py-32">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, idx) => (
            <Link key={idx} to={feature.link}>
              <Card className="h-full group cursor-pointer border hover:border-brand-primary/50 transition-all duration-500">
                <div className={`${feature.color} w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-brand-primary/20 group-hover:scale-110 group-hover:rotate-12 transition-transform`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 group-hover:text-brand-primary transition-colors">{feature.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                  {feature.description}
                </p>
                <div className="flex items-center gap-2 text-brand-primary font-semibold text-sm opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">
                  Try it now <ArrowRight className="w-4 h-4" />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-slate-900 text-white py-24 overflow-hidden relative">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            {stats.map((stat, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <div className="p-4 bg-white/10 rounded-2xl mb-4">
                  <stat.icon className="w-8 h-8 text-brand-primary" />
                </div>
                <div className="text-4xl font-extrabold mb-2">{stat.value}</div>
                <div className="text-slate-400 font-medium uppercase tracking-widest text-xs">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.1),transparent)]" />
      </section>
    </div>
  );
};
