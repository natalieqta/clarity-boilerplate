export type WhatMode = "work" | "spot";

export interface WhatPrompt {
  id: string;
  mode: WhatMode;
  text: string;
}

export interface StructureBreakdown {
  /** Did they open with a clear point or position? */
  clear_point: boolean;
  /** Did they give a reason or explain why? */
  reasoning: boolean;
  /** Did they support it with a specific example, story, or detail? */
  proof: boolean;
  /** Did they land it cleanly — a next step, ask, or clean wrap? */
  landing: boolean;
}

export interface WhatAnalysis {
  overall_score: number;
  structure_score: number;
  speed_score: number;
  conciseness_score: number;
  filler_score: number;
  filler_words_found: string[];
  structure_breakdown: StructureBreakdown;
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
