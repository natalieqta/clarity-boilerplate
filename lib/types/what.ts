export type WhatMode = "work" | "spot";

export interface WhatPrompt {
  id: string;
  mode: WhatMode;
  text: string;
}

export interface FrameworkBreakdown {
  point: boolean;
  why_it_matters: boolean;
  support_reason: boolean;
  next_step: boolean;
}

export interface WhatAnalysis {
  overall_score: number;
  framework_score: number;
  speed_score: number;
  conciseness_score: number;
  filler_score: number;
  filler_words_found: string[];
  framework_breakdown: FrameworkBreakdown;
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
