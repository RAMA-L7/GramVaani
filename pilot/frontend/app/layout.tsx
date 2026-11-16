import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'గ్రామవాణి పైలట్ - GramVaani Pilot',
  description: 'Telugu-first voice reporting pilot (experimental sample reports only, not official, not submitted).',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="te">
      <body>
        {children}
      </body>
    </html>
  );
}