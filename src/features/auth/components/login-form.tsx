import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { adminSessionOf } from "@/features/auth/admin-session";
import { loginSchema, type LoginValues } from "@/features/auth/schema";
import { $api } from "@/lib/api/client";
import { problemOf } from "@/lib/api/problems";
import { useSession } from "@/stores/session-store";

/** The API's names for the fields, mapped to the form's. */
const fieldNames: Record<string, keyof LoginValues> = {
  email: "email",
  password: "password",
};

/**
 * The admin's sign-in, through the same login as the storefront. Only an `ADMIN`
 * or `SUPER_ADMIN` account is kept signed in; the admin then goes on to `returnTo`.
 */
export function LoginForm({ returnTo }: { returnTo: string }) {
  const navigate = useNavigate();
  const signIn = useSession((state) => state.signIn);
  const login = $api.useMutation("post", "/api/auth/login");
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginValues) {
    try {
      const session = adminSessionOf(await login.mutateAsync({ body: values }));
      if (!session) {
        toast.error("Couldn't sign in", {
          description: "This account can't open the admin panel.",
        });
        return;
      }
      signIn(session);
      toast.success("Signed in", { description: `Welcome back, ${session.admin.name}.` });
      await navigate({ href: returnTo, replace: true });
    } catch (error) {
      const { message, fields } = problemOf(error);
      const known = fields.filter((field) => fieldNames[field.field]);
      for (const field of known) {
        setError(fieldNames[field.field]!, { message: field.message });
      }
      toast.error("Couldn't sign in", {
        description: known.length > 0 ? "Check the highlighted fields." : message,
      });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <FieldGroup>
        <Field data-invalid={Boolean(errors.email)}>
          <FieldLabel htmlFor="login-email">Email</FieldLabel>
          <Input
            id="login-email"
            type="email"
            autoComplete="username"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            placeholder="you@globalgrid.com"
            className="h-11 px-3"
            aria-invalid={Boolean(errors.email)}
            {...register("email")}
          />
          <FieldError errors={[errors.email]} />
        </Field>

        <Field data-invalid={Boolean(errors.password)}>
          <FieldLabel htmlFor="login-password">Password</FieldLabel>
          <InputGroup className="h-11">
            <InputGroupInput
              id="login-password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Enter your password"
              className="h-full px-3"
              aria-invalid={Boolean(errors.password)}
              {...register("password")}
            />
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                size="icon-sm"
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                className="text-muted-foreground"
                onClick={() => setShowPassword((shown) => !shown)}
              >
                {showPassword ? <Eye /> : <EyeOff />}
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
          <FieldError errors={[errors.password]} />
        </Field>

        <Button
          type="submit"
          size="lg"
          disabled={isSubmitting}
          className="mt-1 h-11 w-full text-base font-semibold"
        >
          {isSubmitting ? "Signing in…" : "Sign in"}
        </Button>
      </FieldGroup>
    </form>
  );
}
