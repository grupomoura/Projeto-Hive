import './globals.css';
import { Sidebar } from '../components/Sidebar';
import { AuthProvider } from '../components/AuthProvider';

export const metadata = {
  title: 'InstaPost AI',
  description: 'Plataforma de criacao e agendamento de posts para Instagram',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-bg-main text-text-primary min-h-screen">
        <AuthProvider>
          <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 ml-60 p-8">
              {/* Gradient bar decorativa */}
              <div className="h-1 bg-gradient-to-r from-primary via-accent-pink to-accent-orange rounded-full mb-6" />
              {children}
            </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
