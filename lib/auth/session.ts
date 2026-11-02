import "server-only";

import {
  createHmac,
  timingSafeEqual,
} from "node:crypto";

import { cookies } from "next/headers";

export type SessionRole = "office" | "owner" | "team" | "cleaner";

export type SessionPayload = {
  role: SessionRole;
  ownerId?: number;
  teamId?: number;
  teamAuthVersion?: string;
  employeeId?: number;
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
  ownerId?: number,
  teamId?: number,
  teamAuthVersion?: string,
  employeeId?: number
): string {
  if (role === "owner" && (!Number.isSafeInteger(ownerId) || ownerId! <= 0)) {
    throw new Error("A valid ownerId is required");
  }

  if (role === "team" && (!Number.isSafeInteger(teamId) || teamId! <= 0)) {
    throw new Error("A valid teamId is required");
  }

  if (role === "cleaner" && (!Number.isSafeInteger(employeeId) || employeeId! <= 0)) {
    throw new Error("A valid employeeId is required");
  }

  if (role === "office" && (
    ownerId !== undefined ||
    teamId !== undefined ||
    employeeId !== undefined
  )) {
    throw new Error("Office sessions cannot contain IDs");
  }

  if (role === "owner" && (
    teamId !== undefined ||
    employeeId !== undefined
  )) {
    throw new Error("Owner sessions cannot contain teamId or employeeId");
  }

  if (role === "team" && (
    ownerId !== undefined ||
    employeeId !== undefined
  )) {
    throw new Error("Team sessions cannot contain ownerId or employeeId");
  }

  if (role === "cleaner" && (
    ownerId !== undefined ||
    teamId !== undefined ||
    teamAuthVersion !== undefined
  )) {
    throw new Error("Cleaner sessions cannot contain other role IDs");
  }

  if (
    role === "team" &&
    (
      typeof teamAuthVersion !== "string" ||
      !/^[a-f0-9]{64}$/i.test(teamAuthVersion)
    )
  ) {
    throw new Error("A valid teamAuthVersion is required");
  }

  if (role !== "team" && teamAuthVersion !== undefined) {
    throw new Error("Only team sessions can contain a teamAuthVersion");
  }

  if (role !== "cleaner" && employeeId !== undefined) {
    throw new Error("Only cleaner sessions can contain an employeeId");
  }

  const payload: SessionPayload = {
    role,
    ...(role === "owner" ? { ownerId } : {}),
    ...(role === "team" ? { teamId, teamAuthVersion } : {}),
    ...(role === "cleaner" ? { employeeId } : {}),
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
      !["office", "owner", "team", "cleaner"].includes(payload.role) ||
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

    if (
      payload.role === "team" &&
      (
        !Number.isSafeInteger(payload.teamId) ||
        payload.teamId! <= 0 ||
        typeof payload.teamAuthVersion !== "string" ||
        !/^[a-f0-9]{64}$/i.test(payload.teamAuthVersion)
      )
    ) {
      return null;
    }

    if (
      payload.role === "cleaner" &&
      (!Number.isSafeInteger(payload.employeeId) || payload.employeeId! <= 0)
    ) {
      return null;
    }

    if (payload.role === "office" && (
      payload.ownerId !== undefined ||
      payload.teamId !== undefined ||
      payload.teamAuthVersion !== undefined ||
      payload.employeeId !== undefined
    )) {
      return null;
    }

    if (payload.role === "owner" && (
      payload.teamId !== undefined ||
      payload.teamAuthVersion !== undefined ||
      payload.employeeId !== undefined
    )) {
      return null;
    }

    if (payload.role === "team" && (
      payload.ownerId !== undefined ||
      payload.employeeId !== undefined
    )) {
      return null;
    }

    if (payload.role === "cleaner" && (
      payload.ownerId !== undefined ||
      payload.teamId !== undefined ||
      payload.teamAuthVersion !== undefined
    )) {
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

export async function getCurrentSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  return verifySessionToken(token);
}