import { createFileRoute } from "@tanstack/react-router";

type Body = { system?: string; prompt: string };

export const Route = createFileRoute("/api/generate")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        let body: Body;
        try {
          body = (await request.json()) as Body;
        } catch {
          return new Response("Invalid JSON", { status: 400 });
        }
        if (!body?.prompt || typeof body.prompt !== "string") {
          return new Response("Missing prompt", { status: 400 });
        }

        const messages: Array<{ role: string; content: string }> = [];
        if (body.system) messages.push({ role: "system", content: body.system });
        messages.push({ role: "user", content: body.prompt });

        const upstream = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "Lovable-API-Key": key,
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages,
          }),
        });

        if (!upstream.ok) {
          const text = await upstream.text();
          return new Response(text, { status: upstream.status });
        }

        const data = (await upstream.json()) as {
          choices?: Array<{ message?: { content?: string } }>;
        };
        const text = data.choices?.[0]?.message?.content ?? "";
        return new Response(JSON.stringify({ text }), {
          headers: { "content-type": "application/json" },
        });
      },
    },
  },
});
