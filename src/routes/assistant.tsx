import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Loader2, Send, Sparkles, User } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AiDisclaimer } from "@/components/ai-disclaimer";

export const Route = createFileRoute("/assistant")({
  head: () => ({
    meta: [
      { title: "AI Workplace Assistant — WorkFlow AI" },
      {
        name: "description",
        content:
          "Chat with an AI assistant specialised in business communication, planning, and productivity.",
      },
      { property: "og:title", content: "AI Workplace Assistant" },
      {
        property: "og:description",
        content: "Chat with an AI expert in workplace productivity.",
      },
    ],
  }),
  component: AssistantPage,
});

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTED = [
  "How do I politely decline a meeting invitation?",
  "Help me structure a 1:1 with my manager tomorrow.",
  "How do I prioritise when everything feels urgent?",
  "Write me an agenda for a 30-minute team retro.",
];

function AssistantPage() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streaming]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || streaming) return;
    const next: Msg[] = [...messages, { role: "user", content: trimmed }];
    setMessages(next);
    setInput("");
    setStreaming(true);
    // Placeholder assistant message that we stream into
    setMessages((m) => [...m, { role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      if (!res.ok || !res.body) {
        if (res.status === 429) throw new Error("Rate limit reached. Please try again in a moment.");
        if (res.status === 402) throw new Error("AI credits exhausted. Please add credits to continue.");
        throw new Error((await res.text()) || "Chat failed");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let acc = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        // SSE frames separated by double newlines
        const parts = buffer.split("\n\n");
        buffer = parts.pop() ?? "";
        for (const part of parts) {
          for (const line of part.split("\n")) {
            const trimmedLine = line.trim();
            if (!trimmedLine.startsWith("data:")) continue;
            const payload = trimmedLine.slice(5).trim();
            if (!payload || payload === "[DONE]") continue;
            try {
              const json = JSON.parse(payload) as {
                choices?: Array<{ delta?: { content?: string } }>;
              };
              const delta = json.choices?.[0]?.delta?.content;
              if (delta) {
                acc += delta;
                setMessages((m) => {
                  const copy = m.slice();
                  copy[copy.length - 1] = { role: "assistant", content: acc };
                  return copy;
                });
              }
            } catch {
              /* ignore parse errors */
            }
          }
        }
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Something went wrong";
      toast.error(msg);
      setMessages((m) => {
        const copy = m.slice();
        // Remove empty assistant placeholder
        if (copy.length && copy[copy.length - 1].role === "assistant" && !copy[copy.length - 1].content) {
          copy.pop();
        }
        return copy;
      });
    } finally {
      setStreaming(false);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  }

  const empty = messages.length === 0;

  return (
    <div className="mx-auto flex h-[calc(100vh-3.5rem)] w-full max-w-3xl flex-col px-4 sm:px-6">
      <div className="flex-1 overflow-y-auto py-6">
        {empty ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
              <Sparkles className="h-6 w-6" />
            </div>
            <h2 className="mt-4 text-xl font-semibold">How can I help you at work today?</h2>
            <p className="mt-1 max-w-md text-sm text-muted-foreground">
              I specialise in workplace communication, planning, organisation, and productivity.
            </p>
            <div className="mt-6 grid w-full max-w-lg gap-2 sm:grid-cols-2">
              {SUGGESTED.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-lg border bg-card p-3 text-left text-sm transition-colors hover:border-primary/50 hover:bg-accent/40"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((m, i) => (
              <MessageBubble key={i} msg={m} isStreaming={streaming && i === messages.length - 1 && m.role === "assistant"} />
            ))}
            <div ref={endRef} />
          </div>
        )}
      </div>

      <div className="sticky bottom-0 border-t bg-background pb-4 pt-3">
        <AiDisclaimer className="mb-2" />
        <div className="flex items-end gap-2">
          <Textarea
            ref={inputRef}
            rows={2}
            placeholder="Ask about email drafting, planning, meetings, prioritisation..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            className="min-h-11 resize-none"
            disabled={streaming}
          />
          <Button onClick={() => send(input)} disabled={streaming || !input.trim()} size="icon" aria-label="Send">
            {streaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ msg, isStreaming }: { msg: Msg; isStreaming: boolean }) {
  const isUser = msg.role === "user";
  return (
    <div className={"flex gap-3 " + (isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
          <Sparkles className="h-4 w-4" />
        </div>
      )}
      <div
        className={
          "max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed " +
          (isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-foreground")
        }
      >
        {msg.content
          ? isUser
            ? msg.content
            : renderAssistant(msg.content)
          : isStreaming
            ? <span className="opacity-60">Thinking…</span>
            : null}
      </div>
      {isUser && (
        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-muted">
          <User className="h-4 w-4" />
        </div>
      )}
    </div>
  );
}

// Render assistant text: strip leading bullet asterisks, turn **text** into bold.
function renderAssistant(text: string) {
  const lines = text.split("\n");
  return (
    <>
      {lines.map((line, i) => {
        const bulletMatch = line.match(/^(\s*)[*\-•]\s+(.*)$/);
        const isBullet = !!bulletMatch;
        const content = isBullet ? bulletMatch![2] : line;
        return (
          <div key={i} className={isBullet ? "flex gap-2" : undefined}>
            {isBullet && <span aria-hidden>•</span>}
            <span>{renderInline(content)}</span>
          </div>
        );
      })}
    </>
  );
}

function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) => {
    const m = p.match(/^\*\*([^*]+)\*\*$/);
    if (m) return <strong key={i} className="font-semibold">{m[1]}</strong>;
    return <span key={i}>{p}</span>;
  });
}
