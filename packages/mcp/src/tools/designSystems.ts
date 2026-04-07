import { api } from '../api-client';

export interface ListDesignSystemsInput {
  category?: string;
  search?: string;
  limit?: number;
}

export async function listDesignSystems(input: ListDesignSystemsInput = {}) {
  const params: Record<string, string> = {};
  if (input.category) params.category = input.category;
  if (input.search) params.search = input.search;
  if (input.limit) params.limit = String(input.limit);

  const result = await api.listDesignSystems(params);
  return {
    total_in_library: result.totalAvailable,
    returned: result.total,
    design_systems: result.items.map((d: any) => ({
      id: d.id,
      name: d.name,
      vibe: d.vibe,
      category: d.category,
      mood_keywords: d.moodKeywords,
      primary_color: d.colors.primary,
      secondary_color: d.colors.secondary,
    })),
  };
}

export async function getDesignSystem(input: { design_system_id: string }) {
  const ds = await api.getDesignSystem(input.design_system_id);
  return ds;
}

export async function listDesignSystemCategories() {
  const cats = await api.getDesignSystemCategories();
  return { categories: cats };
}

export interface SuggestBrandInput {
  inspiration_ids: string[];
  business_name?: string;
  business_type?: string;
}

export async function suggestBrandFromInspirations(input: SuggestBrandInput) {
  const result = await api.suggestBrandFromInspirations({
    inspirationIds: input.inspiration_ids,
    businessName: input.business_name,
    businessType: input.business_type,
  });
  return result;
}
