import { useState } from 'react';
import { useJobs } from './hooks/useJobs';
import { JobCard } from './components/JobCard';
import { History} from 'lucide-react';

export default function App() {
  const { jobs, loading, checkCurrentTab } = useJobs();
  
  const [filter, setFilter] = useState<'all' | 'live' | 'expired'>('all');

  const filteredJobs = jobs.filter(j => filter === 'all' || j.status === filter);

  return (
    <div className="w-[360px] h-[500px] flex flex-col bg-slate-50 overflow-hidden shadow-2xl">
      {/* Header */}
      <header className="p-4 bg-white border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-1.5 rounded-lg">
            <History size={18} className="text-white" />
          </div>
          <span className="font-extrabold text-slate-800 tracking-tight text-lg">Sentinel</span>
        </div>
        <button onClick={checkCurrentTab} className="text-[11px] font-bold bg-slate-900 text-white px-3 py-1.5 rounded-lg hover:opacity-90 active:scale-95 transition">
          CHECK TAB
        </button>
      </header>

      {/* Tabs */}
      <div className="px-4 py-3 flex gap-2">
        {['all', 'live', 'expired'].map((t) => (
          <button 
            key={t}
            onClick={() => setFilter(t as any)}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg border capitalize transition-colors ${
              filter === t ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-100'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* List Container */}
      <main className="flex-1 overflow-y-auto px-4 pb-4 custom-scrollbar">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full opacity-50 space-y-2">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-bold">Syncing with server...</p>
          </div>
        ) : filteredJobs.length > 0 ? (
          <div className="space-y-3">
            {filteredJobs.map(job => <JobCard key={job.id} job={job} />)}
          </div>
        ) : (
          <div className="text-center mt-20 text-slate-400 font-medium text-sm">
            No history found in this category.
          </div>
        )}
      </main>
    </div>
  );
}