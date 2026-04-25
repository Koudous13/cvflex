import { deepseek, DEEPSEEK_MODEL } from "./client";
import { ADAPT_CV_SYSTEM, buildAdaptUserMessage } from "./prompts";
import { CvProfileSchema, type CvProfile } from "@/lib/types";

export async function adaptCv(input: {
  profile: CvProfile;
  jobOffer: string;
  extraInfo?: string;
}): Promise<CvProfile> {
  const completion = await deepseek.chat.completions.create({
    model: DEEPSEEK_MODEL,
    messages: [
      { role: "system", content: ADAPT_CV_SYSTEM },
      { role: "user", content: buildAdaptUserMessage(input) },
    ],
    response_format: { type: "json_object" },
    temperature: 0.4,
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) throw new Error("DeepSeek a retourné une réponse vide");

  const json = JSON.parse(content);
  return CvProfileSchema.parse(json);
}
