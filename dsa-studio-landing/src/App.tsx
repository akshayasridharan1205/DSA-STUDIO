import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { motion } from 'framer-motion';
import HeroScene from './HeroScene';

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Close menu on Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMenuOpen(false);
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  // Prevent scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isMenuOpen]);

  return (
    <div className="relative min-h-screen h-screen w-full overflow-hidden bg-black text-white font-sans flex flex-col selection:bg-white/30">
      {/* Background layer */}
      <div className="absolute inset-0 z-0 bg-radial-subtle flex items-center justify-center pointer-events-none">
        <div className="absolute inset-0 grid-bg opacity-30"></div>
      </div>
      <HeroScene />

      {/* Navbar */}
      <motion.nav 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0 }}
        className="relative z-50 flex items-center justify-between px-6 py-6 md:px-10"
      >
        {/* Logo */}
        <div className="flex items-center gap-3 cursor-pointer group">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white group-hover:scale-105 transition-transform duration-300">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="12" cy="12" r="2" fill="currentColor" />
          </svg>
          <span className="text-lg font-semibold tracking-tight">DSA Studio</span>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {["Topics", "Visualizer", "Practice", "About"].map((link) => (
            <a key={link} href="#" className="text-sm font-medium tracking-wide text-white/80 hover:text-white hover:opacity-100 transition-colors">
              {link}
            </a>
          ))}
        </div>

        {/* Mobile Nav Toggle */}
        <button 
          className="md:hidden p-2 -mr-2 text-white/80 hover:text-white transition-colors z-50"
          onClick={() => setIsMenuOpen(true)}
          aria-label="Open Menu"
        >
          <Menu className="w-6 h-6" />
        </button>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <div 
        className={`fixed inset-0 z-[60] bg-black/95 backdrop-blur-sm flex flex-col transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      >
        <div className="flex justify-end p-6 md:p-10">
          <button 
            className="p-2 -mr-2 text-white/80 hover:text-white transition-colors"
            onClick={() => setIsMenuOpen(false)}
            aria-label="Close Menu"
          >
            <X className="w-8 h-8" />
          </button>
        </div>
        <div className="flex flex-col items-center justify-center flex-1 gap-8">
          {["Topics", "Visualizer", "Practice", "About"].map((link, idx) => (
            <a 
              key={link} 
              href="#" 
              onClick={() => setIsMenuOpen(false)}
              className={`text-3xl font-medium tracking-tight text-white transition-all duration-500 delay-[${idx * 100}ms] ${
                isMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
              } hover:text-white/70`}
              style={{ transitionDelay: isMenuOpen ? `${idx * 100}ms` : '0ms' }}
            >
              {link}
            </a>
          ))}
        </div>
      </div>

      {/* Hero Section */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold uppercase font-display tracking-tight text-white mb-8 leading-[1.05]" 
          >
            WRITE CODE.<br />
            <span className="text-white">WATCH IT MOVE.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.25 }}
            className="max-w-2xl text-lg md:text-xl text-white/60 mb-12 font-light leading-relaxed"
          >
            Write code, step through it line by line, and watch every pointer, node, and memory change animate in real time.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.35 }}
            className="flex flex-col sm:flex-row items-center gap-6"
          >
            <button className="px-8 py-3.5 bg-white text-black rounded-full font-semibold tracking-wide hover:bg-white/90 transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.2)]">
              Start Learning
            </button>
            <button className="px-6 py-3.5 text-white/80 font-medium hover:text-white transition-colors relative after:absolute after:bottom-2.5 after:left-6 after:right-6 after:h-[1px] after:bg-white/30 hover:after:bg-white/80 after:transition-colors">
              View Topics
            </button>
          </motion.div>
        </div>
      </main>

      {/* Footer Strip */}
      <footer className="relative z-10 flex flex-col sm:flex-row items-center justify-between px-6 py-6 md:px-10 text-xs sm:text-sm text-white/50 tracking-wider">
        <div className="mb-2 sm:mb-0">
          Arrays &middot; Linked Lists &middot; Stacks &middot; Queues &middot; Trees &middot; Graphs
        </div>
        <div>
          Built by Akshaya
        </div>
      </footer>
    </div>
  );
}
