'use client';

import { useAuth, useUser, SignOutButton } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FileText, Eye, Upload, BarChart2, ExternalLink, Trash2, Loader2, Pencil, RefreshCw, ChevronLeft, LogOut, Layout, BookOpen, Link2 } from 'lucide-react';
import axios from 'axios';

import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const { getToken } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

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
  }, [getToken]);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    e.preventDefault();
    if (!confirm('Are you sure you want to delete this resume?')) return;
    
    setDeletingId(id);
    try {
      const token = await getToken();
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      await axios.delete(`${API_URL}/resumes/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setResumes(resumes.filter(r => r._id !== id));
    } catch (error) {
      console.error('Error deleting resume:', error);
      alert('Failed to delete resume');
    } finally {
      setDeletingId(null);
    }
  };

  const username = user?.username || user?.firstName || 'candidate';
  const avatarUrl = user?.imageUrl || '';

  return (
    <>
      {/* Header */}
      <header className="px-8 md:px-12 py-8 flex justify-between items-center w-full bg-transparent border-b border-outline-variant/10">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">DASHBOARD</span>
          <h1 className="text-3xl font-bold tracking-tight text-primary font-playfair">Resumes</h1>
        </div>
        <div className="text-on-surface-variant font-semibold text-sm">
          @{username}
        </div>
      </header>

      {/* Canvas */}
      <div className="px-8 md:px-12 py-10 flex-grow flex flex-col gap-8 w-full max-w-5xl">
        
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-on-surface-variant text-xs">
          <Link href="/" className="w-8 h-8 rounded-full border border-outline-variant/30 flex items-center justify-center hover:bg-surface-variant/20 transition-colors">
            <ChevronLeft size={16} />
          </Link>
          <span className="font-bold uppercase tracking-widest">DASHBOARD / RESUMES</span>
        </div>

        {/* Title Area */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-outline-variant/20 pb-6">
          <div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-primary font-playfair flex items-baseline gap-2">
              Your <span className="font-playfair italic font-normal text-outline">resumes</span>
            </h2>
            <p className="text-sm font-medium text-on-surface-variant mt-2 italic">
              Manage your profile links. Click a resume to copy link or manage analytics.
            </p>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <button 
              onClick={fetchResumes}
              className="w-12 h-12 rounded-full border border-outline-variant/30 flex items-center justify-center bg-surface hover:bg-surface-variant/20 transition-colors shadow-sm text-primary"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
            <Link href="/dashboard/upload" className="flex-grow md:flex-none text-center bg-primary text-on-primary font-bold px-6 py-3.5 rounded-xl hover:scale-[1.02] transition-transform duration-200 shadow-md tracking-wider text-xs">
              UPLOAD NEW RESUME
            </Link>
          </div>
        </div>

        {/* List Area */}
        {loading ? (
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-surface-container-low rounded-[1.5rem] animate-pulse border border-outline-variant/10"></div>
            ))}
          </div>
        ) : resumes.length === 0 ? (
          <div className="glass-panel p-16 rounded-[2.5rem] text-center flex flex-col items-center bg-white/40">
            <h3 className="text-xl font-bold text-primary mb-2">No resumes found</h3>
            <p className="text-on-surface-variant mb-6 max-w-sm text-sm">Upload your first resume file to generate your custom professional URL.</p>
            <Link href="/dashboard/upload" className="bg-primary text-on-primary font-bold px-6 py-3 rounded-xl hover:scale-[1.02] transition-all">
              Upload Now
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {resumes.map((resume) => (
              <div 
                key={resume._id} 
                onClick={() => router.push(`/dashboard/resumes/${resume._id}`)}
                className="group w-full flex flex-col sm:flex-row justify-between items-start sm:items-center bg-surface-container-low rounded-[1.5rem] p-6 border border-tertiary/5 hover:border-tertiary/20 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:scale-[1.01] transition-all duration-300 gap-4 cursor-pointer"
              >
                <div className="flex flex-col gap-1">
                  <h3 className="text-xl font-bold text-primary group-hover:text-secondary transition-colors font-playfair">{resume.title}</h3>
                  <span className="text-sm font-semibold text-on-surface-variant font-mono">/p/{resume.slug}</span>
                </div>

                <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto sm:justify-end">
                  <span className="text-xs text-outline font-semibold">
                    Updated {new Date(resume.updatedAt).toLocaleDateString()}
                  </span>

                  <div className="flex items-center gap-2">
                    <Link 
                      href={`/dashboard/analytics/${resume._id}`} 
                      onClick={(e) => e.stopPropagation()}
                      className="p-2 border border-outline-variant/30 hover:bg-surface-container-high rounded-lg text-primary transition-all flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider"
                    >
                      <BarChart2 size={14} />
                      <span>Stats</span>
                    </Link>
                    
                    <Link 
                      href={`/p/${resume.slug}`} 
                      target="_blank" 
                      onClick={(e) => e.stopPropagation()}
                      className="p-2 border border-outline-variant/30 hover:bg-surface-container-high rounded-lg text-primary transition-all flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider"
                    >
                      <ExternalLink size={14} />
                      <span>View</span>
                    </Link>

                    <Link 
                      href={`/dashboard/edit/${resume._id}`} 
                      onClick={(e) => e.stopPropagation()}
                      className="p-2 border border-outline-variant/30 hover:bg-surface-container-high rounded-lg text-on-surface-variant hover:text-primary transition-colors"
                    >
                      <Pencil size={15} />
                    </Link>

                    <button 
                      onClick={(e) => handleDelete(e, resume._id)}
                      disabled={deletingId === resume._id}
                      className="p-2 border border-outline-variant/30 hover:bg-surface-container-high rounded-lg text-on-surface-variant hover:text-red-600 transition-colors disabled:opacity-50"
                    >
                      {deletingId === resume._id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </>
  );
}
