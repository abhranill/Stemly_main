export interface GenerateRequestBody {
  topic: string;
}

export interface GenerateResponseBody {
  html: string;
}

export interface SimError {
  message: string;
  stack?: string;
  source?: string;
  lineno?: number;
  colno?: number;
}

export interface HealRequestBody {
  topic: string;
  code: string;
  error: SimError;
  attempt: number;
}

export interface HealResponseBody {
  html: string;
}

export interface ApiErrorBody {
  error: string;
}

/** Message shape posted from the sandboxed simulation iframe to the parent window. */
export interface SimMessage {
  source: 'stemly-sim';
  type: 'error' | 'ready';
  payload?: SimError;
}
