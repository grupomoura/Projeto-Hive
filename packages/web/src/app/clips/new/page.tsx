'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '../../../lib/api';
import { ArrowLeft, Loader2, Film, Sparkles } from 'lucide-react';

export default function NewClipPage() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [whisperModel, setWhisperModel] = useState('tiny');
  const [maxMoments, setMaxMoments] = useState(10);
  const [language, setLanguage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit() {
    if (!url.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res: any = await api.analyzeVideo({
        url: url.trim(),
        whisperModel,
        maxMoments,
        language: language || undefined,
      });
      const id = res.data?.id || res.id;
      router.push(`/clips/${id}`);
    } catch (err: any) {
      setError(err.message || 'Erro ao iniciar analise');
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/clips" className="p-2 rounded-lg hover:bg-bg-card-hover transition-colors">
          <ArrowLeft className="w-5 h-5 text-text-secondary" />
        </Link>
        <div>
          <h1 className="text-page-title">Novo Clip</h1>
          <p className="text-sm text-text-secondary">
            Cole a URL de um video do YouTube para analisar
          </p>
        </div>
      </div>

      <div className="card p-6 space-y-5">
        {/* URL */}
        <div>
          <label className="block text-sm font-semibold text-text-primary mb-1.5">URL do YouTube</label>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="input-field"
            placeholder="https://youtube.com/watch?v=..."
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
        </div>

        {/* Whisper Model */}
        <div>
          <label className="block text-sm font-semibold text-text-primary mb-1.5">Modelo de Transcricao</label>
          <select
            value={whisperModel}
            onChange={(e) => setWhisperModel(e.target.value)}
            className="input-field"
          >
            <option value="tiny">Tiny - Mais rapido</option>
            <option value="base">Base - Balanceado</option>
            <option value="small">Small - Melhor qualidade</option>
            <option value="medium">Medium - Alta qualidade</option>
            <option value="large">Large - Maxima qualidade (lento)</option>
          </select>
          <p className="text-xs text-text-muted mt-1">
            Modelos maiores sao mais precisos mas demoram mais
          </p>
        </div>

        {/* Max Moments */}
        <div>
          <label className="block text-sm font-semibold text-text-primary mb-1.5">Maximo de Momentos</label>
          <input
            type="number"
            value={maxMoments}
            onChange={(e) => setMaxMoments(parseInt(e.target.value) || 10)}
            className="input-field"
            min={1}
            max={50}
          />
        </div>

        {/* Language */}
        <div>
          <label className="block text-sm font-semibold text-text-primary mb-1.5">Idioma (opcional)</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="input-field"
          >
            <option value="">Auto-detectar</option>
            <option value="pt">Portugues</option>
            <option value="en">Ingles</option>
            <option value="es">Espanhol</option>
          </select>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-50 text-sm text-status-failed">
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={!url.trim() || loading}
          className="btn-cta w-full flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Enviando para analise...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Analisar Video
            </>
          )}
        </button>
      </div>

      {/* Info */}
      <div className="mt-6 card p-5">
        <h3 className="font-semibold text-sm text-text-primary mb-2 flex items-center gap-2">
          <Film className="w-4 h-4 text-primary" />
          Como funciona
        </h3>
        <ol className="space-y-2 text-xs text-text-secondary">
          <li><strong>1.</strong> O video e baixado e transcrito com IA (Whisper)</li>
          <li><strong>2.</strong> Momentos com maior potencial de engajamento sao identificados</li>
          <li><strong>3.</strong> Voce escolhe quais momentos quer transformar em clips</li>
          <li><strong>4.</strong> Cada clip e gerado em formato vertical (1080x1920) com deteccao de rosto e legendas</li>
        </ol>
      </div>
    </div>
  );
}
