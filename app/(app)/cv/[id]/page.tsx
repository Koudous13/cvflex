import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CvProfileSchema, type TemplateId } from "@/lib/types";
import { renderCvHtml } from "@/components/templates";
import { buttonVariants } from "@/components/ui/button";

export default async function CvViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: cv } = await supabase
    .from("generated_cvs")
    .select("id, template_id, generated_json, created_at")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!cv) notFound();

  const profile = CvProfileSchema.parse(cv.generated_json);
  const templateId = cv.template_id as TemplateId;
  const cvHtml = renderCvHtml(profile, templateId);

  return (
    <div className="bg-muted/30 min-h-screen">
      <div className="max-w-5xl mx-auto px-6 py-6 flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-lg font-semibold">CV adapté</h1>
          <p className="text-xs text-muted-foreground">
            Template : {templateId} ·{" "}
            {new Date(cv.created_at).toLocaleString("fr-FR")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard"
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            Retour
          </Link>
          <a
            href={`/api/pdf/${cv.id}`}
            className={buttonVariants({ size: "sm" })}
          >
            Télécharger PDF
          </a>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 pb-12">
        <div
          className="bg-white rounded-lg shadow-sm overflow-hidden"
          dangerouslySetInnerHTML={{ __html: cvHtml }}
        />
      </div>
    </div>
  );
}
