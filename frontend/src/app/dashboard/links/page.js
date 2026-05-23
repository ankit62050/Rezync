'use client';

import { useEffect, useState } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { ArrowLeft, RefreshCw, Copy, Check, Link as LinkIcon, Loader2 } from 'lucide-react';
import axios from 'axios';

export default function LinksPage() {
  const { getToken } = useAuth();
  const { user } = useUser();
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);
  const [origin, setOrigin] = useState('');

  const username = user?.username || user?.firstName || 'candidate';

  const fetchResumes = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await axios.get(`${API_URL}/resumes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setResumes(res.data);
    } catch (error) {
      console.error('Error fetching resumes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }
  }, [getToken]);

  const handleCopy = async (id, slug) => {
    const url = `${origin}/p/${slug}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard', err);
    }
  };

  return (
    <div className="flex flex-col w-full">
      {/* Header */}
      <header className="px-8 md:px-12 py-8 flex justify-between items-center w-full bg-transparent border-b border-outline-variant/10">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">DASHBOARD</span>
          <h1 className="text-3xl font-bold tracking-tight text-primary font-playfair">Links</h1>
        </div>
        <div className="text-on-surface-variant font-semibold text-sm">
          @{username}
        </div>
      </header>

      {/* Canvas */}
      <div className="px-8 md:px-12 py-10 flex-grow flex flex-col gap-8 w-full max-w-5xl">
        {/* Contextual Breadcrumb/Header */}
        <div>
          <div className="flex items-center gap-2 text-on-surface-variant mb-6 text-xs">
            <Link href="/dashboard" className="w-8 h-8 rounded-full border border-outline-variant/30 flex items-center justify-center hover:bg-surface-variant/20 transition-colors">
              <ArrowLeft size={14} />
            </Link>
            <span className="font-bold uppercase tracking-widest">DASHBOARD / LINKS</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-primary mb-2 font-playfair leading-tight">
            Share clean <span className="font-playfair italic font-normal text-secondary">resume</span> links fast.
          </h1>
          <p className="text-lg text-on-surface-variant italic font-medium">
            Full links, one-click copy, no trimming.
          </p>
        </div>

        {/* Links Section */}
        <div className="mt-8">
          <div className="flex justify-between items-end mb-6 border-b border-outline-variant/20 pb-4">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-on-surface-variant tracking-widest uppercase">PERMANENT PUBLIC LINKS</span>
              <h3 className="text-2xl text-primary font-bold font-playfair">Resume links</h3>
            </div>
            <button
              onClick={fetchResumes}
              disabled={loading}
              className="bg-surface-container-high text-primary hover:bg-surface-container-highest px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
          </div>

          {loading && resumes.length === 0 ? (
            <div className="flex flex-col gap-4">
              {[1, 2].map(i => (
                <div key={i} className="h-32 bg-surface-container-low rounded-[1.5rem] animate-pulse border border-outline-variant/10"></div>
              ))}
            </div>
          ) : resumes.length === 0 ? (
            <div className="glass-panel p-16 rounded-[2.5rem] text-center flex flex-col items-center bg-white/40">
              <h3 className="text-xl font-bold text-primary mb-2">No active links found</h3>
              <p className="text-on-surface-variant mb-6 max-w-sm text-sm">Upload a resume in the overview dashboard to generate a sharing link.</p>
              <Link href="/dashboard" className="bg-primary text-on-primary font-bold px-6 py-3 rounded-xl hover:scale-[1.02] transition-all">
                Go to Dashboard
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {resumes.map((resume) => {
                const isCopied = copiedId === resume._id;
                const fullUrl = `${origin}/p/${resume.slug}`;
                return (
                  <div
                    key={resume._id}
                    className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30 shadow-sm hover:scale-[1.01] hover:shadow-[0_8px_30px_rgb(111,91,61,0.04)] transition-all duration-300 relative overflow-hidden group"
                  >
                    {/* Decorative mesh gradient soft glow */}
                    <div className="absolute -top-20 -right-20 w-40 h-40 bg-secondary-container/10 rounded-full blur-3xl group-hover:bg-secondary-container/20 transition-all duration-500 pointer-events-none"></div>
                    
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 relative z-10 gap-4">
                      <div>
                        <h4 className="text-lg font-bold text-primary font-playfair mb-1">{resume.title}</h4>
                        <p className="text-sm text-on-surface-variant font-mono">/{username}/{resume.slug}</p>
                      </div>
                      <button
                        onClick={() => handleCopy(resume._id, resume.slug)}
                        className={`px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 border cursor-pointer ${
                          isCopied
                            ? 'bg-secondary text-white border-secondary'
                            : 'bg-surface text-primary border-outline-variant/30 hover:bg-surface-container'
                        }`}
                      >
                        {isCopied ? <Check size={14} /> : <Copy size={14} />}
                        <span>{isCopied ? 'Copied' : 'Copy Link'}</span>
                      </button>
                    </div>
                    <div className="bg-surface-container-high rounded-lg px-4 py-3 border border-outline-variant/20 relative z-10 flex items-center">
                      <code className="text-sm text-primary font-mono w-full truncate select-all">{fullUrl}</code>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
