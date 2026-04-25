import { extractText, getDocumentProxy } from "unpdf";

export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  const uint8 = new Uint8Array(buffer);
  const pdf = await getDocumentProxy(uint8);
  const { text } = await extractText(pdf, { mergePages: true });
  return text.trim();
}
