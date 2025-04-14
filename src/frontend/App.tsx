import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, FileUp, ClipboardEdit } from 'lucide-react';
import DocumentUploader from './components/DocumentUploader';
import NotesInput from './components/NotesInput';
import SummaryDisplay from './components/SummaryDisplay';
import FeedbackForm from './components/FeedbackForm';
import NavHeader from './components/NavHeader';
import Footer from './components/Footer';
import { ActionItemsPanel } from './modules/ActionItems';
import type { ActionItem } from '../shared/types/actionItem';


const App: React.FC = () => {
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [actionItemsLoading, setActionItemsLoading] = useState(false);

  const handleSubmit = async (notes: string, documents: File[]) => {
    setIsLoading(true);
    setSummary(null);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('notes', notes);
      documents.forEach((doc, index) => {
        formData.append(`documents[${index}]`, doc, doc.name);
      });

      console.log('🚀 Submitting summary request with:', {
        notesLength: notes.length,
        documentCount: documents.length
      });

      // Log FormData contents
      for (const [key, value] of formData.entries()) {
        console.log(`FormData - ${key}:`, value);
      }

     const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';
const response = await fetch(`${BACKEND_URL}/api/generate-summary`, {
  method: 'POST',
  body: formData
});

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
        setError(errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      let fullSummary = '';
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader?.read() || {};
        if (done) break;

        const chunk = decoder.decode(value);
        const events = chunk.split('\n\n');

        for (const event of events) {
          if (event.startsWith('data: ')) {
            try {
              const data = JSON.parse(event.slice(6));
              if (data.content) {
                fullSummary += data.content;
                setSummary(fullSummary);
              }
              if (data.type === 'done') break;
            } catch (e) {
              console.error('Error parsing event:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('❌ Summary generation failed:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
      setSummary(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Extract action items from summary
  const handleExtractActionItems = async () => {
    if (!summary) return;
    setActionItemsLoading(true);
    try {
      const response = await fetch('/extract-action-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notesOrSummary: summary })
      });
      if (!response.ok) throw new Error('Failed to extract action items');
      const data = await response.json();
      setActionItems(data.items || []);
    } catch (err) {
      setActionItems([]);
    } finally {
      setActionItemsLoading(false);
    }
  };

  return (
    <>

      <div className="min-h-screen w-full bg-gradient-to-br from-blue-400 via-purple-300 to-teal-200 flex flex-col relative overflow-x-hidden">
      {/* Animated Apple-style background blobs */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute left-[-10vw] top-[-10vh] w-[60vw] h-[60vw] rounded-full bg-blue-400/50 blur-3xl animate-float" />
        <div className="absolute right-[-15vw] top-[30vh] w-[40vw] h-[40vw] rounded-full bg-purple-400/30 blur-2xl animate-float2" />
        <div className="absolute left-[20vw] bottom-[-20vh] w-[50vw] h-[50vw] rounded-full bg-teal-300/40 blur-2xl animate-float3" />
      </div>
      {/* Navigation Header */}
      <NavHeader />
      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-14 z-10">
        <div className="w-full max-w-3xl flex flex-col gap-10">
          {/* Upload Card */}
          <AnimatePresence>
            <motion.section
              key="upload"
              initial={{ opacity: 0, y: 40, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.98 }}
              transition={{ duration: 0.7, type: 'spring', bounce: 0.18 }}
              className="rounded-3xl bg-white/80 backdrop-blur-2xl shadow-2xl border border-slate-200 px-0 py-0 overflow-hidden"
            >
              <div className="p-8 md:p-12 flex flex-col gap-6">
                <div className="flex items-center gap-2 mb-2">
                  <FileUp className="text-blue-500" size={26} />
                  <span className="font-semibold text-slate-800 text-xl">Upload Documents</span>
                </div>
                <DocumentUploader />
              </div>
            </motion.section>
          </AnimatePresence>
          {/* Notes Card */}
          <AnimatePresence>
            <motion.section
              key="notes"
              initial={{ opacity: 0, y: 40, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.98 }}
              transition={{ duration: 0.7, type: 'spring', bounce: 0.18, delay: 0.1 }}
              className="rounded-3xl bg-white/80 backdrop-blur-2xl shadow-2xl border border-slate-200 px-0 py-0 overflow-hidden"
            >
              <div className="p-8 md:p-12 flex flex-col gap-6">
                <div className="flex items-center gap-2 mb-2">
                  <ClipboardEdit className="text-blue-500" size={24} />
                  <span className="font-semibold text-slate-800 text-xl">Paste Meeting Notes</span>
                </div>
                <NotesInput onSubmit={handleSubmit} />
              </div>
            </motion.section>
          </AnimatePresence>
          {/* Status/Error/Summary Card */}
          <AnimatePresence>
            {isLoading && (
              <motion.section
                key="loading"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 40 }}
                transition={{ duration: 0.5 }}
                className="rounded-3xl bg-white/70 backdrop-blur-2xl shadow-2xl border border-slate-100 px-0 py-0 overflow-hidden"
              >
                <div className="p-10 flex flex-col items-center gap-4 min-h-[120px]">
                  <div className="w-14 h-14 border-[5px] border-blue-200 border-t-blue-500 rounded-full animate-spin" />
                  <p className="text-blue-600 font-semibold text-lg mt-2">Generating summary...</p>
                </div>
              </motion.section>
            )}
            {error && (
              <motion.section
                key="error"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 40 }}
                transition={{ duration: 0.5 }}
                className="rounded-3xl bg-red-50/80 backdrop-blur-2xl shadow-2xl border border-red-200 px-0 py-0 overflow-hidden"
              >
                <div className="p-10 text-center">
                  <strong className="font-bold text-red-600 text-lg">Error:</strong>
                  <span className="block text-red-700 mt-2">{error}</span>
                </div>
              </motion.section>
            )}
            {summary && (
              <motion.section
                key="summary"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 40 }}
                transition={{ duration: 0.5 }}
                className="rounded-3xl bg-white/90 backdrop-blur-2xl shadow-2xl border border-slate-100 px-0 py-0 overflow-hidden"
              >
                <div className="p-7 md:p-10">
                  <SummaryDisplay summary={summary} />
                  {/* Action Items Panel below summary */}
                  <ActionItemsPanel
                    items={actionItems}
                    onExtract={handleExtractActionItems}
                    loading={actionItemsLoading}
                  />
                </div>
              </motion.section>
            )}
            {!isLoading && !summary && !error && (
              <motion.section
                key="prompt"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 40 }}
                transition={{ duration: 0.5 }}
                className="rounded-3xl bg-white/70 backdrop-blur-2xl shadow-2xl border border-slate-100 px-0 py-0 overflow-hidden"
              >
                <div className="p-10 text-center text-slate-400 text-base">
                  <span>Paste your notes and upload documents to get started!</span>
                </div>
              </motion.section>
            )}
          </AnimatePresence>
          {/* Feedback Card */}
          <AnimatePresence>
            <motion.section
              key="feedback"
              initial={{ opacity: 0, y: 40, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.98 }}
              transition={{ duration: 0.7, type: 'spring', bounce: 0.18, delay: 0.2 }}
              className="rounded-3xl bg-white/70 backdrop-blur-2xl shadow-2xl border border-slate-100 px-0 py-0 overflow-hidden"
            >
              <div className="p-7 md:p-10">
                <FeedbackForm />
              </div>
            </motion.section>
          </AnimatePresence>
        </div>
      </main>
      {/* Footer */}
      <Footer />
      {/* Animations */}
      <style>{`
        .animate-float {
          animation: float 16s ease-in-out infinite alternate;
        }
        .animate-float2 {
          animation: float2 13s ease-in-out infinite alternate;
        }
        .animate-float3 {
          animation: float3 19s ease-in-out infinite alternate;
        }
        @keyframes float {
          0% { transform: translateY(0) scale(1); }
          100% { transform: translateY(-30px) scale(1.04); }
        }
        @keyframes float2 {
          0% { transform: translateY(0) scale(1); }
          100% { transform: translateY(40px) scale(1.06); }
        }
        @keyframes float3 {
          0% { transform: translateY(0) scale(1); }
          100% { transform: translateY(-60px) scale(1.02); }
        }
      `}</style>
    </div>
  </>
  );
};

export default App;
