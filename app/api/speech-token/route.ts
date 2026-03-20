export async function GET() {
  const key = process.env.AZURE_SPEECH_KEY;
  const region = process.env.AZURE_SPEECH_REGION;

  if (!key || !region) {
    return Response.json(
      { error: "Azure Speech not configured" },
      { status: 500 }
    );
  }

  try {
    const res = await fetch(
      `https://${region}.api.cognitive.microsoft.com/sts/v1.0/issueToken`,
      {
        method: "POST",
        headers: { "Ocp-Apim-Subscription-Key": key },
      }
    );

    if (!res.ok) {
      return Response.json(
        { error: "Token fetch failed" },
        { status: 502 }
      );
    }

    const token = await res.text();
    return Response.json(
      { token, region },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return Response.json(
      { error: "Token fetch failed" },
      { status: 502 }
    );
  }
}
