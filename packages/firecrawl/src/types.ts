export interface FirecrawlConfig {
  proxyUrl: string;
}

export type ScrapeFormat = "screenshot" | "markdown" | "branding" | "html" | "rawHtml" | "links";

export interface ScrapeOptions {
  formats: ScrapeFormat[];
  screenshotOptions?: {
    fullPage?: boolean;
    width?: number;
    height?: number;
  };
  waitFor?: number;
  timeout?: number;
}

export interface BrandingColors {
  primary?: string;
  secondary?: string;
  accent?: string;
  background?: string;
  textPrimary?: string;
  textSecondary?: string;
}

export interface BrandingTypography {
  fontFamilies?: {
    primary?: string;
    heading?: string;
    code?: string;
  };
  fontSizes?: Record<string, string>;
  fontWeights?: Record<string, number>;
}

export interface BrandingData {
  colorScheme?: string;
  logo?: string;
  colors?: BrandingColors;
  typography?: BrandingTypography;
  spacing?: {
    baseUnit?: number;
    borderRadius?: string;
  };
  images?: {
    logo?: string;
    favicon?: string;
  };
}

export interface ScrapeMetadata {
  title?: string;
  description?: string;
  ogImage?: string;
}

export interface ScrapeData {
  url: string;
  screenshot?: string;
  markdown?: string;
  html?: string;
  rawHtml?: string;
  links?: string[];
  branding?: BrandingData;
  metadata?: ScrapeMetadata;
}

export interface ScrapeResult {
  success: boolean;
  data: ScrapeData;
}
