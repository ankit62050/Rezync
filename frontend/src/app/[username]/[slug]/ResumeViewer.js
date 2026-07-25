'use client';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  ShieldAlert, 
  Mail, 
  Calendar, 
  MessageSquare,
  X,
  FileText,
  Sparkles,
  Layout,
  ExternalLink,
  ChevronRight
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

export default function ResumeViewer({ username, slug }) {
  const searchParams = useSearchParams();
  const ref = searchParams.get('ref');

  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isOpen, setIsOpen] = useState(true);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [activeTab, setActiveTab] = useState('interactive'); // 'interactive' | 'pdf'
  const [analyticsId, setAnalyticsId] = useState(null);

  // Intersection Observer Scroll Tracking Refs
  const sectionRefs = useRef({});
  const activeSectionRef = useRef(null);
  const sectionTimesRef = useRef({}); // sectionName -> duration in ms
  const lastActiveTimeRef = useRef(Date.now());

  useEffect(() => {
    setIsMobile(/Mobi|Android|iPhone|iPad|iPod|Windows Phone/i.test(navigator.userAgent));
  }, []);

  useEffect(() => {
    const fetchResume = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        const urlParams = ref ? `?ref=${ref}` : '';
        const res = await axios.get(`${API_URL}/resumes/p/${username}/${slug}${urlParams}`);
        
        setResume(res.data);
        setAnalyticsId(res.data.analyticsId);
        
        // If there are no parsed sections, fallback to PDF view automatically
        const sectionsToTrack = res.data.activeCampaign?.sections || res.data.sections || [];
        if (sectionsToTrack.length === 0) {
          setActiveTab('pdf');
        }
        
        setLoading(false);
      } catch (err) {
        console.error(err);
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        setError(err.response?.data?.message || `Failed to connect to backend: ${err.message}`);
        setLoading(false);
      }
    };

    if (username && slug) {
      fetchResume();
    }
  }, [username, slug, ref]);

  const activeCampaign = resume?.activeCampaign;
  const sectionsToTrack = activeCampaign?.sections || resume?.sections || [];

  // 1. Intersection Observer Effect for Scroll Focus
  useEffect(() => {
    if (!resume || activeTab !== 'interactive' || sectionsToTrack.length === 0) return;

    const observerOptions = {
      root: null,
      rootMargin: '-15% 0px -55% 0px', // Focused on upper-middle of viewport
      threshold: 0.05
    };

    const observerCallback = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.id.replace('section-', '');
          const now = Date.now();
          const prevSection = activeSectionRef.current;
          
          if (prevSection !== sectionId) {
            if (prevSection) {
              const elapsed = now - lastActiveTimeRef.current;
              sectionTimesRef.current[prevSection] = (sectionTimesRef.current[prevSection] || 0) + elapsed;
            }
            activeSectionRef.current = sectionId;
            lastActiveTimeRef.current = now;
          }
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    sectionsToTrack.forEach(sec => {
      const el = sectionRefs.current[sec.title];
      if (el) observer.observe(el);
    });

    // Mark current time for initial active section
    lastActiveTimeRef.current = Date.now();

    return () => {
      observer.disconnect();
      // Record any remaining time for the final section
      const now = Date.now();
      const prevSection = activeSectionRef.current;
      if (prevSection) {
        const elapsed = now - lastActiveTimeRef.current;
        sectionTimesRef.current[prevSection] = (sectionTimesRef.current[prevSection] || 0) + elapsed;
      }
    };
  }, [resume, activeTab, sectionsToTrack]);

  // 2. Periodic sync and Exit sync to backend
  useEffect(() => {
    if (!resume || !analyticsId) return;

    const syncTimes = async () => {
      const now = Date.now();
      const prevSection = activeSectionRef.current;
      const updatedTimes = { ...sectionTimesRef.current };
      
      if (prevSection) {
        const elapsed = now - lastActiveTimeRef.current;
        updatedTimes[prevSection] = (updatedTimes[prevSection] || 0) + elapsed;
      }

      // Convert to seconds
      const timesInSeconds = {};
      let hasData = false;
      for (const [sec, ms] of Object.entries(updatedTimes)) {
        const secs = Math.round(ms / 1000);
        if (secs > 0) {
          timesInSeconds[sec] = secs;
          hasData = true;
        }
      }

      if (!hasData) return;

      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        await axios.put(`${API_URL}/analytics/time/${analyticsId}`, { sectionTimes: timesInSeconds });
      } catch (err) {
        console.error('Failed to update section times:', err);
      }
    };

    const interval = setInterval(syncTimes, 8000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        syncTimes();
      } else {
        lastActiveTimeRef.current = Date.now();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      syncTimes();
    };
  }, [resume, analyticsId]);

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

  const iframeSrc = isMobile
    ? `https://docs.google.com/gview?url=${encodeURIComponent(resume.resumeUrl)}&embedded=true`
    : resume.resumeUrl;

  const showTabs = resume.sections && resume.sections.length > 0;

  return (
    <div className="w-screen h-screen overflow-hidden m-0 p-0 bg-background relative flex flex-col font-hanken">
      {/* Top Header Dock */}
      <div className="w-full bg-surface-container-low border-b border-outline-variant/15 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 z-40">
        <div className="flex items-center gap-3">
          <span className="font-bold text-xl text-primary inline-flex items-baseline">
            re<span className="wordmark-x">zync</span>
          </span>
          <div className="hidden sm:block w-px h-6 bg-outline-variant/20"></div>
          <div className="flex flex-col">
            <h1 className="text-sm font-bold text-primary truncate max-w-[200px]" title={resume.title}>
              {resume.title}
            </h1>
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest leading-none mt-0.5">
              Candidate Portfolio
            </span>
          </div>
        </div>

        {/* View Switch Tabs */}
        {showTabs && (
          <div className="flex bg-surface-container rounded-full p-1 border border-outline-variant/20 shadow-sm shrink-0">
            <button
              onClick={() => setActiveTab('interactive')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all uppercase tracking-wider ${
                activeTab === 'interactive'
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              <Sparkles size={14} />
              <span>Interactive Profile</span>
            </button>
            <button
              onClick={() => setActiveTab('pdf')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all uppercase tracking-wider ${
                activeTab === 'pdf'
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              <Layout size={14} />
              <span>PDF Document</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Content Pane */}
      <div className="flex-grow w-full h-[calc(100vh-80px)] overflow-hidden relative bg-surface-container-lowest">
        
        {/* PDF VIEW CONTAINER */}
        {activeTab === 'pdf' && (
          <div className="w-full h-full relative">
            {!iframeLoaded && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-background z-30 transition-opacity duration-300">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4"></div>
                <p className="text-xs font-bold text-primary uppercase tracking-widest animate-pulse font-hanken">Loading PDF Document...</p>
              </div>
            )}

            <iframe
              src={iframeSrc}
              className={`w-full h-full border-none transition-opacity duration-500 ${iframeLoaded ? 'opacity-100' : 'opacity-0'}`}
              title="Resume PDF"
              onLoad={() => setIframeLoaded(true)}
            />
          </div>
        )}

        {/* INTERACTIVE WEB VIEW */}
        {activeTab === 'interactive' && showTabs && (
          <div className="w-full h-full overflow-y-auto px-6 py-10 md:px-12 flex justify-center bg-[radial-gradient(ellipse_at_top_right,_var(--color-surface-container)_0%,_transparent_60%)]">
            <div className="max-w-3xl w-full flex flex-col gap-8 pb-32">
              
              {/* AI Tailored Campaign Banner */}
              {activeCampaign && (
                <div className="glass-panel p-6 rounded-3xl border border-secondary/30 relative overflow-hidden group bg-white/80 shadow-md">
                  <div className="absolute -right-10 -top-10 w-40 h-40 bg-secondary-container/20 rounded-full blur-3xl group-hover:bg-secondary-container/30 transition-colors"></div>
                  <div className="flex items-center gap-4 flex-wrap sm:flex-nowrap">
                    <div className="w-12 h-12 rounded-2xl bg-secondary/15 flex items-center justify-center text-secondary shrink-0">
                      <Sparkles size={22} fill="currentColor" />
                    </div>
                    <div className="flex-grow">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">AI Tailored Profile</span>
                        {activeCampaign.tailoredScore && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-secondary/10 text-secondary">
                            Match Score: {activeCampaign.tailoredScore}%
                          </span>
                        )}
                      </div>
                      <h4 className="text-base font-bold text-primary font-playfair mt-0.5">
                        Optimized Profile for {activeCampaign.name.toUpperCase()}
                      </h4>
                      {activeCampaign.tailoredFeedback?.summary && (
                        <p className="text-xs text-on-surface-variant font-medium mt-1 leading-relaxed">
                          {activeCampaign.tailoredFeedback.summary}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Candidate Info Card */}
              <div className="glass-panel p-8 rounded-[2rem] border border-outline-variant/10 bg-white/50 shadow-xs flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-4xl font-extrabold text-primary font-playfair leading-tight">
                      {resume.userId?.name || username}
                    </h2>
                    {resume.role && (
                      <p className="text-lg font-bold text-secondary mt-1">
                        {resume.role}
                      </p>
                    )}
                  </div>
                  {activeCampaign?.tailoredScore && (
                    <div className="flex flex-col items-center bg-secondary/10 px-6 py-3 rounded-2xl border border-secondary/20">
                      <span className="text-[9px] font-extrabold text-secondary tracking-widest uppercase">MATCH QUALITY</span>
                      <span className="text-3xl font-extrabold text-secondary mt-0.5">{activeCampaign.tailoredScore}%</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Sections Display */}
              <div className="glass-panel p-8 md:p-10 rounded-[2.5rem] border border-outline-variant/15 bg-white/70 shadow-sm flex flex-col gap-6">
                {sectionsToTrack.map((section) => (
                  <div
                    key={section.title}
                    id={`section-${section.title}`}
                    ref={el => { sectionRefs.current[section.title] = el; }}
                    className="scroll-mt-16 py-6 border-b border-outline-variant/10 last:border-none group/sec"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <ChevronRight size={14} className="text-secondary opacity-0 group-hover/sec:opacity-100 transition-opacity" />
                      <h3 className="text-xl font-bold text-primary font-playfair uppercase tracking-wide">
                        {section.title}
                      </h3>
                    </div>
                    <div className="text-on-surface-variant font-medium text-sm sm:text-base whitespace-pre-line leading-relaxed pl-1 sm:pl-4">
                      {section.content}
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>
        )}

      </div>

      {/* Floating Contact Dock */}
      {hasContactInfo && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-[95%] sm:max-w-xl transition-all duration-300">
          {isOpen ? (
            <div className="bg-primary/95 text-on-primary backdrop-blur-md border border-primary-container shadow-2xl rounded-2xl sm:rounded-full px-6 py-3.5 flex flex-col sm:flex-row items-center gap-4 transition-all duration-300 scale-100 opacity-100">
              
              {/* Profile Details */}
              <div className="text-center sm:text-left flex flex-col justify-center max-w-[200px]">
                <span className="text-[10px] font-bold text-secondary uppercase tracking-widest leading-none">Connect with</span>
                <span className="text-xs font-bold text-on-primary truncate leading-tight mt-0.5" title={resume.userId?.name || username}>
                  {resume.userId?.name || 'Applicant'}
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
                    className="p-2.5 bg-secondary hover:bg-secondary-container hover:text-on-secondary-container text-on-secondary rounded-full transition-all duration-200 shadow-sm flex items-center justify-center hover:scale-110 active:scale-95 cursor-pointer"
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
                    className="p-2.5 bg-secondary hover:bg-secondary-container hover:text-on-secondary-container text-on-secondary rounded-full transition-all duration-200 shadow-sm flex items-center justify-center hover:scale-110 active:scale-95 cursor-pointer"
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
                    className="p-2.5 bg-secondary hover:bg-secondary-container hover:text-on-secondary-container text-on-secondary rounded-full transition-all duration-200 shadow-sm flex items-center justify-center hover:scale-110 active:scale-95 cursor-pointer"
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
                    className="p-2.5 bg-secondary hover:bg-secondary-container hover:text-on-secondary-container text-on-secondary rounded-full transition-all duration-200 shadow-sm flex items-center justify-center hover:scale-110 active:scale-95 animate-pulse hover:animate-none cursor-pointer"
                    title="Book a Call"
                  >
                    <Calendar size={16} />
                  </a>
                )}
              </div>

              {/* Minimize Button */}
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-2 right-2 sm:static p-1 text-on-primary/60 hover:text-on-primary rounded-full hover:bg-on-primary/10 transition-colors cursor-pointer"
                title="Minimize toolbar"
              >
                <X size={14} />
              </button>

            </div>
          ) : (
            /* Minimized Icon/Button */
            <button
              onClick={() => setIsOpen(true)}
              className="bg-primary/95 text-on-primary hover:bg-primary backdrop-blur-md border border-primary-container shadow-2xl rounded-full p-4 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer"
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
