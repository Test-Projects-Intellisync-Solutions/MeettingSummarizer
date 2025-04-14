import React from "react";
import { Sparkles } from "lucide-react";

const NavHeader: React.FC = () => (
  <header className="w-full bg-white/90 backdrop-blur-xl border-b border-slate-100 shadow-sm z-20 sticky top-0">
    <nav className="max-w-5xl mx-auto flex items-center justify-between gap-4 px-4 py-4">
      <div className="flex items-center gap-3">
        <Sparkles className="text-blue-500 drop-shadow" size={32} />
        <div>
          <span className="text-2xl font-extrabold tracking-tight text-slate-900">Mnemos <span className="text-xs font-bold text-blue-400 align-top ml-1">AI</span></span>
          <span className="block text-xs text-slate-400 font-semibold mt-0.5">by IntelliSync Solutions</span>
        </div>
      </div>
      <ul className="flex gap-6 text-slate-700 font-medium text-base">
        <li><a href="#home" className="hover:text-blue-600 transition-colors">Home</a></li>
        <li><a href="#about" className="hover:text-blue-600 transition-colors">About</a></li>
        <li><a href="#docs" className="hover:text-blue-600 transition-colors">Docs</a></li>
        <li><a href="#contact" className="hover:text-blue-600 transition-colors">Contact</a></li>
      </ul>
    </nav>
  </header>
);

export default NavHeader;
