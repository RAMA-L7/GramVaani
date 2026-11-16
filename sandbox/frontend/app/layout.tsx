import type { Metadata } from 'next';
import './globals.css';
import SafetyBanner from '@/components/SafetyBanner';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'GramVaani Sandbox',
  description: 'Simulated reporting environment for evaluating Telugu voice input and data transfer.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SafetyBanner />
        <header className="site-header">
          <div className="wrap header-inner">
            <Link href="/" className="brand">GramVaani <span>Sandbox</span></Link>
            <nav className="nav" aria-label="Main navigation">
              <Link href="/">About</Link>
              <Link href="/voice">Voice</Link>
              <Link href="/reporting">Reporting</Link>
              <Link href="/dashboard">Dashboard</Link>
            </nav>
          </div>
        </header>
        <main className="wrap main">{children}</main>
        <footer className="site-footer">
          <div className="wrap">
            <p>Simulated hackathon environment. Fields are illustrative, not official reporting requirements.</p>
            <p className="muted">Scripted Telugu transcripts · synthetic data · no government integration.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
