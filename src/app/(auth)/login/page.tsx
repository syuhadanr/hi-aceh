"use client";

import React, { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/admin/dashboard";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLoading(true);
    setError(null);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl,
    });

    setIsLoading(false);

    if (!res || res.error) {
      setError("Email atau password salah. Silakan coba lagi.");
    } else if (res.ok) {
      window.location.href = res.url ?? "/admin/dashboard";
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-800 dark:bg-red-950/50 dark:text-red-400 border border-red-200 dark:border-red-900/50">
          <div className="font-semibold">Login Gagal</div>
          <div>{error}</div>
        </div>
      )}

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Alamat Email
        </label>
        <div className="mt-1">
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@hiaceh.com"
            className="block w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-teal-500 sm:text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:border-teal-400 dark:focus:ring-teal-400"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Kata Sandi
        </label>
        <div className="mt-1">
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="block w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-teal-500 sm:text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:border-teal-400 dark:focus:ring-teal-400"
          />
        </div>
      </div>

      <div>
        <button
          id="login-submit"
          type="submit"
          disabled={isLoading}
          className="flex w-full justify-center rounded-md bg-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Memproses...
            </span>
          ) : (
            "Masuk"
          )}
        </button>
      </div>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-12 sm:px-6 lg:px-8 dark:bg-zinc-950">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center text-center">
          <span className="text-3xl font-extrabold tracking-tight text-teal-600 dark:text-teal-400">
            Hi Aceh
          </span>
          <h2 className="mt-6 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Masuk ke Panel Redaksi
          </h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Kelola konten portal berita Aceh &amp; Indonesia
          </p>
        </div>

        <div className="bg-white p-8 shadow-md border border-zinc-200 rounded-xl dark:bg-zinc-900 dark:border-zinc-800">
          <Suspense fallback={<div className="h-48 animate-pulse bg-zinc-100 rounded-md dark:bg-zinc-800" />}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
