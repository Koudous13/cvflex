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
        content: `Texte brut du CV à structurer :\n\n${rawText}\n\nRetourne le JSON strict.`,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.1,
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) throw new Error("DeepSeek a retourné une réponse vide");

  const json = JSON.parse(content);
  return CvProfileSchema.parse(json);
}
