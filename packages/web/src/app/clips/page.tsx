'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '../../lib/api';
import { Plus, Loader2, Film, Trash2, ExternalLink, Clock } from 'lucide-react';
import { useConfirm } from '@/components/ConfirmModal';

const STATUS_BADGES: Record<string, { bg: string; text: string; label: string }> = {
  PENDING: { bg: 'bg-bg-card-hover', text: 'text-gray-600', label: 'Pendente' },
  ANALYZING: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Analisando...' },
  ANALYZED: { bg: 'bg-blue-100', text: 'text-blue-600', label: 'Analisado' },
  CLIPPING: { bg: 'bg-orange-100', text: 'text-orange-600', label: 'Cortando...' },
  READY: { bg: 'bg-green-100', text: 'text-green-600', label: 'Pronto' },
  FAILED: { bg: 'bg-red-100', text: 'text-red-600', label: 'Falhou' },
};

export default function ClipsPage() {
  const confirm = useConfirm();
  const [clips, setClips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClips();
  }, []);

  async function loadClips() {
    try {
      const res: any = await api.listVideoClips();
      setClips(res.data?.items || res.items || []);
    } catch {}
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!await confirm({ message: 'Excluir este clip?' })) return;
    try {
      await api.deleteVideoClip(id);
      setClips((c) => c.filter((v) => v.id !== id));
    } catch {}
  }

  function formatDuration(seconds: number) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-page-title">YouTube Clips</h1>
          <p className="text-sm text-text-secondary mt-1">
            Extraia os melhores momentos de videos do YouTube em clips verticais
          </p>
        </div>
        <Link href="/clips/new" className="btn-cta flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Novo Clip
        </Link>
      </div>

      {clips.length === 0 ? (
        <div className="card p-12 text-center">
          <Film className="w-12 h-12 text-text-muted mx-auto mb-3" />
          <h3 className="font-semibold text-text-primary mb-1">Nenhum clip ainda</h3>
          <p className="text-sm text-text-muted mb-4">Cole uma URL do YouTube para comecar</p>
          <Link href="/clips/new" className="btn-cta inline-flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Criar Primeiro Clip
          </Link>
        </div>
      ) : (
        <div className="grid gap-3">
          {clips.map((clip) => {
            const status = STATUS_BADGES[clip.status] || STATUS_BADGES.PENDING;
            const clipCount = Array.isArray(clip.clips) ? clip.clips.length : 0;

            return (
              <Link
                key={clip.id}
                href={`/clips/${clip.id}`}
                className="card p-4 flex items-center gap-4 hover:border-primary/20 transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Film className="w-5 h-5 text-primary" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm text-text-primary truncate">
                      {clip.title || clip.sourceUrl}
                    </h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${status.bg} ${status.text}`}>
                      {status.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-text-muted">
                    {clip.duration && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDuration(clip.duration)}
                      </span>
                    )}
                    {clip.language && <span>{clip.language.toUpperCase()}</span>}
                    {clipCount > 0 && <span>{clipCount} clip(s)</span>}
                    <span>{new Date(clip.createdAt).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(clip.id); }}
                    className="p-2 rounded-lg text-text-muted hover:text-status-failed hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
