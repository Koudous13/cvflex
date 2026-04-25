import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: baseCv } = await supabase
    .from("base_cvs")
    .select("id, parsed_json, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: recentCvs } = await supabase
    .from("generated_cvs")
    .select("id, template_id, created_at, job_offer_text")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);

  if (!baseCv) {
    return (
      <main className="max-w-3xl mx-auto px-6 py-12">
        <Card>
          <CardHeader>
            <CardTitle>Bienvenue 👋</CardTitle>
            <CardDescription>
              Pour commencer, upload ton CV de base. Tu n&apos;auras à le faire
              qu&apos;une seule fois.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/onboarding"
              className={buttonVariants({ size: "lg" })}
            >
              Upload mon CV
            </Link>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="max-w-5xl mx-auto px-6 py-10 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Tableau de bord</h1>
          <p className="text-sm text-muted-foreground">
            CV de base prêt. Tu peux générer une version adaptée à chaque offre.
          </p>
        </div>
        <Link href="/new" className={buttonVariants({ size: "lg" })}>
          Nouvelle candidature
        </Link>
      </div>

      <section>
        <h2 className="text-lg font-semibold mb-3">Récents</h2>
        {!recentCvs || recentCvs.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aucun CV généré pour l&apos;instant.
          </p>
        ) : (
          <div className="grid gap-3">
            {recentCvs.map((cv) => (
              <Card key={cv.id}>
                <CardContent className="p-4 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {cv.job_offer_text.slice(0, 80)}…
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Template : {cv.template_id} ·{" "}
                      {new Date(cv.created_at).toLocaleString("fr-FR")}
                    </p>
                  </div>
                  <Link
                    href={`/cv/${cv.id}`}
                    className={buttonVariants({ variant: "outline", size: "sm" })}
                  >
                    Ouvrir
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
