/**
 * Contract: Error taxonomy for Gemini SDK wrapper
 * Feature: BE-04 Gemini SDK 세팅 + 래퍼 유틸
 *
 * This contract defines the error hierarchy consumed by all downstream features.
 * Callers can use `instanceof` checks to handle specific error types.
 */

import { z } from "zod";

/**
 * Type discriminator for all Gemini errors.
 * Use in switch/exhaustive checks.
 */
export type GeminiErrorType =
  | "GeminiTimeoutError"
  | "GeminiRetryExhaustedError"
  | "GeminiValidationError"
  | "GeminiApiError";

/**
 * Union type of all possible errors from callGemini().
 * Useful for exhaustive error handling:
 *
 * @example
 * ```typescript
 * try {
 *   const result = await callGemini({ ... });
 * } catch (err) {
 *   if (err instanceof GeminiTimeoutError) { ... }
 *   else if (err instanceof GeminiRetryExhaustedError) { ... }
 *   else if (err instanceof GeminiValidationError) { ... }
 *   else if (err instanceof GeminiApiError) { ... }
 *   else throw err; // unexpected error
 * }
 * ```
 */
export type AnyGeminiError =
  | GeminiTimeoutError
  | GeminiRetryExhaustedError
  | GeminiValidationError
  | GeminiApiError;

export declare class GeminiTimeoutError extends Error {
  readonly name: "GeminiTimeoutError";
  readonly attemptNumber: number;
  readonly timeoutMs: number;
  constructor(attemptNumber: number, timeoutMs: number);
}

export declare class GeminiRetryExhaustedError extends Error {
  readonly name: "GeminiRetryExhaustedError";
  readonly cause: Error;
  readonly totalAttempts: number;
  constructor(lastError: Error, totalAttempts: number);
}

export declare class GeminiValidationError extends Error {
  readonly name: "GeminiValidationError";
  readonly cause: z.ZodError;
  readonly issues: z.ZodIssue[];
  constructor(zodError: z.ZodError);
}

export declare class GeminiApiError extends Error {
  readonly name: "GeminiApiError";
  readonly statusCode: number;
  readonly isRetryable: boolean;
  constructor(statusCode: number, message: string);
}
