import { supabase } from "~/utils/supabase/client";

interface SseEvent {
  delta?: string;
  error?: string;
}

export async function* authFetchStream(
  path: string,
  init: RequestInit = {},
): AsyncGenerator<string> {
  const { data } = await supabase.auth.getSession();
  const response = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${data.session?.access_token}`,
      ...init.headers,
    },
  });

  if (!response.ok || !response.body) {
    const message = await response.text().catch(() => "");
    throw new Error(message || `Request failed with status ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const events = buffer.split("\n\n");
    buffer = events.pop() ?? "";

    for (const rawEvent of events) {
      const line = rawEvent.trim();
      if (!line.startsWith("data:")) continue;
      const payload = line.slice("data:".length).trim();
      if (payload === "[DONE]") return;

      const parsed = JSON.parse(payload) as SseEvent;
      if (parsed.error) throw new Error(parsed.error);
      if (parsed.delta) yield parsed.delta;
    }
  }
}

/**
 * The same SSE transport, but yielding whole parsed frames rather than text.
 * Pairs with `streamEventsToSseResponse` for streams that carry typed events.
 */
export async function* authFetchEventStream<T>(
  path: string,
  init: RequestInit = {},
): AsyncGenerator<T> {
  const { data } = await supabase.auth.getSession();
  const response = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${data.session?.access_token}`,
      ...init.headers,
    },
  });

  if (!response.ok || !response.body) {
    const message = await response.text().catch(() => "");
    throw new Error(message || `Request failed with status ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const events = buffer.split("\n\n");
    buffer = events.pop() ?? "";

    for (const rawEvent of events) {
      const line = rawEvent.trim();
      if (!line.startsWith("data:")) continue;
      const payload = line.slice("data:".length).trim();
      if (payload === "[DONE]") return;

      const parsed = JSON.parse(payload) as { error?: string };
      if (parsed.error) throw new Error(parsed.error);
      yield parsed as T;
    }
  }
}
