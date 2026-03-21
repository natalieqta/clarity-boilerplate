import type { WhatMode, WhatPrompt } from "./types/what";

export const WORK_PROMPTS: WhatPrompt[] = [
  { id: "w1", mode: "work", text: "You're on a client call and they say: 'We're thinking of moving to a different vendor.' You have 60 seconds to respond." },
  { id: "w2", mode: "work", text: "It's sprint planning. The client just added three new stories but won't remove anything from the sprint. Your PM asks you to speak up." },
  { id: "w3", mode: "work", text: "You're demoing a feature to the client. Halfway through, they say: 'This isn't what I asked for.' Respond." },
  { id: "w4", mode: "work", text: "A junior developer pushed code that broke staging on Friday at 5pm. You're the tech lead. Brief the team on what happened and the plan." },
  { id: "w5", mode: "work", text: "The client's CTO joins the weekly standup unannounced and asks: 'Why aren't we moving faster?'" },
  { id: "w6", mode: "work", text: "You need to tell your PM that the original estimate was wrong by 2x. The client already approved the first timeline. Deliver the news." },
  { id: "w7", mode: "work", text: "A client asks you to skip writing tests to meet the deadline. Explain why that's a bad idea without sounding dismissive." },
  { id: "w8", mode: "work", text: "Your team just inherited a legacy codebase from another vendor. The client asks for your honest assessment." },
  { id: "w9", mode: "work", text: "You're in a retro. The sprint went badly — missed commitments, unclear requirements, tension on the team. Lead the conversation." },
  { id: "w10", mode: "work", text: "A stakeholder wants you to present the product roadmap for next quarter. Walk them through your recommendation for what to prioritize and why." },
  { id: "w11", mode: "work", text: "Two senior developers on your team disagree on the architecture. You need to make the call — and the client is in the room. Explain your decision." },
  { id: "w12", mode: "work", text: "The client asks: 'Can you walk me through exactly how this feature works under the hood?' Explain it clearly for a non-technical audience." },
];

export const SPOT_PROMPTS: WhatPrompt[] = [
  { id: "s1", mode: "spot", text: "Tell me about yourself and what you do." },
  { id: "s2", mode: "spot", text: "Describe a time you had to deliver bad news to a client or manager. How did you handle it?" },
  { id: "s3", mode: "spot", text: "What's your philosophy on writing clean code versus shipping fast?" },
  { id: "s4", mode: "spot", text: "Tell me about a project that failed. What did you learn?" },
  { id: "s5", mode: "spot", text: "What's the difference between a developer who ships and one who doesn't?" },
  { id: "s6", mode: "spot", text: "Remote teams move slower than in-person teams. Agree or disagree — and why?" },
  { id: "s7", mode: "spot", text: "You notice your manager is wrong about something in a meeting with the client. What do you do?" },
  { id: "s8", mode: "spot", text: "What separates a good consultant from a good employee?" },
  { id: "s9", mode: "spot", text: "Tell me about a time you had to learn something completely new under a tight deadline." },
  { id: "s10", mode: "spot", text: "Is technical debt a failure of engineering or a failure of management?" },
  { id: "s11", mode: "spot", text: "You get promoted to lead a team of people who are all more senior than you. What's your first move?" },
  { id: "s12", mode: "spot", text: "A teammate gives you feedback you strongly disagree with. How do you respond?" },
];

export function getRandomPrompt(mode: WhatMode, excludeId?: string): WhatPrompt {
  const pool = mode === "work" ? WORK_PROMPTS : SPOT_PROMPTS;
  const filtered = excludeId ? pool.filter((p) => p.id !== excludeId) : pool;
  return filtered[Math.floor(Math.random() * filtered.length)];
}
