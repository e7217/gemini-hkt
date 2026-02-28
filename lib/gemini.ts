import "server-only";
import { GoogleGenAI } from "@google/genai";
import { z } from "zod";

// ─── Constants (T004) ────────────────────────────────────────────────────────

/**
 * Standard Gemini model for the application.
 */
export const GEMINI_MODEL = "gemini-2.5-flash" as const;

/**
 * Timeout in milliseconds for each API call attempt.
 */
export const TIMEOUT_MS = 15_000;

/**
 * Maximum number of retry attempts for transient errors.
 */
export const MAX_RETRIES = 3;

/**
 * HTTP status codes that trigger a retry attempt.
 */
export const RETRYABLE_STATUS_CODES = [429, 500, 503] as const;

/**
 * Base delay in milliseconds for exponential backoff.
 */
export const BASE_DELAY_MS = 1_000;

// ─── Error Classes (T005-T008) ────────────────────────────────────────────────

/**
 * Type discriminator for all Gemini errors.
 */
export type GeminiErrorType =
  | "GeminiTimeoutError"
  | "GeminiRetryExhaustedError"
  | "GeminiValidationError"
  | "GeminiApiError";

/**
 * Union type of all possible errors from callGemini().
 */
export type AnyGeminiError =
  | GeminiTimeoutError
  | GeminiRetryExhaustedError
  | GeminiValidationError
  | GeminiApiError;

/**
 * Thrown when a Gemini API call exceeds TIMEOUT_MS. (T005)
 */
export class GeminiTimeoutError extends Error {
  override readonly name = "GeminiTimeoutError";
  readonly attemptNumber: number;
  readonly timeoutMs: number;

  constructor(attemptNumber: number, timeoutMs: number = TIMEOUT_MS) {
    super(`Gemini API call timed out after ${timeoutMs}ms (attempt ${attemptNumber})`);
    this.attemptNumber = attemptNumber;
    this.timeoutMs = timeoutMs;
    Object.setPrototypeOf(this, GeminiTimeoutError.prototype);
  }
}

/**
 * Thrown when all MAX_RETRIES attempts fail. (T006)
 */
export class GeminiRetryExhaustedError extends Error {
  override readonly name = "GeminiRetryExhaustedError";
  readonly cause: Error;
  readonly totalAttempts: number;

  constructor(lastError: Error, totalAttempts: number) {
    super(`Gemini API retries exhausted after ${totalAttempts} attempts. Last error: ${lastError.message}`);
    this.cause = lastError;
    this.totalAttempts = totalAttempts;
    Object.setPrototypeOf(this, GeminiRetryExhaustedError.prototype);
  }
}

/**
 * Thrown when the Gemini response fails Zod schema validation. (T007)
 */
export class GeminiValidationError extends Error {
  override readonly name = "GeminiValidationError";
  readonly cause: z.ZodError;
  readonly issues: z.ZodIssue[];

  constructor(zodError: z.ZodError) {
    super(`Gemini response failed validation: ${zodError.message}`);
    this.cause = zodError;
    this.issues = zodError.issues;
    Object.setPrototypeOf(this, GeminiValidationError.prototype);
  }
}

/**
 * Thrown for API errors (e.g., HTTP 400, 401, 403, or retryable errors that exhausted retries). (T008)
 */
export class GeminiApiError extends Error {
  override readonly name = "GeminiApiError";
  readonly statusCode: number;
  readonly isRetryable: boolean;

  constructor(statusCode: number, message: string, isRetryable: boolean = false) {
    super(`Gemini API error (${statusCode}): ${message}`);
    this.statusCode = statusCode;
    this.isRetryable = isRetryable;
    Object.setPrototypeOf(this, GeminiApiError.prototype);
  }
}

// ─── Internal Utilities (T010-T013) ──────────────────────────────────────────

let client: GoogleGenAI | null = null;

/**
 * Singleton getClient() function (T009)
 */
export function getClient(): GoogleGenAI {
  if (client) return client;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not set in environment variables. " +
      "Please add it to .env.local for server-side use."
    );
  }

  client = new GoogleGenAI({ apiKey });
  return client;
}

/**
 * Internal delay utility (T010)
 */
export async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Internal isRetryableError utility (T011)
 */
export function isRetryableError(err: unknown): boolean {
  if (err instanceof GeminiTimeoutError) return true;
  
  // @google/genai SDK errors usually have a status or we check message
  const error = err as any;
  const status = error?.status || error?.statusCode || error?.response?.status;
  
  if (status && (RETRYABLE_STATUS_CODES as readonly number[]).includes(status)) {
    return true;
  }

  const message = error?.message?.toLowerCase() || "";
  if (message.includes("429") || message.includes("500") || message.includes("503")) {
    return true;
  }

  return false;
}

/**
 * Wraps a promise with a timeout (T012)
 */
async function withTimeout<T>(promise: Promise<T>, attemptNumber: number): Promise<T> {
  let timeoutId: NodeJS.Timeout;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new GeminiTimeoutError(attemptNumber));
    }, TIMEOUT_MS);
  });

  try {
    const result = await Promise.race([promise, timeoutPromise]);
    return result;
  } finally {
    // @ts-ignore - timeoutId is initialized in timeoutPromise executor
    if (timeoutId) clearTimeout(timeoutId);
  }
}

/**
 * Builds the generate content request (T013)
 */
function buildGenerateContentRequest(prompt: string, systemInstruction?: string) {
  const config: any = {
    responseMimeType: "application/json",
  };
  if (systemInstruction) {
    config.systemInstruction = systemInstruction;
  }
  return {
    model: GEMINI_MODEL,
    contents: prompt,
    config: config
  };
}

// ─── Public API (T014-T015) ──────────────────────────────────────────────────

export interface GeminiCallParams<T> {
  prompt: string;
  systemInstruction?: string;
  schema: z.ZodSchema<T>;
  useCache?: boolean;
}

/**
 * Performs a single attempt to call Gemini API.
 * Handles:
 * - SDK client initialization
 * - Building request with JSON mode
 * - Timeout enforcement (T012, T021)
 * - JSON parsing and initial error wrapping (T026)
 */
async function callGeminiOnce<T>(
  params: GeminiCallParams<T>,
  attemptNumber: number
): Promise<T> {
  const { prompt, systemInstruction, schema } = params;
  const ai = getClient();
  
  const request = buildGenerateContentRequest(prompt, systemInstruction);
  
  try {
    // Wrap with timeout (T021)
    const result = await withTimeout(ai.models.generateContent(request), attemptNumber);
    
    const text = result.text;
    if (!text) {
      throw new Error("Gemini returned an empty response");
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      throw new Error(`Failed to parse Gemini response as JSON: ${text}`);
    }

    const validated = schema.safeParse(parsed);
    if (!validated.success) {
      throw new GeminiValidationError(validated.error);
    }

    return validated.data;
  } catch (err) {
    if (err instanceof GeminiTimeoutError || err instanceof GeminiValidationError) {
      throw err;
    }

    // Extract status code if available (T020)
    const error = err as any;
    const statusCode = error?.status || error?.statusCode || error?.response?.status || 500;
    
    // For T020: Wrap non-retryable errors in GeminiApiError
    // isRetryableError(err) will be used by the retry loop in callGemini()
    throw new GeminiApiError(statusCode, error?.message || "Unknown Gemini API error", isRetryableError(err));
  }
}

/**
 * Primary Gemini API wrapper function (T018 - with Retry Loop)
 */
export async function callGemini<T>(params: GeminiCallParams<T>): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES + 1; attempt++) {
    try {
      return await callGeminiOnce(params, attempt);
    } catch (err) {
      lastError = err as Error;

      // If it's a validation error, don't retry (T024, US4)
      if (err instanceof GeminiValidationError) {
        throw err;
      }

      // Check if we should retry (T018, T020)
      const canRetry = attempt <= MAX_RETRIES && isRetryableError(err);
      
      if (!canRetry) {
        break;
      }

      // Exponential backoff with jitter (T018)
      // delay = BASE_DELAY_MS * 2^(attempt-1) + random(0, 1000)
      const baseDelay = BASE_DELAY_MS * Math.pow(2, attempt - 1);
      const jitter = Math.random() * 1000;
      const totalDelay = baseDelay + jitter;

      if (err instanceof GeminiTimeoutError) {
        console.warn(
          `[Gemini] Attempt ${attempt} timed out after ${TIMEOUT_MS}ms. Retrying in ${Math.round(totalDelay)}ms...`
        );
      } else {
        const statusCode = (err as any)?.statusCode || "Unknown";
        console.warn(
          `[Gemini] Attempt ${attempt} failed (${statusCode}). Retrying in ${Math.round(totalDelay)}ms...`
        );
      }

      await delay(totalDelay);
    }
  }

  // If we reach here, it means we exhausted retries or hit a non-retryable error
  if (lastError instanceof GeminiApiError || lastError instanceof GeminiTimeoutError) {
    if (isRetryableError(lastError)) {
      throw new GeminiRetryExhaustedError(lastError, MAX_RETRIES + 1);
    }
    throw lastError;
  }

  throw lastError || new Error("Unknown error in callGemini");
}
