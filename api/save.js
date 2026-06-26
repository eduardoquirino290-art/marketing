// POST /api/save — saves site content (data.json) to GitHub.
// The admin sends only { password, data }. The GitHub token lives in the
// server's environment, so no token ever touches the browser.
module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const REPO   = process.env.GH_REPO   || 'eduardoquirino290-art/marketing';
  const BRANCH = process.env.GH_BRANCH || 'main';
  const token  = process.env.GH_TOKEN;
  const valid  = (process.env.ADMIN_PASSWORDS || '')
    .split(',').map(s => s.trim()).filter(Boolean);

  if (!token) return res.status(500).json({ error: 'Server not configured: GH_TOKEN missing' });
  if (!valid.length) return res.status(500).json({ error: 'Server not configured: ADMIN_PASSWORDS missing' });

  try {
    const body = (req.body && typeof req.body === 'object')
      ? req.body
      : JSON.parse(req.body || '{}');

    const { password, data } = body;

    if (!password || !valid.includes(password)) {
      return res.status(401).json({ error: 'Invalid password' });
    }
    if (!data || typeof data !== 'object') {
      return res.status(400).json({ error: 'No data provided' });
    }

    // strip internal fields before writing
    const clean = { ...data };
    delete clean._sha;
    const content = Buffer.from(JSON.stringify(clean, null, 2)).toString('base64');

    const headers = {
      Authorization: 'Bearer ' + token,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'rmd-admin',
      'Content-Type': 'application/json'
    };

    // get current sha (required to update an existing file)
    const cur = await fetch(`https://api.github.com/repos/${REPO}/contents/data.json?ref=${BRANCH}`, { headers });
    const curJson = await cur.json();
    const sha = curJson.sha;

    const put = await fetch(`https://api.github.com/repos/${REPO}/contents/data.json`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        message: 'Admin: update site content',
        content,
        sha,
        branch: BRANCH
      })
    });

    if (!put.ok) {
      const err = await put.json();
      throw new Error(err.message || 'GitHub write failed (' + put.status + ')');
    }

    const putJson = await put.json();
    res.status(200).json({ ok: true, sha: putJson.content.sha });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
