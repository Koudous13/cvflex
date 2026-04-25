import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { CvProfileSchema, type TemplateId } from "@/lib/types";
import { renderCvDocument } from "@/components/templates";
import { generatePdfFromHtml } from "@/lib/pdf/generate";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { data: cv } = await supabase
    .from("generated_cvs")
    .select("id, template_id, generated_json")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!cv) return NextResponse.json({ error: "Introuvable" }, { status: 404 });

  const profile = CvProfileSchema.parse(cv.generated_json);
  const templateId = cv.template_id as TemplateId;
  const html = renderCvDocument(profile, templateId);

  let pdf: Buffer;
  try {
    pdf = await generatePdfFromHtml(html);
  } catch (err) {
    return NextResponse.json(
      {
        error: "Erreur de génération PDF.",
        detail: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }

  return new NextResponse(new Uint8Array(pdf), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="cv-${id}.pdf"`,
      "Cache-Control": "private, max-age=0, no-cache",
    },
  });
}
