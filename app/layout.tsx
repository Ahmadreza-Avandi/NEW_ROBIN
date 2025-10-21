import './globals.css';
import type { Metadata } from 'next';
import { Toaster } from '@/components/ui/toaster';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'داشبورد مدیریت - شرکت رابین تجارت خاورمیانه',
  description: 'داشبورد جامع CRM و CEM برای مدیریت روابط و تجربیات مشتریان',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen font-vazir">
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}