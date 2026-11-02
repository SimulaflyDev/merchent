export interface TermsDocument {
  version: string;
  title: string;
  sha256: string;
  page_count: number;
  published_at: string | null;
}

export interface TermsPage { image: string; text: string; page: number }
