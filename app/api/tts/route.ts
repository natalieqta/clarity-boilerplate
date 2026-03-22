export async function POST(request: Request) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return new Response("ElevenLabs API not configured", { status: 500 });
  }

  let body: { text: string; speed?: "slow" | "normal" };
  try {
    body = await request.json();
  } catch {
    return new Response("Invalid request body", { status: 400 });
  }

  const { text, speed = "normal" } = body;
  if (!text) {
    return new Response("Missing text", { status: 400 });
  }

  // Rachel voice — clear, professional female voice
  const voiceId = "21m00Tcm4TlvDq8ikWAM";

  const voiceSettings =
    speed === "slow"
      ? { stability: 0.85, similarity_boost: 0.75, speed: 0.65 }
      : { stability: 0.75, similarity_boost: 0.75, speed: 1.0 };

  try {
    const res = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": apiKey,
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_flash_v2_5",
          voice_settings: voiceSettings,
        }),
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      console.error("ElevenLabs API error:", res.status, errText);
      return new Response("TTS failed", { status: 502 });
    }

    const audioBuffer = await res.arrayBuffer();

    return new Response(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (err) {
    console.error("TTS error:", err);
    return new Response("TTS failed", { status: 500 });
  }
}
