import mammoth from "mammoth";
import { createRequire } from "module";

export type ResumeExtractionResult = {
  text: string;
  warnings: string[];
};

const SUPPORTED_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

export function isSupportedResumeMimeType(mimeType: string | undefined): boolean {
  if (!mimeType) return false;
  return SUPPORTED_TYPES.has(mimeType);
}

export async function extractResumeText(
  buffer: Buffer,
  mimeType: string,
): Promise<ResumeExtractionResult> {
  if (mimeType === "application/pdf") {
    const require = createRequire(import.meta.url);
    const pdfModule = require("pdf-parse") as unknown as {
      PDFParse?: new (options: { data: Buffer }) => { getText: () => Promise<{ text: string }> };
      default?: { PDFParse?: new (options: { data: Buffer }) => { getText: () => Promise<{ text: string }> } };
    };

    const PDFParseClass = pdfModule.PDFParse ?? pdfModule.default?.PDFParse;
    if (!PDFParseClass) {
      throw new Error("pdf-parse PDFParse class not found");
    }

    const parser = new PDFParseClass({ data: buffer });
    const result = await parser.getText();
    return { text: result.text.trim(), warnings: [] };
  }

  if (mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
    const result = await mammoth.extractRawText({ buffer });
    return { text: result.value.trim(), warnings: result.messages.map((m) => m.message) };
  }

  throw new Error("Unsupported resume file type");
}
