import React from "react";
import type { ActionItem } from "../../../shared/types/actionItem";

interface ActionItemsPanelProps {
  items: ActionItem[];
  onExtract: () => void;
  loading: boolean;
}

const ActionItemsPanel: React.FC<ActionItemsPanelProps> = ({ items, onExtract, loading }) => (
  <section className="rounded-2xl shadow-lg border border-slate-200 bg-white/80 px-6 py-6 mt-8">
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-bold text-slate-800">Action Items</h2>
      <button
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg px-4 py-1.5 text-sm shadow focus:outline-none focus:ring-2 focus:ring-blue-300"
        onClick={onExtract}
        disabled={loading}
      >
        {loading ? 'Extracting...' : 'Extract from Summary'}
      </button>
    </div>
    {items.length === 0 ? (
      <div className="text-slate-400 italic">No action items extracted yet.</div>
    ) : (
      <ul className="space-y-3">
        {items.map(item => (
          <li key={item.id} className="bg-blue-50/60 border border-blue-100 rounded-lg px-4 py-2 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <span className="font-medium text-slate-700">{item.description}</span>
            {item.owner && <span className="text-xs text-slate-500">Owner: {item.owner}</span>}
            {item.dueDate && <span className="text-xs text-slate-400">Due: {item.dueDate}</span>}
            <button className="ml-auto text-blue-600 text-xs font-semibold hover:underline">Send to Task Manager</button>
          </li>
        ))}
      </ul>
    )}
  </section>
);

export default ActionItemsPanel;
