"use client";

import { login, signup } from "@/app/auth-actions";
import { Button, Input, Label } from "@/components/ui";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

function ErrorNote({ message }: { message: string }) {
  return (
    <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
      {message}
    </p>
  );
}

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      // On success this redirects and never returns.
      const result = await login(email, password);
      if (result?.error) {
        setError(result.error);
        setBusy(false);
      }
    } catch (err) {
      // redirect() throws by design — let Next handle it.
      if (err instanceof Error && err.message.includes("NEXT_REDIRECT")) throw err;
      setError("Something went wrong. Try again.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {error && <ErrorNote message={error} />}
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@yourdealership.com"
        />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <Button type="submit" disabled={busy} className="w-full">
        {busy && <Loader2 className="h-4 w-4 animate-spin" />}
        Sign in
      </Button>
      <p className="text-center text-xs text-slate-500">
        New here?{" "}
        <Link href="/signup" className="font-medium text-blue-700 hover:underline">
          Create a dealership account
        </Link>
      </p>
    </form>
  );
}

export function SignupForm() {
  const [form, setForm] = useState({
    dealershipName: "",
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const result = await signup(form);
      if (result?.error) {
        setError(result.error);
        setBusy(false);
      }
    } catch (err) {
      if (err instanceof Error && err.message.includes("NEXT_REDIRECT")) throw err;
      setError("Something went wrong. Try again.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {error && <ErrorNote message={error} />}
      <div>
        <Label htmlFor="dealershipName">Dealership name</Label>
        <Input
          id="dealershipName"
          value={form.dealershipName}
          onChange={set("dealershipName")}
          placeholder="Fox Valley Auto Sales"
        />
      </div>
      <div>
        <Label htmlFor="name">Your name</Label>
        <Input id="name" value={form.name} onChange={set("name")} placeholder="Dale Vandenberg" />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={set("email")}
          placeholder="you@yourdealership.com"
        />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          value={form.password}
          onChange={set("password")}
          placeholder="At least 8 characters"
        />
      </div>
      <Button type="submit" disabled={busy} className="w-full">
        {busy && <Loader2 className="h-4 w-4 animate-spin" />}
        Create account
      </Button>
      <p className="text-center text-xs text-slate-500">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-blue-700 hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
