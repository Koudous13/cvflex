import { extractText } from "unpdf";

export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  const { text, totalPages } = await extractText(new Uint8Array(buffer), {
    mergePages: true,
  });
  console.log(
    `[pdf] extracted ${text.length} chars from ${totalPages} pages`
  );
  return text.trim();
}
