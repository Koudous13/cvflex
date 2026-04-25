import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { extractTextFromPdf } from "@/lib/pdf/extract";
import { parseCv } from "@/lib/deepseek/parse-cv";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_SIZE = 5 * 1024 * 1024;

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("cv") as File | null;

  if (!file) {
    return NextResponse.json({ error: "Fichier manquant" }, { status: 400 });
  }
  if (file.type !== "application/pdf") {
    return NextResponse.json(
      { error: "Format invalide (PDF requis)" },
      { status: 400 }
    );
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "Fichier trop volumineux (max 5 Mo)" },
      { status: 400 }
    );
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // 1. Storage upload
  const path = `${user.id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  const { error: uploadError } = await supabase.storage
    .from("base-cvs")
    .upload(path, buffer, {
      contentType: "application/pdf",
      upsert: false,
    });

  if (uploadError) {
    return NextResponse.json(
      { error: `Upload échoué : ${uploadError.message}` },
      { status: 500 }
    );
  }

  // 2. Extract text
  let extractedText: string;
  try {
    extractedText = await extractTextFromPdf(buffer);
  } catch (err) {
    return NextResponse.json(
      {
        error:
          "Impossible d'extraire le texte du PDF. Essaie un autre fichier.",
        detail: err instanceof Error ? err.message : String(err),
      },
      { status: 422 }
    );
  }

  if (!extractedText || extractedText.length < 50) {
    return NextResponse.json(
      {
        error:
          "Le texte extrait est trop court. Le PDF est-il bien lisible (pas une image scannée) ?",
      },
      { status: 422 }
    );
  }

  // 3. Parse via DeepSeek
  let parsed;
  try {
    parsed = await parseCv(extractedText);
  } catch (err) {
    return NextResponse.json(
      {
        error: "Erreur lors de l'analyse IA. Réessaie dans un instant.",
        detail: err instanceof Error ? err.message : String(err),
      },
      { status: 502 }
    );
  }

  // 4. Save in DB
  const { data: inserted, error: insertError } = await supabase
    .from("base_cvs")
    .insert({
      user_id: user.id,
      pdf_url: path,
      extracted_text: extractedText,
      parsed_json: parsed,
    })
    .select("id")
    .single();

  if (insertError) {
    return NextResponse.json(
      { error: `Erreur DB : ${insertError.message}` },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, id: inserted.id });
}
