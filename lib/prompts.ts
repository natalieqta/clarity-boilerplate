import type { WhatMode, WhatPrompt } from "./types/what";

export const WORK_PROMPTS: WhatPrompt[] = [
  { id: "w1", mode: "work", text: "Your client says: 'We're thinking of going with another vendor.' You have 60 seconds to respond." },
  { id: "w2", mode: "work", text: "A stakeholder asks you in a meeting: 'Why is this taking so long?' Respond." },
  { id: "w3", mode: "work", text: "You need to push back on a deadline without sounding difficult. Deliver the message." },
  { id: "w4", mode: "work", text: "You're introducing yourself to a new client for the first time. Tell them who you are and what you bring." },
  { id: "w5", mode: "work", text: "Your manager asks: 'What's the biggest risk on this project right now?' Answer them." },
  { id: "w6", mode: "work", text: "You need to explain a complex decision you made to someone non-technical. Walk them through it." },
  { id: "w7", mode: "work", text: "A colleague publicly disagrees with your recommendation in a meeting. Respond." },
  { id: "w8", mode: "work", text: "You're giving an update and things aren't going well. Deliver the bad news honestly." },
  { id: "w9", mode: "work", text: "A client asks: 'What would you do differently if you were in my shoes?' Give them a real answer." },
  { id: "w10", mode: "work", text: "You're asked to present the status of a project to leadership in 60 seconds. Go." },
  { id: "w11", mode: "work", text: "Someone on your team dropped the ball. You need to address it without destroying trust. Speak to them." },
  { id: "w12", mode: "work", text: "A prospect asks: 'Why should we work with you instead of your competitor?' Make your case." },
];

export const SPOT_PROMPTS: WhatPrompt[] = [
  { id: "s1", mode: "spot", text: "What's something you changed your mind about in the last year?" },
  { id: "s2", mode: "spot", text: "What's the most overrated piece of career advice?" },
  { id: "s3", mode: "spot", text: "Remote work makes teams weaker. Agree or disagree?" },
  { id: "s4", mode: "spot", text: "What's one thing most people get wrong about leadership?" },
  { id: "s5", mode: "spot", text: "Is it better to be fast or thorough? Pick one and defend it." },
  { id: "s6", mode: "spot", text: "What separates someone who's good at their job from someone who's great?" },
  { id: "s7", mode: "spot", text: "Meetings are a waste of time. Make the counterargument." },
  { id: "s8", mode: "spot", text: "What's the hardest feedback you've ever had to give — and how did you deliver it?" },
  { id: "s9", mode: "spot", text: "If you could change one thing about how teams communicate, what would it be?" },
  { id: "s10", mode: "spot", text: "What's a skill that's undervalued in the workplace right now?" },
  { id: "s11", mode: "spot", text: "Should people specialize or generalize in their careers? Pick a side." },
  { id: "s12", mode: "spot", text: "Tell me about a time you failed — and what you actually learned from it." },
];

export function getRandomPrompt(mode: WhatMode, excludeId?: string): WhatPrompt {
  const pool = mode === "work" ? WORK_PROMPTS : SPOT_PROMPTS;
  const filtered = excludeId ? pool.filter((p) => p.id !== excludeId) : pool;
  return filtered[Math.floor(Math.random() * filtered.length)];
}
