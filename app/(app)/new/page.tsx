import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { GenerateForm } from "./generate-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function NewPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: baseCv } = await supabase
    .from("base_cvs")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!baseCv) redirect("/onboarding");

  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      <Card>
        <CardHeader>
          <CardTitle>Nouvelle candidature</CardTitle>
          <CardDescription>
            Colle l&apos;offre d&apos;emploi, choisis un template, et
            l&apos;IA adapte ton CV à l&apos;offre.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GenerateForm />
        </CardContent>
      </Card>
    </main>
  );
}
