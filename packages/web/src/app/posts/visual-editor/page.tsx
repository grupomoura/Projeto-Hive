'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '../../../lib/api';
import { Plus, Trash2, Loader2, ChevronLeft } from 'lucide-react';
import {
  SlideState, GlobalStyle, SavedTemplate, AspectRatio, TemplateId,
  TEMPLATES, emptySlide, defaultGlobalStyle,
} from './types';
import { buildSlideHtml, getSafeZone } from './build-slide-html';
import { EditorSidebar } from './components/EditorSidebar';
import { useStyleTemplates } from './hooks/use-style-templates';

export default function VisualEditorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const postIdParam = searchParams?.get('postId');

  // ── State ──
  const [slides, setSlides] = useState<SlideState[]>([emptySlide(0, 'hero'), emptySlide(1, 'content')]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [globalStyle, setGlobalStyle] = useState<GlobalStyle>(defaultGlobalStyle());
  const [brands, setBrands] = useState<any[]>([]);
  const [brandId, setBrandId] = useState('');
  const [brandLogoUrl, setBrandLogoUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [currentPostId, setCurrentPostId] = useState<string | null>(null);
  const [loadingPost, setLoadingPost] = useState(false);
  const [genLoading, setGenLoading] = useState<string | null>(null);
  const [renderingAll, setRenderingAll] = useState(false);
  const [savingPost, setSavingPost] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { templates: savedTemplates, saveTemplate: saveStyleTemplate, deleteTemplate: deleteStyleTemplate } = useStyleTemplates();

  const active = slides[activeIdx];
  const activeTemplate = TEMPLATES.find((t) => t.id === active.template)!;

  // ── Load brands ──
  useEffect(() => {
    api.listBrands()
      .then((r: any) => {
        const items = r.items || [];
        setBrands(items);
        const def = items.find((b: any) => b.isDefault);
        if (def) { setBrandId(def.id); setBrandLogoUrl(def.logoUrl || ''); }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const brand = brands.find((b) => b.id === brandId);
    setBrandLogoUrl(brand?.logoUrl || '');
  }, [brandId, brands]);

  // ── Load post ──
  useEffect(() => {
    if (!postIdParam) return;
    setLoadingPost(true);
    api.getPost(postIdParam)
      .then((post: any) => {
        if (!post) return;
        setCurrentPostId(post.id);
        setCaption(post.caption || '');
        setHashtags((post.hashtags || []).join(', '));
        if (post.scheduledAt) setScheduledAt(new Date(post.scheduledAt).toISOString().slice(0, 16));
        if (post.aspectRatio) setAspectRatio(post.aspectRatio as AspectRatio);
        if (post.editorState?.slides?.length) {
          setSlides(post.editorState.slides);
          if (post.editorState.brandId) setBrandId(post.editorState.brandId);
          if (post.editorState.globalStyle) setGlobalStyle(post.editorState.globalStyle);
          setMessage('Post carregado no editor');
          setMessageType('success');
          return;
        }
        const urls: string[] = [];
        if (post.isCarousel && post.images?.length) urls.push(...post.images.map((i: any) => i.imageUrl));
        else if (post.imageUrl) urls.push(post.imageUrl);
        if (urls.length) {
          setSlides(urls.map((url, i) => ({ ...emptySlide(i, 'hero'), backgroundUrl: url, renderedUrl: url, title: '', subtitle: '', overlayOpacity: 0 })));
          setMessage(`${urls.length} imagem(ns) importadas`);
          setMessageType('success');
        }
      })
      .catch((e: any) => { setMessage(e.message); setMessageType('error'); })
      .finally(() => setLoadingPost(false));
  }, [postIdParam]);

  // ── Helpers ──
  function updateActive(patch: Partial<SlideState>) {
    setSlides((prev) => prev.map((s, i) => (i === activeIdx ? { ...s, ...patch, renderedUrl: undefined } : s)));
  }

  function addSlide(tpl: TemplateId = 'content') {
    const next = [...slides, emptySlide(slides.length, tpl)];
    setSlides(next);
    setActiveIdx(next.length - 1);
  }

  function removeSlide(id: string) {
    if (slides.length <= 1) return;
    setSlides((prev) => prev.filter((s) => s.id !== id));
    setActiveIdx(Math.max(0, activeIdx - 1));
  }

  function changeTemplate(tpl: TemplateId) {
    const t = TEMPLATES.find((x) => x.id === tpl)!;
    updateActive({ template: tpl, position: t.defaultPosition });
  }

  function copyLayoutToNext() {
    if (activeIdx >= slides.length - 1) return;
    const { id, title, subtitle, label, stat, backgroundUrl, backgroundPrompt, renderedUrl, refinePrompt, wordHighlights, ...style } = active;
    setSlides((prev) => prev.map((s, i) => (i === activeIdx + 1 ? { ...s, ...style, renderedUrl: undefined } : s)));
    setMessage('Layout copiado para o proximo slide');
    setMessageType('success');
  }

  function loadTemplate(tpl: SavedTemplate) {
    updateActive(tpl.style);
    setMessage(`Template "${tpl.name}" aplicado`);
    setMessageType('success');
  }

  function handleSaveTemplate(name: string) {
    const { id, title, subtitle, label, stat, backgroundUrl, backgroundPrompt, renderedUrl, refinePrompt, wordHighlights, ...style } = active;
    saveStyleTemplate(name, style);
    setMessage(`Template "${name}" salvo`);
    setMessageType('success');
  }

  async function handleUploadBg(file: File) {
    setGenLoading('upload');
    try {
      const r = await api.uploadFile(file);
      updateActive({ backgroundUrl: r.fileUrl });
    } catch (e: any) { setMessage(e.message); setMessageType('error'); }
    setGenLoading(null);
  }

  async function handleGenerateBg() {
    if (!active.backgroundPrompt.trim()) { setMessage('Descreva o fundo'); setMessageType('error'); return; }
    setGenLoading('bg');
    try {
      const r = await api.generateImage(active.backgroundPrompt, aspectRatio);
      updateActive({ backgroundUrl: r.imageUrl });
    } catch (e: any) { setMessage(e.message); setMessageType('error'); }
    setGenLoading(null);
  }

  async function handleGenerateContent() {
    if (!caption.trim() && !active.title.trim()) { setMessage('Preencha a legenda ou titulo primeiro'); setMessageType('error'); return; }
    setGenLoading('content');
    try {
      const topic = caption || active.title;
      const r = await api.generateCaption(topic);
      const parts = r.caption.split('.\n');
      updateActive({ title: parts[0]?.slice(0, 60) || active.title, subtitle: parts[1]?.slice(0, 100) || active.subtitle });
    } catch (e: any) { setMessage(e.message); setMessageType('error'); }
    setGenLoading(null);
  }

  async function renderSlide(slide: SlideState): Promise<string> {
    const html = buildSlideHtml(slide, { aspectRatio, brandLogoUrl, globalStyle });
    const result = await api.generateComposed({
      html,
      backgroundUrl: slide.backgroundUrl || undefined,
      backgroundPrompt: !slide.backgroundUrl ? (slide.backgroundPrompt || slide.title) : undefined,
      aspectRatio,
      overlayOpacity: slide.overlayOpacity,
      brandId: brandId || undefined,
      applyBrand: !!brandId,
    });
    return result.imageUrl;
  }

  async function handleRenderAll() {
    setRenderingAll(true);
    setMessage('');
    try {
      const total = slides.length;
      const updated: SlideState[] = [];
      for (let i = 0; i < slides.length; i++) {
        const slide = { ...slides[i], slideNumber: i + 1, totalSlides: total };
        const url = await renderSlide(slide);
        updated.push({ ...slide, renderedUrl: url });
      }
      setSlides(updated);
      setMessage(`${updated.length} slides renderizados!`);
      setMessageType('success');
    } catch (e: any) { setMessage(e.message); setMessageType('error'); }
    setRenderingAll(false);
  }

  async function handleSavePost(action: 'draft' | 'schedule') {
    setSavingPost(true);
    setMessage('');
    try {
      const total = slides.length;
      const finalSlides: SlideState[] = [];
      for (let i = 0; i < slides.length; i++) {
        const slide = { ...slides[i], slideNumber: i + 1, totalSlides: total };
        if (slide.renderedUrl) finalSlides.push(slide);
        else { const url = await renderSlide(slide); finalSlides.push({ ...slide, renderedUrl: url }); }
      }
      setSlides(finalSlides);

      const urls = finalSlides.map((s) => s.renderedUrl!).filter(Boolean);
      if (!urls.length) throw new Error('Nenhum slide');

      const editorState = { slides: finalSlides, brandId, aspectRatio, globalStyle };
      const isCarousel = urls.length >= 2;

      if (currentPostId) {
        await api.updatePost(currentPostId, { caption, hashtags: hashtags.split(',').map((h) => h.trim()).filter(Boolean), aspectRatio, editorState, isCarousel, imageUrl: urls[0] });
        if (action === 'schedule' && scheduledAt) await api.schedulePost(currentPostId, new Date(scheduledAt).toISOString());
        setMessage('Post atualizado!');
      } else {
        const payload: Record<string, unknown> = { caption, hashtags: hashtags.split(',').map((h) => h.trim()).filter(Boolean), aspectRatio, editorState };
        if (isCarousel) { payload.isCarousel = true; payload.images = urls.map((u, i) => ({ imageUrl: u, order: i })); }
        else payload.imageUrl = urls[0];
        const post = (await api.createPost(payload)) as any;
        if (action === 'schedule' && scheduledAt) await api.schedulePost(post.id, new Date(scheduledAt).toISOString());
        setMessage(action === 'schedule' ? 'Post agendado!' : 'Rascunho salvo!');
      }
      setMessageType('success');
      setTimeout(() => router.push('/posts'), 1500);
    } catch (e: any) { setMessage(e.message); setMessageType('error'); }
    setSavingPost(false);
  }

  const aspectClass = aspectRatio === '4:5' ? 'aspect-[4/5]' : aspectRatio === '9:16' ? 'aspect-[9/16]' : 'aspect-square';

  // ── Render ──
  return (
    <div className="animate-fade-in">
      {/* Hidden file input */}
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
        onChange={(e) => { if (e.target.files?.[0]) handleUploadBg(e.target.files[0]); e.target.value = ''; }} />

      {/* ── Right Sidebar ── */}
      <EditorSidebar
        slides={slides}
        activeIdx={activeIdx}
        active={active}
        updateActive={updateActive}
        globalStyle={globalStyle}
        setGlobalStyle={setGlobalStyle}
        brands={brands}
        brandId={brandId}
        setBrandId={setBrandId}
        brandLogoUrl={brandLogoUrl}
        genLoading={genLoading}
        handleUploadBg={handleUploadBg}
        handleGenerateBg={handleGenerateBg}
        handleGenerateContent={handleGenerateContent}
        handleRenderAll={handleRenderAll}
        handleSavePost={handleSavePost}
        renderingAll={renderingAll}
        savingPost={savingPost}
        caption={caption}
        setCaption={setCaption}
        hashtags={hashtags}
        setHashtags={setHashtags}
        scheduledAt={scheduledAt}
        setScheduledAt={setScheduledAt}
        fileInputRef={fileInputRef}
        copyLayoutToNext={copyLayoutToNext}
        savedTemplates={savedTemplates}
        saveTemplate={handleSaveTemplate}
        deleteTemplate={deleteStyleTemplate}
        loadTemplate={loadTemplate}
        changeTemplate={changeTemplate}
      />

      {/* ── Canvas Area ── */}
      <div className="mr-[340px]">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <Link href="/posts" className="text-xs text-text-secondary hover:text-primary inline-flex items-center gap-1 mb-1">
              <ChevronLeft className="w-3.5 h-3.5" /> Voltar
            </Link>
            <h1 className="text-page-title text-text-primary flex items-center gap-3">
              Editor Visual
              {currentPostId && <span className="text-[11px] font-semibold px-2 py-1 rounded-badge bg-primary/10 text-primary">EDITANDO</span>}
              {loadingPost && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-bg-main rounded-lg p-0.5">
              {(['1:1', '4:5', '9:16'] as AspectRatio[]).map((ar) => (
                <button key={ar} onClick={() => setAspectRatio(ar)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${aspectRatio === ar ? 'bg-bg-card text-primary shadow-sm' : 'text-text-muted'}`}
                >{ar}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Slide thumbnails */}
        <div className="card p-3 overflow-x-auto mb-3">
          <div className="flex items-start gap-3 min-w-min">
            {slides.map((slide, idx) => (
              <div key={slide.id} onClick={() => setActiveIdx(idx)}
                className={`relative ${aspectClass} w-36 flex-shrink-0 rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
                  idx === activeIdx ? 'border-primary shadow-lg scale-105' : 'border-border hover:border-primary/50'
                }`}
                style={{
                  backgroundColor: slide.slideBgColor || '#1a1a2e',
                  backgroundImage: slide.backgroundUrl ? `url('${slide.backgroundUrl}')` : undefined,
                  backgroundPosition: `${slide.backgroundX ?? 50}% ${slide.backgroundY ?? 50}%`,
                  backgroundSize: `${slide.backgroundZoom ?? 100}%`,
                }}
              >
                <div className="absolute inset-0" style={{ background: `rgba(0,0,0,${slide.overlayOpacity})` }} />
                <div className="absolute inset-0 flex items-center justify-center p-2 text-center">
                  <div>
                    {slide.stat && <p className="text-white text-sm font-black" style={{ textShadow: '0 2px 8px rgba(0,0,0,.8)' }}>{slide.stat}</p>}
                    <p className="text-white text-[10px] font-bold leading-tight" style={{ textShadow: '0 2px 8px rgba(0,0,0,.8)' }}>{slide.title}</p>
                  </div>
                </div>
                <div className="absolute top-1 left-1 bg-black/60 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">{idx + 1}</div>
                {slide.renderedUrl && <div className="absolute top-1 right-1 bg-emerald-500 text-white text-[7px] font-bold px-1 py-0.5 rounded">OK</div>}
                <button onClick={(e) => { e.stopPropagation(); removeSlide(slide.id); }}
                  className="absolute bottom-1 right-1 w-5 h-5 bg-red-500/80 hover:bg-red-500 rounded text-white flex items-center justify-center">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
            <div className={`${aspectClass} w-36 flex-shrink-0 rounded-xl border-2 border-dashed border-border hover:border-primary text-text-muted hover:text-primary flex flex-col items-center justify-center gap-1 transition-all cursor-pointer`}
              onClick={() => addSlide('content')}>
              <Plus className="w-5 h-5" />
              <span className="text-[10px] font-semibold">Novo slide</span>
            </div>
          </div>
        </div>

        {/* Big preview */}
        <div className="card p-4">
          <div className={`${aspectClass} w-full max-w-[600px] mx-auto rounded-xl overflow-hidden relative shadow-xl`}
            style={{
              backgroundColor: active.slideBgColor || '#1a1a2e',
              backgroundImage: active.backgroundUrl ? `url('${active.backgroundUrl}')` : undefined,
              backgroundPosition: `${active.backgroundX ?? 50}% ${active.backgroundY ?? 50}%`,
              backgroundSize: `${active.backgroundZoom ?? 100}%`,
            }}
          >
            <div className="absolute inset-0" style={{
              background: active.overlayStyle === 'gradient'
                ? `linear-gradient(to bottom, transparent 20%, rgba(0,0,0,${active.overlayOpacity}))`
                : active.overlayStyle === 'vignette'
                ? `radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,${active.overlayOpacity}) 100%)`
                : `rgba(0,0,0,${active.overlayOpacity})`
            }} />
            {/* Live preview */}
            <div className="absolute inset-0" style={{
                transform: 'scale(0.556)', transformOrigin: 'top left',
                width: '1080px',
                height: aspectRatio === '9:16' ? '1920px' : aspectRatio === '4:5' ? '1350px' : '1080px',
              }}
              dangerouslySetInnerHTML={{ __html: buildSlideHtml(active, { aspectRatio, brandLogoUrl, globalStyle }) }}
            />
          </div>
          <p className="text-center text-xs text-text-muted mt-3">
            Slide {activeIdx + 1} / {slides.length} — {activeTemplate.name} — {active.renderedUrl ? 'renderizado' : 'preview ao vivo'}
          </p>
        </div>

        {message && (
          <div className={`mt-3 px-4 py-3 rounded-btn border text-sm ${messageType === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-status-published' : 'bg-red-500/10 border-red-500/20 text-status-failed'}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
