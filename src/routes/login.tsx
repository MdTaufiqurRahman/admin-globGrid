import { createFileRoute, redirect } from "@tanstack/react-router";
import { z } from "zod";
import { LogoMark } from "@/components/logo-mark";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoginForm } from "@/features/auth/components/login-form";
import { safeReturnPath } from "@/features/auth/return-path";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { isSignedIn } from "@/stores/session-store";

const loginSearch = z.object({
  /** The page the admin was sent here from, to go back to once signed in. */
  redirect: z.string().optional().catch(undefined),
});

export const Route = createFileRoute("/login")({
  validateSearch: loginSearch,
  beforeLoad: ({ search }) => {
    if (isSignedIn()) throw redirect({ href: safeReturnPath(search.redirect) ?? "/" });
  },
  component: LoginPage,
});

function LoginPage() {
  const { redirect: from } = Route.useSearch();
  useDocumentTitle("Sign in");

  return (
    <main className="flex min-h-svh items-center justify-center bg-muted p-6">
      <div className="flex w-full max-w-md flex-col gap-6">
        <div className="flex items-center justify-center gap-3">
          <LogoMark className="size-10" />
          <div className="leading-tight">
            <p className="font-heading text-xl font-extrabold">
              Globa<span className="text-primary">GRID</span>
            </p>
            <p className="text-xs text-muted-foreground">Admin panel</p>
          </div>
        </div>
        <Card className="gap-0 py-0 shadow-lg [--card-spacing:--spacing(5)]">
          <CardHeader className="pt-4 text-center [.border-b]:pb-4">
            <CardTitle className="text-2xl font-semibold">Sign in</CardTitle>
            <CardDescription>For the GlobaGRID admin only.</CardDescription>
          </CardHeader>
          <CardContent className="py-5">
            <LoginForm returnTo={safeReturnPath(from) ?? "/"} />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
