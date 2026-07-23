import { createFileRoute, Link } from "@tanstack/react-router";
import { Mail, CalendarClock, MessageSquare, ArrowRight, ShieldCheck, Zap, Lock } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — WorkFlow AI" },
      { name: "description", content: "AI tools for email, scheduling, and workplace help." },
      { property: "og:title", content: "WorkFlow AI Dashboard" },
      { property: "og:description", content: "Boost your workday with AI." },
    ],
  }),
  component: Dashboard,
});

const features = [
  {
    to: "/email" as const,
    title: "Smart Email Generator",
    desc: "Draft professional emails in seconds — set tone, length, and key points.",
    icon: Mail,
  },
  {
    to: "/planner" as const,
    title: "AI Task Planner",
    desc: "Turn your to-do list into a structured daily or weekly schedule.",
    icon: CalendarClock,
  },
  {
    to: "/assistant" as const,
    title: "AI Workplace Assistant",
    desc: "Chat with an AI expert on communication, planning, and productivity.",
    icon: MessageSquare,
  },
];

const trust = [
  { icon: Lock, label: "No accounts", desc: "Use every feature without signing up." },
  { icon: ShieldCheck, label: "No data stored", desc: "Your inputs stay in your browser." },
  { icon: Zap, label: "Fast & focused", desc: "Purpose-built for workplace productivity." },
];

function Dashboard() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="rounded-2xl border bg-gradient-to-br from-primary/10 via-background to-accent/30 p-6 sm:p-10">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <Zap className="h-3.5 w-3.5" /> Powered by AI
          </div>
          <h2 className="mt-4 text-2xl font-semibold tracking-tight sm:text-4xl">
            Get more done at work — with an AI teammate.
          </h2>
          <p className="mt-3 text-sm text-muted-foreground sm:text-base">
            Draft emails, plan your day, and get workplace advice instantly. No accounts, no data stored.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Button asChild>
              <Link to="/assistant">
                Start chatting <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/email">Write an email</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mt-8">
        <h3 className="text-lg font-semibold">Tools</h3>
        <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <Link key={f.to} to={f.to} className="group">
              <Card className="h-full transition-colors group-hover:border-primary/50">
                <CardHeader>
                  <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
                    <f.icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="mt-3 text-base">{f.title}</CardTitle>
                  <CardDescription>{f.desc}</CardDescription>
                </CardHeader>
                <CardContent>
                  <span className="inline-flex items-center text-sm font-medium text-primary">
                    Open <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-10 grid gap-3 sm:grid-cols-3">
        {trust.map((t) => (
          <div key={t.label} className="flex items-start gap-3 rounded-xl border bg-card p-4">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-muted">
              <t.icon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium">{t.label}</div>
              <div className="text-xs text-muted-foreground">{t.desc}</div>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
