import '../globals.css';
import { dir } from 'i18next';

import { Analytics } from '@vercel/analytics/react';
import { languages } from '@/i18n/settings';

export const metadata = {
  title: 'Quickz',
  description:
    'A simple quiz app for your organization. Create, edit, and delete questions, and let your team answer them.',
  icons: {
    icon: '/favicon.ico'
  }
};

export async function generateStaticParams() {
  return languages.map((lng) => ({ params: { lng } }));
}

export default function RootLayout({
  children,
  params: { lng }
}: {
  children: React.ReactNode;
  params: { lng: string };
}) {
  return (
    <html lang={lng} dir={dir(lng)}>
      <body className="flex min-h-screen w-full flex-col">{children}</body>
      <Analytics />
    </html>
  );
}
