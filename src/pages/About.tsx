import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Shield, Lock, Zap, Layout, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const About = () => {
  return (
    <div className="container mx-auto px-6 py-20 pt-32 max-w-7xl">
      <div className="max-w-3xl mx-auto text-center mb-20">
        <h1 className="text-5xl font-extrabold mb-6 tracking-tight">Our <span className="text-brand-primary underline decoration-brand-accent/30 underline-offset-8">Mission</span></h1>
        <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed">
          At ToolPack, we believe that professional document and image tools should be accessible to everyone without the need for high-end software or expensive subscriptions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-24">
        {[
          { icon: Shield, title: 'Privacy First', text: 'All processing happens locally in your browser. Your files never touch our servers.' },
          { icon: Zap, title: 'Super Fast', text: 'Powered by advanced browser APIs, we enable instant conversions and editing.' },
          { icon: Lock, title: 'Secure', text: 'No signups, no tracking. We respect your digital footprint and anonymity.' },
          { icon: Layout, title: 'Clean UI', text: 'Modern, minimalist, and easy-to-use interface designed for productivity.' },
        ].map((item, idx) => (
          <Card key={idx} variant="solid" className="text-center group border-none bg-slate-50 dark:bg-slate-900 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all">
            <div className="w-14 h-14 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-md group-hover:scale-110 group-hover:bg-brand-primary group-hover:text-white transition-all text-brand-primary">
              <item.icon className="w-7 h-7" />
            </div>
            <h4 className="font-bold text-lg mb-3">{item.title}</h4>
            <p className="text-slate-500 text-sm leading-relaxed">{item.text}</p>
          </Card>
        ))}
      </div>

      <Card className="bg-brand-primary/10 border-brand-primary/20 p-12 overflow-hidden relative">
        <div className="md:flex items-center justify-between gap-12 relative z-10">
          <div className="mb-8 md:mb-0 max-w-xl">
            <h3 className="text-3xl font-extrabold mb-4">Let's build something <span className="text-brand-primary">incredible</span>.</h3>
            <p className="text-slate-600 dark:text-slate-400">
              ToolPack is a completely free project created to solve everyday digital problems. We are continuously adding more tools to our system based on user feedback.
            </p>
          </div>
          <Link to="/tools">
            <Button size="lg" rightIcon={<ArrowRight />}>Explore All Tools</Button>
          </Link>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-accent/10 rounded-full -mr-32 -mt-32 blur-3xl" />
      </Card>
    </div>
  );
};
