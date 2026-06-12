import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Howard Endo Fellowship App',
  description: 'ACGME metric-tracking and clinical evaluation for Howard University Hospital Endocrinology Fellowship',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-white text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}
