import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/customer/Header';
import Footer from '@/components/customer/Footer';

export const metadata: Metadata = {
  title: 'VIDYUT SPARES - Electrical Products & Spares Store Vijayawada',
  description:
    'Official e-commerce store for VIDYUT SPARES in Vijayawada, Andhra Pradesh. Quality electrical switches, copper wires, MCBs, LED panel lights, conduits, and installation spares.',
  icons: {
    icon: '/vs-logo.svg',
    shortcut: '/vs-logo.svg',
    apple: '/vs-logo.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

