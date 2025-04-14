import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send } from 'lucide-react';

interface NotesInputProps {
  onSubmit: (notes: string, documents: File[]) => void;
}

const NotesInput: React.FC<NotesInputProps> = ({ onSubmit }) => {
  const [notes, setNotes] = useState('');
  const [documents, setDocuments] = useState<File[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Trim notes and validate
    const trimmedNotes = notes.trim();
    if (!trimmedNotes) {
      alert('Please enter meeting notes');
      return;
    }

    // Log submission details
    console.log('Submitting notes:', {
      notesLength: trimmedNotes.length,
      documentCount: documents.length
    });

    // Call onSubmit with notes and documents
    onSubmit(trimmedNotes, documents);
  };

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = e.target.files ? Array.from(e.target.files) : [];
    
    // Log uploaded files
    console.log('Uploaded files:', uploadedFiles);
    
    setDocuments(uploadedFiles);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl shadow-xl border border-slate-100 bg-white/70 backdrop-blur-md px-0 py-0 overflow-hidden"
      style={{ minHeight: 120 }}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-6 md:p-8">
        <label htmlFor="meeting-notes" className="text-slate-700 font-medium text-base mb-1">
          Meeting Notes
        </label>
        <textarea
          id="meeting-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Paste your meeting notes here..."
          className="resize-none rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-base text-slate-800 font-mono focus:ring-2 focus:ring-blue-300 focus:border-blue-300 outline-none transition-all min-h-[120px] max-h-96 shadow-inner placeholder:text-slate-400"
          rows={6}
          spellCheck={true}
        />
        <div className="flex justify-end gap-3">
          <button
            type="button"
            className="inline-flex items-center gap-2 bg-slate-200 hover:bg-slate-300 active:bg-slate-400 text-slate-700 font-semibold rounded-xl px-5 py-2 shadow transition-all focus:outline-none focus:ring-2 focus:ring-blue-200"
            aria-label="Clear meeting notes"
            onClick={() => setNotes('')}
            disabled={notes.length === 0}
          >
            Clear
          </button>
          <button
            type="submit"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold rounded-xl px-6 py-2 shadow transition-all focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            <Send size={18} className="-ml-1" />
            Generate Summary
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default NotesInput;
