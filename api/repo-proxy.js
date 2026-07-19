/* ============================================================
   Openhouse — tiny repo-metadata proxy (Vercel serverless function)

   Self-hosted forges (Gitea/Forgejo/GitLab instances) usually don't
   send CORS headers, so the browser can't read their API responses.
   This function fetches the API server-side and re-serves it with
   CORS enabled. Only forge-API-shaped GET requests are allowed, so
   it can't be abused as a general-purpose open proxy.

   Used by js/categories.js as a fallback when a direct fetch fails.
   ============================================================ */

const ALLOWED_PATH = new RegExp(
  '^/(' +
    'api/v1/repos/[^/]+/[^/]+' + // Gitea / Forgejo
    '|api/v4/projects/[^/]+' +   // GitLab
  ')/?$'
);

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'GET only' });

  const raw = req.query.url;
  if (!raw) return res.status(400).json({ error: 'missing url' });

  let target;
  try { target = new URL(raw); } catch (e) {
    return res.status(400).json({ error: 'bad url' });
  }
  if (target.protocol !== 'https:') {
    return res.status(400).json({ error: 'https only' });
  }
  if (!ALLOWED_PATH.test(target.pathname)) {
    return res.status(400).json({ error: 'unsupported path' });
  }
  // block requests to private/internal ranges by hostname shape
  if (/^(localhost|127\.|10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|\[::1\])/i.test(target.hostname)) {
    return res.status(400).json({ error: 'forbidden host' });
  }

  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 8000);
    const upstream = await fetch(target.toString(), {
      headers: { 'Accept': 'application/json', 'User-Agent': 'openhouse-directory' },
      signal: ctrl.signal
    });
    clearTimeout(timer);
    const body = await upstream.text();
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    return res.status(upstream.status).send(body);
  } catch (e) {
    return res.status(502).json({ error: 'upstream unreachable' });
  }
};
