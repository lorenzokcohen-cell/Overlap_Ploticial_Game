import { supabaseServer } from "@/lib/supabase/server";
import Polls from "./Polls";
export const metadata = { title: "Polls · Overlap" };

export default async function Page() {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  const [{ data: questions }, { data: responses }, { data: profile }, { data: items }] = await Promise.all([
    supabase.from("poll_questions").select("id,statement,topic,source_item_id").eq("active", true).order("sort_order"),
    supabase.from("poll_responses").select("question_id,answer"),
    supabase.from("profiles").select("consent_at,party").eq("id", user!.id).maybeSingle(),
    supabase.from("game_items").select("id,d,r,pollster,fielded,url"),
  ]);
  const bench = Object.fromEntries((items ?? []).map((i) => [i.id, i]));
  return (
    <Polls
      questions={(questions ?? []).map((q) => ({ ...q, bench: q.source_item_id ? bench[q.source_item_id] ?? null : null }))}
      answered={Object.fromEntries((responses ?? []).map((r) => [r.question_id, r.answer]))}
      counted={!!profile?.consent_at && !!profile?.party}
    />
  );
}
