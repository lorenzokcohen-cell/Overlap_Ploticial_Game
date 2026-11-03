import { supabaseServer } from "@/lib/supabase/server";
import ProfileForm from "./ProfileForm";
export const metadata = { title: "Your profile · Overlap" };

export default async function Page() {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  const { data } = await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle();
  return <ProfileForm initial={data} />;
}
