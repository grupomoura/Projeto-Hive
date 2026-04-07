import { DESIGN_SYSTEMS, DesignSystem, DesignSystemCategory, TOTAL_DESIGN_SYSTEMS } from './library';

export { DESIGN_SYSTEMS, TOTAL_DESIGN_SYSTEMS };
export type { DesignSystem, DesignSystemCategory };

export interface ListOptions {
  category?: DesignSystemCategory;
  search?: string;
  limit?: number;
}

export function listDesignSystems(options: ListOptions = {}): DesignSystem[] {
  let items = DESIGN_SYSTEMS;
  if (options.category) {
    items = items.filter((d) => d.category === options.category);
  }
  if (options.search) {
    const q = options.search.toLowerCase();
    items = items.filter((d) =>
      d.name.toLowerCase().includes(q) ||
      d.vibe.toLowerCase().includes(q) ||
      d.moodKeywords.some((k) => k.toLowerCase().includes(q))
    );
  }
  if (options.limit && options.limit > 0) {
    items = items.slice(0, options.limit);
  }
  return items;
}

export function getDesignSystem(id: string): DesignSystem | null {
  return DESIGN_SYSTEMS.find((d) => d.id === id.toLowerCase()) || null;
}

export function getCategories(): { category: DesignSystemCategory; count: number }[] {
  const map = new Map<DesignSystemCategory, number>();
  for (const d of DESIGN_SYSTEMS) {
    map.set(d.category, (map.get(d.category) || 0) + 1);
  }
  return Array.from(map.entries())
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Combines several design systems into a single brand suggestion.
 * Picks the dominant palette from the first inspiration, blends accents,
 * and merges principles + mood keywords.
 */
export interface BrandSuggestion {
  name?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor?: string;
  fontFamily: string;
  voiceTone: string;
  description: string;
  moodKeywords: string[];
  inspirations: { id: string; name: string }[];
  rationale: string;
}

export function suggestBrandFromInspirations(
  inspirationIds: string[],
  hint?: { businessName?: string; businessType?: string }
): BrandSuggestion | null {
  const systems = inspirationIds
    .map((id) => getDesignSystem(id))
    .filter((d): d is DesignSystem => d !== null);

  if (systems.length === 0) return null;

  const primary = systems[0];
  const secondary = systems[1] || systems[0];

  // Merge mood keywords (unique)
  const moodKeywords = Array.from(
    new Set(systems.flatMap((s) => s.moodKeywords))
  ).slice(0, 6);

  // Build a tone description from the vibes
  const vibes = systems.map((s) => s.vibe);
  const voiceTone = systems
    .map((s) => s.moodKeywords[0])
    .filter((v, i, arr) => arr.indexOf(v) === i)
    .slice(0, 3)
    .join(', ');

  // Pick first 4 principles from the dominant inspiration
  const principlesPreview = primary.principles.slice(0, 2).join('. ');

  const businessHint = hint?.businessType ? ` for a ${hint.businessType} brand` : '';
  const description = `Visual identity${businessHint} inspired by: ${vibes.join(' + ')}. ${principlesPreview}.`;

  const rationale = systems
    .map((s) => `${s.name}: ${s.vibe}. Key trait: ${s.principles[0]}.`)
    .join(' ');

  return {
    name: hint?.businessName,
    primaryColor: primary.colors.primary,
    secondaryColor: secondary.colors.primary !== primary.colors.primary
      ? secondary.colors.primary
      : primary.colors.secondary,
    accentColor: primary.colors.accent,
    fontFamily: primary.typography.font,
    voiceTone: voiceTone || primary.moodKeywords[0],
    description,
    moodKeywords,
    inspirations: systems.map((s) => ({ id: s.id, name: s.name })),
    rationale,
  };
}
