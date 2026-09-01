/**
 * `Response.redirect()` returns a Response with immutable headers (per the
 * Fetch spec), which breaks when TanStack Start tries to merge Supabase's
 * `Set-Cookie` headers onto it. Use this instead wherever a redirect may
 * follow cookie-setting code.
 */
export function redirect(url: string | URL, status: number): Response {
  return new Response(null, {
    status,
    headers: { Location: url.toString() },
  });
}
