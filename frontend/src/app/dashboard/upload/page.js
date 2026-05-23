'use client';

import { useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { UploadCloud, ArrowLeft, Loader2, FileText, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';

export default function UploadResume() {
  const { getToken } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    role: '',
    note: '',
    isPublic: true,
    contactEmail: '',
    linkedinUrl: '',
    githubUrl: '',
    calendlyUrl: '',
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a PDF file');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = await getToken();
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      
      const data = new FormData();
      data.append('title', formData.title);
      data.append('slug', formData.slug);
      data.append('role', formData.role);
      data.append('note', formData.note);
      data.append('isPublic', formData.isPublic);
      data.append('contactEmail', formData.contactEmail);
      data.append('linkedinUrl', formData.linkedinUrl);
      data.append('githubUrl', formData.githubUrl);
      data.append('calendlyUrl', formData.calendlyUrl);
      data.append('file', file);

      await axios.post(`${API_URL}/resumes`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      router.push('/dashboard');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <Link href="/dashboard" className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-secondary hover:text-primary mb-8 transition gap-1.5">
        <ArrowLeft size={14} /> Back to Dashboard
      </Link>

      <div className="bg-surface-container p-10 rounded-[2rem] shadow-sm border border-outline-variant/30">
        <h1 className="text-3xl font-bold text-primary font-playfair mb-8 flex items-center gap-3">
          <UploadCloud className="text-secondary" size={32} /> Upload New Resume
        </h1>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm font-medium border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Resume Title</label>
              <input 
                type="text" 
                name="title" 
                required 
                placeholder="e.g. Software Engineer 2026"
                value={formData.title} 
                onChange={handleChange}
                className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant/30 rounded-xl focus:ring-2 focus:ring-secondary focus:border-secondary outline-none transition text-primary font-medium placeholder-on-surface-variant/40"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Custom Slug</label>
              <div className="flex rounded-xl shadow-sm overflow-hidden">
                <span className="inline-flex items-center px-4 border border-r-0 border-outline-variant/30 bg-surface-container-low text-on-surface-variant font-bold text-xs uppercase tracking-wider">
                  rezync.com/[username]/
                </span>
                <input 
                  type="text" 
                  name="slug" 
                  required 
                  placeholder="john-doe"
                  value={formData.slug} 
                  onChange={handleChange}
                  className="flex-1 min-w-0 block w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant/30 focus:ring-2 focus:ring-secondary focus:border-secondary outline-none transition text-primary font-medium placeholder-on-surface-variant/40"
                />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Resume File (PDF)</label>
            <div className="mt-1 flex justify-center px-6 pt-8 pb-10 bg-surface-container-lowest border-2 border-outline-variant/40 border-dashed rounded-[1.5rem] hover:border-secondary transition cursor-pointer group relative">
              <div className="space-y-2 text-center">
                {file ? (
                  <div className="flex flex-col items-center">
                    <CheckCircle2 className="mx-auto h-12 w-12 text-secondary mb-3" />
                    <span className="text-base font-bold text-primary">{file.name}</span>
                    <span className="text-sm text-on-surface-variant font-medium">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                  </div>
                ) : (
                  <>
                    <FileText className="mx-auto h-12 w-12 text-on-surface-variant/45 group-hover:text-secondary transition mb-3" />
                    <div className="flex text-base font-medium text-on-surface-variant justify-center">
                      <label htmlFor="file-upload" className="relative cursor-pointer text-secondary hover:text-primary transition focus-within:outline-none font-bold">
                        <span>Upload a file</span>
                        <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="application/pdf" onChange={(e) => setFile(e.target.files[0])} />
                      </label>
                      <p className="pl-2">or drag and drop</p>
                    </div>
                    <p className="text-xs font-bold text-on-surface-variant/40 uppercase tracking-widest mt-2">PDF up to 10MB</p>
                  </>
                )}
                {file && (
                   <input id="file-upload-replace" name="file-upload" type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="application/pdf" onChange={(e) => setFile(e.target.files[0])} />
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center pt-2">
            <input
              id="isPublic"
              name="isPublic"
              type="checkbox"
              checked={formData.isPublic}
              onChange={handleChange}
              className="h-5 w-5 text-primary focus:ring-secondary border-outline-variant/30 rounded cursor-pointer accent-secondary"
            />
            <label htmlFor="isPublic" className="ml-3 block text-sm font-bold text-on-surface-variant uppercase tracking-wider cursor-pointer">
              Make this resume public
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 flex justify-center py-4 px-4 rounded-full text-base font-bold text-on-primary bg-primary hover:scale-[1.02] active:scale-[0.98] focus:outline-none transition-all shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="animate-spin" /> : 'Upload Resume'}
          </button>
        </form>
      </div>
    </div>
  );
}
