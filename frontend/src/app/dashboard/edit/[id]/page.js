'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter, useParams } from 'next/navigation';
import { Pencil, ArrowLeft, Loader2, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';

export default function EditResume() {
  const { id } = useParams();
  const { getToken } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    role: '',
    isPublic: true,
    contactEmail: '',
    linkedinUrl: '',
    githubUrl: '',
    calendlyUrl: '',
  });
  const [originalSlug, setOriginalSlug] = useState('');
  const [file, setFile] = useState(null);
  const [fetching, setFetching] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [slugStatus, setSlugStatus] = useState({ loading: false, available: true, message: '' });

  // Fetch current resume details
  useEffect(() => {
    const fetchResume = async () => {
      try {
        const token = await getToken();
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        const res = await axios.get(`${API_URL}/resumes/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const { title, slug, role, isPublic, contactEmail, linkedinUrl, githubUrl, calendlyUrl } = res.data;
        setFormData({ 
          title, 
          slug, 
          role, 
          isPublic,
          contactEmail: contactEmail || '',
          linkedinUrl: linkedinUrl || '',
          githubUrl: githubUrl || '',
          calendlyUrl: calendlyUrl || ''
        });
        setOriginalSlug(slug);
      } catch (err) {
        console.error('Error fetching resume:', err);
        setError('Failed to fetch resume details');
      } finally {
        setFetching(false);
      }
    };

    if (id) {
      fetchResume();
    }
  }, [id, getToken]);

  // Debounced slug check function
  const checkSlug = useCallback(async (slugToCheck) => {
    if (!slugToCheck || slugToCheck === originalSlug) {
      setSlugStatus({ loading: false, available: true, message: '' });
      return;
    }

    setSlugStatus(prev => ({ ...prev, loading: true, message: '' }));
    try {
      const token = await getToken();
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await axios.get(`${API_URL}/resumes/check-slug/${slugToCheck}?excludeId=${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.available) {
        setSlugStatus({ loading: false, available: true, message: 'Slug is available!' });
      } else {
        setSlugStatus({ loading: false, available: false, message: 'Slug is already taken.' });
      }
    } catch (err) {
      console.error('Error checking slug:', err);
      setSlugStatus({ loading: false, available: true, message: '' });
    }
  }, [id, originalSlug, getToken]);

  // Handle slug check debounce
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      checkSlug(formData.slug);
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [formData.slug, checkSlug]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!slugStatus.available) {
      setError('Please choose a different slug');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const token = await getToken();
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

      const data = new FormData();
      data.append('title', formData.title);
      data.append('slug', formData.slug);
      data.append('role', formData.role);
      data.append('isPublic', formData.isPublic);
      data.append('contactEmail', formData.contactEmail);
      data.append('linkedinUrl', formData.linkedinUrl);
      data.append('githubUrl', formData.githubUrl);
      data.append('calendlyUrl', formData.calendlyUrl);
      if (file) {
        data.append('file', file);
      }

      await axios.put(`${API_URL}/resumes/${id}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      router.push('/dashboard');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Something went wrong while updating');
    } finally {
      setSubmitting(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f6f1]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2c2621]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <Link href="/dashboard" className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-secondary hover:text-primary mb-8 transition gap-1.5">
        <ArrowLeft size={14} /> Back to Dashboard
      </Link>

      <div className="bg-surface-container p-10 rounded-[2rem] shadow-sm border border-outline-variant/30">
        <h1 className="text-3xl font-bold text-primary font-playfair mb-8 flex items-center gap-3">
          <Pencil className="text-secondary" size={32} /> Edit Resume
        </h1>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm font-medium border border-red-100 flex items-center gap-2">
            <AlertCircle size={16} />
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
                  resumex.com/p/
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
              {slugStatus.loading && (
                <p className="text-xs text-on-surface-variant mt-1 flex items-center gap-1">
                  <Loader2 size={12} className="animate-spin" /> Checking availability...
                </p>
              )}
              {slugStatus.message && (
                <p className={`text-xs mt-1 font-semibold ${slugStatus.available ? 'text-green-600' : 'text-red-500'}`}>
                  {slugStatus.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Role / Targeted Job</label>
            <input 
              type="text" 
              name="role" 
              placeholder="e.g. Full Stack Developer"
              value={formData.role} 
              onChange={handleChange}
              className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant/30 rounded-xl focus:ring-2 focus:ring-secondary focus:border-secondary outline-none transition text-primary font-medium placeholder-on-surface-variant/40"
            />
          </div>

          {/* Contact Details */}
          <div className="border-t border-outline-variant/30 pt-6">
            <h3 className="text-sm font-bold text-primary font-playfair mb-4">Contact & Social Links (Optional)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Contact Email</label>
                <input 
                  type="email" 
                  name="contactEmail" 
                  placeholder="recruiter-contact@example.com"
                  value={formData.contactEmail} 
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant/30 rounded-xl focus:ring-2 focus:ring-secondary focus:border-secondary outline-none transition text-primary font-medium placeholder-on-surface-variant/40"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Calendly Link</label>
                <input 
                  type="url" 
                  name="calendlyUrl" 
                  placeholder="https://calendly.com/username"
                  value={formData.calendlyUrl} 
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant/30 rounded-xl focus:ring-2 focus:ring-secondary focus:border-secondary outline-none transition text-primary font-medium placeholder-on-surface-variant/40"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">LinkedIn URL</label>
                <input 
                  type="url" 
                  name="linkedinUrl" 
                  placeholder="https://linkedin.com/in/username"
                  value={formData.linkedinUrl} 
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant/30 rounded-xl focus:ring-2 focus:ring-secondary focus:border-secondary outline-none transition text-primary font-medium placeholder-on-surface-variant/40"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">GitHub URL</label>
                <input 
                  type="url" 
                  name="githubUrl" 
                  placeholder="https://github.com/username"
                  value={formData.githubUrl} 
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant/30 rounded-xl focus:ring-2 focus:ring-secondary focus:border-secondary outline-none transition text-primary font-medium placeholder-on-surface-variant/40"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
              Update Resume File (PDF) <span className="text-xs font-normal text-on-surface-variant/50 ml-1">(Optional - leave blank to keep current version)</span>
            </label>
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
                        <span>Upload a new file</span>
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
            disabled={submitting || !slugStatus.available}
            className="w-full mt-4 flex justify-center py-4 px-4 rounded-full text-base font-bold text-on-primary bg-primary hover:scale-[1.02] active:scale-[0.98] focus:outline-none transition-all shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {submitting ? <Loader2 className="animate-spin" /> : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
