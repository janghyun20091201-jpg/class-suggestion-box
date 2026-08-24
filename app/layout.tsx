import type { Metadata, Viewport } from 'next';
import './globals.css';
import Header from '@/components/Header';
import AdminSessionGuard from '@/components/AdminSessionGuard';

export const metadata: Metadata = {
  title: '11-3 건의함',
  description: '11-3 반을 위한 솔직한 의견을 남겨주세요.',
  icons: {
    icon:
      'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">💬</text></svg>',
  },
};

export const viewport: Viewport = {
  themeColor: '#ffffff',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-white font-sans text-ink">
        <AdminSessionGuard />
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">{children}</main>
        </div>
      </body>
    </html>
  );
}
