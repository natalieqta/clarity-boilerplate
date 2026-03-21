import type { WhatMode } from "@/lib/types/what";

function buildSystemPrompt(mode: WhatMode): string {
  const structureName = mode === "work" ? "STRUCTURE (Work scenario)" : "STRUCTURE (On-the-spot)";

  const structureCriteria =
    mode === "work"
      ? `1. ${structureName} (0-25): Did they hit these four elements?
   - Clear position (stated their main point up front)
   - Context & stakes (explained why it matters or what's at risk)
   - Evidence (gave a supporting reason, example, or data)
   - Action / recommendation (ended with a clear next step or ask)`
      : `1. ${structureName} (0-25): Did they hit these four elements?
   - Clear position (stated their stance or answer up front)
   - Reasoning (explained the "why" behind their position)
   - Concrete example (illustrated with a specific story, case, or detail)
   - Landing (wrapped up cleanly — didn't trail off or ramble at the end)`;

  const breakdownSchema =
    mode === "work"
      ? `"structure_breakdown": {
    "clear_position": true,
    "context_stakes": false,
    "evidence": true,
    "action_recommendation": false
  }`
      : `"structure_breakdown": {
    "clear_position": true,
    "reasoning": false,
    "concrete_example": true,
    "landing": false
  }`;

  return `You are a communication coach evaluating a spoken response. The user was given a prompt and responded verbally. Their speech has been transcribed.

Analyze the transcript and score it on four dimensions (0-25 each, total out of 100):

${structureCriteria}

2. SPEED TO POINT (0-25): How quickly did they state the main point?
   - 25: First 1-2 sentences
   - 15: Within first third of response
   - 5: Buried or never stated

3. CONCISENESS (0-25): Was the response tight or did it ramble?
   - Penalize repetition, over-explanation, circling back
   - Reward clear, direct language

4. FILLER WORDS (0-25): Count and penalize: um, uh, like, basically, so (as sentence starters), you know, kind of, sort of, right?
   - 25: 0-2 fillers
   - 15: 3-6 fillers
   - 5: 7+ fillers

Return ONLY valid JSON in this exact format (no markdown, no explanation):
{
  "overall_score": <number 0-100>,
  "structure_score": <number 0-25>,
  "speed_score": <number 0-25>,
  "conciseness_score": <number 0-25>,
  "filler_score": <number 0-25>,
  "filler_words_found": ["um", "like"],
  ${breakdownSchema},
  "structure_mode": "${mode}",
  "first_clear_point_sentence": "quote the sentence where they first stated their main point, or null if never stated",
  "top_coaching_note": "one specific, direct coaching tip in 1-2 sentences",
  "rewrite_suggestion": "a tighter version of their opening 2 sentences that gets to the point faster"
}`;
}

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "Anthropic API not configured" }, { status: 500 });
  }

  let body: { transcript: string; prompt: string; mode?: WhatMode };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { transcript, prompt, mode = "work" } = body;
  if (!transcript || !prompt) {
    return Response.json({ error: "Missing transcript or prompt" }, { status: 400 });
  }

  try {
    const systemPrompt = buildSystemPrompt(mode);

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: `PROMPT GIVEN: "${prompt}"\n\nTRANSCRIPT OF SPOKEN RESPONSE:\n${transcript}`,
          },
        ],
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Anthropic API error:", res.status, errText);
      return Response.json({ error: "Analysis failed" }, { status: 502 });
    }

    const data = await res.json();
    const textContent = data.content?.[0]?.text ?? "";

    // Strip markdown code fences if present
    let jsonStr = textContent.trim();
    if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
    }

    const analysis = JSON.parse(jsonStr);

    // Validate required fields
    if (
      typeof analysis.overall_score !== "number" ||
      typeof analysis.structure_score !== "number" ||
      typeof analysis.speed_score !== "number" ||
      typeof analysis.conciseness_score !== "number" ||
      typeof analysis.filler_score !== "number"
    ) {
      return Response.json({ error: "Invalid analysis format" }, { status: 502 });
    }

    return Response.json(analysis);
  } catch (err) {
    console.error("Analysis error:", err);
    return Response.json({ error: "Analysis failed" }, { status: 500 });
  }
}
