import type { WhatMode, WhatPrompt } from "./types/what";

export const WORK_PROMPTS: WhatPrompt[] = [
  { id: "w1", mode: "work", text: "Explain to a client why the project timeline changed." },
  { id: "w2", mode: "work", text: "Your manager asks: what's the biggest risk on your current project?" },
  { id: "w3", mode: "work", text: "A stakeholder pushes back on your recommendation. Respond." },
  { id: "w4", mode: "work", text: "Summarize what your team accomplished this sprint." },
  { id: "w5", mode: "work", text: "A new team member asks you to explain the system architecture. Walk them through it." },
  { id: "w6", mode: "work", text: "Your client wants to add scope mid-sprint. How do you respond?" },
  { id: "w7", mode: "work", text: "You found a critical bug right before release. Brief the team on the plan." },
  { id: "w8", mode: "work", text: "Pitch a technical solution to a non-technical stakeholder." },
  { id: "w9", mode: "work", text: "Your team disagrees on the approach. How do you align everyone?" },
  { id: "w10", mode: "work", text: "Explain why you chose this tech stack for the project." },
  { id: "w11", mode: "work", text: "A client asks why the estimate was wrong. Walk them through what happened." },
  { id: "w12", mode: "work", text: "You need to push back on an unrealistic deadline. Make your case." },
];

export const SPOT_PROMPTS: WhatPrompt[] = [
  { id: "s1", mode: "spot", text: "What's a leadership lesson you learned the hard way?" },
  { id: "s2", mode: "spot", text: "If you could change one thing about how your team works, what would it be?" },
  { id: "s3", mode: "spot", text: "You have 60 seconds. Convince me this project matters." },
  { id: "s4", mode: "spot", text: "What does good communication look like to you?" },
  { id: "s5", mode: "spot", text: "Describe a time you had to deliver bad news. How did you handle it?" },
  { id: "s6", mode: "spot", text: "What's the most important thing you've learned in your career so far?" },
  { id: "s7", mode: "spot", text: "If you were leading this team, what would you do differently?" },
  { id: "s8", mode: "spot", text: "What makes a great teammate?" },
  { id: "s9", mode: "spot", text: "Explain a complex idea you dealt with recently — make it simple." },
  { id: "s10", mode: "spot", text: "What's one thing most people get wrong about remote work?" },
  { id: "s11", mode: "spot", text: "You're mentoring a junior developer. What's your #1 piece of advice?" },
  { id: "s12", mode: "spot", text: "What would you do if you disagreed with a decision from leadership?" },
];

export function getRandomPrompt(mode: WhatMode, excludeId?: string): WhatPrompt {
  const pool = mode === "work" ? WORK_PROMPTS : SPOT_PROMPTS;
  const filtered = excludeId ? pool.filter((p) => p.id !== excludeId) : pool;
  return filtered[Math.floor(Math.random() * filtered.length)];
}
