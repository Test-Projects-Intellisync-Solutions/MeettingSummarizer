import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { FileUp, FileText, X } from 'lucide-react';

const DocumentUploader: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFiles(Array.from(event.target.files));
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files) {
      setFiles(Array.from(e.dataTransfer.files));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={
        `relative flex flex-col items-center justify-center gap-3 px-0 py-0 ` +
        `rounded-2xl shadow-xl border border-slate-100 ` +
        `bg-white/70 backdrop-blur-md overflow-hidden ` +
        `${isDragActive ? 'ring-2 ring-blue-400 ring-offset-2' : ''}`
      }
      onDragOver={e => { e.preventDefault(); setIsDragActive(true); }}
      onDragLeave={e => { e.preventDefault(); setIsDragActive(false); }}
      onDrop={handleDrop}
      style={{ minHeight: 140 }}
    >
      <input
        type="file"
        multiple
        ref={inputRef}
        onChange={handleFileChange}
        className="hidden"
      />
      <button
        type="button"
        className="flex flex-col items-center justify-center gap-2 py-8 px-8 w-full h-full focus:outline-none"
        onClick={() => inputRef.current?.click()}
        tabIndex={0}
        aria-label="Upload documents"
      >
        <FileUp size={38} className="text-blue-400 drop-shadow mb-1" />
        <span className="text-lg font-medium text-slate-700">Drag & drop or <span className="underline text-blue-500">browse</span></span>
        <span className="text-xs text-slate-400">PDF, DOCX, TXT, etc. (max 5 files)</span>
      </button>
      {files.length > 0 && (
        <div className="absolute left-0 right-0 bottom-0 px-4 pb-4">
          <div className="bg-white/90 rounded-lg shadow border border-slate-100 p-3 mt-2">
            <p className="text-xs text-slate-500 mb-1 font-medium">Selected Files:</p>
            <ul className="flex flex-wrap gap-2">
              {files.map((file, idx) => (
                <li key={idx} className="flex items-center gap-1 px-2 py-1 bg-slate-100 rounded text-xs font-medium text-slate-700">
                  <FileText size={15} className="mr-1 text-blue-400" />
                  {file.name}
                  <button
                    type="button"
                    className="ml-1 text-slate-400 hover:text-red-400 focus:outline-none"
                    onClick={() => setFiles(files.filter((_, i) => i !== idx))}
                    aria-label={`Remove ${file.name}`}
                  >
                    <X size={14} />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default DocumentUploader;
