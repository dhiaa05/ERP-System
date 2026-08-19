import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { QueryProvider } from '@/components/providers/QueryProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Lamsti OS - ERP & Analytics',
  description: 'Operating System for Cash On Delivery businesses.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="dark" suppressHydrationWarning>
      <body className={`${inter.className} bg-background text-foreground antialiased`} suppressHydrationWarning>
        <QueryProvider>
          <AuthProvider>
            <TooltipProvider>{children}</TooltipProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
