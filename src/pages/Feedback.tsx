import React from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Star, Send, Trophy, Layout, Shield } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { sendEmail } from '../services/emailService';

export const Feedback = () => {
  const [rating, setRating] = React.useState(0);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [formData, setFormData] = React.useState({
    feature: 'General',
    email: '',
    comment: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Please provide a star rating before submitting.');
      return;
    }

    setIsSubmitting(true);
    try {
      const resp = await sendEmail({
        sender: formData.email,
        subject: `ToolPack Feedback: ${formData.feature}`,
        body: `Rating: ${rating} Stars\n\nComment: ${formData.comment}`
      });

      if (resp.success) {
        toast.success('Thank you! Your feedback has been recorded.');
        setFormData({ feature: 'General', email: '', comment: '' });
        setRating(0);
      }
    } catch (err) {
      toast.error('Failed to process feedback. Our server might be temporarily offline.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-6 py-20 pt-32 max-w-4xl">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-extrabold mb-4 tracking-tight">Share Your <span className="text-brand-primary underline decoration-brand-accent/20 underline-offset-8">Experience</span></h1>
        <p className="text-slate-600 dark:text-slate-400">Help us fine-tune ToolPack. Every piece of feedback helps build a better toolkit.</p>
      </div>

      <Card className="p-10 saas-card backdrop-blur-3xl shadow-2xl border-white/5 rounded-[3rem] overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-3xl -mr-32 -mt-32 rounded-full" />
        
        <form onSubmit={handleSubmit} className="space-y-10 relative z-10">
          <div className="flex flex-col items-center gap-6">
             <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] text-center">Your Rating</label>
             <div className="flex gap-4">
                {[1, 2, 3, 4, 5].map(v => (
                  <button 
                    key={v} type="button" 
                    onClick={() => setRating(v)}
                    className={`transition-all duration-300 transform hover:scale-125 ${rating >= v ? 'text-brand-accent drop-shadow-[0_0_12px_rgba(255,215,0,0.4)] scale-110' : 'text-slate-700 hover:text-slate-500'}`}
                  >
                    <Star className={`w-10 h-10 ${rating >= v ? 'fill-current' : 'fill-none'}`} />
                  </button>
                ))}
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-slate-800/40">
             <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Tool Category</label>
                <div className="grid grid-cols-2 gap-3">
                   {['Passport', 'Signature', 'General', 'Other'].map(f => (
                     <button
                       key={f} type="button"
                       onClick={() => setFormData({...formData, feature: f})}
                       className={`p-3 text-[11px] font-bold tracking-tight rounded-xl border transition-all ${formData.feature === f ? 'bg-indigo-500/10 border-indigo-500/40 text-indigo-400' : 'bg-slate-900 border-white/5 text-slate-500 hover:border-slate-800'}`}
                     >
                        {f}
                     </button>
                   ))}
                </div>
             </div>

             <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Email (Optional)</label>
                <input 
                   type="email"
                   value={formData.email}
                   onChange={e => setFormData({...formData, email: e.target.value})}
                   placeholder="john@example.com"
                   className="w-full h-14 bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 outline-none p-4 rounded-xl text-sm font-bold transition-all shadow-sm"
                />
             </div>
          </div>

          <div className="space-y-3">
             <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Your Detailed Feedback</label>
             <textarea 
               rows={4} required
               value={formData.comment}
               onChange={e => setFormData({...formData, comment: e.target.value})}
               className="w-full bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 outline-none p-4 rounded-3xl text-sm font-bold transition-all shadow-sm resize-none"
               placeholder="Tell us what you love or what we could improve..."
             />
          </div>

          <Button 
            type="submit" 
            className="h-16 w-full bg-indigo-500 hover:bg-indigo-600 text-white font-black uppercase tracking-widest gap-2 shadow-2xl shadow-indigo-500/10 rounded-2xl active:scale-95 transition-all"
            leftIcon={<Send className="w-5 h-5" />}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Finalizing Feed...' : 'Submit Feedback'}
          </Button>
        </form>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24">
         {[
           { icon: Trophy, title: 'Continuous Growth', text: 'We regularly implement features requested by our community.' },
           { icon: Layout, title: 'Polish & Refine', text: 'Your feedback directly impacts the UI/UX evolution of ToolPack.' },
           { icon: Shield, title: 'Quality Assurance', text: 'Every bug report helps us reach mission-critical stability.' }
         ].map((item, idx) => (
           <Card key={idx} variant="glass" className="text-center p-8 bg-slate-900/40 border-none shadow-sm hover:shadow-indigo-500/5 transition-all">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center mx-auto mb-6 text-indigo-400">
                 <item.icon className="w-6 h-6" />
              </div>
              <h4 className="font-extrabold text-sm mb-2">{item.title}</h4>
              <p className="text-slate-500 text-xs leading-relaxed">{item.text}</p>
           </Card>
         ))}
      </div>
    </div>
  );
};
