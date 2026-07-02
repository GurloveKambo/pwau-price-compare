/**
 * api.js
 *
 * All calls to the backend go through here. In dev, Vite proxies /api to
 * the local Express server (see vite.config.js). In production, Netlify
 * redirects /api/* to the deployed functions (see netlify.toml).
 */

export async function searchProducts(query, postcode) {
  const params = new URLSearchParams({ q: query });
  if (postcode) params.set("postcode", postcode);

  const response = await fetch(`/api/search?${params.toString()}`);

  if (!response.ok) {
    let message = `Search failed (${response.status})`;
    try {
      const body = await response.json();
      if (body?.error) message = body.error;
    } catch {
      // response wasn't JSON — keep the generic message
    }
    throw new Error(message);
  }

  return response.json();
}

export async function fetchRetailers() {
  const response = await fetch("/api/retailers");
  if (!response.ok) throw new Error(`Failed to load retailers (${response.status})`);
  return response.json();
}
