// GET /api/data — returns the current site content (data.json) from GitHub.
// Reads server-side with the stored token so public visitors never need one.
// Edge-cached briefly so many viewers polling for updates won't hit GitHub limits.
module.exports = async (req, res) => {
  const REPO   = process.env.GH_REPO   || 'eduardoquirino290-art/marketing';
  const BRANCH = process.env.GH_BRANCH || 'main';
  const token  = process.env.GH_TOKEN;

  try {
    const headers = { Accept: 'application/vnd.github+json', 'User-Agent': 'rmd-admin' };
    if (token) headers.Authorization = 'Bearer ' + token;

    const r = await fetch(
      `https://api.github.com/repos/${REPO}/contents/data.json?ref=${BRANCH}&t=${Date.now()}`,
      { headers }
    );
    if (!r.ok) throw new Error('GitHub read failed (' + r.status + ')');

    const j = await r.json();
    const content = Buffer.from(j.content, 'base64').toString('utf8');
    const data = JSON.parse(content);
    data._sha = j.sha;

    // Cache at the edge for 10s; serve stale while revalidating for smoothness.
    res.setHeader('Cache-Control', 's-maxage=10, stale-while-revalidate=30');
    res.setHeader('Content-Type', 'application/json');
    res.status(200).send(JSON.stringify(data));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
