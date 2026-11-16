import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';
import SafetyBanner from '@/components/SafetyBanner';

export const metadata: Metadata = {
  title: 'GramVaani Pilot',
  description: 'Experimental pilot for Telugu voice reporting workflow - not an official government system.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SafetyBanner />
        <header className="site-header">
          <div className="wrap header-inner">
            <Link href="/" className="brand">GramVaani <span>Pilot</span></Link>
            <nav className="nav" aria-label="Main navigation">
              <Link href="/">Home</Link>
              <Link href="/voice">Voice</Link>
              <Link href="/transcript">Transcript</Link>
              <Link href="/preview">Report</Link>
              <Link href="/test-scenarios">Scenarios</Link>
              <Link href="/evaluation">Evaluation</Link>
              <Link href="/feedback">Feedback</Link>
            </nav>
          </div>
        </header>
        <main className="wrap main">{children}</main>
        <footer className="site-footer">
          <div className="wrap">
            <p><strong>Experimental pilot.</strong> Sample outputs only - not official, not submitted to any government system.</p>
            <p className="muted">Use synthetic/non-identifying data for testing. No government integration.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
