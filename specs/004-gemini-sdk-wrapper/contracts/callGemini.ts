/**
 * Contract: callGemini wrapper function
 * Feature: BE-04 Gemini SDK 세팅 + 래퍼 유틸
 * File: lib/gemini.ts
 *
 * This contract defines the public API surface of the Gemini SDK wrapper.
 * All downstream features (BE-02, BE-05, etc.) depend on this interface.
 */

import { z } from "zod";

// ─── Constants ──────────────────────────────────────────────────────────────

export const GEMINI_MODEL = "gemini-2.0-flash" as const;
export const TIMEOUT_MS = 15_000; // 15 seconds per API call attempt
export const MAX_RETRIES = 3;
export const RETRYABLE_STATUS_CODES = [429, 500, 503] as const;
export const BASE_DELAY_MS = 1_000; // 1 second base delay for exponential backoff

// ─── Params ─────────────────────────────────────────────────────────────────

export interface GeminiCallParams<T> {
  /**
   * The user prompt to send to Gemini.
   * This is the main input text.
   */
  prompt: string;

  /**
   * Optional system instruction for the model.
   * Used to set behavior, tone, or output constraints.
   */
  systemInstruction?: string;

  /**
   * Zod schema used to validate and parse the Gemini JSON response.
   * The wrapper will throw GeminiValidationError if the response
   * does not match this schema.
   */
  schema: z.ZodSchema<T>;

  /**
   * Future extension: whether to use a cache layer.
   * Currently a no-op; included for extensibility.
   * @default false
   */
  useCache?: boolean;
}

// ─── Errors ─────────────────────────────────────────────────────────────────

/**
 * Thrown when a Gemini API call exceeds TIMEOUT_MS.
 */
export declare class GeminiTimeoutError extends Error {
  readonly name: "GeminiTimeoutError";
  constructor(attemptNumber: number);
}

/**
 * Thrown when all MAX_RETRIES attempts fail.
 */
export declare class GeminiRetryExhaustedError extends Error {
  readonly name: "GeminiRetryExhaustedError";
  readonly cause: Error;
  constructor(lastError: Error, totalAttempts: number);
}

/**
 * Thrown when the Gemini response fails Zod schema validation.
 */
export declare class GeminiValidationError extends Error {
  readonly name: "GeminiValidationError";
  readonly cause: z.ZodError;
  constructor(zodError: z.ZodError);
}

/**
 * Thrown for non-retryable API errors (e.g., HTTP 400, 401, 403).
 */
export declare class GeminiApiError extends Error {
  readonly name: "GeminiApiError";
  readonly statusCode: number;
  constructor(statusCode: number, message: string);
}

// ─── Primary Interface ───────────────────────────────────────────────────────

/**
 * Primary Gemini API wrapper function.
 *
 * Handles:
 * - JSON mode (responseMimeType: application/json)
 * - Exponential backoff retry for HTTP 429/500/503 (max 3 retries)
 * - 15-second timeout per attempt
 * - Zod schema validation of response
 * - Server-side API key protection
 *
 * @throws {GeminiTimeoutError} if any attempt exceeds TIMEOUT_MS
 * @throws {GeminiRetryExhaustedError} if all retries fail
 * @throws {GeminiValidationError} if response fails schema validation
 * @throws {GeminiApiError} for non-retryable API errors
 *
 * @example
 * ```typescript
 * import { callGemini } from "@/lib/gemini";
 * import { PathMapSchema } from "@/lib/schemas";
 *
 * const pathMap = await callGemini({
 *   prompt: "Generate 3 career paths for: becoming a senior engineer",
 *   systemInstruction: "You are a helpful life path coach.",
 *   schema: PathMapSchema,
 * });
 * // pathMap is fully typed as z.infer<typeof PathMapSchema>
 * ```
 */
export declare function callGemini<T>(params: GeminiCallParams<T>): Promise<T>;
