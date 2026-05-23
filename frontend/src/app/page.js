'use client';

import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import { RefreshCw, Eye, Link2, Files, ChevronRight, Check, X, ArrowRight, HelpCircle } from 'lucide-react';
import { useState } from 'react';

export default function Home() {
  const { isLoaded, userId } = useAuth();
  const [activeFaq, setActiveFaq] = useState(0);

  const faqs = [
    {
      q: "How is Rezync different from sending a PDF?",
      a: "With Rezync, you share one permanent link. Whenever you upload a better version, that same link always serves your latest resume, so recruiters never open an outdated file."
    },
    {
      q: "Can I keep multiple resumes for different roles?",
      a: "Yes! You can create different custom slugs (e.g. /username/frontend vs /username/product) to distribute role-tailored resumes easily."
    },
    {
      q: "Will I know who viewed my resume link?",
      a: "Absolutely. Our analytics track views, dynamic referrer sources (like LinkedIn or email), device info, and timestamp logs."
    },
    {
      q: "Do I need to resend links after every update?",
      a: "No. The main advantage of Rezync is that your existing links reflect updates immediately, meaning no resends are ever needed."
    }
  ];

  return (
    <div className="bg-background text-on-background min-h-screen font-body-md antialiased selection:bg-secondary-container selection:text-on-secondary-container flex flex-col">
      
      {/* TopNavBar */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-8 py-3 bg-surface/80 backdrop-blur-md shadow-sm border border-outline-variant/30 rounded-full mt-4 mx-auto max-w-5xl transition-all duration-300">
        <Link href="/" className="font-body-md font-bold text-2xl text-primary hover:scale-[1.02] transition-transform duration-200">
          re<span className="wordmark-x">zync</span>
        </Link>
        <div className="hidden md:flex items-center gap-6 text-sm font-semibold text-on-surface-variant">
          <a href="#features" className="hover:text-primary transition-colors">Features</a>
          <a href="#workflow" className="hover:text-primary transition-colors">Workflow</a>
          <a href="#vs-drive" className="hover:text-primary transition-colors">Vs Drive</a>
          <a href="#faqs" className="hover:text-primary transition-colors">FAQs</a>
        </div>
        <div>
          {isLoaded && userId ? (
            <Link href="/dashboard" className="bg-primary text-on-primary px-6 py-2 rounded-full font-bold hover:scale-[1.02] transition-transform duration-200 shadow-sm text-sm">
              Dashboard
            </Link>
          ) : (
            <Link href="/sign-in" className="bg-primary text-on-primary px-6 py-2 rounded-full font-bold hover:scale-[1.02] transition-transform duration-200 shadow-sm text-sm">
              Login
            </Link>
          )}
        </div>
      </nav>

      <main className="flex-grow">
        
        {/* Hero Section */}
        <section 
          className="relative min-h-[90vh] flex items-center justify-center pt-32 pb-24 px-6 md:px-12 bg-cover bg-center bg-no-repeat"
          style={{ 
            backgroundImage: "url('https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2000&auto=format&fit=crop')",
          }}
        >
          <div className="absolute inset-0 bg-background/85 backdrop-blur-[1px]"></div>
          <div className="relative z-10 text-center max-w-4xl mx-auto">
            <h1 className="font-playfair text-5xl md:text-8xl leading-tight text-primary font-bold mb-6 tracking-tight">
              Stop Sending <br />
              <span className="font-playfair italic font-normal text-secondary">Outdated Resumes</span>
            </h1>
            <p className="text-lg md:text-xl text-on-surface-variant max-w-2xl mx-auto mb-10 leading-relaxed">
              One link. Always updated. Know exactly who viewed your resume and where they came from.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href={userId ? "/dashboard" : "/sign-up"} className="w-full sm:w-auto bg-primary text-on-primary px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition-transform text-center">
                Get Your Resume Link
              </Link>
              <a href="#features" className="w-full sm:w-auto bg-transparent border border-secondary text-on-surface px-8 py-4 rounded-full font-bold text-lg hover:bg-surface-container/50 transition-colors text-center">
                Explore Features
              </a>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 px-6 md:px-12 max-w-6xl mx-auto" id="features">
          <div className="text-center mb-16">
            <span className="text-xs font-bold text-secondary uppercase tracking-widest mb-4 block">Features</span>
            <h2 className="font-playfair text-4xl md:text-6xl text-primary font-bold leading-tight">
              A Better Way to <br />
              Share <span className="font-playfair italic font-normal text-secondary">Your Resume</span>
            </h2>
            <p className="mt-6 text-on-surface-variant max-w-2xl mx-auto text-lg leading-relaxed">
              No more outdated PDFs, messy links, or guesswork. Update once, share everywhere, and finally know what happens after you send your resume.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Card 1 */}
            <div className="bg-surface-container rounded-[1.5rem] p-8 md:p-10 soft-shadow smooth-hover border border-outline-variant/20">
              <div className="bg-primary text-on-primary w-12 h-12 rounded-2xl flex items-center justify-center mb-6">
                <RefreshCw size={22} />
              </div>
              <h3 className="font-playfair text-2xl font-bold text-primary mb-4">Always Up-to-Date</h3>
              <p className="text-on-surface-variant leading-relaxed">Update your resume once, and your link reflects it everywhere instantly. No resending. No confusion.</p>
            </div>
            
            {/* Card 2 */}
            <div className="bg-surface-container rounded-[1.5rem] p-8 md:p-10 soft-shadow smooth-hover border border-outline-variant/20">
              <div className="bg-primary text-on-primary w-12 h-12 rounded-2xl flex items-center justify-center mb-6">
                <Eye size={22} />
              </div>
              <h3 className="font-playfair text-2xl font-bold text-primary mb-4">See Who Viewed</h3>
              <p className="text-on-surface-variant leading-relaxed">Know when your resume gets opened and where the views come from - LinkedIn, referrals, or anywhere else.</p>
            </div>

            {/* Card 3 */}
            <div className="bg-surface-container rounded-[1.5rem] p-8 md:p-10 soft-shadow smooth-hover border border-outline-variant/20">
              <div className="bg-primary text-on-primary w-12 h-12 rounded-2xl flex items-center justify-center mb-6">
                <Link2 size={22} />
              </div>
              <h3 className="font-playfair text-2xl font-bold text-primary mb-4">One Link Everywhere</h3>
              <p className="text-on-surface-variant leading-relaxed">Share a single clean link on LinkedIn, portfolio, or CV - instead of messy PDFs and long Drive links.</p>
            </div>

            {/* Card 4 */}
            <div className="bg-surface-container rounded-[1.5rem] p-8 md:p-10 soft-shadow smooth-hover border border-outline-variant/20">
              <div className="bg-primary text-on-primary w-12 h-12 rounded-2xl flex items-center justify-center mb-6">
                <Files size={22} />
              </div>
              <h3 className="font-playfair text-2xl font-bold text-primary mb-4">Manage Multiple Versions</h3>
              <p className="text-on-surface-variant leading-relaxed">Create different resumes for different roles without losing track. Switch and update with ease.</p>
            </div>
          </div>
        </section>

        {/* Steps Section */}
        <section className="py-24 px-6 md:px-12 max-w-6xl mx-auto border-t border-outline-variant/20" id="workflow">
          <div className="text-center mb-16">
            <span className="text-xs font-bold text-secondary uppercase tracking-widest mb-4 block">How It Works</span>
            <h2 className="font-playfair text-4xl md:text-6xl text-primary font-bold leading-tight">
              From Resume Upload <br />
              to <span className="font-playfair italic font-normal text-secondary">Recruiter View</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-surface-container rounded-[1.5rem] p-8 soft-shadow smooth-hover relative overflow-hidden border border-outline-variant/20">
              <span className="absolute top-8 right-8 text-xs font-bold text-on-surface-variant uppercase tracking-widest">Step 01</span>
              <div className="bg-primary text-on-primary w-10 h-10 rounded-full flex items-center justify-center font-bold mb-6">01</div>
              <h3 className="font-playfair text-xl font-bold text-primary mb-4">Upload Your Resume</h3>
              <p className="text-on-surface-variant">Drop your resume PDF in seconds and publish it with one clean profile link.</p>
            </div>

            <div className="bg-surface-container rounded-[1.5rem] p-8 soft-shadow smooth-hover relative overflow-hidden border border-outline-variant/20">
              <span className="absolute top-8 right-8 text-xs font-bold text-on-surface-variant uppercase tracking-widest">Step 02</span>
              <div className="bg-primary text-on-primary w-10 h-10 rounded-full flex items-center justify-center font-bold mb-6">02</div>
              <h3 className="font-playfair text-xl font-bold text-primary mb-4">Create a Role-Specific Slug</h3>
              <p className="text-on-surface-variant">Make targeted links like /username/frontend or /username/product for different applications.</p>
            </div>

            <div className="bg-surface-container rounded-[1.5rem] p-8 soft-shadow smooth-hover relative overflow-hidden border border-outline-variant/20">
              <span className="absolute top-8 right-8 text-xs font-bold text-on-surface-variant uppercase tracking-widest">Step 03</span>
              <div className="bg-primary text-on-primary w-10 h-10 rounded-full flex items-center justify-center font-bold mb-6">03</div>
              <h3 className="font-playfair text-xl font-bold text-primary mb-4">Share Everywhere</h3>
              <p className="text-on-surface-variant">Use the same Rezync link on LinkedIn, email, portfolios, and referrals.</p>
            </div>

            <div className="bg-surface-container rounded-[1.5rem] p-8 soft-shadow smooth-hover relative overflow-hidden border border-outline-variant/20">
              <span className="absolute top-8 right-8 text-xs font-bold text-on-surface-variant uppercase tracking-widest">Step 04</span>
              <div className="bg-primary text-on-primary w-10 h-10 rounded-full flex items-center justify-center font-bold mb-6">04</div>
              <h3 className="font-playfair text-xl font-bold text-primary mb-4">Update Once, Stay Current</h3>
              <p className="text-on-surface-variant">Whenever you improve your resume, your existing shared link is automatically up to date.</p>
            </div>
          </div>
        </section>

        {/* Comparison Section */}
        <section className="py-24 px-6 md:px-12 max-w-6xl mx-auto border-t border-outline-variant/20" id="vs-drive">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="font-playfair text-4xl md:text-6xl text-primary font-bold mb-6 leading-tight">
              Why Recruiters <br />
              Prefer <span className="font-playfair italic font-normal text-secondary">Rezync</span>
            </h2>
            <p className="text-on-surface-variant text-lg">
              Google Drive links share files. Rezync shares your professional profile flow: always current, easier to trust, and built for hiring conversations.
            </p>
          </div>

          <div className="bg-surface-container rounded-[1.5rem] overflow-hidden soft-shadow border border-outline-variant/20">
            <div className="grid grid-cols-3 border-b border-outline-variant/20 bg-surface-container-high/50 p-6 text-sm font-semibold">
              <div className="text-secondary uppercase tracking-widest">Comparison</div>
              <div className="text-secondary uppercase tracking-widest">Google Drive Link</div>
              <div className="text-secondary uppercase tracking-widest font-bold">Rezync Link</div>
            </div>

            <div className="grid grid-cols-3 border-b border-outline-variant/20 p-6 items-center text-sm font-medium">
              <div className="font-bold text-primary">Always latest resume</div>
              <div className="text-on-surface-variant">You must re-share a new file each update</div>
              <div className="text-primary font-bold">One link always points to your latest version</div>
            </div>

            <div className="grid grid-cols-3 border-b border-outline-variant/20 p-6 items-center text-sm font-medium">
              <div className="font-bold text-primary">Professional URL</div>
              <div className="text-on-surface-variant">Long, generic link with random characters</div>
              <div className="text-primary font-bold">Clean URL with your username and slug</div>
            </div>

            <div className="grid grid-cols-3 border-b border-outline-variant/20 p-6 items-center text-sm font-medium">
              <div className="font-bold text-primary">View insights</div>
              <div className="text-on-surface-variant">No candidate-level source tracking</div>
              <div className="text-primary font-bold">Track views and traffic origins (LinkedIn, etc)</div>
            </div>

            <div className="grid grid-cols-3 p-6 items-center text-sm font-medium">
              <div className="font-bold text-primary">Role-specific resumes</div>
              <div className="text-on-surface-variant">Folder juggling and duplicate filenames</div>
              <div className="text-primary font-bold">Maintain multiple tailored versions neatly</div>
            </div>
          </div>
        </section>

        {/* FAQs Section */}
        <section className="py-24 px-6 md:px-12 max-w-6xl mx-auto flex flex-col md:flex-row gap-16 border-t border-outline-variant/20" id="faqs">
          <div className="md:w-1/3">
            <span className="text-xs font-bold text-secondary uppercase tracking-widest mb-4 block">FAQs</span>
            <h2 className="font-playfair text-4xl md:text-5xl text-primary font-bold mb-6">
              Answers <br />
              Before <span className="font-playfair italic font-normal text-secondary">You Ask</span>
            </h2>
            <p className="text-on-surface-variant text-base mb-8">
              Everything you need to know before sharing your resume link with recruiters and hiring managers.
            </p>
          </div>

          <div className="md:w-2/3 flex flex-col gap-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-surface-container rounded-2xl border border-outline-variant/20 overflow-hidden">
                <button 
                  onClick={() => setActiveFaq(activeFaq === idx ? -1 : idx)}
                  className="w-full text-left p-6 flex justify-between items-center font-bold text-primary hover:bg-surface-container-high/30 transition-colors"
                >
                  {faq.q}
                  <span className="text-lg font-normal text-secondary">
                    {activeFaq === idx ? '−' : '+'}
                  </span>
                </button>
                {activeFaq === idx && (
                  <div className="p-6 pt-0 text-on-surface-variant text-sm leading-relaxed border-t border-outline-variant/10">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-6 md:px-12 max-w-6xl mx-auto flex flex-col md:flex-row gap-12 items-center justify-between border-t border-outline-variant/20" id="cta">
          <div className="md:w-1/2">
            <span className="text-xs font-bold text-secondary uppercase tracking-widest mb-4 block">Ready when you are</span>
            <h2 className="font-playfair text-4xl md:text-6xl text-primary font-bold mb-6 leading-tight">
              Your Resume Deserves <br />
              <span className="font-playfair italic font-normal text-secondary">Better Than a PDF</span>
            </h2>
            <p className="text-on-surface-variant text-lg mb-8 max-w-md">
              One link for your resume that always stays updated, no matter where you shared it. Track views and never send outdated files.
            </p>
            <div className="flex items-center gap-6">
              <Link href={userId ? "/dashboard" : "/sign-up"} className="bg-primary text-on-primary px-8 py-4 rounded-full font-bold text-base hover:scale-105 transition-transform shadow-md">
                Create My Resume Link
              </Link>
            </div>
          </div>
          <div className="md:w-1/2 flex flex-col items-end gap-6 text-right w-full font-semibold">
            <div className="w-full max-w-md border-b border-outline-variant/20 pb-4">
              <span className="text-xs text-secondary uppercase tracking-widest">Link Once</span>
            </div>
            <div className="w-full max-w-md border-b border-outline-variant/20 pb-4">
              <span className="text-xs text-secondary uppercase tracking-widest">Update Anytime</span>
            </div>
            <div className="w-full max-w-md border-b border-outline-variant/20 pb-4">
              <span className="text-xs text-secondary uppercase tracking-widest">Track Everything</span>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="w-full py-16 px-6 md:px-12 border-t border-outline-variant bg-surface-container-low">
        <div className="max-w-6xl mx-auto w-full">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            
            <div className="md:col-span-2">
              <Link href="/" className="font-body-md font-bold text-2xl text-primary mb-4 block">
                re<span className="wordmark-x text-3xl">zync</span>
              </Link>
              <p className="text-on-surface-variant max-w-xs text-sm leading-relaxed">
                The modern way to share your professional story. One link, always current, powered by insights.
              </p>
            </div>
            
            <div className="flex flex-col gap-3 text-sm">
              <span className="font-bold text-primary uppercase tracking-wider text-xs">Platform</span>
              <a className="text-on-surface-variant hover:text-primary transition-colors" href="#features">Features</a>
              <a className="text-on-surface-variant hover:text-primary transition-colors" href="#workflow">Workflow</a>
              <a className="text-on-surface-variant hover:text-primary transition-colors" href="#faqs">FAQs</a>
            </div>

            <div className="flex flex-col gap-3 text-sm">
              <span className="font-bold text-primary uppercase tracking-wider text-xs">Connect</span>
              <a className="text-on-surface-variant hover:text-primary transition-colors" href="#">LinkedIn</a>
              <a className="text-on-surface-variant hover:text-primary transition-colors" href="#">Twitter</a>
              <a className="text-on-surface-variant hover:text-primary transition-colors" href="#">GitHub</a>
            </div>

          </div>

          <div className="border-t border-outline-variant/20 pt-12">
            <div className="text-[12vw] leading-none font-bold text-primary/5 tracking-tighter text-center select-none font-playfair">
              re<span className="font-playfair italic font-normal text-secondary/20">zync</span>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center mt-12 text-on-surface-variant text-xs pt-8 border-t border-outline-variant/10 gap-4">
            <div className="flex gap-6">
              <a href="#" className="hover:text-primary">Privacy Policy</a>
              <a href="#" class="hover:text-primary">Terms of Service</a>
            </div>
            <span>&copy; {new Date().getFullYear()} Rezync. All rights reserved. Crafted for better first impressions.</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
