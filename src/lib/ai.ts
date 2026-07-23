// Client-side helper to call one-shot generation endpoint.
export async function generateText(input: { system?: string; prompt: string }): Promise<string> {
  const res = await fetch("/api/generate", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const text = await res.text();
    if (res.status === 429) throw new Error("Rate limit reached. Please wait a moment and try again.");
    if (res.status === 402) throw new Error("AI credits exhausted. Please add credits to continue.");
    throw new Error(text || "Failed to generate");
  }
  const data = (await res.json()) as { text: string };
  return data.text;
}
