import "server-only";

import { getCurrentSession } from "@/lib/auth/session";

export async function requireOfficeSession() {
  const session = await getCurrentSession();

  if (!session || session.role !== "office") {
    return null;
  }

  return session;
}

export async function requireOwnerSession() {
  const session = await getCurrentSession();

  if (
    !session ||
    session.role !== "owner" ||
    !Number.isSafeInteger(session.ownerId) ||
    session.ownerId! <= 0
  ) {
    return null;
  }

  return session as typeof session & {
    role: "owner";
    ownerId: number;
  };
}
