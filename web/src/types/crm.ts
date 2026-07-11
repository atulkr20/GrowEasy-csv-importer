export interface CrmRecord {
  created_at: string;
  name: string;
  email: string;
  country_code: string;
  mobile_without_country_code: string;
  company: string;
  city: string;
  state: string;
  country: string;
  lead_owner: string;
  crm_status: string;
  crm_note: string;
  data_source: string;
  possession_time: string;
  description: string;
}

export interface SkippedRow {
  index: number;
  reason: string;
}

export interface ImportResult {
  records: CrmRecord[];
  skipped: SkippedRow[];
  totalImported: number;
  totalSkipped: number;
}

export interface BatchProgress {
  batchIndex: number;
  totalBatches: number;
  processedRows: number;
  totalRows: number;
}

export const CRM_COLUMNS: (keyof CrmRecord)[] = [
  "name",
  "email",
  "country_code",
  "mobile_without_country_code",
  "company",
  "city",
  "state",
  "country",
  "crm_status",
  "lead_owner",
  "crm_note",
  "created_at",
  "data_source",
  "possession_time",
  "description",
];

export const CRM_COLUMN_LABELS: Record<keyof CrmRecord, string> = {
  created_at: "Created At",
  name: "Name",
  email: "Email",
  country_code: "Code",
  mobile_without_country_code: "Mobile",
  company: "Company",
  city: "City",
  state: "State",
  country: "Country",
  lead_owner: "Lead Owner",
  crm_status: "CRM Status",
  crm_note: "Note",
  data_source: "Source",
  possession_time: "Possession",
  description: "Description",
};
