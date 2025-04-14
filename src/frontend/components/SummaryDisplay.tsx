import React from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface SummaryDisplayProps {
  summary: string;
}

const SummaryDisplay: React.FC<SummaryDisplayProps> = ({ summary }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
    >
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Meeting Summary</h2>
      <div className="prose max-w-none">
        <ReactMarkdown 
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({...props}) => <h1 className="text-2xl font-bold mb-4" {...props} />,
            h2: ({...props}) => <h2 className="text-xl font-semibold mb-3" {...props} />,
            h3: ({...props}) => <h3 className="text-lg font-medium mb-2" {...props} />,
            p: ({...props}) => <p className="mb-4 leading-relaxed" {...props} />,
            ul: ({...props}) => <ul className="list-disc list-inside mb-4" {...props} />,
            ol: ({...props}) => <ol className="list-decimal list-inside mb-4" {...props} />,
            a: ({...props}) => <a className="text-blue-600 hover:underline" {...props} />,
          }}
        >
          {summary}
        </ReactMarkdown>
      </div>
      
      <div className="mt-6 flex space-x-4">
        <button 
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => navigator.clipboard.writeText(summary)}
        >
          Copy Summary
        </button>
        <button 
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => {
            const blob = new Blob([summary], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'meeting_summary.txt';
            link.click();
          }}
        >
          Download Summary
        </button>
      </div>
    </motion.div>
  );
};

export default SummaryDisplay;
