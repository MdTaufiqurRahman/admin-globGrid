import { z } from "zod";

/**
 * Build-time env vars. Vite inlines `import.meta.env.VITE_*` into the bundle,
 * so each one must be set before `pnpm build` (see `.env.example`). Each key
 * is read by name: handing over `import.meta.env` whole would inline every
 * variable into the bundle, dev-only ones included.
 */
const schema = z.object({
  VITE_API_URL: z.url(),
});

const parsed = schema.safeParse({
  VITE_API_URL: import.meta.env.VITE_API_URL,
});

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
    .join("\n");
  throw new Error(`Invalid environment variables:\n${issues}`);
}

export const env = parsed.data;
