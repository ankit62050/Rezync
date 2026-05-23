'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { 
  ShieldAlert, 
  Mail, 
  Calendar, 
  MessageSquare,
  X
} from 'lucide-react';
import axios from 'axios';

const GithubIcon = ({ size = 16 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const LinkedinIcon = ({ size = 16 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

export default function PublicResumePage() {
  const { username, slug } = useParams();
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchResume = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        const res = await axios.get(`${API_URL}/resumes/p/${slug}`);
        setResume(res.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || 'Resume not found');
        setLoading(false);
      }
    };

    if (slug) {
      fetchResume();
    }
  }, [slug]);

  const trackClick = async (eventType) => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      await axios.post(`${API_URL}/analytics/${resume._id}/click`, { eventType });
    } catch (err) {
      console.error('Failed to log click analytic:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !resume) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6">
        <div className="glass-card p-10 rounded-3xl border border-outline-variant/30 max-w-md w-full text-center bg-white/90">
          <ShieldAlert className="mx-auto h-16 w-16 text-red-500 mb-4" />
          <h1 className="text-2xl font-bold text-on-background mb-2">Unavailable</h1>
          <p className="text-on-surface-variant mb-6">{error || 'This resume might be private or does not exist.'}</p>
          <a href="/" className="inline-block px-6 py-2.5 bg-primary text-white font-bold rounded-full hover:bg-primary-container shadow transition-all">
            Go to Home
          </a>
        </div>
      </div>
    );
  }

  const hasContactInfo = resume.contactEmail || resume.linkedinUrl || resume.githubUrl || resume.calendlyUrl;

  return (
    <div className="w-screen h-screen overflow-hidden m-0 p-0 bg-background relative flex flex-col">
      <iframe
        src={resume.resumeUrl}
        className="w-full h-full border-none flex-grow"
        title="Resume PDF"
      />

      {/* Floating Contact Dock */}
      {hasContactInfo && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-[95%] sm:max-w-xl transition-all duration-300">
          {isOpen ? (
            <div className="bg-primary/95 text-on-primary backdrop-blur-md border border-primary-container shadow-2xl rounded-2xl sm:rounded-full px-6 py-3.5 flex flex-col sm:flex-row items-center gap-4 transition-all duration-300 scale-100 opacity-100">
              
              {/* Profile Details */}
              <div className="text-center sm:text-left flex flex-col justify-center max-w-[200px]">
                <span className="text-[10px] font-bold text-secondary uppercase tracking-widest leading-none">Connect with</span>
                <span className="text-xs font-bold text-on-primary truncate leading-tight mt-0.5" title={resume.title}>
                  {resume.title || 'Applicant'}
                </span>
              </div>

              {/* Divider */}
              <div className="hidden sm:block w-px h-8 bg-on-primary/20" />

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                {resume.contactEmail && (
                  <a
                    href={`mailto:${resume.contactEmail}`}
                    onClick={() => trackClick('click_email')}
                    className="p-2.5 bg-secondary hover:bg-secondary-container hover:text-on-secondary-container text-on-secondary rounded-full transition-all duration-200 shadow-sm flex items-center justify-center hover:scale-110 active:scale-95"
                    title="Send Email"
                  >
                    <Mail size={16} />
                  </a>
                )}

                {resume.linkedinUrl && (
                  <a
                    href={resume.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackClick('click_linkedin')}
                    className="p-2.5 bg-secondary hover:bg-secondary-container hover:text-on-secondary-container text-on-secondary rounded-full transition-all duration-200 shadow-sm flex items-center justify-center hover:scale-110 active:scale-95"
                    title="LinkedIn Profile"
                  >
                    <LinkedinIcon size={16} />
                  </a>
                )}

                {resume.githubUrl && (
                  <a
                    href={resume.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackClick('click_github')}
                    className="p-2.5 bg-secondary hover:bg-secondary-container hover:text-on-secondary-container text-on-secondary rounded-full transition-all duration-200 shadow-sm flex items-center justify-center hover:scale-110 active:scale-95"
                    title="GitHub Profile"
                  >
                    <GithubIcon size={16} />
                  </a>
                )}

                {resume.calendlyUrl && (
                  <a
                    href={resume.calendlyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackClick('click_calendly')}
                    className="p-2.5 bg-secondary hover:bg-secondary-container hover:text-on-secondary-container text-on-secondary rounded-full transition-all duration-200 shadow-sm flex items-center justify-center hover:scale-110 active:scale-95 animate-pulse hover:animate-none"
                    title="Book a Call"
                  >
                    <Calendar size={16} />
                  </a>
                )}
              </div>

              {/* Close/Minimize Button */}
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-2 right-2 sm:static p-1 text-on-primary/60 hover:text-on-primary rounded-full hover:bg-on-primary/10 transition-colors"
                title="Minimize toolbar"
              >
                <X size={14} />
              </button>

            </div>
          ) : (
            /* Minimized Icon/Button */
            <button
              onClick={() => setIsOpen(true)}
              className="bg-primary/95 text-on-primary hover:bg-primary backdrop-blur-md border border-primary-container shadow-2xl rounded-full p-4 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
              title="Open Contact Bar"
            >
              <MessageSquare size={18} className="text-secondary" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
