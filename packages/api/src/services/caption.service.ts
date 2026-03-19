interface GenerateCaptionParams {
  topic: string;
  tone?: 'educativo' | 'inspirador' | 'humor' | 'noticia';
  hashtagsCount?: number;
  language?: string;
  maxLength?: number;
}

interface GenerateCaptionResult {
  caption: string;
  hashtags: string[];
}

const TONE_TEMPLATES: Record<string, string> = {
  educativo: '💡 Você sabia?\n\n{content}\n\n💾 Salva esse post para consultar depois!',
  inspirador: '🚀 {content}\n\n✨ O futuro é agora!\n\n📌 Salve e compartilhe!',
  humor: '😂 {content}\n\n🤣 Marca aquele amigo dev!\n\n#humor #tech',
  noticia: '🔥 NOVIDADE!\n\n{content}\n\n📲 Fica ligado para mais updates!',
};

function generateHashtags(topic: string, count: number): string[] {
  const base = ['IA', 'Tech', 'Programacao', 'Dev', 'Tecnologia'];
  const topicWords = topic
    .split(' ')
    .filter((w) => w.length > 3)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());

  return [...topicWords.slice(0, Math.ceil(count / 2)), ...base.slice(0, count)].slice(0, count);
}

export async function generateCaption(params: GenerateCaptionParams): Promise<GenerateCaptionResult> {
  const { topic, tone = 'educativo', hashtagsCount = 10, maxLength = 2200 } = params;

  const template = TONE_TEMPLATES[tone] || TONE_TEMPLATES.educativo;
  const content = `Sobre ${topic}: Este é um tema essencial para quem acompanha tecnologia e inovação. Confira as novidades e insights mais importantes!`;
  let caption = template.replace('{content}', content);

  if (caption.length > maxLength) {
    caption = caption.slice(0, maxLength - 3) + '...';
  }

  const hashtags = generateHashtags(topic, hashtagsCount);

  return { caption, hashtags };
}
