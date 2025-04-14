import React from "react";

const Footer: React.FC = () => (
  <footer className="w-full py-6 px-4 text-center text-xs text-slate-500 border-t border-slate-100 bg-white/80 z-10 mt-12">
    <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
      <div>
        <span className="font-semibold">Mnemos AI</span> &copy; {new Date().getFullYear()} by <a href="https://home.intellisyncsolutions.io" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline font-semibold">IntelliSync Solutions</a>. All rights reserved.
      </div>
      <div className="flex gap-4 items-center">
        <a href="mailto:Chris.June@intellisync.ca" className="hover:text-blue-600 transition-colors">Contact: Chris June</a>
        <a href="https://intellisyncsolutions.io" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors">GPT Builder</a>
        <a href="/privacy" className="hover:text-blue-600 transition-colors">Privacy Policy</a>
      </div>
    </div>
  </footer>
);

export default Footer;
