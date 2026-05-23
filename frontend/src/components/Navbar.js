'use client';

import Link from 'next/link';
import { useAuth, SignInButton, UserButton } from '@clerk/nextjs';

export default function Navbar() {
  const { isLoaded, userId } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-8 py-3 bg-surface/80 backdrop-blur-md shadow-sm border border-outline-variant/30 rounded-full mt-4 mx-auto max-w-5xl transition-all duration-300">
      <Link href="/" className="font-body-md font-bold text-2xl text-primary hover:scale-[1.02] transition-transform duration-200">
        resume<span className="wordmark-x">X</span>
      </Link>
      
      <div className="flex items-center gap-6">
        {isLoaded && userId ? (
          <>
            <Link href="/dashboard" className="text-on-surface-variant hover:text-primary font-semibold transition-colors">
              Dashboard
            </Link>
            <UserButton afterSignOutUrl="/" />
          </>
        ) : isLoaded && !userId ? (
          <SignInButton mode="modal">
            <button className="bg-primary text-on-primary px-6 py-2 rounded-full font-bold hover:scale-[1.02] transition-transform duration-200 shadow-md">
              Sign In
            </button>
          </SignInButton>
        ) : null}
      </div>
    </nav>
  );
}
