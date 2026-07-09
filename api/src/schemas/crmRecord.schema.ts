import { z } from "zod";
import { CRM_STATUS_VALUES, DATA_SOURCE_VALUES } from "../types/crm.types";

export const crmRecordSchema = z.object({
  created_at: z.string().default(""),
  name: z.string().default(""),
  email: z.string().default(""),
  country_code: z.string().default(""),
  mobile_without_country_code: z.string().default(""),
  company: z.string().default(""),
  city: z.string().default(""),
  state: z.string().default(""),
  country: z.string().default(""),
  lead_owner: z.string().default(""),
  crm_status: z.union([z.enum(CRM_STATUS_VALUES), z.literal("")]).catch(""),
  crm_note: z.string().default(""),
  data_source: z.union([z.enum(DATA_SOURCE_VALUES), z.literal("")]).catch(""),
  possession_time: z.string().default(""),
  description: z.string().default(""),
});

export const extractionResultItemSchema = z.object({
  status: z.enum(["success", "skipped"]),
  reason: z.string().default(""),
  record: crmRecordSchema,
});

export const extractionResponseSchema = z.object({
  results: z.array(extractionResultItemSchema),
});

export type ExtractionResultItem = z.infer<typeof extractionResultItemSchema>;