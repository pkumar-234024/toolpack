import { Mail, Github, Twitter, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-slate-50 dark:bg-slate-950 border-t border-slate-200/50 dark:border-slate-800/50 pt-16 pb-8 px-6 sm:px-12 mt-20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
        <div>
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center shadow-lg shadow-brand-primary/20">
              <span className="text-white font-bold text-sm">T</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-brand-primary to-brand-accent bg-clip-text text-transparent">
              ToolPack
            </span>
          </div>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
            The ultimate toolkit for creators. Professional-grade tools at your fingertips, free for everyone.
          </p>
          <div className="flex gap-4">
            <a href="#" className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:text-brand-primary transition-all shadow-sm">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="#" className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:text-brand-primary transition-all shadow-sm">
              <Github className="w-5 h-5" />
            </a>
            <a href="#" className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:text-brand-primary transition-all shadow-sm">
              <Mail className="w-5 h-5" />
            </a>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-6">Tools</h4>
          <ul className="space-y-4 text-slate-600 dark:text-slate-400">
            <li><Link to="/tools/passport" className="hover:text-brand-primary transition-colors">Passport Photo Maker</Link></li>
            <li><Link to="/tools/signature" className="hover:text-brand-primary transition-colors">Signature Editor</Link></li>
            <li><Link to="/tools/size-converter" className="hover:text-brand-primary transition-colors">Size Converter</Link></li>
            <li><Link to="/tools/doc-converter" className="hover:text-brand-primary transition-colors">Document Converter</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-6">Company</h4>
          <ul className="space-y-4 text-slate-600 dark:text-slate-400">
            <li><Link to="/about" className="hover:text-brand-primary transition-colors">About Us</Link></li>
            <li><Link to="/privacy" className="hover:text-brand-primary transition-colors">Privacy Policy</Link></li>
            <li><Link to="/feedback" className="hover:text-brand-primary transition-colors">Feedback</Link></li>
            <li><Link to="/contact" className="hover:text-brand-primary transition-colors">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-6">Get in Touch</h4>
          <ul className="space-y-4 text-slate-600 dark:text-slate-400">
            <li className="flex gap-2">
              <MapPin className="w-5 h-5 text-brand-primary shrink-0" />
              <span>Silicon Valley, CA</span>
            </li>
            <li className="flex gap-2 text-brand-primary">
              <Mail className="w-5 h-5 shrink-0" />
              <span>support@toolpack.com</span>
            </li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto pt-8 border-t border-slate-200/50 dark:border-slate-800/50 text-center text-slate-500 text-sm">
        © {new Date().getFullYear()} ToolPack Inc. Crafted with passion by Antigravity AI.
      </div>
    </footer>
  );
};
