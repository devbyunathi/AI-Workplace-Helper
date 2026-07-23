import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CalendarClock, Copy, Loader2, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AiDisclaimer } from "@/components/ai-disclaimer";
import { generateText } from "@/lib/ai";

export const Route = createFileRoute("/planner")({
  head: () => ({
    meta: [
      { title: "AI Task Planner — WorkFlow AI" },
      { name: "description", content: "Turn your tasks and deadlines into an AI-generated schedule." },
      { property: "og:title", content: "AI Task Planner" },
      { property: "og:description", content: "AI-generated daily and weekly schedules." },
    ],
  }),
  component: PlannerPage,
});

const RANGES = ["Daily", "Weekly"] as const;

function PlannerPage() {
  const [tasks, setTasks] = useState("");
  const [deadlines, setDeadlines] = useState("");
  const [meetings, setMeetings] = useState("");
  const [priorities, setPriorities] = useState("");
  const [range, setRange] = useState<(typeof RANGES)[number]>("Daily");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const canSubmit = tasks.trim().length > 0 && !loading;

  async function run() {
    if (!canSubmit) return;
    setLoading(true);
    try {
      const system =
        "You are an expert productivity coach. Produce a realistic, well-paced schedule for a working professional. Group items into time blocks. Keep it concise, action-oriented, and easy to scan. Do not include commentary before or after the schedule.";
      const prompt = `Create a ${range.toLowerCase()} schedule.

Tasks:
${tasks}

Deadlines:
${deadlines || "(none)"}

Meeting times:
${meetings || "(none)"}

Priority levels:
${priorities || "(not specified)"}

Format:
${
  range === "Daily"
    ? "Use these four sections in order and use them as headings: Morning, Midday, Afternoon, End of Day. Under each, list time-blocked tasks as bullet points."
    : "For each day Monday through Friday, use the day as a heading and beneath it use the four sub-sections Morning, Midday, Afternoon, End of Day with bullet points."
}
Include buffer time and short breaks where sensible.`;
      const text = await generateText({ system, prompt });
      setOutput(text.trim());
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to generate schedule");
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
    setTasks("");
    setDeadlines("");
    setMeetings("");
    setPriorities("");
    setOutput("");
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarClock className="h-4 w-4 text-primary" /> Plan your {range.toLowerCase()}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Schedule range</Label>
              <Select value={range} onValueChange={(v) => setRange(v as (typeof RANGES)[number])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {RANGES.map((r) => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tasks">Tasks</Label>
              <Textarea
                id="tasks"
                rows={5}
                placeholder="List the tasks you need to complete..."
                value={tasks}
                onChange={(e) => setTasks(e.target.value)}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="deadlines">Deadlines</Label>
                <Textarea
                  id="deadlines"
                  rows={3}
                  placeholder="e.g. Report due Friday 5pm"
                  value={deadlines}
                  onChange={(e) => setDeadlines(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="meetings">Meeting times</Label>
                <Textarea
                  id="meetings"
                  rows={3}
                  placeholder="e.g. 10:00 standup, 2pm client call"
                  value={meetings}
                  onChange={(e) => setMeetings(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="prio">Priority levels</Label>
              <Input
                id="prio"
                placeholder="e.g. Report = high, Slack replies = low"
                value={priorities}
                onChange={(e) => setPriorities(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              <Button onClick={run} disabled={!canSubmit}>
                {loading ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : null}
                Generate schedule
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
              <CardTitle className="text-base">Your schedule</CardTitle>
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
              rows={20}
              placeholder="Your generated schedule will appear here. Edit it directly to fine-tune."
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
