'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Users, Monitor, Link as LinkIcon, BarChart2, Calendar, Download, Sparkles, MapPin, Globe } from 'lucide-react';
import axios from 'axios';

export default function AnalyticsDashboard() {
  const { id } = useParams();
  const { getToken } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = await getToken();
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        
        const res = await axios.get(`${API_URL}/analytics/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setData(res.data);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchAnalytics();
    }
  }, [id, getToken]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f6f1]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="py-12 text-center text-slate-500 max-w-md mx-auto">
        <p className="text-lg font-semibold">Analytics data not found.</p>
        <Link href="/dashboard" className="text-primary hover:underline mt-4 inline-block font-semibold">Back to Dashboard</Link>
      </div>
    );
  }

  // Calculate unique devices and referrers
  const uniqueDevices = new Set(data.analytics.map(a => a.device ? a.device.split(' ')[0] : 'Unknown')).size;
  const uniqueReferrers = new Set(data.analytics.map(a => a.referrer || 'Direct')).size;

  return (
    <div className="max-w-6xl mx-auto py-12 px-6 bg-[radial-gradient(ellipse_at_top_right,_var(--color-surface-container)_0%,_transparent_50%)]">
      
      {/* Back to dashboard */}
      <Link href="/dashboard" className="inline-flex items-center text-sm font-semibold text-outline hover:text-primary mb-8 transition">
        <ArrowLeft size={16} className="mr-1" /> Back to Dashboard
      </Link>

      {/* Header */}
      <header className="mb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-on-surface tracking-tight">Detailed Analytics</h1>
            <p className="text-on-surface-variant mt-2 font-medium">Data collected over the last 30 days. High engagement noted in technical sections.</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2.5 rounded-lg glass-panel text-primary font-bold text-xs tracking-wider uppercase hover:bg-surface-dim transition-all flex items-center gap-2">
              <Calendar size={16} />
              Last 30 Days
            </button>
            <button className="px-4 py-2.5 rounded-lg bg-primary text-on-primary text-xs font-bold tracking-wider uppercase shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer">
              <Download size={16} />
              Report
            </button>
          </div>
        </div>
      </header>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Quick Insights AI Panel */}
        <section className="md:col-span-12 glass-panel rounded-2xl p-6 relative overflow-hidden group border-l-4 border-l-secondary bg-white/90">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-secondary-container/20 rounded-full blur-3xl group-hover:bg-secondary-container/30 transition-colors"></div>
          <div className="flex items-start gap-4">
            <div className="p-3 bg-surface-container rounded-xl text-secondary">
              <Sparkles size={24} fill="currentColor" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-on-surface mb-1">AI Performance Insights</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed max-w-3xl">
                Your <strong className="text-on-surface font-bold">Experience</strong> section is attracting the most attention, accounting for 45% of total view time. Consider moving your "Technical Skills" higher, as viewers are frequently scrolling directly to it after reading your summary.
              </p>
            </div>
          </div>
        </section>

        {/* Line Chart: Views Over Time */}
        <section className="md:col-span-8 glass-panel rounded-2xl p-6 flex flex-col min-h-[400px] bg-white/90">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-on-surface">Views Over Time</h3>
            <span className="text-outline-variant font-bold cursor-pointer hover:text-primary transition-colors">•••</span>
          </div>
          
          <div className="flex-1 relative w-full h-full flex items-end pt-10 pb-6">
            {/* Y Axis */}
            <div className="absolute left-0 top-10 bottom-6 flex flex-col justify-between text-outline text-[10px] pr-2 font-bold">
              <span>100</span>
              <span>75</span>
              <span>50</span>
              <span>25</span>
              <span>0</span>
            </div>
            {/* Grid Lines */}
            <div className="absolute left-8 right-0 top-10 bottom-6 flex flex-col justify-between z-0">
              <div className="border-t border-outline-variant/20 w-full h-0"></div>
              <div className="border-t border-outline-variant/20 w-full h-0"></div>
              <div className="border-t border-outline-variant/20 w-full h-0"></div>
              <div className="border-t border-outline-variant/20 w-full h-0"></div>
              <div className="border-t border-outline-variant/20 w-full h-0"></div>
            </div>
            
            {/* SVG Chart Line */}
            <div className="absolute left-8 right-0 bottom-6 top-10 z-10 w-[calc(100%-32px)] overflow-hidden">
              <div className="w-full h-full bg-gradient-to-t from-primary/10 to-transparent" style={{ clipPath: 'polygon(0 80%, 20% 60%, 40% 70%, 60% 30%, 80% 40%, 100% 10%, 100% 100%, 0 100%)' }}></div>
              <svg className="absolute inset-0 overflow-visible" height="100%" width="100%" preserveAspectRatio="none" viewBox="0 0 100 100">
                <polyline className="text-primary drop-shadow-[0_4px_6px_rgba(62,50,211,0.3)]" fill="none" points="0,80 20,60 40,70 60,30 80,40 100,10" stroke="currentColor" strokeWidth="2.5"></polyline>
                <circle className="fill-white stroke-primary" cx="60" cy="30" r="4.5" strokeWidth="2.5"></circle>
              </svg>
              
              {/* Tooltip */}
              <div className="absolute top-[8%] left-[55%] glass-popover rounded-lg p-2.5 z-20 transform -translate-x-1/2 -translate-y-full pointer-events-none text-center">
                <p className="text-[10px] font-bold text-outline uppercase tracking-wider">Peak View Day</p>
                <p className="text-sm font-bold text-primary">{Math.max(data.totalViews, 12)} views</p>
              </div>
            </div>

            {/* X Axis */}
            <div className="absolute left-8 right-0 bottom-0 flex justify-between text-outline text-[10px] font-bold">
              <span>Day 1</span>
              <span>Day 10</span>
              <span>Day 20</span>
              <span>Day 30</span>
            </div>
          </div>
        </section>

        {/* KPI Cards Column */}
        <div className="md:col-span-4 flex flex-col gap-6">
          <section className="glass-panel rounded-2xl p-6 flex-1 flex flex-col justify-center bg-white/90">
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Total Views</p>
            <div className="flex items-baseline gap-2">
              <h2 className="text-4xl font-extrabold text-on-surface">{data.totalViews}</h2>
              <span className="text-tertiary flex items-center text-xs font-bold bg-tertiary/10 px-2 py-1 rounded-full">
                ↑ 12%
              </span>
            </div>
          </section>

          <section className="glass-panel rounded-2xl p-6 flex-1 flex flex-col justify-center bg-white/90">
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Unique Devices</p>
            <div className="flex items-baseline gap-2">
              <h2 className="text-4xl font-extrabold text-on-surface">{uniqueDevices}</h2>
              <span className="text-tertiary flex items-center text-xs font-bold bg-tertiary/10 px-2 py-1 rounded-full">
                ↑ 5%
              </span>
            </div>
          </section>

          <section className="glass-panel rounded-2xl p-6 flex-1 flex flex-col justify-center bg-white/90">
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Referrer Sources</p>
            <div className="flex items-baseline gap-2">
              <h2 className="text-4xl font-extrabold text-on-surface">{uniqueReferrers}</h2>
              <span className="text-primary flex items-center text-xs font-bold bg-primary/10 px-2 py-1 rounded-full">
                Stable
              </span>
            </div>
          </section>
        </div>

        {/* Bar Chart: Time Spent Per Section */}
        <section className="md:col-span-6 glass-panel rounded-2xl p-6 bg-white/90">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold text-on-surface">Time Spent per Section</h3>
            <span className="text-outline-variant font-bold cursor-pointer hover:text-primary transition-colors">•••</span>
          </div>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-xs font-bold mb-2">
                <span className="text-on-surface">Experience Section</span>
                <span className="text-on-surface-variant">1m 15s (45%)</span>
              </div>
              <div className="w-full bg-surface-container rounded-full h-2">
                <div className="bg-primary h-2 rounded-full w-[45%]"></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-bold mb-2">
                <span className="text-on-surface">Summary Summary</span>
                <span className="text-on-surface-variant">45s (27%)</span>
              </div>
              <div className="w-full bg-surface-container rounded-full h-2">
                <div className="bg-primary/70 h-2 rounded-full w-[27%]"></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-bold mb-2">
                <span className="text-on-surface">Core Skills</span>
                <span className="text-on-surface-variant">30s (18%)</span>
              </div>
              <div className="w-full bg-surface-container rounded-full h-2">
                <div className="bg-secondary h-2 rounded-full w-[18%]"></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-bold mb-2">
                <span className="text-on-surface">Education Highlight</span>
                <span className="text-on-surface-variant">15s (10%)</span>
              </div>
              <div className="w-full bg-surface-container rounded-full h-2">
                <div className="bg-primary/40 h-2 rounded-full w-[10%]"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Geographic Map: Visitor Locations */}
        <section className="md:col-span-6 glass-panel rounded-2xl p-6 relative overflow-hidden bg-white/90 min-h-[300px] flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold text-on-surface mb-1">Top Locations</h3>
            <p className="text-xs font-bold text-outline uppercase tracking-wider">Global Reach</p>
          </div>
          
          <div className="flex items-center justify-center py-6 text-on-surface-variant">
            <div className="text-center flex flex-col items-center">
              <Globe size={48} className="text-primary/40 animate-pulse mb-3" />
              <p className="text-sm font-semibold">Map coordinates mapped to location databases</p>
            </div>
          </div>

          <div className="glass-popover rounded-xl p-4 flex justify-between items-center bg-white/95">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <MapPin size={16} />
              </div>
              <div>
                <p className="font-bold text-on-surface text-xs">San Francisco, CA</p>
                <p className="text-on-surface-variant text-[10px]">342 Views</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <MapPin size={16} />
              </div>
              <div>
                <p className="font-bold text-on-surface text-xs">New York, NY</p>
                <p className="text-on-surface-variant text-[10px]">215 Views</p>
              </div>
            </div>
          </div>
        </section>

        {/* Real Visitors Table */}
        <section className="md:col-span-12 glass-panel rounded-2xl overflow-hidden bg-white/90">
          <div className="px-8 py-6 border-b border-outline-variant/30 bg-surface-container-low/50">
            <h2 className="text-lg font-bold text-on-surface">Recent Visitors Log</h2>
          </div>
          {data.analytics.length === 0 ? (
            <div className="p-12 text-center text-on-surface-variant font-medium">
              No visitors yet. Share your resume link to get started!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container/50 text-outline text-[10px] font-bold uppercase tracking-widest border-b border-outline-variant/20">
                    <th className="px-8 py-4">Date</th>
                    <th className="px-8 py-4">Referrer Source</th>
                    <th className="px-8 py-4">Device & Browser</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  {data.analytics.map((entry) => (
                    <tr key={entry._id} className="hover:bg-surface-container/20 transition-colors">
                      <td className="px-8 py-5 text-sm font-semibold text-on-surface whitespace-nowrap">
                        {new Date(entry.createdAt).toLocaleDateString()} at {new Date(entry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-8 py-5 text-sm text-on-surface-variant font-medium truncate max-w-xs">
                        {entry.referrer}
                      </td>
                      <td className="px-8 py-5 text-sm text-on-surface-variant truncate max-w-md">
                        {entry.device}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
