import { SignupForm } from "@/components/auth-forms";
import { Card, CardContent } from "@/components/ui";
import { getSessionUser } from "@/lib/auth";
import { Car } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function SignupPage() {
  if (await getSessionUser()) redirect("/app");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-5 py-12">
      <Link href="/" className="mb-6 flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-700 text-white">
          <Car className="h-5 w-5" />
        </span>
        <span className="text-xl font-bold tracking-tight text-slate-900">
          Auction<span className="text-blue-700">Desk</span>
        </span>
      </Link>

      <Card className="w-full max-w-sm">
        <CardContent className="p-6">
          <h1 className="mb-1 text-lg font-bold text-slate-900">Create your account</h1>
          <p className="mb-5 text-sm text-slate-500">
            Set up your dealership — takes about a minute.
          </p>
          <SignupForm />
        </CardContent>
      </Card>
    </div>
  );
}
