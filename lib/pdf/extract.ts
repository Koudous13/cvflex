// Import direct du sous-module pour éviter le code de debug d'index.js
// qui tente de lire un PDF de test au load (incompatible Next.js bundling).
import pdf from "pdf-parse/lib/pdf-parse.js";

export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  const data = await pdf(buffer);
  return data.text.trim();
}
