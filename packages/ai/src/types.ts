export interface AIConfig {
  proxyUrl: string;
}

export interface TextContent {
  type: "text";
  text: string;
}

export interface ImageUrlSource {
  type: "url";
  url: string;
}

export interface ImageBase64Source {
  type: "base64";
  media_type: string;
  data: string;
}

export interface ImageContent {
  type: "image";
  source: ImageUrlSource | ImageBase64Source;
}

export type ContentBlock = TextContent | ImageContent;

export interface Message {
  role: "user" | "assistant";
  content: string | ContentBlock[];
}

export interface GenerateOptions {
  model?: string;
  system?: string;
  messages: Message[];
  maxTokens?: number;
  temperature?: number;
  schema?: Record<string, unknown>;
}

export interface GenerateResult<T = unknown> {
  content: string;
  parsed?: T;
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
}
