/**
 * Endpoints the admin panel needs that the API's Swagger does not list yet,
 * typed the way `schema.d.ts` types the rest so `fetchClient` treats them the
 * same. Each follows the contract proposed to the backend team; once one
 * shows up in `schema.d.ts` after `pnpm api:types`, delete it here.
 *
 * None are pending right now.
 */
export type PendingPaths = Record<never, never>;
