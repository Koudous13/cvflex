import { deepseek, DEEPSEEK_MODEL } from "./client";
import { PARSE_CV_SYSTEM } from "./prompts";
import { CvProfileSchema, type CvProfile } from "@/lib/types";

export async function parseCv(rawText: string): Promise<CvProfile> {
  const completion = await deepseek.chat.completions.create({
    model: DEEPSEEK_MODEL,
    messages: [
      { role: "system", content: PARSE_CV_SYSTEM },
      {
        role: "user",
        content: `Texte brut du CV à structurer :\n\n${rawText}\n\nRetourne le JSON strict respectant le schéma.`,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.1,
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) throw new Error("DeepSeek a retourné une réponse vide");

  let json: unknown;
  try {
    json = JSON.parse(content);
  } catch {
    console.error("[parseCv] DeepSeek returned non-JSON:", content.slice(0, 500));
    throw new Error("DeepSeek a retourné un JSON invalide");
  }

  const result = CvProfileSchema.safeParse(json);
  if (!result.success) {
    console.error("[parseCv] Zod validation failed. Keys received:", Object.keys(json as object));
    console.error("[parseCv] Raw JSON sample:", JSON.stringify(json).slice(0, 800));
    throw result.error;
  }
  return result.data;
}
