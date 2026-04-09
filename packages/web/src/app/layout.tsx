import './globals.css';
import { LayoutContent } from '../components/LayoutContent';
import { AuthProvider } from '../components/AuthProvider';
import { ThemeProvider } from '../components/ThemeProvider';
import { ConfirmProvider } from '../components/ConfirmModal';

export const metadata = {
  title: 'OpenHive AI - Content Platform',
  description: 'Plataforma open-source de criacao e gestao de conteudo com IA',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme')||'dark';document.documentElement.classList.toggle('dark',t==='dark')}catch(e){}})()`,
          }}
        />
      </head>
      <body className="bg-bg-main text-text-primary min-h-screen">
        <ThemeProvider>
          <ConfirmProvider>
            <AuthProvider>
              <LayoutContent>{children}</LayoutContent>
            </AuthProvider>
          </ConfirmProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
