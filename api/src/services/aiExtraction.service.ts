import { groqClient } from "../config/groq.client";
import { chunkArray } from "../utils/batch.util";
import {
  CRM_EXTRACTION_SYSTEM_PROMPT,
  buildUserPrompt,
} from "../prompts/crmExtraction.prompt";
import {
  extractionResponseSchema,
  ExtractionResultItem,
} from "../schemas/crmRecord.schema";
import { CrmRecord } from "../types/crm.types";

const MODEL = "openai/gpt-oss-120b";
const BATCH_SIZE = 20;
const MAX_RETRIES = 2;

export interface ExtractionSummary {
  records: CrmRecord[];
  skipped: { index: number; reason: string }[];
  totalImported: number;
  totalSkipped: number;
}

async function extractBatch(
  rows: Record<string, string>[]
): Promise<ExtractionResultItem[]> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const completion = await groqClient.chat.completions.create({
        model: MODEL,
        temperature: 0,
        reasoning_effort: "low",
        include_reasoning: false,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: CRM_EXTRACTION_SYSTEM_PROMPT },
          { role: "user", content: buildUserPrompt(rows) },
        ],
      });

      const raw = completion.choices[0]?.message?.content ?? "";
      const parsed = JSON.parse(raw);
      const validated = extractionResponseSchema.parse(parsed);

      if (validated.results.length !== rows.length) {
        throw new Error(
          `Expected ${rows.length} results, got ${validated.results.length}`
        );
      }

      return validated.results;
    } catch (err) {
      lastError = err;
      console.error(`Batch extraction attempt ${attempt + 1} failed:`, err);
      if (attempt < MAX_RETRIES) {
        await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
      }
    }
  }

  throw lastError;
}

export async function extractCrmRecords(
  rows: Record<string, string>[]
): Promise<ExtractionSummary> {
  const batches = chunkArray(rows, BATCH_SIZE);
  const records: CrmRecord[] = [];
  const skipped: { index: number; reason: string }[] = [];

  let globalIndex = 0;

  for (const batch of batches) {
    try {
      const results = await extractBatch(batch);

      results.forEach((result) => {
        if (result.status === "success") {
          records.push(result.record);
        } else {
          skipped.push({ index: globalIndex, reason: result.reason || "Missing email and mobile number" });
        }
        globalIndex++;
      });
    } catch (err) {
      // Whole batch failed even after retries. Mark every row in it as
      // skipped rather than losing the entire import.
      batch.forEach(() => {
        skipped.push({
          index: globalIndex,
          reason: "AI extraction failed for this batch",
        });
        globalIndex++;
      });
    }
  }

  return {
    records,
    skipped,
    totalImported: records.length,
    totalSkipped: skipped.length,
  };
}