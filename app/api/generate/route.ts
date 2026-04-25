import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { adaptCv } from "@/lib/deepseek/adapt-cv";
import { CvProfileSchema, TEMPLATES } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const BodySchema = z.object({
  jobOffer: z.string().min(50),
  extraInfo: z.string().optional(),
  templateId: z.enum(TEMPLATES.map((t) => t.id) as [string, ...string[]]),
});

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  let body;
  try {
    body = BodySchema.parse(await req.json());
  } catch (err) {
    return NextResponse.json(
      { error: "Données invalides", detail: err instanceof Error ? err.message : "" },
      { status: 400 }
    );
  }

  const { data: baseCv, error: baseErr } = await supabase
    .from("base_cvs")
    .select("id, parsed_json")
    .eq("user_id", user.id)
    .maybeSingle();

  if (baseErr || !baseCv) {
    return NextResponse.json(
      { error: "CV de base introuvable. Termine l'onboarding." },
      { status: 400 }
    );
  }

  const profile = CvProfileSchema.parse(baseCv.parsed_json);

  let adapted;
  try {
    adapted = await adaptCv({
      profile,
      jobOffer: body.jobOffer,
      extraInfo: body.extraInfo,
    });
  } catch (err) {
    return NextResponse.json(
      {
        error: "Erreur lors de l'adaptation IA. Réessaie dans un instant.",
        detail: err instanceof Error ? err.message : String(err),
      },
      { status: 502 }
    );
  }

  const { data: inserted, error: insertErr } = await supabase
    .from("generated_cvs")
    .insert({
      user_id: user.id,
      base_cv_id: baseCv.id,
      job_offer_text: body.jobOffer,
      extra_info: body.extraInfo ?? null,
      template_id: body.templateId,
      generated_json: adapted,
    })
    .select("id")
    .single();

  if (insertErr) {
    return NextResponse.json(
      { error: `Erreur DB : ${insertErr.message}` },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, id: inserted.id });
}
