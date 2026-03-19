'use client';

import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { useAuth } from '../../components/AuthProvider';
import { Camera, Zap, Send, Monitor, LogOut, CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function SettingsPage() {
  const [igStatus, setIgStatus] = useState<boolean | null>(null);
  const { logout } = useAuth();

  useEffect(() => {
    async function load() {
      try {
        const result = await api.instagramStatus();
        setIgStatus(result.connected);
      } catch {
        setIgStatus(false);
      }
    }
    load();
  }, []);

  const services = [
    {
      name: 'Instagram',
      description: 'Publicacao automatica de posts no Instagram',
      connected: igStatus,
      loading: igStatus === null,
      icon: Camera,
      iconBg: 'bg-gradient-to-br from-primary/10 to-accent-pink/10',
      iconColor: 'text-primary',
      hint: 'Configure INSTAGRAM_ACCESS_TOKEN e INSTAGRAM_USER_ID no arquivo .env',
    },
    {
      name: 'Geracao de Imagens (Gemini)',
      description: 'Geracao de imagens com IA via Google Gemini',
      connected: true,
      loading: false,
      icon: Zap,
      iconBg: 'bg-amber-50',
      iconColor: 'text-accent-orange',
      hint: 'Configurado via NANO_BANANA_API_KEY no arquivo .env',
    },
    {
      name: 'Telegram Bot',
      description: 'Criacao e gerenciamento de posts via Telegram',
      connected: true,
      loading: false,
      icon: Send,
      iconBg: 'bg-blue-50',
      iconColor: 'text-status-scheduled',
      hint: 'Configure TELEGRAM_BOT_TOKEN e TELEGRAM_ALLOWED_CHAT_IDS no arquivo .env',
    },
    {
      name: 'MCP Server',
      description: 'Integracao com Claude e outros agentes IA',
      connected: true,
      loading: false,
      icon: Monitor,
      iconBg: 'bg-emerald-50',
      iconColor: 'text-status-published',
      hint: 'Servidor MCP com 8 tools para integracao com agentes IA',
    },
  ];

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="text-page-title text-text-primary">Configuracoes</h1>
        <p className="text-sm text-text-secondary mt-1">Gerencie integracoes e preferencias</p>
      </div>

      {/* Services */}
      <div className="space-y-4 mb-8">
        <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">Integracoes</p>
        {services.map((service) => {
          const Icon = service.icon;
          return (
            <div key={service.name} className="card p-5 hover:-translate-y-0.5">
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-card flex items-center justify-center flex-shrink-0 ${service.iconBg}`}>
                  <Icon className={`w-6 h-6 ${service.iconColor}`} strokeWidth={1.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-sm font-bold text-text-primary">{service.name}</h3>
                    {service.loading ? (
                      <span className="badge bg-gray-100 text-text-muted flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Verificando
                      </span>
                    ) : service.connected ? (
                      <span className="badge badge-published flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" strokeWidth={2} />
                        Conectado
                      </span>
                    ) : (
                      <span className="badge badge-failed flex items-center gap-1">
                        <XCircle className="w-3 h-3" strokeWidth={2} />
                        Desconectado
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-text-secondary mb-2">{service.description}</p>
                  <p className="text-[11px] text-text-muted bg-bg-main rounded-input px-3 py-2 font-mono">
                    {service.hint}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Account */}
      <div className="space-y-4">
        <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">Conta</p>
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-card bg-red-50 flex items-center justify-center">
                <LogOut className="w-5 h-5 text-status-failed" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm font-bold text-text-primary">Encerrar sessao</p>
                <p className="text-xs text-text-secondary">Sair da sua conta</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 rounded-btn text-xs font-semibold bg-red-50 text-status-failed hover:bg-red-100 border border-red-100 transition-all"
            >
              Sair
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
