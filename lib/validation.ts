import { NextResponse } from "next/server";

export interface ValidationError {
  field: string;
  message: string;
}

export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; errors: ValidationError[] };

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const HTML_TAG_REGEX = /<[^>]*>/g;

/**
 * Strip HTML tags and escape special characters to prevent stored XSS.
 * React auto-escapes on render, but this adds defense-in-depth at storage time.
 */
export function sanitizeText(input: string): string {
  return input
    .replace(HTML_TAG_REGEX, "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

function requireString(
  value: unknown,
  field: string,
  maxLength: number,
  errors: ValidationError[]
): string | null {
  if (typeof value !== "string" || value.trim().length === 0) {
    errors.push({ field, message: `${field} is required` });
    return null;
  }
  const trimmed = value.trim();
  if (trimmed.length > maxLength) {
    errors.push({
      field,
      message: `${field} must be at most ${maxLength} characters`,
    });
    return null;
  }
  return sanitizeText(trimmed);
}

function optionalString(
  value: unknown,
  field: string,
  maxLength: number,
  errors: ValidationError[]
): string | null {
  if (value === undefined || value === null || value === "") {
    return null;
  }
  if (typeof value !== "string") {
    errors.push({ field, message: `${field} must be a string` });
    return null;
  }
  const trimmed = value.trim();
  if (trimmed.length === 0) return null;
  if (trimmed.length > maxLength) {
    errors.push({
      field,
      message: `${field} must be at most ${maxLength} characters`,
    });
    return null;
  }
  return sanitizeText(trimmed);
}

// --- Field validators ---

export function validateTitle(
  value: unknown,
  errors: ValidationError[]
): string | null {
  return requireString(value, "title", 500, errors);
}

export function validateDescription(
  value: unknown,
  errors: ValidationError[]
): string | null {
  return optionalString(value, "description", 5000, errors);
}

export function validateNickname(
  value: unknown,
  errors: ValidationError[]
): string | null {
  return requireString(value, "nickname", 100, errors);
}

export function validateTagName(
  value: unknown,
  errors: ValidationError[]
): string | null {
  return requireString(value, "tagName", 50, errors);
}

export function validateProps(
  value: unknown,
  errors: ValidationError[]
): string[] | null {
  if (value === undefined || value === null) return null;
  if (!Array.isArray(value)) {
    errors.push({ field: "props", message: "props must be an array" });
    return null;
  }
  if (value.length > 20) {
    errors.push({ field: "props", message: "props must have at most 20 items" });
    return null;
  }
  const cleaned: string[] = [];
  for (let i = 0; i < value.length; i++) {
    const item = value[i];
    if (typeof item !== "string") {
      errors.push({ field: "props", message: `props[${i}] must be a string` });
      return null;
    }
    const trimmed = item.trim();
    if (trimmed.length === 0) continue;
    if (trimmed.length > 100) {
      errors.push({ field: "props", message: `props[${i}] must be at most 100 characters` });
      return null;
    }
    cleaned.push(sanitizeText(trimmed));
  }
  return cleaned;
}

export function validateEmail(
  value: unknown,
  errors: ValidationError[]
): string | null {
  if (typeof value !== "string" || value.trim().length === 0) {
    errors.push({ field: "email", message: "Email is required" });
    return null;
  }
  const email = value.trim().toLowerCase();
  if (!EMAIL_REGEX.test(email)) {
    errors.push({ field: "email", message: "Invalid email address" });
    return null;
  }
  if (email.length > 320) {
    errors.push({
      field: "email",
      message: "Email must be at most 320 characters",
    });
    return null;
  }
  return email;
}

/**
 * Return a 400 response with validation errors.
 */
export function validationErrorResponse(
  errors: ValidationError[]
): NextResponse {
  return NextResponse.json({ errors }, { status: 400 });
}
