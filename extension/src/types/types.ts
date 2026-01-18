export type JobStatus = 'live' | 'expired' | 'manual' | 'error' | 'pending';

export interface JobLink {
  id: string;
  url: string;
  company: string;
  status: JobStatus;
  checkedAt: string;
}