export type WhatMode = "work" | "spot";

export interface WhatPrompt {
  id: string;
  mode: WhatMode;
  text: string;
}

export interface WorkStructureBreakdown {
  clear_position: boolean;
  context_stakes: boolean;
  evidence: boolean;
  action_recommendation: boolean;
}

export interface SpotStructureBreakdown {
  clear_position: boolean;
  reasoning: boolean;
  concrete_example: boolean;
  landing: boolean;
}

export type StructureBreakdown = WorkStructureBreakdown | SpotStructureBreakdown;

export interface WhatAnalysis {
  overall_score: number;
  structure_score: number;
  speed_score: number;
  conciseness_score: number;
  filler_score: number;
  filler_words_found: string[];
  structure_breakdown: StructureBreakdown;
  structure_mode: WhatMode;
  first_clear_point_sentence: string | null;
  top_coaching_note: string;
  rewrite_suggestion: string;
}

export interface WhatSessionData {
  prompt: WhatPrompt;
  transcript: string;
  analysis: WhatAnalysis;
  durationSeconds: number;
  timestamp: number;
}
