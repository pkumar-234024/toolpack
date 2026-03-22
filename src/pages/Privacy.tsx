import { Card } from '../components/ui/Card';
import { Shield, Eye, FileText, Lock } from 'lucide-react';

export const Privacy = () => {
  return (
    <div className="container mx-auto px-6 py-20 pt-32 max-w-4xl">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-extrabold mb-4 tracking-tight">Privacy <span className="text-brand-primary underline decoration-brand-accent/20 underline-offset-8">Policy</span></h1>
        <p className="text-slate-600 dark:text-slate-400">Your privacy is our top priority. We've built ToolPack to be local-first and secure.</p>
      </div>

      <div className="space-y-8">
        {[
          {
            icon: Shield,
            title: "Local-First Processing",
            content: "The core of ToolPack's security model is local processing. When you convert a document or edit a photo, all computing happens directly on your machine. Your files never leave your browser."
          },
          {
            icon: Eye,
            title: "Zero Data Tracking",
            content: "We don't track your behavior, IP, or digital footprint. ToolPack does not use third-party tracking pixels or marketing analytics. We exist purely to provide tools, not to collect profiles."
          },
          {
            icon: Lock,
            title: "No Account Required",
            content: "You don't need to sign up or provide an email to use our tools. This ensures that even if we were compromised, there would be no user data to steal."
          },
          {
            icon: FileText,
            title: "Session Persistence",
            content: "Work is saved in your browser's session memory only while the tab is open. We do not use permanent storage (like localDB or large Cookies) for your workspace content."
          }
        ].map((section, idx) => (
          <Card key={idx} variant="solid" className="p-8 border-none bg-slate-50 dark:bg-slate-900 transition-all hover:bg-white dark:hover:bg-slate-800 shadow-sm border border-slate-200/50 dark:border-slate-800/50">
            <div className="flex items-start gap-6">
              <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center shadow-sm text-brand-primary shrink-0 transition-transform group-hover:scale-110">
                <section.icon className="w-6 h-6 text-indigo-500" />
              </div>
              <div className="flex flex-col gap-3">
                <h3 className="text-xl font-bold">{section.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {section.content}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-20 pt-12 border-t border-slate-200 dark:border-slate-800 text-center text-sm text-slate-500 max-w-2xl mx-auto">
        <p className="italic">Last updated: March 22, 2026. If you have questions about how ToolPack handles your digital privacy, please use our contact form or email our security lead at safety@toolpack.com</p>
      </div>
    </div>
  );
};
