import React from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Mail, MapPin, Send, MessageSquareText, ShieldCheck } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { sendEmail } from '../services/emailService';

export const Contact = () => {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const resp = await sendEmail({
        sender: formData.email,
        subject: `ToolPack Contact: ${formData.subject}`,
        body: formData.message + `\n\n- Sent by ${formData.name}`
      });

      if (resp.success) {
        toast.success(resp.message);
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        toast.error('Unable to reach our support systems. Please try again.');
      }
    } catch (err) {
      toast.error('An unexpected error occurred while sending your message.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-6 py-20 pt-32 max-w-7xl">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-extrabold mb-4 tracking-tight">Get in <span className="text-brand-primary underline decoration-brand-accent/20 underline-offset-8">Touch</span></h1>
        <p className="text-slate-600 dark:text-slate-400">We're here to help you get the most out of our toolkit.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-5 space-y-8">
           <Card variant="solid" className="p-8 border-none bg-indigo-50 dark:bg-slate-900 shadow-sm">
             <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-indigo-500 shadow-sm">
                   <MessageSquareText className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold">Contact Details</h2>
             </div>
             
             <div className="space-y-6">
               <div className="flex gap-4">
                 <Mail className="w-5 h-5 text-indigo-500 shrink-0 mt-1" />
                 <div>
                   <span className="block text-xs font-bold uppercase text-slate-500 mb-1 tracking-widest">Email</span>
                   <span className="font-bold text-slate-800 dark:text-white">support@toolpack.com</span>
                 </div>
               </div>
               
               <div className="flex gap-4">
                 <MapPin className="w-5 h-5 text-indigo-500 shrink-0 mt-1" />
                 <div>
                   <span className="block text-xs font-bold uppercase text-slate-500 mb-1 tracking-widest">Office</span>
                   <span className="font-bold text-slate-800 dark:text-white italic">Silicon Valley, CA</span>
                 </div>
               </div>
             </div>
           </Card>

           <Card variant="glass" className="p-8 bg-brand-primary/5 border-l-4 border-l-brand-primary/40 relative overflow-hidden group">
             <div className="relative z-10 flex items-center gap-4">
               <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary group-hover:scale-110 transition-transform">
                 <ShieldCheck className="w-5 h-5" />
               </div>
               <div>
                  <h4 className="font-bold text-sm">Response Time</h4>
                  <p className="text-xs text-slate-500 font-medium tracking-tight">Typically we respond under 24 hours.</p>
               </div>
             </div>
             <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-brand-accent/10 blur-3xl rounded-full" />
           </Card>
        </div>

        <Card className="lg:col-span-7 p-10 saas-card backdrop-blur-3xl shadow-2xl border-white/5 rounded-[2.5rem]">
           <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Full Name</label>
                    <input 
                      type="text" required
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      placeholder="John Doe"
                      className="w-full bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 outline-none p-4 rounded-xl text-sm font-bold transition-all shadow-sm focus:ring-1 focus:ring-indigo-500"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Business Email</label>
                    <input 
                      type="email" required
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      placeholder="john@example.com"
                      className="w-full bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 outline-none p-4 rounded-xl text-sm font-bold transition-all shadow-sm focus:ring-1 focus:ring-indigo-500"
                    />
                 </div>
              </div>

              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Subject</label>
                 <select 
                   value={formData.subject} required
                   onChange={e => setFormData({...formData, subject: e.target.value})}
                   className="w-full bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 outline-none p-4 rounded-xl text-sm font-bold transition-all shadow-sm cursor-pointer appearance-none"
                 >
                   <option value="">Select a category</option>
                   <option value="General Inquiry">General Inquiry</option>
                   <option value="Technical Support">Technical Support</option>
                   <option value="Feature Request">Feature Request</option>
                 </select>
              </div>

              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Your Message</label>
                 <textarea 
                   rows={5} required
                   value={formData.message}
                   onChange={e => setFormData({...formData, message: e.target.value})}
                   placeholder="How can we help?"
                   className="w-full bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 outline-none p-4 rounded-xl text-sm font-bold transition-all shadow-sm resize-none focus:ring-1 focus:ring-indigo-500"
                 />
              </div>

              <Button 
                type="submit" 
                className="w-full h-14 bg-indigo-500 hover:bg-indigo-600 text-white font-extrabold uppercase tracking-widest gap-2 shadow-xl shadow-indigo-500/20 active:scale-[0.98] transition-all"
                leftIcon={<Send className="w-4 h-4" />}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Transmitting Module...' : 'Send Message'}
              </Button>
           </form>
        </Card>
      </div>
    </div>
  );
};
