import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Copy, Loader2, RefreshCw, Trash2, Mail } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AiDisclaimer } from "@/components/ai-disclaimer";
import { generateText } from "@/lib/ai";

export const Route = createFileRoute("/email")({
  head: () => ({
    meta: [
      { title: "Smart Email Generator — WorkFlow AI" },
      { name: "description", content: "Draft professional workplace emails in seconds with AI." },
      { property: "og:title", content: "Smart Email Generator" },
      { property: "og:description", content: "AI-drafted workplace emails with the right tone." },
    ],
  }),
  component: EmailPage,
});

const TONES = ["Formal", "Friendly", "Direct", "Persuasive", "Apologetic"] as const;
const LENGTHS = ["Short", "Medium", "Long"] as const;

function EmailPage() {
  const [purpose, setPurpose] = useState("");
  const [recipient, setRecipient] = useState("");
  const [keyPoints, setKeyPoints] = useState("");
  const [tone, setTone] = useState<(typeof TONES)[number]>("Formal");
  const [length, setLength] = useState<(typeof LENGTHS)[number]>("Medium");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const canSubmit = purpose.trim().length > 0 && !loading;

  async function run() {
    if (!canSubmit) return;
    setLoading(true);
    try {
      const system =
        "You are an expert workplace communication assistant. Write clear, professional emails. Return only the email body with a subject line prefixed by 'Subject:' on the first line. Do not include commentary.";
      const prompt = `Write a workplace email.

Purpose: ${purpose}
Recipient: ${recipient || "(unspecified)"}
Key points:
${keyPoints || "(none provided)"}

Tone: ${tone}
Length: ${length}

Format:
Subject: <subject>
<blank line>
<email body with greeting and sign-off>`;
      const text = await generateText({ system, prompt });
      setOutput(text.trim());
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to generate email");
    } finally {
      setLoading(false);
    }
  }

  async function copy() {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Could not copy");
    }
  }

  function clearAll() {
    setPurpose("");
    setRecipient("");
    setKeyPoints("");
    setOutput("");
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Mail className="h-4 w-4 text-primary" /> Email details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="purpose">Email purpose</Label>
              <Input
                id="purpose"
                placeholder="e.g. Request a meeting to review Q3 report"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="recipient">Recipient</Label>
              <Input
                id="recipient"
                placeholder="e.g. My manager, Sarah from finance"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="key">Key points</Label>
              <Textarea
                id="key"
                rows={5}
                placeholder="Bullet the main points you want to include..."
                value={keyPoints}
                onChange={(e) => setKeyPoints(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Tone</Label>
                <Select value={tone} onValueChange={(v) => setTone(v as (typeof TONES)[number])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TONES.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Length</Label>
                <Select value={length} onValueChange={(v) => setLength(v as (typeof LENGTHS)[number])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {LENGTHS.map((l) => (
                      <SelectItem key={l} value={l}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              <Button onClick={run} disabled={!canSubmit}>
                {loading ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : null}
                Generate email
              </Button>
              <Button variant="outline" onClick={clearAll} disabled={loading}>
                <Trash2 className="mr-1 h-4 w-4" /> Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-base">Draft</CardTitle>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={copy} disabled={!output}>
                  <Copy className="mr-1 h-4 w-4" /> Copy
                </Button>
                <Button variant="ghost" size="sm" onClick={run} disabled={!canSubmit}>
                  <RefreshCw className="mr-1 h-4 w-4" /> Regenerate
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea
              rows={18}
              placeholder="Your generated email will appear here. You can edit it directly."
              value={output}
              onChange={(e) => setOutput(e.target.value)}
              className="font-mono text-sm"
            />
            <AiDisclaimer />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
