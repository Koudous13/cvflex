import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OnboardingForm } from "./onboarding-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: existing } = await supabase
    .from("base_cvs")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) redirect("/dashboard");

  return (
    <main className="max-w-2xl mx-auto px-6 py-12">
      <Card>
        <CardHeader>
          <CardTitle>Upload ton CV</CardTitle>
          <CardDescription>
            Format PDF uniquement, max 5 Mo. Notre IA va l&apos;analyser et le
            structurer pour pouvoir l&apos;adapter à chaque offre que tu recevras.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OnboardingForm />
        </CardContent>
      </Card>
    </main>
  );
}
