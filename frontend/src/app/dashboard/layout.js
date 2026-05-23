'use client';

import { useUser, SignOutButton } from '@clerk/nextjs';
import Link from 'next/link';
import { FileText, Link2, BarChart2, LogOut } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function DashboardLayout({ children }) {
  const { user } = useUser();
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
          <SignOutButton>
            <button className="w-full text-on-surface-variant hover:bg-surface-variant/50 border border-outline-variant/30 rounded-xl px-4 py-3 flex items-center justify-center gap-2 transition-colors cursor-pointer">
              <LogOut size={16} />
              <span className="text-sm font-semibold">Sign Out</span>
            </button>
          </SignOutButton>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="md:ml-[280px] flex-grow min-h-screen bg-surface-container-lowest overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
