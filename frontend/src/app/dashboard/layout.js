'use client';

import { useUser, useClerk } from '@clerk/nextjs';
import Link from 'next/link';
import { FileText, Link2, BarChart2, LogOut } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function DashboardLayout({ children }) {
  const { user } = useUser();
  const { signOut } = useClerk();
  const pathname = usePathname();

  const username = user?.username || user?.firstName || 'candidate';
  const avatarUrl = user?.imageUrl || '';

  return (
    <div className="min-h-screen bg-background text-on-background font-body-md text-body-md flex w-full">
      {/* SideNavBar */}
      <nav className="w-[280px] h-screen fixed left-0 top-0 bg-surface-container-low border-r border-outline-variant/20 flex flex-col py-8 gap-6 z-40 hidden md:flex justify-between">
        <div className="flex flex-col gap-8 w-full px-6">
          {/* Brand */}
          <div className="px-2">
            <Link href="/" className="font-body-md font-bold text-2xl text-primary inline-flex items-baseline hover:scale-[1.02] transition-transform">
              re<span className="wordmark-x">zync</span>
            </Link>
          </div>
          
          {/* Navigation Links */}
          <div className="flex flex-col gap-2 w-full">
            <div className="px-2 py-2">
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">DASHBOARD</span>
            </div>
            
            <Link 
              href="/dashboard" 
              className={`flex items-center gap-4 rounded-xl font-bold px-4 py-3 transition-all ${
                pathname === '/dashboard' || pathname.startsWith('/dashboard/edit') || pathname === '/dashboard/upload'
                  ? 'bg-primary text-on-primary shadow-md hover:scale-[1.02]' 
                  : 'text-on-surface-variant hover:bg-surface-variant/50 transition-colors'
              }`}
            >
              <FileText size={18} />
              <span>Resumes</span>
            </Link>

            <Link 
              href="/dashboard/links" 
              className={`flex items-center gap-4 rounded-xl font-bold px-4 py-3 transition-all ${
                pathname === '/dashboard/links'
                  ? 'bg-primary text-on-primary shadow-md hover:scale-[1.02]' 
                  : 'text-on-surface-variant hover:bg-surface-variant/50 transition-colors'
              }`}
            >
              <Link2 size={18} />
              <span>Links</span>
            </Link>

            <Link 
              href="/dashboard/analytics" 
              className={`flex items-center gap-4 rounded-xl font-bold px-4 py-3 transition-all ${
                pathname === '/dashboard/analytics' || (pathname.startsWith('/dashboard/analytics/') && pathname !== '/dashboard/analytics')
                  ? 'bg-primary text-on-primary shadow-md hover:scale-[1.02]' 
                  : 'text-on-surface-variant hover:bg-surface-variant/50 transition-colors'
              }`}
            >
              <BarChart2 size={18} />
              <span>Analytics</span>
            </Link>
          </div>
        </div>

        {/* User Info / Sign Out */}
        <div className="w-full px-6 pt-6 border-t border-outline-variant/20 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            {avatarUrl ? (
              <img src={avatarUrl} alt={username} className="w-10 h-10 rounded-full object-cover shadow-sm border border-outline-variant/25" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-secondary-container text-secondary flex items-center justify-center font-bold text-lg uppercase shrink-0">
                {username[0]}
              </div>
            )}
            <div className="flex flex-col">
              <span className="font-bold text-primary truncate max-w-[140px]">{username}</span>
              <span className="text-xs text-on-surface-variant truncate max-w-[140px]">@{username}</span>
            </div>
          </div>
          <button 
            onClick={() => signOut({ redirectUrl: '/' })}
            className="w-full text-on-surface-variant hover:bg-surface-variant/50 border border-outline-variant/30 rounded-xl px-4 py-3 flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <LogOut size={16} />
            <span className="text-sm font-semibold">Sign Out</span>
          </button>
        </div>
      </nav>

      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-surface-container-low border-b border-outline-variant/15 flex justify-between items-center px-6 z-40">
        <Link href="/" className="font-body-md font-bold text-xl text-primary hover:scale-[1.02] transition-transform">
          re<span className="wordmark-x">zync</span>
        </Link>
        <div className="flex items-center gap-3">
          {avatarUrl ? (
            <img src={avatarUrl} alt={username} className="w-8 h-8 rounded-full object-cover border border-outline-variant/25 shadow-sm" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-secondary-container text-secondary flex items-center justify-center font-bold text-sm uppercase">
              {username[0]}
            </div>
          )}
          <button 
            onClick={() => signOut({ redirectUrl: '/' })}
            className="text-on-surface-variant hover:text-red-600 transition-colors p-1.5 border border-outline-variant/20 rounded-lg bg-surface hover:bg-surface-variant/30 cursor-pointer" 
            title="Sign Out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="md:ml-[280px] flex-grow min-h-screen bg-surface-container-lowest overflow-y-auto pt-16 pb-16 md:pt-0 md:pb-0">
        {children}
      </main>

      {/* Mobile Bottom Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-surface-container-low border-t border-outline-variant/15 flex justify-around items-center z-40 px-2 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
        <Link 
          href="/dashboard" 
          className={`flex flex-col items-center gap-1 text-[10px] font-bold py-1 px-3 rounded-xl transition-all ${
            pathname === '/dashboard' || pathname.startsWith('/dashboard/edit') || pathname === '/dashboard/upload'
              ? 'text-primary'
              : 'text-on-surface-variant/70 hover:text-on-surface-variant'
          }`}
        >
          <FileText size={20} />
          <span>Resumes</span>
        </Link>

        <Link 
          href="/dashboard/links" 
          className={`flex flex-col items-center gap-1 text-[10px] font-bold py-1 px-3 rounded-xl transition-all ${
            pathname === '/dashboard/links'
              ? 'text-primary'
              : 'text-on-surface-variant/70 hover:text-on-surface-variant'
          }`}
        >
          <Link2 size={20} />
          <span>Links</span>
        </Link>

        <Link 
          href="/dashboard/analytics" 
          className={`flex flex-col items-center gap-1 text-[10px] font-bold py-1 px-3 rounded-xl transition-all ${
            pathname === '/dashboard/analytics' || (pathname.startsWith('/dashboard/analytics/') && pathname !== '/dashboard/analytics')
              ? 'text-primary'
              : 'text-on-surface-variant/70 hover:text-on-surface-variant'
          }`}
        >
          <BarChart2 size={20} />
          <span>Analytics</span>
        </Link>
      </div>
    </div>
  );
}
