"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { LIKERT } from "@/lib/options";
import { supabaseBrowser } from "@/lib/supabase/client";

type Bench = { d: number; r: number; pollster: string; fielded: string | null; url: string } | null;
type Q = { id: string; statement: string; topic: string | null; bench: Bench };
const PAGE = 8;

export default function Polls({ questions, answered, counted }: { questions: Q[]; answered: Record<string, number>; counted: boolean }) {
  const [ans, setAns] = useState<Record<string, number>>(answered);
  const [err, setErr] = useState("");
  const [showAll, setShowAll] = useState(false);
  // Unanswered first, a page at a time; answered ones stay visible until the page changes.
  const [batch, setBatch] = useState(() => questions.filter((q) => !answered[q.id]).slice(0, PAGE).map((q) => q.id));
  const done = Object.keys(ans).length;
  const remaining = questions.filter((q) => !ans[q.id]);

  const shown = useMemo(() => showAll ? questions : questions.filter((q) => batch.includes(q.id)), [showAll, questions, batch]);

  async function answer(qid: string, v: number) {
    const prev = ans[qid];
    setAns({ ...ans, [qid]: v }); setErr("");
    const supabase = supabaseBrowser();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from("poll_responses").upsert({ user_id: user.id, question_id: qid, answer: v, answered_at: new Date().toISOString() });
    if (error) { setErr("That answer didn't save. Check your connection and try again."); setAns((a) => { const n = { ...a }; if (prev) n[qid] = prev; else delete n[qid]; return n; }); }
  }

  return (
    <div className="col">
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <p className="eyebrow"><span>Overlap polls</span><span>{done} of {questions.length} answered</span></p>
        <h1 className="title" style={{ fontSize: 44 }}>Add your voice</h1>
        <p className="muted" style={{ margin: 0 }}>Once enough people from both parties answer a question, it becomes a round in the daily game. After you answer, you'll see how the country answered in a national poll.</p>
      </div>
      {!counted && (
        <div className="wash small">
          Your answers are saved but won't be counted yet. To include them, <Link href="/profile">add your party and turn on research use</Link> in your profile.
        </div>
      )}
      <div className="progress" aria-hidden="true"><span className="on" style={{ flex: done || 0.0001 }} /><span style={{ flex: questions.length - done || 0.0001 }} /></div>

      {shown.length === 0 && <p className="dek" style={{ fontSize: 20 }}>You've answered every poll. New questions are added regularly.</p>}

      {shown.map((q) => (
        <section key={q.id} className="pq" aria-labelledby={"q-" + q.id}>
          {q.topic && <p className="eyebrow">{q.topic}</p>}
          <h2 id={"q-" + q.id} style={{ fontFamily: "var(--display)", fontSize: 21, lineHeight: 1.25, margin: 0 }}>{q.statement}</h2>
          <div className="likert" role="group" aria-label="Your answer">
            {LIKERT.map((o) => (
              <button key={o.value} aria-pressed={ans[q.id] === +o.value} onClick={() => answer(q.id, +o.value)}>{o.label}</button>
            ))}
          </div>
          {ans[q.id] && q.bench && (
            <p className="source">
              Nationally: <b style={{ color: "var(--dem)" }}>{q.bench.d}%</b> of Democrats and <b style={{ color: "var(--rep)" }}>{q.bench.r}%</b> of Republicans agree.{" "}
              <a href={q.bench.url} target="_blank" rel="noreferrer">{q.bench.pollster}{q.bench.fielded ? `, ${q.bench.fielded}` : ""}</a>
            </p>
          )}
        </section>
      ))}
      {err && <p className="error" role="alert">{err}</p>}

      <div className="btn-row" style={{ justifyContent: "flex-start" }}>
        {!showAll && remaining.length > 0 && (
          <button className="btn btn-primary" onClick={() => { setBatch(remaining.slice(0, PAGE).map((q) => q.id)); window.scrollTo(0, 0); }}>
            Next {Math.min(PAGE, remaining.length)} questions
          </button>
        )}
        <button className="btn btn-ghost" onClick={() => setShowAll(!showAll)}>{showAll ? "Show a few at a time" : "Show all questions"}</button>
      </div>
    </div>
  );
}
