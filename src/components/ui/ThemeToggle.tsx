import { Sun, Moon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from './Button';

export const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(
    () => localStorage.getItem('theme') === 'dark' || 
    (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
  );

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  return (
    <Button
      variant="ghost"
      size="sm"
      aria-label="Toggle theme"
      onClick={() => setIsDark(!isDark)}
      className="p-2 w-10 h-10 rounded-full"
    >
      {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-700" />}
    </Button>
  );
};
