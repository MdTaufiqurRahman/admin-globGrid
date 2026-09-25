import { NetworkError } from "./errors";
import type { components } from "./schema";

type ErrorResponse = components["schemas"]["ErrorResponse"];

/** One field the API turned down, under the API's own name for it. */
export type FieldProblem = { field: string; message: string };

/**
 * A failed call, read the way a screen can act on it: the fields the API
 * turned down, and one sentence for everything else. The API's messages are
 * written for people, so they are shown as they come.
 *
 * A failed call throws the API's `ErrorResponse` envelope, the raw text when
 * something in front of the API answered instead, or a `NetworkError` when the
 * request never got there.
 */
export function problemOf(error: unknown): { message: string; fields: FieldProblem[] } {
  if (error instanceof NetworkError) {
    return {
      message: "Couldn't reach the GlobaGRID API. Check your connection and try again.",
      fields: [],
    };
  }

  if (isErrorResponse(error)) {
    // The trace ID is what the backend team asks for when looking one up.
    console.error(`Request failed: ${error.status} ${error.code ?? ""}`, {
      message: error.message,
      traceId: error.traceId,
    });

    const fields = (error.errors ?? []).flatMap((problem) =>
      problem.field && problem.message
        ? [{ field: problem.field, message: problem.message }]
        : [],
    );
    if (error.status >= 500) {
      return { message: "Something went wrong on the API's side. Please try again.", fields };
    }
    return { message: error.message ?? "The API turned the request down.", fields };
  }

  return { message: "Something went wrong. Please try again.", fields: [] };
}

/** The HTTP status a failed call came back with, when it was the API that answered. */
export function statusOf(error: unknown) {
  return isErrorResponse(error) ? error.status : undefined;
}

function isErrorResponse(value: unknown): value is ErrorResponse & { status: number } {
  return (
    typeof value === "object" &&
    value !== null &&
    "status" in value &&
    typeof value.status === "number"
  );
}
