function buildSystemPrompt(): string {
  return `You are a communication coach evaluating a spoken response. The user was given a prompt and responded verbally. Their speech has been transcribed.

Analyze the transcript and score it on four dimensions (0-25 each, total out of 100):

1. STRUCTURE (0-25): Did they build a clear, complete response? Check for these four elements:
   - Clear point: Opened with a direct answer or position (not throat-clearing or restating the question)
   - Reasoning: Explained WHY — gave the logic, motivation, or context behind their point
   - Proof: Backed it up with something specific — an example, a story, a data point, a comparison
   - Landing: Ended with purpose — a next step, a recommendation, a question, or a clean wrap (didn't just trail off)

2. SPEED TO POINT (0-25): How quickly did they get to their actual point?
   - 25: First sentence or two — immediately clear what they think
   - 15: Took a while but got there within the first third
   - 5: Buried, vague, or never clearly stated

3. CONCISENESS (0-25): Was the response tight or padded?
   - Penalize: repetition, restating what was already said, over-explaining, circular reasoning, hedging
   - Reward: direct language, saying it once and moving on, every sentence earning its place

4. FILLER WORDS (0-25): Count these fillers: um, uh, like (non-grammatical), basically, so (as sentence starters), you know, kind of, sort of, right?, I mean, honestly, actually (when meaningless)
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
  "structure_breakdown": {
    "clear_point": true,
    "reasoning": false,
    "proof": true,
    "landing": false
  },
  "first_clear_point_sentence": "quote the sentence where they first stated their main point, or null if never stated",
  "top_coaching_note": "one specific, direct coaching tip in 1-2 sentences — tell them exactly what to change next time",
  "rewrite_suggestion": "a tighter version of their opening 2 sentences that gets to the point faster"
}`;
}

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "Anthropic API not configured" }, { status: 500 });
  }

  let body: { transcript: string; prompt: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { transcript, prompt } = body;
  if (!transcript || !prompt) {
    return Response.json({ error: "Missing transcript or prompt" }, { status: 400 });
  }

  try {
    const systemPrompt = buildSystemPrompt();

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
