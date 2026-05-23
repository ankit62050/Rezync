import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';
import { Hanken_Grotesk, Playfair_Display } from 'next/font/google';

const hanken = Hanken_Grotesk({ subsets: ['latin'], variable: '--font-hanken' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair', style: ['normal', 'italic'] });

export const metadata = {
  title: 'Rezync | Professional Resume Links',
  description: 'Upload your resume and get one permanent professional link that always stays updated.',
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
      <html lang="en">
        <head>
          <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
        </head>
        <body className={`${hanken.variable} ${playfair.variable} font-hanken bg-background text-on-background min-h-screen flex flex-col`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
