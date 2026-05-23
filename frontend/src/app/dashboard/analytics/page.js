'use client';

import { useEffect, useState } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { ArrowLeft, RefreshCw, BarChart2, Compass, Users, Clock, Globe } from 'lucide-react';
import axios from 'axios';

function LinkedInIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function GitHubIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
    </svg>
  );
}

function formatRelativeTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 1000 / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin} min ago`;
  if (diffHr < 24) return `${diffHr} hrs ago`;
  return `${diffDay} days ago`;
}

export default function GlobalAnalyticsPage() {
  const { getToken } = useAuth();
  const { user } = useUser();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const username = user?.username || user?.firstName || 'candidate';

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await axios.get(`${API_URL}/analytics`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(res.data);
    } catch (error) {
      console.error('Error fetching global analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [getToken]);

  // Calculations
  let linkedinCount = 0;
  let githubCount = 0;
  let directCount = 0;
  let uniqueDevices = 0;

  if (data?.analytics) {
    const devices = new Set();
    data.analytics.forEach(entry => {
      // Breakdown referrers
      const ref = (entry.referrer || '').toLowerCase();
      if (ref.includes('linkedin')) {
        linkedinCount++;
      } else if (ref.includes('github')) {
        githubCount++;
      } else {
        directCount++;
      }
      // Breakdown devices
      if (entry.device) {
        devices.add(entry.device.split(' ')[0]);
      }
    });
    uniqueDevices = devices.size;
  }

  return (
    <div className="flex flex-col w-full bg-surface">
      {/* Header */}
      <header className="px-8 md:px-12 py-6 flex justify-between items-center w-full bg-surface border-b border-outline-variant/20 sticky top-0 z-30">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">DASHBOARD</span>
          <h1 className="text-3xl font-bold tracking-tight text-primary font-playfair">Analytics</h1>
        </div>
        <div className="text-on-surface-variant font-semibold text-sm">
          @{username}
        </div>
      </header>

      {/* Canvas */}
      <div className="px-8 md:px-12 py-10 flex-grow flex flex-col gap-10 w-full max-w-6xl">
        {/* Breadcrumb & Hero */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-on-surface-variant text-xs">
            <Link href="/dashboard" className="w-8 h-8 rounded-full border border-outline-variant/30 flex items-center justify-center hover:bg-surface-variant/20 transition-colors">
              <ArrowLeft size={14} />
            </Link>
            <span className="font-bold uppercase tracking-widest">DASHBOARD / ANALYTICS</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-primary font-playfair leading-tight max-w-4xl">
            Resume <span className="font-playfair italic font-normal text-on-surface-variant">performance</span>, without the clutter.
          </h2>
          <p className="text-lg text-secondary font-medium italic mt-1">
            See where your link is being opened and what is working best.
          </p>
        </section>

        {/* Breakdown Section */}
        <section className="flex flex-col gap-6">
          <div className="flex justify-between items-end border-b border-outline-variant/20 pb-4">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-on-surface-variant tracking-widest uppercase">BREAKDOWN</span>
              <h3 className="text-2xl text-primary font-bold font-playfair">Where views are coming from</h3>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-on-surface-variant font-bold text-sm">
                {data ? data.totalViews : 0} total views
              </div>
              <button
                onClick={fetchAnalytics}
                disabled={loading}
                className="w-10 h-10 rounded-full border border-outline-variant/30 flex items-center justify-center bg-surface-container-high hover:bg-surface-container-highest transition-colors cursor-pointer"
              >
                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>

          {loading && !data ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-40 bg-surface-container-low rounded-[1.5rem] animate-pulse border border-outline-variant/10"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Stat Card: LinkedIn */}
              <div className="bg-surface-container rounded-[1.5rem] p-6 border border-tertiary/5 shadow-sm hover:scale-[1.02] transition-all duration-300 flex flex-col justify-between min-h-[160px]">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold text-on-surface-variant tracking-widest uppercase flex items-center gap-1.5">
                    <LinkedInIcon className="w-[14px] h-[14px] text-secondary" /> LinkedIn
                  </span>
                  <span className="text-on-surface-variant font-bold text-xs">-</span>
                </div>
                <div className="text-5xl font-extrabold text-primary font-playfair mt-4">
                  {linkedinCount}
                </div>
              </div>

              {/* Stat Card: Github */}
              <div className="bg-surface-container rounded-[1.5rem] p-6 border border-tertiary/5 shadow-sm hover:scale-[1.02] transition-all duration-300 flex flex-col justify-between min-h-[160px]">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold text-on-surface-variant tracking-widest uppercase flex items-center gap-1.5">
                    <GitHubIcon className="w-[14px] h-[14px] text-secondary" /> GitHub
                  </span>
                  <span className="text-on-surface-variant font-bold text-xs">
                    <Clock size={12} />
                  </span>
                </div>
                <div className="text-5xl font-extrabold text-primary font-playfair mt-4">
                  {githubCount}
                </div>
              </div>

              {/* Stat Card: Direct */}
              <div className="bg-surface-container rounded-[1.5rem] p-6 border border-tertiary/5 shadow-sm hover:scale-[1.02] transition-all duration-300 flex flex-col justify-between min-h-[160px]">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold text-on-surface-variant tracking-widest uppercase flex items-center gap-1.5">
                    <Compass size={14} className="text-secondary" /> Direct
                  </span>
                  <span className="text-on-surface-variant font-bold text-xs">
                    <BarChart2 size={12} />
                  </span>
                </div>
                <div className="text-5xl font-extrabold text-primary font-playfair mt-4">
                  {directCount}
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Recent Activity Table */}
        {data?.analytics && (
          <section className="flex flex-col rounded-[1.5rem] bg-surface-container-lowest border border-outline-variant/30 shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-outline-variant/20 bg-surface/50">
              <h3 className="text-xs font-bold text-on-surface-variant tracking-widest uppercase">RECENT ACTIVITY</h3>
            </div>
            <div className="w-full overflow-x-auto">
              {data.analytics.length === 0 ? (
                <div className="p-12 text-center text-on-surface-variant font-semibold">
                  No visitors recorded yet. Shared links will track view events here.
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-outline-variant/20">
                      <th className="py-4 px-8 text-xs font-bold text-on-surface-variant/80 uppercase tracking-widest">EVENT</th>
                      <th className="py-4 px-8 text-xs font-bold text-on-surface-variant/80 uppercase tracking-widest">SOURCE</th>
                      <th className="py-4 px-8 text-xs font-bold text-on-surface-variant/80 uppercase tracking-widest">LINK</th>
                      <th className="py-4 px-8 text-xs font-bold text-on-surface-variant/80 uppercase tracking-widest">TIME</th>
                    </tr>
                  </thead>
                  <tbody className="text-on-surface">
                    {data.analytics.slice(0, 10).map((entry) => (
                      <tr key={entry._id} className="border-b border-outline-variant/10 hover:bg-surface-variant/20 transition-colors">
                        <td className="py-5 px-8 flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-secondary"></div>
                          <span className="font-bold text-primary font-playfair">Resume Viewed</span>
                        </td>
                        <td className="py-5 px-8">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-surface border border-outline-variant/30 text-on-surface-variant uppercase tracking-wider">
                            {entry.referrer.includes('linkedin') ? 'LinkedIn' : entry.referrer.includes('github') ? 'GitHub' : 'Direct'}
                          </span>
                        </td>
                        <td className="py-5 px-8 text-on-surface-variant font-mono text-sm">
                          /{username}/{entry.resumeId?.slug || 'profile'}
                        </td>
                        <td className="py-5 px-8 text-on-surface-variant/80 text-sm font-medium">
                          {formatRelativeTime(entry.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
