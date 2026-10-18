
import "server-only";

import {
  createHmac,
  timingSafeEqual,
} from "node:crypto";

export type SessionRole = "office" | "owner";

export type SessionPayload = {
  role: SessionRole;
  ownerId?: number;
  exp: number;
};

const COOKIE_NAME = "purespace_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 8;

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET is missing or too short");
  }

  return secret;
}

function sign(value: string): string {
  return createHmac("sha256", getSecret())
    .update(value)
    .digest("base64url");
}

export function createSessionToken(
  role: SessionRole,
  ownerId?: number
): string {
  if (role === "owner" && (!Number.isSafeInteger(ownerId) || ownerId! <= 0)) {
    throw new Error("A valid ownerId is required");
  }

  if (role === "office" && ownerId !== undefined) {
    throw new Error("Office sessions cannot contain an ownerId");
  }

  const payload: SessionPayload = {
    role,
    ...(role === "owner" ? { ownerId } : {}),
    exp: Math.floor(Date.now() / 1000) + SESSION_DURATION_SECONDS,
  };

  const encodedPayload = Buffer.from(
    JSON.stringify(payload)
  ).toString("base64url");

  return `${encodedPayload}.${sign(encodedPayload)}`;
}

export function verifySessionToken(
  token: string
): SessionPayload | null {
  try {
    const parts = token.split(".");

    if (parts.length !== 2) return null;

    const [encodedPayload, suppliedSignature] = parts;
    const expectedSignature = sign(encodedPayload);

    const supplied = Buffer.from(suppliedSignature);
    const expected = Buffer.from(expectedSignature);

    if (
      supplied.length !== expected.length ||
      !timingSafeEqual(supplied, expected)
    ) {
      return null;
    }

    const payload = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8")
    ) as SessionPayload;

    if (
      (payload.role !== "office" && payload.role !== "owner") ||
      !Number.isSafeInteger(payload.exp) ||
      payload.exp <= Math.floor(Date.now() / 1000)
    ) {
      return null;
    }

    if (
      payload.role === "owner" &&
      (!Number.isSafeInteger(payload.ownerId) || payload.ownerId! <= 0)
    ) {
      return null;
    }

    if (payload.role === "office" && payload.ownerId !== undefined) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export const sessionCookie = {
  name: COOKIE_NAME,
  maxAge: SESSION_DURATION_SECONDS,
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

import { cookies } from "next/headers";

export async function getCurrentSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  return verifySessionToken(token);
}
