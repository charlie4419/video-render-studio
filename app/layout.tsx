import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Header } from '@/components/layout/header';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Video Render Studio',
  description: 'AI 쇼츠 영상 제작 스튜디오',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full bg-background text-foreground">
        <Providers>
          <Header />
          <main className="min-h-screen">
            <div className="max-w-6xl mx-auto px-6 py-8">
              {children}
            </div>
          </main>
        </Providers>
      </body>
    </html>
  );
}
