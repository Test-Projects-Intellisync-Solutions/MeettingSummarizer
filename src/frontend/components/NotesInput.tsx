import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send } from 'lucide-react';

interface NotesInputProps {
  onSubmit: (notes: string, documents: File[]) => void;
}

const NotesInput: React.FC<NotesInputProps> = ({ onSubmit }) => {
  const [notes, setNotes] = useState('');
  const [documents, setDocuments] = useState<File[]>([]);
  const [extractedText, setExtractedText] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Trim notes and validate
    const trimmedNotes = notes.trim();
    if (!trimmedNotes && !extractedText.trim()) {
      alert('Please enter meeting notes or upload a document');
      return;
    }

    // Log submission details
    console.log('Submitting notes:', {
      notesLength: trimmedNotes.length,
      extractedTextLength: extractedText.length,
      documentCount: documents.length
    });

    // Call onSubmit with merged notes and extracted document text
    onSubmit(trimmedNotes + (extractedText ? '\n\n[Document]\n' + extractedText : ''), documents);
  };

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = e.target.files ? Array.from(e.target.files) : [];
    setDocuments(uploadedFiles);
    setExtractedText('');
    setUploadError(null);
    if (uploadedFiles.length > 0) {
      const file = uploadedFiles[0];
      if (file.type !== 'application/pdf') {
        setUploadError('Only PDF files are supported.');
        return;
      }
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append('document', file);
        const response = await fetch('/api/upload-document', {
          method: 'POST',
          body: formData
        });
        const data = await response.json();
        if (response.ok && data.text) {
          setExtractedText(data.text);
        } else {
          setUploadError(data.error || 'Failed to extract text from PDF.');
        }
      } catch (err) {
        setUploadError('Failed to upload or parse document.');
      } finally {
        setUploading(false);
      }
    }
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

        <label htmlFor="pdf-upload" className="text-slate-700 font-medium text-base mt-2">Upload PDF Document</label>
        <input
          id="pdf-upload"
          type="file"
          accept="application/pdf"
          onChange={handleDocumentUpload}
          className="block w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        {uploading && <span className="text-xs text-blue-600">Extracting text from PDF...</span>}
        {uploadError && <span className="text-xs text-red-500">{uploadError}</span>}
        {extractedText && (
          <div className="mt-2">
            <label htmlFor="extracted-text" className="text-slate-700 font-medium text-sm mb-1">Extracted Document Text (edit if needed):</label>
            <textarea
              id="extracted-text"
              value={extractedText}
              onChange={e => setExtractedText(e.target.value)}
              className="resize-none rounded-xl border border-slate-200 bg-white/80 px-4 py-2 text-sm text-slate-800 font-mono focus:ring-2 focus:ring-blue-300 focus:border-blue-300 outline-none transition-all min-h-[80px] max-h-60 shadow-inner placeholder:text-slate-400 mt-1"
              rows={5}
              spellCheck={true}
            />
          </div>
        )}
        <div className="flex justify-end gap-3 mt-2">
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
