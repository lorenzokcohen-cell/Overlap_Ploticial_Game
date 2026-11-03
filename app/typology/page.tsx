import { supabaseServer } from "@/lib/supabase/server";
import Quiz from "./Quiz";
export const metadata = { title: "Political typology · Overlap" };

export default async function Page() {
  const supabase = await supabaseServer();
  const { data } = await supabase.from("typology_results")
    .select("category,econ_score,social_score,created_at").order("created_at", { ascending: false }).limit(1).maybeSingle();
  return <Quiz latest={data} />;
}
