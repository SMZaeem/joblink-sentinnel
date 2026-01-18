import { ExternalLink } from 'lucide-react';
import type { JobLink, JobStatus } from '../types/types';

const statusStyles: Record<JobStatus, string> = {
  live: "bg-green-100 text-green-700 border-green-200",
  expired: "bg-red-100 text-red-700 border-red-200",
  manual: "bg-amber-100 text-amber-700 border-amber-200",
  error: "bg-gray-100 text-gray-700 border-gray-200",
  pending: "bg-blue-100 text-blue-700 border-blue-200 animate-pulse"
};

export const JobCard = ({ job }: { job: JobLink }) => {
  return (
    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
      <div className="flex justify-between items-start mb-1">
        <h3 className="font-bold text-slate-800 text-sm truncate">{job.company}</h3>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusStyles[job.status]}`}>
          {job.status.toUpperCase()}
        </span>
      </div>
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-slate-500 truncate flex-1 italic">{job.url}</p>
        <a href={job.url} target="_blank" className="text-blue-500 hover:text-blue-700">
          <ExternalLink size={14} />
        </a>
      </div>
    </div>
  );
};