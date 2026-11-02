
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Building2,
  Check,
  ChevronDown,
  KeyRound,
  Loader2,
  Plus,
  RefreshCw,
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Users,
  UsersRound,
} from "lucide-react";
import Link from "next/link";

type Team = {
  id: number;
  name: string;
  is_active: boolean;
  created_at?: string;
};

type Employee = {
  id: number;
  name: string;
  status?: string | null;
};

type Property = {
  id: number;
  name: string;
  address?: string | null;
};

type MemberAssignment = {
  team_id: number;
  employee_id: number;
};

type PropertyAssignment = {
  team_id: number;
  property_id: number;
};

type DashboardData = {
  teams: Team[];
  employees: Employee[];
  properties: Property[];
  members: MemberAssignment[];
  propertyAssignments: PropertyAssignment[];
};

const emptyData: DashboardData = {
  teams: [],
  employees: [],
  properties: [],
  members: [],
  propertyAssignments: [],
};

export default function TeamManagementPage() {
  const [data, setData] = useState<DashboardData>(emptyData);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [teamName, setTeamName] = useState("");
  const [teamPassword, setTeamPassword] = useState("");

  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [newPassword, setNewPassword] = useState("");

  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [selectedPropertyId, setSelectedPropertyId] = useState("");

  const [activeTab, setActiveTab] = useState<"employees" | "properties">(
    "employees"
  );

  const selectedTeam = useMemo(
    () => data.teams.find((team) => team.id === selectedTeamId) ?? null,
    [data.teams, selectedTeamId]
  );

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/team-assignments", {
        cache: "no-store",
      });

      const result = await response.json();

      if (response.status === 401 || response.status === 403) {
        window.location.href = "/office-login";
        return;
      }

      if (!response.ok) {
        throw new Error(result.error || "Unable to load team management.");
      }

      setData({
        teams: result.teams ?? [],
        employees: result.employees ?? [],
        properties: result.properties ?? [],
        members: result.members ?? [],
        propertyAssignments: result.propertyAssignments ?? [],
      });

      if (
        selectedTeamId &&
        !(result.teams ?? []).some(
          (team: Team) => team.id === selectedTeamId
        )
      ) {
        setSelectedTeamId(null);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load team data."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function showMessage(text: string) {
    setMessage(text);
    setError("");
  }

  async function apiRequest(
    url: string,
    method: string,
    body: Record<string, unknown>
  ) {
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Request failed.");
    }

    return result;
  }

  async function createTeam(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!teamName.trim() || teamPassword.length < 8) {
      setError("Enter a team name and a password of at least 8 characters.");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      await apiRequest("/api/teams", "POST", {
        name: teamName.trim(),
        password: teamPassword,
      });

      setTeamName("");
      setTeamPassword("");
      showMessage("Team created successfully.");
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create team.");
    } finally {
      setSaving(false);
    }
  }

  async function updateTeamPassword() {
    if (!selectedTeam || newPassword.length < 8) {
      setError("The new password must have at least 8 characters.");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      await apiRequest("/api/teams", "PATCH", {
        id: selectedTeam.id,
        password: newPassword,
      });

      setNewPassword("");
      showMessage("Team password updated successfully.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to update password."
      );
    } finally {
      setSaving(false);
    }
  }

  async function toggleTeam(team: Team) {
    const action = team.is_active ? "deactivate" : "activate";

    if (
      !window.confirm(
        `Are you sure you want to ${action} ${team.name}?`
      )
    ) {
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      await apiRequest("/api/teams", "PATCH", {
        id: team.id,
        is_active: !team.is_active,
      });

      showMessage(
        team.is_active
          ? "Team deactivated."
          : "Team activated successfully."
      );

      await loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to update team."
      );
    } finally {
      setSaving(false);
    }
  }

  async function assignEmployee() {
    if (!selectedTeam || !selectedEmployeeId) return;

    setSaving(true);
    setError("");
    setMessage("");

    try {
      await apiRequest("/api/team-assignments", "POST", {
        action: "assign_employee",
        teamId: selectedTeam.id,
        employeeId: Number(selectedEmployeeId),
      });

      setSelectedEmployeeId("");
      showMessage("Cleaner assigned to the team.");
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to assign cleaner."
      );
    } finally {
      setSaving(false);
    }
  }

  async function removeEmployee(employeeId: number) {
    if (!selectedTeam) return;

    if (!window.confirm("Remove this cleaner from the selected team?")) {
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      await apiRequest("/api/team-assignments", "DELETE", {
        action: "remove_employee",
        teamId: selectedTeam.id,
        employeeId,
      });

      showMessage("Cleaner removed from the team.");
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to remove cleaner."
      );
    } finally {
      setSaving(false);
    }
  }

  async function assignProperty() {
    if (!selectedTeam || !selectedPropertyId) return;

    const propertyId = Number(selectedPropertyId);
    const previousAssignment = data.propertyAssignments.find(
      (assignment) => assignment.property_id === propertyId
    );

    const previousTeam = data.teams.find(
      (team) => team.id === previousAssignment?.team_id
    );

    if (
      previousAssignment &&
      previousAssignment.team_id !== selectedTeam.id
    ) {
      const confirmed = window.confirm(
        `This property is currently assigned to ${previousTeam?.name || "another team"}. Move it to ${selectedTeam.name}?`
      );

      if (!confirmed) return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      await apiRequest("/api/team-assignments", "POST", {
        action: "assign_property",
        teamId: selectedTeam.id,
        propertyId,
      });

      setSelectedPropertyId("");
      showMessage("Property assigned successfully.");
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to assign property."
      );
    } finally {
      setSaving(false);
    }
  }

  async function removeProperty(propertyId: number) {
    if (!selectedTeam) return;

    if (!window.confirm("Remove this property from the selected team?")) {
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      await apiRequest("/api/team-assignments", "DELETE", {
        action: "remove_property",
        teamId: selectedTeam.id,
        propertyId,
      });

      showMessage("Property removed from the team.");
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to remove property."
      );
    } finally {
      setSaving(false);
    }
  }

  const teamMembers = selectedTeam
    ? data.members.filter((member) => member.team_id === selectedTeam.id)
    : [];

  const teamProperties = selectedTeam
    ? data.propertyAssignments.filter(
        (assignment) => assignment.team_id === selectedTeam.id
      )
    : [];

  const availableEmployees = data.employees.filter(
    (employee) =>
      !teamMembers.some((member) => member.employee_id === employee.id)
  );

  const availableProperties = data.properties.filter(
    (property) => {
      const assignment = data.propertyAssignments.find(
        (item) => item.property_id === property.id
      );

      return assignment?.team_id !== selectedTeam?.id;
    }
  );

  const employeeName = (id: number) =>
    data.employees.find((employee) => employee.id === id)?.name ||
    "Unknown cleaner";

  const propertyName = (id: number) =>
    data.properties.find((property) => property.id === id)?.name ||
    "Unknown property";

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F4F7FB]">
        <Loader2 className="h-10 w-10 animate-spin text-[#2E7BBE]" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F4F7FB] text-[#172A3F]">
      <div className="mx-auto max-w-[1500px] px-5 py-7 md:px-9">

        <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link
              href="/dashboard"
              className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-[#2E7BBE]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Command Center
            </Link>

            <p className="text-xs font-bold uppercase tracking-[2px] text-[#2E7BBE]">
              PURESPACE COMMAND CENTER
            </p>

            <h1 className="mt-2 text-3xl font-black tracking-tight md:text-4xl">
              Team Management
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Manage teams, cleaners and property assignments.
            </p>
          </div>

          <button
            onClick={loadData}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 shadow-sm hover:border-[#2E7BBE] hover:text-[#2E7BBE] disabled:opacity-50"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>

        {message && (
          <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {error}
          </div>
        )}

        {/* CREATE TEAM */}
        <section className="mb-8 rounded-[26px] border border-white bg-white p-6 shadow-sm md:p-7">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EAF4FE] text-[#2E7BBE]">
              <Plus className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Create a new team</h2>
              <p className="text-sm text-slate-500">
                Each team has its own shared manager password.
              </p>
            </div>
          </div>

          <form
            onSubmit={createTeam}
            className="grid gap-4 md:grid-cols-[1fr_1fr_auto]"
          >
            <input
              value={teamName}
              onChange={(event) => setTeamName(event.target.value)}
              placeholder="Team name"
              maxLength={100}
              required
              className="min-w-0 rounded-xl border border-slate-200 bg-[#FAFCFE] px-4 py-3 text-sm outline-none transition focus:border-[#2E7BBE]"
            />

            <input
              value={teamPassword}
              onChange={(event) => setTeamPassword(event.target.value)}
              placeholder="Shared team password (8+ characters)"
              type="password"
              minLength={8}
              maxLength={256}
              required
              className="min-w-0 rounded-xl border border-slate-200 bg-[#FAFCFE] px-4 py-3 text-sm outline-none transition focus:border-[#2E7BBE]"
            />

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2E7BBE] px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#23649D] disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              Create Team
            </button>
          </form>
        </section>

        {/* TEAM LIST AND MANAGEMENT */}
        <div className="grid gap-6 xl:grid-cols-[360px_1fr]">

          <section className="rounded-[26px] border border-white bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">Your teams</h2>
                <p className="mt-1 text-xs text-slate-500">
                  {data.teams.length} teams created
                </p>
              </div>

              <UsersRound className="h-6 w-6 text-[#2E7BBE]" />
            </div>

            {data.teams.length === 0 ? (
              <div className="rounded-xl bg-[#F7FAFD] px-4 py-8 text-center">
                <Users className="mx-auto h-8 w-8 text-slate-300" />
                <p className="mt-3 text-sm font-semibold text-slate-600">
                  No teams yet
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Create your first team above.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {data.teams.map((team) => (
                  <button
                    key={team.id}
                    onClick={() => {
                      setSelectedTeamId(team.id);
                      setNewPassword("");
                      setMessage("");
                      setError("");
                    }}
                    className={`w-full rounded-2xl border p-4 text-left transition ${
                      selectedTeamId === team.id
                        ? "border-[#2E7BBE] bg-[#EDF6FD] shadow-sm"
                        : "border-slate-100 bg-white hover:border-[#C9DFF1] hover:bg-[#FAFCFE]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EAF4FE] text-[#2E7BBE]">
                          <UsersRound className="h-5 w-5" />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate font-bold text-[#172A3F]">
                            {team.name}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {data.members.filter(
                              (member) => member.team_id === team.id
                            ).length}{" "}
                            cleaners ·{" "}
                            {data.propertyAssignments.filter(
                              (assignment) => assignment.team_id === team.id
                            ).length}{" "}
                            properties
                          </p>
                        </div>
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${
                          team.is_active
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {team.is_active ? "ACTIVE" : "INACTIVE"}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* SELECTED TEAM */}
          <section className="min-w-0 rounded-[26px] border border-white bg-white p-5 shadow-sm md:p-7">
            {!selectedTeam ? (
              <div className="flex min-h-[350px] flex-col items-center justify-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[#EAF4FE] text-[#2E7BBE]">
                  <ShieldCheck className="h-8 w-8" />
                </div>
                <h2 className="mt-5 text-xl font-bold">
                  Select a team
                </h2>
                <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                  Choose a team from the list to manage its password,
                  cleaners and assigned properties.
                </p>
              </div>
            ) : (
              <>
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-6">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[2px] text-[#2E7BBE]">
                      Selected team
                    </p>
                    <h2 className="mt-2 text-2xl font-black">
                      {selectedTeam.name}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Team ID: {selectedTeam.id}
                    </p>
                  </div>

                  <button
                    onClick={() => toggleTeam(selectedTeam)}
                    disabled={saving}
                    className={`inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition disabled:opacity-50 ${
                      selectedTeam.is_active
                        ? "bg-red-50 text-red-600 hover:bg-red-100"
                        : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                    }`}
                  >
                    {selectedTeam.is_active ? (
                      <ToggleRight className="h-5 w-5" />
                    ) : (
                      <ToggleLeft className="h-5 w-5" />
                    )}
                    {selectedTeam.is_active ? "Deactivate team" : "Activate team"}
                  </button>
                </div>

                {/* PASSWORD */}
                <div className="mt-6 rounded-2xl border border-[#DCEAF6] bg-[#F7FBFF] p-5">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#2E7BBE] shadow-sm">
                      <KeyRound className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold">Team access password</h3>
                      <p className="text-xs text-slate-500">
                        Change the shared password for this team.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(event) => setNewPassword(event.target.value)}
                      placeholder="Enter new password (8+ characters)"
                      minLength={8}
                      maxLength={256}
                      className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#2E7BBE]"
                    />

                    <button
                      onClick={updateTeamPassword}
                      disabled={saving || newPassword.length < 8}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2E7BBE] px-5 py-3 text-sm font-bold text-white hover:bg-[#23649D] disabled:opacity-50"
                    >
                      <Check className="h-4 w-4" />
                      Update password
                    </button>
                  </div>
                </div>

                {/* TABS */}
                <div className="mt-8 flex flex-wrap gap-2 border-b border-slate-100 pb-3">
                  <button
                    onClick={() => setActiveTab("employees")}
                    className={`rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                      activeTab === "employees"
                        ? "bg-[#2E7BBE] text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    <Users className="mr-2 inline h-4 w-4" />
                    Cleaners ({teamMembers.length})
                  </button>

                  <button
                    onClick={() => setActiveTab("properties")}
                    className={`rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                      activeTab === "properties"
                        ? "bg-[#2E7BBE] text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    <Building2 className="mr-2 inline h-4 w-4" />
                    Properties ({teamProperties.length})
                  </button>
                </div>

                {/* CLEANERS */}
                {activeTab === "employees" && (
                  <div className="pt-5">
                    <div className="mb-4">
                      <h3 className="font-bold">Assign cleaners</h3>
                      <p className="mt-1 text-xs text-slate-500">
                        A cleaner can belong to more than one team.
                      </p>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row">
                      <div className="relative min-w-0 flex-1">
                        <select
                          value={selectedEmployeeId}
                          onChange={(event) =>
                            setSelectedEmployeeId(event.target.value)
                          }
                          className="w-full appearance-none rounded-xl border border-slate-200 bg-[#FAFCFE] px-4 py-3 pr-10 text-sm outline-none focus:border-[#2E7BBE]"
                        >
                          <option value="">Select a cleaner</option>
                          {availableEmployees.map((employee) => (
                            <option key={employee.id} value={employee.id}>
                              {employee.name}
                              {employee.status ? ` · ${employee.status}` : ""}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-3.5 h-4 w-4 text-slate-400" />
                      </div>

                      <button
                        onClick={assignEmployee}
                        disabled={saving || !selectedEmployeeId}
                        className="rounded-xl bg-[#2E7BBE] px-5 py-3 text-sm font-bold text-white hover:bg-[#23649D] disabled:opacity-50"
                      >
                        Assign cleaner
                      </button>
                    </div>

                    <div className="mt-5 space-y-2">
                      {teamMembers.length === 0 ? (
                        <p className="rounded-xl bg-[#F7FAFD] p-5 text-center text-sm text-slate-500">
                          No cleaners assigned to this team yet.
                        </p>
                      ) : (
                        teamMembers.map((member) => (
                          <div
                            key={member.employee_id}
                            className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 p-4"
                          >
                            <div className="flex min-w-0 items-center gap-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EAF4FE] text-[#2E7BBE]">
                                <Users className="h-4 w-4" />
                              </div>
                              <p className="truncate text-sm font-semibold">
                                {employeeName(member.employee_id)}
                              </p>
                            </div>

                            <button
                              onClick={() =>
                                removeEmployee(member.employee_id)
                              }
                              disabled={saving}
                              title="Remove cleaner from team"
                              className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* PROPERTIES */}
                {activeTab === "properties" && (
                  <div className="pt-5">
                    <div className="mb-4">
                      <h3 className="font-bold">Assign properties</h3>
                      <p className="mt-1 text-xs text-slate-500">
                        Each property can belong to only one team at a time.
                      </p>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row">
                      <div className="relative min-w-0 flex-1">
                        <select
                          value={selectedPropertyId}
                          onChange={(event) =>
                            setSelectedPropertyId(event.target.value)
                          }
                          className="w-full appearance-none rounded-xl border border-slate-200 bg-[#FAFCFE] px-4 py-3 pr-10 text-sm outline-none focus:border-[#2E7BBE]"
                        >
                          <option value="">Select a property</option>
                          {availableProperties.map((property) => (
                            <option key={property.id} value={property.id}>
                              {property.name}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-3.5 h-4 w-4 text-slate-400" />
                      </div>

                      <button
                        onClick={assignProperty}
                        disabled={saving || !selectedPropertyId}
                        className="rounded-xl bg-[#2E7BBE] px-5 py-3 text-sm font-bold text-white hover:bg-[#23649D] disabled:opacity-50"
                      >
                        Assign property
                      </button>
                    </div>

                    <div className="mt-5 space-y-2">
                      {teamProperties.length === 0 ? (
                        <p className="rounded-xl bg-[#F7FAFD] p-5 text-center text-sm text-slate-500">
                          No properties assigned to this team yet.
                        </p>
                      ) : (
                        teamProperties.map((assignment) => {
                          const property = data.properties.find(
                            (item) => item.id === assignment.property_id
                          );

                          return (
                            <div
                              key={assignment.property_id}
                              className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 p-4"
                            >
                              <div className="flex min-w-0 items-center gap-3">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EAF4FE] text-[#2E7BBE]">
                                  <Building2 className="h-4 w-4" />
                                </div>
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-semibold">
                                    {propertyName(assignment.property_id)}
                                  </p>
                                  {property?.address && (
                                    <p className="mt-1 truncate text-xs text-slate-400">
                                      {property.address}
                                    </p>
                                  )}
                                </div>
                              </div>

                              <button
                                onClick={() =>
                                  removeProperty(assignment.property_id)
                                }
                                disabled={saving}
                                title="Remove property from team"
                                className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </section>
        </div>

        <footer className="mt-10 border-t border-slate-200 pt-5 text-center text-xs text-slate-400">
          PURESPACE CLEANING · COMMAND CENTER
        </footer>
      </div>
    </main>
  );
}
