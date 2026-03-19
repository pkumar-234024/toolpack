import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './app/store';
import { MainLayout } from './layouts/MainLayout';
import { Home } from './pages/Home';
import { Tools } from './pages/Tools';
import { About } from './pages/About';
import { Loader2 } from 'lucide-react';

const PassportTool = lazy(() => import('./features/passport/PassportTool').then(m => ({ default: m.PassportTool })));
const SignatureTool = lazy(() => import('./features/signature/SignatureTool').then(m => ({ default: m.SignatureTool })));
const SizeConverter = lazy(() => import('./features/size-converter/SizeConverter').then(m => ({ default: m.SizeConverter })));
const DocConverter = lazy(() => import('./features/doc-converter/DocConverter').then(m => ({ default: m.DocConverter })));

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
    <div className="flex flex-col items-center gap-6">
      <div className="relative">
        <Loader2 className="w-12 h-12 text-brand-primary animate-spin" />
        <div className="absolute inset-0 w-12 h-12 bg-brand-primary/20 rounded-full blur-xl animate-pulse" />
      </div>
      <p className="font-bold text-slate-500 animate-pulse tracking-widest uppercase text-xs">Loading Tool Suite...</p>
    </div>
  </div>
);

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <MainLayout>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/tools" element={<Tools />} />
              <Route path="/about" element={<About />} />
              
              {/* Tool Routes */}
              <Route path="/tools/passport" element={<PassportTool />} />
              <Route path="/tools/signature" element={<SignatureTool />} />
              <Route path="/tools/size-converter" element={<SizeConverter />} />
              <Route path="/tools/doc-converter" element={<DocConverter />} />
              
              {/* Catch all redirect to Home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </MainLayout>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
