import { useState, useEffect } from 'react';
import type { JobLink } from '../types/types';

export const useJobs = () => {
  const [jobs, setJobs] = useState<JobLink[]>([]);
  const [loading, setLoading] = useState(true);

  // FETCH HISTORY FROM BACKEND
  const fetchHistory = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/history');
      const data = await response.json();
      setJobs(data);
    } catch (err) {
      console.error("Failed to fetch history:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
    // Optional: Refresh every 10 seconds to see status updates
    const interval = setInterval(fetchHistory, 10000);
    return () => clearInterval(interval);
  }, []);

  // SEND CURRENT URL TO BACKEND
  const checkCurrentTab = async () => {
    // 1. Get current tab URL from Chrome API
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (tab?.url) {
      await fetch('http://localhost:3000/api/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: tab.url }),
      });
      fetchHistory(); // Refresh list immediately
    }
  };

  return { jobs, loading, checkCurrentTab };
};