import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/auth";
import { LoginForm } from "@/components/auth/login-form";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await getAuthenticatedUser();
  if (user) redirect("/dashboard");

  const { error } = await searchParams;

  const errorMessage =
    error === "expired"
      ? "This link has expired. Please request a new one."
      : error === "used"
        ? "This link has already been used."
        : error === "invalid"
          ? "Invalid login link. Please request a new one."
          : undefined;

  return (
    <div className="flex min-h-screen items-center justify-center p-8 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col items-center gap-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold">KinkList</h1>
          <p className="mt-2 text-lg text-gray-600">
            Collaborative todo lists made simple.
          </p>
        </div>

        <LoginForm error={errorMessage} />
      </main>
    </div>
  );
}
