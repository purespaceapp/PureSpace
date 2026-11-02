
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft,
  ArrowRight,
  Users,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
  KeyRound,
  RefreshCw,
} from "lucide-react";

type Team = {
  id: number;
  name: string;
};

export default function TeamsPage() {
  const router = useRouter();

  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loadingTeams, setLoadingTeams] = useState(true);
  const [loggingIn, setLoggingIn] = useState(false);

  const [error, setError] = useState("");

  async function loadTeams() {
    setLoadingTeams(true);
    setError("");

    try {
      const response = await fetch("/api/teams", {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Unable to load teams.");
      }

      const data = await response.json();

      setTeams(Array.isArray(data.teams) ? data.teams : []);
    } catch {
      setError("Unable to load teams. Please try again.");
    } finally {
      setLoadingTeams(false);
    }
  }

  useEffect(() => {
    loadTeams();
  }, []);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!selectedTeam || !password.trim()) {
      setError("Please enter your team password.");
      return;
    }

    setLoggingIn(true);
    setError("");

    try {
      const response = await fetch("/api/team-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          teamId: selectedTeam.id,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Incorrect team password.");
        return;
      }

      router.push("/team-dashboard");
    } catch {
      setError("Unable to connect to the server. Please try again.");
    } finally {
      setLoggingIn(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#F4F8FC] px-5 py-10 text-[#132238]">

      {/* BACKGROUND */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-[450px] w-[450px] rounded-full bg-[#BFEAF0]/35 blur-3xl" />
        <div className="absolute -right-32 bottom-[-150px] h-[500px] w-[500px] rounded-full bg-[#BBD9F5]/40 blur-3xl" />
      </div>

      {/* BACK BUTTON */}

      <button
        onClick={() => router.push("/office")}
        className="absolute left-6 top-6 z-10 flex items-center gap-2 rounded-xl border border-white bg-white/90 px-4 py-3 text-sm font-semibold text-slate-600 shadow-sm transition hover:text-[#2E7BBE] md:left-10 md:top-10"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      {/* MAIN CONTENT */}

      <div className="relative w-full max-w-2xl">

        {/* HEADER */}

        <div className="mb-8 flex flex-col items-center text-center">

          <div className="mb-5 h-20 w-20 overflow-hidden rounded-3xl bg-white shadow-lg">
            <Image
              src="/images/logo.jpg"
              alt="PureSpace"
              width={80}
              height={80}
              priority
              className="h-full w-full object-cover"
            />
          </div>

          <p className="text-[10px] font-bold uppercase tracking-[3px] text-[#2E7BBE]">
            PURESPACE MANAGEMENT
          </p>

          <h1 className="mt-3 text-4xl font-black tracking-tight text-[#132238] md:text-5xl">
            Team Access
          </h1>

          <p className="mt-3 max-w-md text-sm leading-6 text-slate-500">
            Select your assigned team and enter the shared password
            provided by PURESPACE.
          </p>

        </div>

        {/* MAIN CARD */}

        <div className="rounded-[30px] border border-white bg-white/90 p-6 shadow-[0_25px_70px_rgba(32,69,103,0.10)] backdrop-blur-xl md:p-9">

          {!selectedTeam ? (
            <>
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[2px] text-slate-400">
                    Step 01
                  </p>
                  <h2 className="mt-1 text-xl font-bold text-[#172A3F]">
                    Select your team
                  </h2>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EAF3FC] text-[#2E7BBE]">
                  <Users className="h-6 w-6" />
                </div>
              </div>

              {loadingTeams ? (
                <div className="flex flex-col items-center justify-center py-14">
                  <Loader2 className="h-8 w-8 animate-spin text-[#2E7BBE]" />
                  <p className="mt-4 text-sm text-slate-500">
                    Loading teams...
                  </p>
                </div>
              ) : teams.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-[#F8FBFE] px-5 py-10 text-center">
                  <Users className="mx-auto h-9 w-9 text-slate-300" />
                  <p className="mt-4 font-semibold text-[#172A3F]">
                    No teams available
                  </p>
                  <p className="mt-2 text-sm text-slate-500">
                    Teams will appear here once they are created
                    in the Command Center.
                  </p>

                  <button
                    onClick={loadTeams}
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#2E7BBE] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#23649D]"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Try again
                  </button>
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {teams.map((team) => (
                    <button
                      key={team.id}
                      onClick={() => {
                        setSelectedTeam(team);
                        setError("");
                      }}
                      className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-[#9BC9E8] hover:shadow-lg"
                    >
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#EAF3FC] text-[#2E7BBE] transition group-hover:bg-[#2E7BBE] group-hover:text-white">
                        <Users className="h-5 w-5" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate font-bold text-[#172A3F]">
                          {team.name}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          Team workspace
                        </p>
                      </div>

                      <ArrowRight className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:text-[#2E7BBE]" />
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  setSelectedTeam(null);
                  setPassword("");
                  setError("");
                }}
                className="mb-7 flex items-center gap-2 text-sm font-semibold text-[#2E7BBE] transition hover:text-[#23649D]"
              >
                <ArrowLeft className="h-4 w-4" />
                Change team
              </button>

              <div className="mb-7 flex items-center gap-4 rounded-2xl border border-[#D8E9F6] bg-[#F4F9FE] p-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-[#2E7BBE] shadow-sm">
                  <Users className="h-7 w-7" />
                </div>

                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[2px] text-slate-400">
                    Selected team
                  </p>
                  <h2 className="mt-1 truncate text-xl font-bold text-[#172A3F]">
                    {selectedTeam.name}
                  </h2>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-[10px] font-bold uppercase tracking-[2px] text-slate-400">
                  Step 02
                </p>
                <h2 className="mt-1 text-xl font-bold text-[#172A3F]">
                  Team authentication
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Enter the shared password assigned to this team.
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-5">

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Team password
                  </label>

                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setError("");
                      }}
                      placeholder="Enter team password"
                      autoComplete="current-password"
                      className="w-full rounded-2xl border border-slate-200 bg-white py-4 pl-12 pr-12 text-base text-[#172A3F] outline-none transition placeholder:text-slate-300 focus:border-[#2E7BBE] focus:ring-4 focus:ring-[#2E7BBE]/10"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-[#2E7BBE]"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loggingIn || !password.trim()}
                  className="flex w-full items-center justify-center gap-3 rounded-2xl bg-[#2E7BBE] py-4 font-bold text-white shadow-lg shadow-[#2E7BBE]/15 transition hover:bg-[#23649D] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loggingIn ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Verifying access...
                    </>
                  ) : (
                    <>
                      <KeyRound className="h-5 w-5" />
                      Access Team Workspace
                    </>
                  )}
                </button>

              </form>
            </>
          )}

          <div className="mt-8 flex items-center justify-center gap-2 border-t border-slate-100 pt-6 text-xs text-slate-400">
            <ShieldCheck className="h-4 w-4" />
            Secure PURESPACE team access
          </div>

        </div>

        <p className="mt-7 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} PURESPACE CLEANING
        </p>

      </div>
    </main>
  );
}
