
import "server-only";
import { createHash } from "node:crypto";
import {
  getCurrentSession,
  getTeamSession,
} from "@/lib/auth/session";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

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

export async function requireTeamSession() {
  const session = await getTeamSession();

  if (
    !session ||
    !Number.isSafeInteger(session.teamId) ||
    session.teamId! <= 0
  ) {
    return null;
  }

  const { data: team, error } = await supabaseAdmin
    .from("teams")
    .select("id, is_active, password_hash")
    .eq("id", session.teamId)
    .maybeSingle();

  if (error || !team || !team.is_active) {
    return null;
  }

  const currentAuthVersion = createHash("sha256")
    .update(team.password_hash)
    .digest("hex");

  if (session.teamAuthVersion !== currentAuthVersion) {
    return null;
  }

  return session as typeof session & {
    role: "team";
    teamId: number;
  };
}

export async function requireCleanerSession() {
  const session = await getCurrentSession();

  if (
    !session ||
    session.role !== "cleaner" ||
    !Number.isSafeInteger(session.employeeId) ||
    session.employeeId! <= 0
  ) {
    return null;
  }

  const { data: employee, error } = await supabaseAdmin
    .from("employees")
    .select("id, status")
    .eq("id", session.employeeId)
    .maybeSingle();

  if (error || !employee || employee.status === "Inactive") {
    return null;
  }

  return session as typeof session & {
    role: "cleaner";
    employeeId: number;
  };
}

export async function requireOfficeOrTeamSession() {
  const officeSession = await getCurrentSession();

  if (officeSession?.role === "office") {
    return officeSession;
  }

  return await requireTeamSession();
}
