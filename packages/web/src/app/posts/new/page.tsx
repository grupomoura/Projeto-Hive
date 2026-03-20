'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../../lib/api';
import { Zap, Image as ImageIcon, Edit3, Clock, Send, Save, Loader2, X, Heart, MessageCircle, Share } from 'lucide-react';

const ASPECT_RATIOS = [
  { value: '1:1', label: '1:1', desc: 'Feed' },
  { value: '4:5', label: '4:5', desc: 'Retrato' },
  { value: '9:16', label: '9:16', desc: 'Stories/Reels' },
];

export default function NewPost() {
  const router = useRouter();
  const [caption, setCaption] = useState('');
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [loading, setLoading] = useState(false);
  const [genLoading, setGenLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [showFullImage, setShowFullImage] = useState(false);

  async function handleGenerateImage() {
    if (!prompt) return;
    setGenLoading(true);
    setMessage('');
    try {
      const result = await api.generateImage(prompt, aspectRatio);
      setImageUrl(result.imageUrl);
    } catch (err: any) {
      setMessage(err.message || 'Erro ao gerar imagem');
      setMessageType('error');
    }
    setGenLoading(false);
  }

  async function handleGenerateCaption() {
    if (!prompt) return;
    setGenLoading(true);
    try {
      const result = await api.generateCaption(prompt);
      setCaption(result.caption);
      setHashtags(result.hashtags.join(', '));
    } catch (err: any) {
      setMessage(err.message || 'Erro ao gerar legenda');
      setMessageType('error');
    }
    setGenLoading(false);
  }

  async function handleSave(status: 'draft' | 'schedule' | 'publish') {
    setLoading(true);
    setMessage('');
    try {
      const post = (await api.createPost({
        caption,
        imageUrl: imageUrl || undefined,
        hashtags: hashtags.split(',').map((h) => h.trim()).filter(Boolean),
        nanoPrompt: prompt || undefined,
        aspectRatio,
      })) as any;

      if (status === 'schedule' && scheduledAt) {
        await api.schedulePost(post.id, new Date(scheduledAt).toISOString());
        setMessage('Post agendado com sucesso!');
        setMessageType('success');
      } else if (status === 'publish') {
        await api.publishPost(post.id);
        setMessage('Post publicado com sucesso!');
        setMessageType('success');
      } else {
        setMessage('Rascunho salvo!');
        setMessageType('success');
      }
      setTimeout(() => router.push('/posts'), 1500);
    } catch (err: any) {
      setMessage(err.message || 'Erro ao salvar');
      setMessageType('error');
    }
    setLoading(false);
  }

  const previewAspect = aspectRatio === '4:5' ? 'aspect-[4/5]' : aspectRatio === '9:16' ? 'aspect-[9/16]' : 'aspect-square';

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="text-page-title text-text-primary">Criar Post</h1>
        <p className="text-sm text-text-secondary mt-1">Gere imagens e legendas com inteligencia artificial</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Editor */}
        <div className="space-y-5">
          {/* AI Generation */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent-pink/10">
                <Zap className="w-4 h-4 text-primary" strokeWidth={2} />
              </div>
              <h2 className="text-sm font-bold text-text-primary">Geracao com IA</h2>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">Prompt</label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Descreva o tema do post... Ex: 'Post sobre produtividade com dicas de organizacao'"
                  rows={3}
                  className="input-field resize-none"
                />
              </div>
              <div className="flex gap-2">
                <button onClick={handleGenerateImage} disabled={genLoading || !prompt} className="btn-cta flex-1 justify-center text-xs py-2.5">
                  {genLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" strokeWidth={1.5} />}
                  {genLoading ? 'Gerando...' : 'Gerar Imagem'}
                </button>
                <button onClick={handleGenerateCaption} disabled={genLoading || !prompt} className="btn-ghost flex-1 justify-center text-xs py-2.5">
                  <Edit3 className="w-4 h-4" strokeWidth={1.5} />
                  Gerar Legenda
                </button>
              </div>
            </div>
          </div>

          {/* Aspect Ratio */}
          <div className="card p-5">
            <label className="block text-xs font-semibold text-text-secondary mb-3 uppercase tracking-wider">Tamanho da imagem</label>
            <div className="grid grid-cols-3 gap-2">
              {ASPECT_RATIOS.map((ar) => (
                <button
                  key={ar.value}
                  onClick={() => setAspectRatio(ar.value)}
                  className={`py-3 px-3 rounded-btn text-sm border transition-all duration-200 ${
                    aspectRatio === ar.value
                      ? 'bg-primary/[0.08] border-primary text-primary shadow-sm'
                      : 'bg-white border-border text-text-secondary hover:border-primary/50'
                  }`}
                >
                  <span className="font-bold block">{ar.label}</span>
                  <span className="text-xs opacity-60 block mt-0.5">{ar.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Caption */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Legenda</label>
              <span className="text-[11px] text-text-muted tabular-nums">{caption.length}/2200</span>
            </div>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              maxLength={2200}
              rows={5}
              placeholder="Escreva a legenda do post..."
              className="input-field resize-none"
            />
          </div>

          {/* Hashtags */}
          <div className="card p-5">
            <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">Hashtags</label>
            <input value={hashtags} onChange={(e) => setHashtags(e.target.value)} placeholder="IA, Tech, Programacao (separadas por virgula)" className="input-field" />
            {hashtags && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {hashtags.split(',').filter(h => h.trim()).map((h, i) => (
                  <span key={i} className="text-xs px-2.5 py-1 rounded-badge bg-primary/10 text-primary font-medium">
                    #{h.trim()}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Schedule */}
          <div className="card p-5">
            <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">Agendar para</label>
            <input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} className="input-field" />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button onClick={() => handleSave('draft')} disabled={loading} className="btn-ghost flex-1 justify-center">
              <Save className="w-4 h-4" strokeWidth={1.5} />
              Rascunho
            </button>
            <button onClick={() => handleSave('schedule')} disabled={loading || !scheduledAt} className="btn-ghost flex-1 justify-center text-status-scheduled border-status-scheduled/30 hover:bg-blue-50 hover:text-status-scheduled">
              <Clock className="w-4 h-4" strokeWidth={1.5} />
              Agendar
            </button>
            <button onClick={() => handleSave('publish')} disabled={loading} className="btn-cta flex-1 justify-center">
              <Send className="w-4 h-4" strokeWidth={1.5} />
              Publicar
            </button>
          </div>

          {/* Message */}
          {message && (
            <div className={`flex items-center gap-2 px-4 py-3 rounded-btn border animate-slide-up ${
              messageType === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-status-published'
                : 'bg-red-50 border-red-200 text-status-failed'
            }`}>
              <p className="text-sm font-medium">{message}</p>
            </div>
          )}
        </div>

        {/* Preview */}
        <div className="lg:sticky lg:top-8 lg:self-start">
          <div className="card p-5">
            <p className="text-xs font-semibold text-text-secondary mb-4 uppercase tracking-wider">Preview do Post</p>
            <div className="bg-white rounded-2xl overflow-hidden border border-border">
              {/* Instagram Header */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
                <div className="w-9 h-9 rounded-full flex items-center justify-center bg-gradient-to-br from-primary to-accent-pink">
                  <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
                </div>
                <div>
                  <span className="text-sm font-semibold text-text-primary">instapost.ai</span>
                  <p className="text-[10px] text-text-muted">Patrocinado</p>
                </div>
              </div>

              {/* Image */}
              <div className={`${previewAspect} max-h-[500px] bg-bg-main flex items-center justify-center`}>
                {imageUrl ? (
                  <img src={imageUrl} alt="Preview" className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity" onClick={() => setShowFullImage(true)} />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-text-muted">
                    <ImageIcon className="w-10 h-10" strokeWidth={1} />
                    <span className="text-xs">Imagem aparecera aqui</span>
                  </div>
                )}
              </div>

              {/* Instagram Actions */}
              <div className="px-4 py-3 flex gap-4">
                <Heart className="w-6 h-6 text-text-primary" strokeWidth={1.5} />
                <MessageCircle className="w-6 h-6 text-text-primary" strokeWidth={1.5} />
                <Share className="w-6 h-6 text-text-primary" strokeWidth={1.5} />
              </div>

              {/* Caption */}
              <div className="px-4 pb-4">
                <p className="text-sm text-text-primary whitespace-pre-wrap leading-relaxed">
                  {caption || <span className="text-text-muted">Legenda aparecera aqui...</span>}
                </p>
                {hashtags && (
                  <p className="text-sm text-primary mt-2">
                    {hashtags.split(',').filter(h => h.trim()).map((h) => `#${h.trim()}`).join(' ')}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full Image Modal */}
      {showFullImage && imageUrl && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 cursor-pointer modal-backdrop" onClick={() => setShowFullImage(false)}>
          <div className="relative modal-content">
            <img src={imageUrl} alt="Full size" className="max-w-full max-h-[85vh] object-contain rounded-card shadow-2xl" />
            <button onClick={() => setShowFullImage(false)} className="absolute -top-3 -right-3 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors">
              <X className="w-4 h-4" strokeWidth={2} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
