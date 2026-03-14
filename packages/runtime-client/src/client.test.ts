import { describe, expect, mock, test } from "bun:test";

import { createRuntimeClient } from "./client";

describe("runtime client", () => {
  test("sends auth headers for protected requests", async () => {
    const fetchMock = mock(async () => ({
      ok: true,
      status: 200,
      json: async () => [{ id: "session-1" }],
    })) as unknown as typeof fetch;

    const client = createRuntimeClient({
      baseUrl: "http://127.0.0.1:41200",
      authToken: "secret-token",
      fetchImpl: fetchMock,
    });

    await client.listSessions();

    expect(fetchMock).toHaveBeenCalledWith(
      "http://127.0.0.1:41200/api/v1/sessions",
      expect.objectContaining({
        headers: expect.any(Headers),
      }),
    );
    const headers = ((fetchMock as any).mock.calls[0]?.[1] as RequestInit).headers as Headers;
    expect(headers.get("Authorization")).toBe("Bearer secret-token");
  });

  test("skips auth for pairing bootstrap flows and builds session event urls", async () => {
    const fetchMock = mock(async () => ({
      ok: true,
      status: 200,
      json: async () => ({ pairingToken: "pair-1" }),
    })) as unknown as typeof fetch;

    const client = createRuntimeClient({
      baseUrl: "http://127.0.0.1:41200",
      authToken: "secret-token",
      fetchImpl: fetchMock,
    });

    await client.createPairingIntent(["sessions:read"]);

    const headers = ((fetchMock as any).mock.calls[0]?.[1] as RequestInit).headers as Headers;
    expect(headers.get("Authorization")).toBeNull();
    expect(client.sessionEventsUrl("session-1")).toContain(
      "/api/v1/sessions/session-1/stream?authToken=secret-token",
    );
  });

  test("deletes sessions through the protected runtime API", async () => {
    const fetchMock = mock(async () => ({
      ok: true,
      status: 204,
      json: async () => undefined,
    })) as unknown as typeof fetch;

    const client = createRuntimeClient({
      baseUrl: "http://127.0.0.1:41200",
      authToken: "secret-token",
      fetchImpl: fetchMock,
    });

    await client.deleteSession("session-99");

    expect(fetchMock).toHaveBeenCalledWith(
      "http://127.0.0.1:41200/api/v1/sessions/session-99",
      expect.objectContaining({
        method: "DELETE",
      }),
    );
  });
});
