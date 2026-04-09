'use client';

import { useState, useEffect } from 'react';
import { SavedTemplate, SlideState, makeId } from '../types';

const STORAGE_KEY = 'visual-editor-style-templates';

export function useStyleTemplates() {
  const [templates, setTemplates] = useState<SavedTemplate[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setTemplates(JSON.parse(saved));
    } catch {}
  }, []);

  function persist(next: SavedTemplate[]) {
    setTemplates(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  function saveTemplate(name: string, style: Partial<SlideState>) {
    const tpl: SavedTemplate = {
      id: makeId(),
      name,
      style,
      createdAt: new Date().toISOString(),
    };
    persist([...templates, tpl]);
  }

  function deleteTemplate(id: string) {
    persist(templates.filter((t) => t.id !== id));
  }

  return { templates, saveTemplate, deleteTemplate };
}
