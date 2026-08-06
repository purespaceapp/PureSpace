"use client";

import { useState } from "react";

import Link from "next/link";

import Image from "next/image";

import { useRouter } from "next/navigation";

import {
  ArrowLeft,
  Eye,
  EyeOff,
  Lock,
  Loader2,
} from "lucide-react";

export default function OfficeLoginPage() {

  const router = useRouter();

  const [password, setPassword] = useState("");

  const [error, setError] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  async function handleLogin(
    e: React.FormEvent<HTMLFormElement>
  ) {

    e.preventDefault();

    setError("");

    setLoading(true);

    try {

      const response = await fetch(
        "/api/office-login",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            password,
          }),
        }
      );

      if (response.ok) {

        router.push("/dashboard");

        return;

      }

      setError("Incorrect office password.");

    } catch {

      setError(
        "Unable to connect to the server."
      );

    } finally {

      setLoading(false);

    }

  }

  return (

    <main className="min-h-screen bg-gradient-to-br from-[#F5F7FA] via-[#EEF5FF] to-[#E4EEFC] flex items-center justify-center p-8">
            <div className="absolute left-10 top-10">

        <Link
          href="/"
          className="flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-slate-700 shadow-lg transition hover:-translate-y-0.5 hover:text-[#2E7BBE]"
        >

          <ArrowLeft className="h-5 w-5" />

          Back

        </Link>

      </div>

      <div className="w-full max-w-md rounded-[36px] bg-white p-12 shadow-2xl">

        <div className="flex flex-col items-center">

          <div className="flex h-32 w-32 items-center justify-center rounded-full bg-[#F4F8FD] shadow-inner">

            <Image
              src="/images/logo.jpg"
              alt="PureSpace"
              width={110}
              height={110}
              priority
              className="rounded-full"
            />

          </div>

          <h1 className="mt-8 text-4xl font-bold text-slate-800">

            Office Staff

          </h1>

          <p className="mt-3 text-center leading-7 text-slate-500">

            Enter your office password to access
            the PureSpace management dashboard.

          </p>

        </div>

        <form
          onSubmit={handleLogin}
          className="mt-10 space-y-6"
        >
                    <div>

            <label className="mb-3 block font-semibold text-slate-700">

              Office Password

            </label>

            <div className="relative">

              <Lock className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                className="w-full rounded-2xl border border-slate-300 py-4 pl-14 pr-14 text-lg outline-none transition focus:border-[#2E7BBE] focus:ring-4 focus:ring-[#2E7BBE]/10"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
                className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-[#2E7BBE]"
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

            <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-center text-sm font-medium text-red-600">

              {error}

            </div>

          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-2xl bg-[#2E7BBE] py-4 text-lg font-semibold text-white transition hover:bg-[#23649D] disabled:cursor-not-allowed disabled:opacity-70"
          >

            {loading ? (

              <>

                <Loader2 className="h-5 w-5 animate-spin" />

                Signing In...

              </>

            ) : (

              "Sign In"

            )}

          </button>
                  </form>

        <div className="mt-8 border-t border-slate-200 pt-6">

          <p className="text-center text-sm text-slate-400">

            © {new Date().getFullYear()} PureSpace Cleaning

          </p>

        </div>

      </div>

    </main>

  );

}