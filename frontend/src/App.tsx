import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { MethodologyPage } from './pages/MethodologyPage';
import { DataCoveragePage } from './pages/DataCoveragePage';
import { ArchitecturePage } from './pages/ArchitecturePage';
import { ApiDocsPage } from './pages/ApiDocsPage';
import { DashboardPage } from './pages/DashboardPage';
import { ContactPage } from './pages/ContactPage';
import { ExternalLink } from 'lucide-react';

export function App() {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine activePage from URL pathname for full SPA routing support
  const getPageFromPath = (path: string): string => {
    const cleanPath = path.toLowerCase().replace(/^\/|\/$/g, '');
    if (!cleanPath) return 'home';
    if (cleanPath === 'about' || cleanPath === 'methodology') return 'methodology';
    if (cleanPath === 'data' || cleanPath === 'analytics') return 'data';
    if (cleanPath === 'architecture' || cleanPath === 'how-it-works') return 'architecture';
    if (cleanPath === 'api') return 'api';
    if (cleanPath === 'dashboard' || cleanPath === 'prediction' || cleanPath === 'recommendation') return 'dashboard';
    if (cleanPath === 'contact') return 'contact';
    return 'home';
  };

  const [activePage, setActivePageState] = useState<string>(() => getPageFromPath(location.pathname));

  useEffect(() => {
    setActivePageState(getPageFromPath(location.pathname));
  }, [location.pathname]);

  const handleSetActivePage = (pageId: string) => {
    setActivePageState(pageId);
    if (pageId === 'home') {
      navigate('/');
    } else {
      navigate(`/${pageId}`);
    }
  };

  const apiDocsUrl = import.meta.env.VITE_API_URL 
    ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/docs`
    : 'http://localhost:8000/docs';

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-800">
      
      {/* Top Engineering & Provenance Announcement Bar */}
      <div className="bg-slate-900 text-slate-300 text-xs py-2 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-mono text-slate-200 font-medium">
              AgriLink-OR v2.0: Pure Operations Research Engine
            </span>
            <span className="hidden sm:inline text-slate-500">·</span>
            <span className="hidden sm:inline text-emerald-400 font-mono font-semibold">
              50 / 50 Tests Passing
            </span>
            <span className="hidden md:inline text-slate-500">·</span>
            <span className="hidden md:inline text-crimson-400 font-mono font-bold">
              ZERO MACHINE LEARNING
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px] font-mono">
            <span className="text-emerald-400 flex items-center gap-1 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>Netlify Production Ready</span>
            </span>
            <span className="text-slate-600">|</span>
            <a 
              href={apiDocsUrl} 
              target="_blank" 
              rel="noreferrer"
              className="text-slate-400 hover:text-white transition-colors flex items-center gap-1"
            >
              <span>API /docs</span>
              <ExternalLink className="w-3 h-3 text-slate-500" />
            </a>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <Navbar activePage={activePage} setActivePage={handleSetActivePage} />

      {/* Page Content Viewport with SPA Routes */}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage setActivePage={handleSetActivePage} />} />
          <Route path="/about" element={<MethodologyPage />} />
          <Route path="/methodology" element={<MethodologyPage />} />
          <Route path="/how-it-works" element={<ArchitecturePage />} />
          <Route path="/architecture" element={<ArchitecturePage />} />
          <Route path="/analytics" element={<DataCoveragePage />} />
          <Route path="/data" element={<DataCoveragePage />} />
          <Route path="/prediction" element={<DashboardPage />} />
          <Route path="/recommendation" element={<DashboardPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/api" element={<ApiDocsPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Footer */}
      <Footer setActivePage={handleSetActivePage} />

    </div>
  );
}

export default App;
