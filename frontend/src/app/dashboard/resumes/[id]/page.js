'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useDashboard } from '../../layout';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Upload, Trash2, Copy, Check, Eye, Loader2, Sparkles, Pencil, FileText, X, ExternalLink } from 'lucide-react';
import axios from 'axios';

export default function ResumeWorkspacePage() {
  const { id } = useParams();
  const { getToken } = useAuth();
  const router = useRouter();

  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [origin, setOrigin] = useState('');

  // Version control state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadNote, setUploadNote] = useState('');

  const [previewUrl, setPreviewUrl] = useState('');
  const [previewVersion, setPreviewVersion] = useState(1);

  const [editingVersionId, setEditingVersionId] = useState(null);
  const [editingVersionNote, setEditingVersionNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [activatingVersionId, setActivatingVersionId] = useState(null);
  const [deletingVersionId, setDeletingVersionId] = useState(null);

  const [contactEmail, setContactEmail] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [calendlyUrl, setCalendlyUrl] = useState('');
  const [savingCtas, setSavingCtas] = useState(false);
  const [ctaSuccess, setCtaSuccess] = useState(false);

  // AI Career Suite State
  const [analyzing, setAnalyzing] = useState(false);
  const [tailoring, setTailoring] = useState(false);
  const [campaignName, setCampaignName] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [isTailoringModalOpen, setIsTailoringModalOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [copiedCampaignId, setCopiedCampaignId] = useState(null);
  const [modalTab, setModalTab] = useState('feedback');
  const [copiedSectionTitle, setCopiedSectionTitle] = useState('');

  const handleCopySectionText = (text, title) => {
    navigator.clipboard.writeText(text);
    setCopiedSectionTitle(title);
    setTimeout(() => setCopiedSectionTitle(''), 2000);
  };

  const { username } = useDashboard();

  const fetchResume = async () => {
    try {
      const token = await getToken();
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await axios.get(`${API_URL}/resumes/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setResume(res.data);
      setContactEmail(res.data.contactEmail || '');
      setLinkedinUrl(res.data.linkedinUrl || '');
      setGithubUrl(res.data.githubUrl || '');
      setCalendlyUrl(res.data.calendlyUrl || '');

      // Initialize or update preview matching active version if preview url not set
      if (!previewUrl) {
        setPreviewUrl(res.data.resumeUrl);
        setPreviewVersion(res.data.version);
      } else {
        // Update URL/Version if active matches the loaded active version
        const activeVer = res.data.versions?.find(v => v.version === res.data.version);
        if (activeVer) {
          // If we had active previewed, keep it updated
          const activeUrl = activeVer.resumeUrl;
          const wasActive = previewUrl === activeUrl;
          if (wasActive || !res.data.versions?.some(v => v.resumeUrl === previewUrl)) {
            setPreviewUrl(res.data.resumeUrl);
            setPreviewVersion(res.data.version);
          }
        }
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load resume workspace');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCtas = async (e) => {
    e.preventDefault();
    setSavingCtas(true);
    setError('');
    setCtaSuccess(false);
    try {
      const token = await getToken();
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await axios.put(`${API_URL}/resumes/${id}`, {
        contactEmail,
        linkedinUrl,
        githubUrl,
        calendlyUrl,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setResume(res.data);
      setCtaSuccess(true);
      setTimeout(() => setCtaSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to update CTA settings');
    } finally {
      setSavingCtas(false);
    }
  };

  const handleRunAIAnalysis = async () => {
    setAnalyzing(true);
    setError('');
    try {
      const token = await getToken();
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await axios.post(`${API_URL}/resumes/${id}/analyze`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setResume(res.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to run AI audit');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleCreateCampaign = async (e) => {
    e.preventDefault();
    if (!campaignName || !jobDescription) return;
    setTailoring(true);
    setError('');
    try {
      const token = await getToken();
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await axios.post(`${API_URL}/resumes/${id}/campaigns`, {
        name: campaignName,
        jobDescription
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setResume(res.data);
      setIsTailoringModalOpen(false);
      setCampaignName('');
      setJobDescription('');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to create campaign');
    } finally {
      setTailoring(false);
    }
  };

  const handleDeleteCampaign = async (campaignId) => {
    if (!confirm('Are you sure you want to delete this campaign? The link will stop working.')) return;
    setError('');
    try {
      const token = await getToken();
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await axios.delete(`${API_URL}/resumes/${id}/campaigns/${campaignId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setResume(res.data);
      if (selectedCampaign?._id === campaignId) {
        setSelectedCampaign(null);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to delete campaign');
    }
  };

  const handleToggleCampaignActive = async (campaignId) => {
    setError('');
    try {
      const token = await getToken();
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await axios.patch(`${API_URL}/resumes/${id}/campaigns/${campaignId}/active`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setResume(res.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to update campaign status');
    }
  };

  const handleCopyCampaignLink = async (campaign) => {
    const fullLink = `${origin}/${username}/${resume.slug}?ref=${campaign.name}`;
    try {
      await navigator.clipboard.writeText(fullLink);
      setCopiedCampaignId(campaign._id);
      setTimeout(() => setCopiedCampaignId(null), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (id) {
      fetchResume();
    }
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }
  }, [id, getToken]);

  const handleCopy = async () => {
    if (!resume) return;
    const fullUrl = `${origin}/${username}/${resume.slug}`;
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUploadVersion = async () => {
    if (!uploadFile) return;

    setUploading(true);
    setError('');
    try {
      const token = await getToken();
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('note', uploadNote);

      const res = await axios.put(`${API_URL}/resumes/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      setResume(res.data);
      setPreviewUrl(res.data.resumeUrl);
      setPreviewVersion(res.data.version);
      setIsUploadModalOpen(false);
      setUploadFile(null);
      setUploadNote('');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to upload new version');
    } finally {
      setUploading(false);
    }
  };

  const handleMakeActive = async (versionId) => {
    setActivatingVersionId(versionId);
    setError('');
    try {
      const token = await getToken();
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await axios.patch(`${API_URL}/resumes/${id}/versions/${versionId}/active`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setResume(res.data);
      setPreviewUrl(res.data.resumeUrl);
      setPreviewVersion(res.data.version);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to set active version');
    } finally {
      setActivatingVersionId(null);
    }
  };

  const handleSaveVersionNote = async (versionId) => {
    setSavingNote(true);
    setError('');
    try {
      const token = await getToken();
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await axios.patch(`${API_URL}/resumes/${id}/versions/${versionId}/note`, {
        note: editingVersionNote
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setResume(res.data);
      setEditingVersionId(null);
      setEditingVersionNote('');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to save note');
    } finally {
      setSavingNote(false);
    }
  };

  const handleDeleteVersion = async (versionId) => {
    if (!confirm('Are you sure you want to delete this version? This cannot be undone.')) return;
    setDeletingVersionId(versionId);
    setError('');
    try {
      const token = await getToken();
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await axios.delete(`${API_URL}/resumes/${id}/versions/${versionId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setResume(res.data);
      const versionExists = res.data.versions?.some(v => v.resumeUrl === previewUrl);
      if (!versionExists) {
        setPreviewUrl(res.data.resumeUrl);
        setPreviewVersion(res.data.version);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to delete version');
    } finally {
      setDeletingVersionId(null);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this resume? This will also remove all short links.')) return;
    setDeleting(true);
    try {
      const token = await getToken();
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      await axios.delete(`${API_URL}/resumes/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      router.push('/dashboard');
    } catch (err) {
      console.error(err);
      setError('Failed to delete resume');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (error && !resume) {
    return (
      <div className="px-8 md:px-12 py-12 text-center text-on-surface-variant font-medium">
        <p className="text-red-500 mb-4">{error}</p>
        <Link href="/dashboard" className="text-secondary hover:text-primary font-bold transition">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const fullUrl = `${origin}/${username}/${resume.slug}`;

  return (
    <div className="flex flex-col w-full bg-surface">
      {/* Top Header */}
      <header className="px-8 md:px-12 py-8 flex justify-between items-center w-full bg-transparent border-b border-outline-variant/10">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">DASHBOARD</span>
          <h1 className="text-3xl font-bold tracking-tight text-primary font-playfair">Resumes</h1>
        </div>
        <div className="text-on-surface-variant font-semibold text-sm">
          @{username}
        </div>
      </header>

      {/* Canvas Grid */}
      <div className="px-8 md:px-12 py-10 flex-grow grid grid-cols-1 lg:grid-cols-12 gap-10 w-full max-w-7xl">
        
        {/* Left column (Details and upload actions) */}
        <div className="lg:col-span-5 flex flex-col gap-8">
          
          {/* Breadcrumbs */}
          <div>
            <div className="flex items-center gap-2 text-on-surface-variant text-xs mb-6">
              <Link href="/dashboard" className="w-8 h-8 rounded-full border border-outline-variant/30 flex items-center justify-center hover:bg-surface-variant/20 transition-colors">
                <ArrowLeft size={14} />
              </Link>
              <span className="font-bold uppercase tracking-widest">RESUME WORKSPACE</span>
            </div>

            <h2 className="text-4xl font-extrabold text-primary font-playfair mb-2 leading-tight">
              {resume.title}
            </h2>
            
            {/* Short Link Display */}
            <div className="flex items-center gap-2 mt-4">
              <span className="text-xs font-bold text-secondary font-mono tracking-wider truncate max-w-xs">{fullUrl}</span>
              <button
                onClick={handleCopy}
                className="p-1.5 border border-outline-variant/30 hover:bg-surface-container rounded-lg text-on-surface-variant hover:text-primary transition-all flex items-center justify-center cursor-pointer"
                title="Copy Short Link"
              >
                {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
              </button>
            </div>
          </div>

          {/* AI Career Suite Card */}
          <div className="glass-panel p-6 rounded-2xl border border-outline-variant/20 bg-surface-container-low shadow-xs flex flex-col gap-6">
            <div className="flex items-center gap-2 border-b border-outline-variant/10 pb-3">
              <Sparkles className="text-secondary" size={20} fill="currentColor" />
              <h3 className="text-lg font-bold text-primary font-playfair uppercase tracking-wider">AI Career Suite</h3>
            </div>

            {/* Part A: Resume Analyzer Audits */}
            <div className="flex flex-col gap-3">
              <h4 className="text-xs font-extrabold text-on-surface-variant tracking-wider uppercase">AI Resume Audit</h4>
              {resume.aiScore !== null && resume.aiScore !== undefined ? (
                <div className="flex items-center justify-between bg-surface rounded-xl p-4 border border-outline-variant/15">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-secondary/15 flex items-center justify-center font-bold text-secondary text-lg">
                      {resume.aiScore}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-primary">Audit Score</span>
                      <span className="text-[10px] text-on-surface-variant font-medium">Out of 100 points</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsAuditModalOpen(true)}
                      className="px-3 py-1.5 bg-secondary text-on-secondary rounded-lg text-[10px] font-bold hover:opacity-90 transition-all cursor-pointer"
                    >
                      Report
                    </button>
                    <button
                      onClick={handleRunAIAnalysis}
                      disabled={analyzing}
                      className="px-3 py-1.5 border border-outline-variant/30 text-on-surface-variant rounded-lg text-[10px] font-bold hover:bg-surface-variant/20 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {analyzing ? <Loader2 className="animate-spin animate-duration-1000" size={10} /> : 'Re-run'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3 bg-surface rounded-xl p-4 border border-outline-variant/15">
                  <p className="text-xs text-on-surface-variant font-medium italic">
                    Analyze your resume structure, content, and phrasing. Generate detailed feedback.
                  </p>
                  <button
                    onClick={handleRunAIAnalysis}
                    disabled={analyzing}
                    className="w-full py-2.5 bg-secondary text-on-secondary rounded-xl text-xs font-bold hover:opacity-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {analyzing ? <Loader2 className="animate-spin" size={14} /> : <Sparkles size={14} />}
                    <span>{analyzing ? 'Running Audit...' : 'Run AI Audit'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Part B: Tailored Campaigns */}
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-extrabold text-on-surface-variant tracking-wider uppercase">Tailored Campaigns</h4>
                <button
                  onClick={() => setIsTailoringModalOpen(true)}
                  className="text-[10px] font-extrabold text-secondary hover:text-primary transition uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                >
                  + Add Campaign
                </button>
              </div>

              {resume.campaigns && resume.campaigns.length > 0 ? (
                <div className="flex flex-col gap-2 max-h-[25vh] overflow-y-auto pr-1">
                  {resume.campaigns.map((campaign) => (
                    <div
                      key={campaign._id}
                      className="flex flex-col gap-2 bg-surface rounded-xl p-3 border border-outline-variant/15 hover:border-outline-variant/30 transition-all"
                    >
                      <div className="flex justify-between items-center w-full">
                        <span className="text-xs font-bold text-primary uppercase font-mono">
                          ?ref={campaign.name}
                        </span>
                        <div className="flex items-center gap-2">
                          {campaign.tailoredScore && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-secondary/15 text-secondary">
                              {campaign.tailoredScore}% Match
                            </span>
                          )}
                          <button
                            onClick={() => handleToggleCampaignActive(campaign._id)}
                            className={`px-1.5 py-0.5 rounded-md text-[8px] font-bold border transition-colors cursor-pointer ${
                              campaign.isActive
                                ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                                : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                            }`}
                            title={campaign.isActive ? 'Deactivate Tailored Link' : 'Activate Tailored Link'}
                          >
                            {campaign.isActive ? 'Active' : 'Inactive'}
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center gap-4">
                        <span className="text-[10px] text-on-surface-variant font-medium italic truncate max-w-[120px]">
                          Target: {campaign.name.toUpperCase()}
                        </span>
                        
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleCopyCampaignLink(campaign)}
                            className="p-1.5 border border-outline-variant/25 hover:bg-white rounded-md text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                            title="Copy Campaign Link"
                          >
                            {copiedCampaignId === campaign._id ? (
                              <Check size={11} className="text-green-600" />
                            ) : (
                              <Copy size={11} />
                            )}
                          </button>
                          <button
                            onClick={() => {
                              setSelectedCampaign(campaign);
                              setModalTab('feedback');
                            }}
                            className="px-2 py-1.5 bg-primary text-on-primary rounded-md text-[9px] font-bold hover:opacity-90 transition-colors cursor-pointer"
                          >
                            Feedback
                          </button>
                          <button
                            onClick={() => handleDeleteCampaign(campaign._id)}
                            className="p-1.5 border border-outline-variant/25 hover:bg-red-50 text-on-surface-variant hover:text-red-600 transition-colors rounded-md cursor-pointer"
                            title="Delete Campaign"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-on-surface-variant font-medium italic bg-surface/40 p-3 rounded-xl border border-dashed border-outline-variant/25">
                  No tailored campaigns created. Click "+ Add Campaign" to tailor your profile for specific jobs.
                </p>
              )}
            </div>
          </div>

          {/* Action Trigger: Open Upload Modal */}
          <div className="mt-2">
            <button 
              onClick={() => setIsUploadModalOpen(true)}
              className="flex items-center justify-center gap-3 bg-primary text-on-primary font-bold px-6 py-4 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md cursor-pointer text-sm w-full sm:w-auto text-center"
            >
              <Upload size={18} />
              <span>UPLOAD NEW VERSION</span>
            </button>
          </div>

          {/* Version History List */}
          <div className="flex flex-col gap-4">
            <span className="text-xs font-bold text-on-surface-variant tracking-wider uppercase border-b border-outline-variant/10 pb-2">
              VERSION HISTORY
            </span>

            {error && (
              <p className="text-xs text-red-500 font-bold mb-2">{error}</p>
            )}

            <div className="flex flex-col gap-4 max-h-[45vh] overflow-y-auto pr-1">
              {resume.versions && resume.versions.length > 0 ? (
                [...resume.versions]
                  .sort((a, b) => b.version - a.version)
                  .map((v) => {
                    const isActive = v.resumeUrl === resume.resumeUrl && v.version === resume.version;
                    const isPreviewing = v.resumeUrl === previewUrl;
                    const isEditing = editingVersionId === v._id;

                    return (
                      <div 
                        key={v._id} 
                        onClick={() => {
                          setPreviewUrl(v.resumeUrl);
                          setPreviewVersion(v.version);
                        }}
                        className={`group/item rounded-2xl p-5 border transition-all duration-300 relative flex flex-col gap-3 cursor-pointer ${
                          isActive 
                            ? 'bg-[#ffffff] border-secondary/30 shadow-sm' 
                            : 'bg-surface-container-low border-outline-variant/25 hover:border-outline-variant/50'
                        } ${isPreviewing && !isActive ? 'ring-1 ring-secondary/20' : ''}`}
                      >
                        {/* Top Row: Version Number & Active Badges */}
                        <div className="flex justify-between items-center w-full">
                          <span className="text-lg font-bold text-primary font-playfair">v{v.version}</span>
                          {isActive ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-extrabold bg-[#e6f4ea] text-[#137333] tracking-wide uppercase">
                              ACTIVE
                            </span>
                          ) : isPreviewing ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-extrabold bg-secondary/15 text-secondary tracking-wide uppercase">
                              PREVIEWING
                            </span>
                          ) : null}
                        </div>

                        {/* Date String */}
                        <div className="text-[11px] text-on-surface-variant font-mono">
                          {new Date(v.createdAt).toLocaleString()}
                        </div>

                        {/* Tailoring Note / Job Target */}
                        {isEditing ? (
                          <div className="flex items-center gap-2 mt-1 w-full" onClick={(e) => e.stopPropagation()}>
                            <input 
                              type="text" 
                              value={editingVersionNote}
                              onChange={(e) => setEditingVersionNote(e.target.value)}
                              className="flex-1 min-w-0 px-2 py-1 text-xs bg-surface-container-lowest border border-outline-variant/40 rounded-lg focus:ring-1 focus:ring-secondary focus:border-secondary outline-none text-primary font-medium"
                              placeholder="Edit note..."
                              autoFocus
                            />
                            <button 
                              onClick={() => handleSaveVersionNote(v._id)}
                              disabled={savingNote}
                              className="px-2.5 py-1 bg-primary text-on-primary rounded-lg text-[10px] font-bold hover:opacity-90 disabled:opacity-50 shrink-0"
                            >
                              {savingNote ? <Loader2 className="animate-spin" size={10} /> : 'Save'}
                            </button>
                            <button 
                              onClick={() => {
                                setEditingVersionId(null);
                                setEditingVersionNote('');
                              }}
                              className="px-2 py-1 border border-outline-variant/30 text-on-surface-variant rounded-lg text-[10px] font-bold hover:bg-surface-variant/20 shrink-0"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 mt-0.5 w-full min-w-0">
                            <p className="text-xs text-on-surface-variant font-medium italic truncate flex-1">
                              {v.note || 'No note added'}
                            </p>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingVersionId(v._id);
                                setEditingVersionNote(v.note || '');
                              }}
                              className="opacity-0 group-hover/item:opacity-100 transition-opacity p-1 text-on-surface-variant hover:text-primary shrink-0"
                              title="Edit note"
                            >
                              <Pencil size={11} />
                            </button>
                          </div>
                        )}

                        {/* Bottom Row: Actions (Serving public link / Make Active button + Trash delete) */}
                        <div className="flex justify-between items-center gap-4 mt-2">
                          {isActive ? (
                            <div className="flex-grow py-2 text-center text-xs font-bold text-[#137333] border border-[#137333]/30 rounded-lg bg-[#e6f4ea]/40 select-none">
                              Serving public link
                            </div>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMakeActive(v._id);
                              }}
                              disabled={activatingVersionId !== null}
                              className="flex-grow py-2 text-center text-xs font-bold text-secondary border border-secondary hover:bg-secondary hover:text-white rounded-lg bg-transparent transition duration-200 cursor-pointer disabled:opacity-50"
                            >
                              {activatingVersionId === v._id ? <Loader2 className="animate-spin mx-auto" size={14} /> : 'Make Active'}
                            </button>
                          )}

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteVersion(v._id);
                            }}
                            disabled={deletingVersionId !== null || isActive}
                            className={`p-2 border border-outline-variant/30 hover:bg-surface-container-high rounded-xl transition-all flex items-center justify-center cursor-pointer ${
                              isActive 
                                ? 'opacity-40 cursor-not-allowed text-on-surface-variant' 
                                : 'text-red-500 hover:text-red-700 hover:border-red-200'
                            }`}
                            title={isActive ? "Cannot delete the active version" : "Delete Version"}
                          >
                            {deletingVersionId === v._id ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
                          </button>
                        </div>
                      </div>
                    );
                  })
              ) : (
                <div className="bg-surface-container-low rounded-2xl p-5 border border-outline-variant/30 relative overflow-hidden flex justify-between items-center group">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-bold text-primary font-playfair">v{resume.version}</span>
                      <span className="text-[10px] text-on-surface-variant font-mono">
                        {new Date(resume.updatedAt).toLocaleString()}
                      </span>
                    </div>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold bg-green-50 text-green-700 border border-green-200/50 w-fit">
                      Serving public link
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Danger Zone */}
            <div className="mt-2 border-t border-outline-variant/10 pt-4 flex justify-between items-center">
              <span className="text-[9px] text-on-surface-variant/50 uppercase tracking-widest font-bold">DANGER ZONE</span>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="text-[10px] font-bold text-red-500 hover:text-red-700 transition-all flex items-center gap-1 uppercase tracking-wider"
              >
                {deleting ? <Loader2 className="animate-spin" size={12} /> : <Trash2 size={12} />}
                <span>Delete Entire Resume</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right column (Full PDF Preview) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="border-b border-outline-variant/20 pb-2 flex justify-between items-end">
            <div>
              <span className="text-[10px] font-bold text-on-surface-variant tracking-widest uppercase">FULL RESUME PREVIEW</span>
              <h3 className="text-lg font-bold text-primary font-playfair flex items-center gap-2">
                <span>Previewing v{previewVersion}</span>
              </h3>
            </div>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-secondary/15 text-secondary uppercase tracking-widest">
              Active Link: v{resume.version}
            </span>
          </div>

          <div className="bg-surface-container-low rounded-2xl overflow-hidden h-[70vh] p-2 border border-outline-variant/30 shadow-sm relative group">
            <iframe
              src={`${previewUrl}#toolbar=0`}
              className="w-full h-full border-none rounded-xl bg-white"
              title="Resume Preview Frame"
              key={previewUrl}
            />
          </div>
        </div>

      </div>

      {/* Upload Tailored Version Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-surface-container max-w-md w-full rounded-[2rem] p-8 border border-outline-variant/30 shadow-2xl flex flex-col gap-6 relative">
            <h3 className="text-2xl font-bold text-primary font-playfair flex items-center gap-2">
              <Upload className="text-secondary" size={24} />
              Upload Tailored Version
            </h3>
            <p className="text-xs text-on-surface-variant font-medium italic">
              Keep your short link URL unchanged while serving a specific resume tailored for a job or role.
            </p>

            {/* File selector dropzone */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">PDF Resume File</label>
              <div className="flex justify-center px-4 py-8 bg-surface-container-lowest border-2 border-outline-variant/40 border-dashed rounded-2xl hover:border-secondary transition cursor-pointer relative group">
                <div className="space-y-1 text-center">
                  {uploadFile ? (
                    <div className="flex flex-col items-center">
                      <Check className="h-8 w-8 text-secondary mb-2" />
                      <span className="text-sm font-bold text-primary truncate max-w-[200px]">{uploadFile.name}</span>
                      <span className="text-xs text-on-surface-variant">{(uploadFile.size / 1024 / 1024).toFixed(2)} MB</span>
                    </div>
                  ) : (
                    <>
                      <FileText className="mx-auto h-8 w-8 text-on-surface-variant/45 group-hover:text-secondary transition mb-1" />
                      <span className="text-sm font-bold text-secondary">Click to upload</span>
                      <p className="text-[10px] text-on-surface-variant/40 uppercase tracking-widest mt-1">PDF up to 10MB</p>
                    </>
                  )}
                  <input 
                    type="file" 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                    accept="application/pdf" 
                    onChange={(e) => setUploadFile(e.target.files[0])} 
                  />
                </div>
              </div>
            </div>

            {/* Note input */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Tailoring Note (Role / Target Company)</label>
              <input 
                type="text" 
                placeholder="e.g. Tailored for Stripe Product Manager role"
                value={uploadNote} 
                onChange={(e) => setUploadNote(e.target.value)}
                className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant/30 rounded-xl focus:ring-2 focus:ring-secondary focus:border-secondary outline-none transition text-primary font-medium placeholder-on-surface-variant/40"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-4 mt-2">
              <button 
                onClick={() => {
                  setIsUploadModalOpen(false);
                  setUploadFile(null);
                  setUploadNote('');
                }}
                className="flex-1 px-4 py-3 rounded-full border border-outline-variant/30 text-xs font-bold text-on-surface-variant hover:bg-surface-variant/10 transition-all uppercase tracking-wider"
              >
                Cancel
              </button>
              <button 
                onClick={handleUploadVersion}
                disabled={uploading || !uploadFile}
                className="flex-1 px-4 py-3 rounded-full bg-primary text-on-primary text-xs font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md uppercase tracking-wider flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {uploading ? <Loader2 className="animate-spin" size={14} /> : null}
                <span>{uploading ? 'Uploading...' : 'Upload'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* AI Audit Details Modal */}
      {isAuditModalOpen && resume.aiFeedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-surface-container max-w-lg w-full rounded-[2rem] p-8 border border-outline-variant/30 shadow-2xl flex flex-col gap-5 relative max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-outline-variant/10 pb-3">
              <h3 className="text-2xl font-bold text-primary font-playfair flex items-center gap-2">
                <Sparkles className="text-secondary" size={24} fill="currentColor" />
                AI Audit Report
              </h3>
              <button onClick={() => setIsAuditModalOpen(false)} className="p-1 hover:bg-surface-variant/20 rounded-full cursor-pointer text-on-surface-variant">
                <X size={18} />
              </button>
            </div>

            <div className="flex items-center gap-4 bg-secondary/10 px-5 py-4 rounded-2xl border border-secondary/20">
              <div className="w-14 h-14 rounded-full bg-secondary text-on-secondary flex items-center justify-center font-bold text-2xl shrink-0">
                {resume.aiScore}
              </div>
              <div>
                <h4 className="text-sm font-bold text-primary">Resume Quality Index</h4>
                <p className="text-xs text-on-surface-variant font-medium mt-0.5">
                  {resume.aiFeedback.summary || 'Your resume has been audited.'}
                </p>
              </div>
            </div>

            {/* Pros */}
            {resume.aiFeedback.pros && resume.aiFeedback.pros.length > 0 && (
              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold text-green-700 uppercase tracking-wider">Key Strengths</span>
                <ul className="list-disc list-inside text-xs text-on-surface-variant font-medium space-y-1 bg-green-50/30 border border-green-100 p-4 rounded-xl">
                  {resume.aiFeedback.pros.map((p, idx) => (
                    <li key={idx} className="leading-relaxed text-xs">{p}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Cons */}
            {resume.aiFeedback.cons && resume.aiFeedback.cons.length > 0 && (
              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold text-red-700 uppercase tracking-wider">Areas for Improvement</span>
                <ul className="list-disc list-inside text-xs text-on-surface-variant font-medium space-y-1 bg-red-50/30 border border-red-100 p-4 rounded-xl">
                  {resume.aiFeedback.cons.map((c, idx) => (
                    <li key={idx} className="leading-relaxed text-xs">{c}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommendations */}
            {resume.aiFeedback.recommendations && resume.aiFeedback.recommendations.length > 0 && (
              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold text-primary uppercase tracking-wider">Actionable Recommendations</span>
                <ul className="list-decimal list-inside text-xs text-on-surface-variant font-medium space-y-1 bg-primary/5 border border-primary/10 p-4 rounded-xl">
                  {resume.aiFeedback.recommendations.map((r, idx) => (
                    <li key={idx} className="leading-relaxed text-xs">{r}</li>
                  ))}
                </ul>
              </div>
            )}

            <button 
              onClick={() => setIsAuditModalOpen(false)}
              className="w-full mt-2 py-3.5 bg-primary text-on-primary text-xs font-bold rounded-full hover:scale-[1.01] transition-transform shadow-md uppercase tracking-wider cursor-pointer text-center"
            >
              Close Report
            </button>
          </div>
        </div>
      )}

      {/* AI Tailoring Form Modal */}
      {isTailoringModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-surface-container max-w-md w-full rounded-[2rem] p-8 border border-outline-variant/30 shadow-2xl flex flex-col gap-5 relative">
            <div className="flex justify-between items-center border-b border-outline-variant/10 pb-3">
              <h3 className="text-2xl font-bold text-primary font-playfair flex items-center gap-2">
                <Sparkles className="text-secondary" size={24} fill="currentColor" />
                Tailor Profile
              </h3>
              <button 
                onClick={() => {
                  setIsTailoringModalOpen(false);
                  setCampaignName('');
                  setJobDescription('');
                }} 
                className="p-1 hover:bg-surface-variant/20 rounded-full cursor-pointer text-on-surface-variant"
              >
                <X size={18} />
              </button>
            </div>
            
            <p className="text-xs text-on-surface-variant font-medium italic">
              Input a job description and name the target company. The AI will tailor your profile section details to align with the role.
            </p>

            <form onSubmit={handleCreateCampaign} className="space-y-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Target Company / Campaign Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Google"
                  required
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant/30 rounded-xl focus:ring-2 focus:ring-secondary focus:border-secondary outline-none transition text-primary font-medium placeholder-on-surface-variant/40"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Job Description</label>
                <textarea 
                  placeholder="Paste the full job description or requirements here..."
                  required
                  rows={6}
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant/30 rounded-xl focus:ring-2 focus:ring-secondary focus:border-secondary outline-none transition text-primary font-medium placeholder-on-surface-variant/40 resize-none text-xs"
                />
              </div>

              <div className="flex gap-4 pt-2">
                <button 
                  type="button"
                  onClick={() => {
                    setIsTailoringModalOpen(false);
                    setCampaignName('');
                    setJobDescription('');
                  }}
                  className="flex-1 px-4 py-3 rounded-full border border-outline-variant/30 text-xs font-bold text-on-surface-variant hover:bg-surface-variant/10 transition-all uppercase tracking-wider cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={tailoring || !campaignName || !jobDescription}
                  className="flex-1 px-4 py-3 rounded-full bg-primary text-on-primary text-xs font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md uppercase tracking-wider flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {tailoring ? <Loader2 className="animate-spin" size={14} /> : null}
                  <span>{tailoring ? 'Tailoring...' : 'Tailor Profile'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Campaign Details / Feedback Modal */}
      {selectedCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-surface-container max-w-lg w-full rounded-[2rem] p-8 border border-outline-variant/30 shadow-2xl flex flex-col gap-5 relative max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-outline-variant/10 pb-3">
              <h3 className="text-2xl font-bold text-primary font-playfair flex items-center gap-2">
                <Sparkles className="text-secondary" size={24} fill="currentColor" />
                Campaign Feedback: {selectedCampaign.name.toUpperCase()}
              </h3>
              <button onClick={() => setSelectedCampaign(null)} className="p-1 hover:bg-surface-variant/20 rounded-full cursor-pointer text-on-surface-variant">
                <X size={18} />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-outline-variant/15 pb-1 gap-4">
              <button
                type="button"
                onClick={() => setModalTab('feedback')}
                className={`pb-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                  modalTab === 'feedback'
                    ? 'border-primary text-primary font-extrabold'
                    : 'border-transparent text-on-surface-variant/75 hover:text-primary'
                }`}
              >
                Feedback & Gaps
              </button>
              <button
                type="button"
                onClick={() => setModalTab('tailoredText')}
                className={`pb-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                  modalTab === 'tailoredText'
                    ? 'border-primary text-primary font-extrabold'
                    : 'border-transparent text-on-surface-variant/75 hover:text-primary'
                }`}
              >
                Tailored Resume Text
              </button>
            </div>

            {modalTab === 'feedback' && (
              <>
                <div className="flex items-center gap-4 bg-secondary/10 px-5 py-4 rounded-2xl border border-secondary/20">
                  <div className="w-14 h-14 rounded-full bg-secondary text-on-secondary flex items-center justify-center font-bold text-2xl shrink-0">
                    {selectedCampaign.tailoredScore || 0}%
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-primary">Job Alignment Score</h4>
                    <p className="text-xs text-on-surface-variant font-medium mt-0.5">
                      {selectedCampaign.tailoredFeedback?.summary || 'Candidate details match the target role.'}
                    </p>
                  </div>
                </div>

                {/* Gaps */}
                {selectedCampaign.tailoredFeedback?.gaps && selectedCampaign.tailoredFeedback.gaps.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-bold text-red-700 uppercase tracking-wider">Identified Qualification Gaps</span>
                    <ul className="list-disc list-inside text-xs text-on-surface-variant font-medium space-y-1 bg-red-50/30 border border-red-100 p-4 rounded-xl">
                      {selectedCampaign.tailoredFeedback.gaps.map((gap, idx) => (
                        <li key={idx} className="leading-relaxed text-xs">{gap}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Modifications */}
                {selectedCampaign.tailoredFeedback?.modifications && selectedCampaign.tailoredFeedback.modifications.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-bold text-primary uppercase tracking-wider">AI Tailoring Adjustments Made</span>
                    <ul className="list-disc list-inside text-xs text-on-surface-variant font-medium space-y-1 bg-primary/5 border border-primary/10 p-4 rounded-xl">
                      {selectedCampaign.tailoredFeedback.modifications.map((mod, idx) => (
                        <li key={idx} className="leading-relaxed text-xs">{mod}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}

            {modalTab === 'tailoredText' && (
              <div className="flex flex-col gap-4">
                {selectedCampaign.tailoredSections && selectedCampaign.tailoredSections.length > 0 ? (
                  selectedCampaign.tailoredSections.map((section) => (
                    <div key={section.title} className="bg-surface p-4 rounded-2xl border border-outline-variant/15 flex flex-col gap-2 relative">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-primary uppercase tracking-wider">
                          {section.title}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopySectionText(section.content, section.title)}
                          className="text-[10px] font-bold text-secondary hover:text-primary transition flex items-center gap-1 cursor-pointer bg-secondary/5 px-2.5 py-1 rounded-md"
                        >
                          {copiedSectionTitle === section.title ? (
                            <>
                              <Check size={10} className="text-green-600" />
                              <span>Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy size={10} />
                              <span>Copy Text</span>
                            </>
                          )}
                        </button>
                      </div>
                      <div className="text-xs text-on-surface-variant font-medium whitespace-pre-line leading-relaxed max-h-[150px] overflow-y-auto bg-surface-container-lowest/50 p-2.5 rounded-lg font-mono">
                        {section.content}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-on-surface-variant font-medium italic text-center py-4">
                    No tailored sections available for this campaign.
                  </p>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 mt-2">
              <a
                href={`${window.location.origin}/${username}/${resume.slug}?ref=${selectedCampaign.name}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 bg-secondary text-on-secondary text-xs font-bold rounded-full hover:opacity-90 transition-opacity uppercase tracking-wider cursor-pointer text-center flex items-center justify-center gap-1.5"
              >
                <ExternalLink size={14} />
                <span>View Tailored Profile</span>
              </a>
              <button 
                type="button"
                onClick={() => handleCopyCampaignLink(selectedCampaign)}
                className="flex-1 py-3 border border-outline-variant/30 rounded-full text-xs font-bold text-primary hover:bg-surface-variant/20 transition-all uppercase tracking-wider cursor-pointer text-center flex items-center justify-center gap-1.5"
              >
                {copiedCampaignId === selectedCampaign._id ? (
                  <>
                    <Check size={14} className="text-green-600" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
              <button 
                type="button"
                onClick={() => setSelectedCampaign(null)}
                className="flex-1 py-3 bg-primary text-on-primary text-xs font-bold rounded-full hover:opacity-90 transition-opacity uppercase tracking-wider cursor-pointer text-center"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
