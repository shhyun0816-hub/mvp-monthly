export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const token = process.env.GITHUB_TOKEN;
  const adminPassword = process.env.ADMIN_PASSWORD || 'mvp2025';
  const { password, title, url } = req.body;

  // 디버그용 환경변수 체크
  if (!token) return res.status(500).json({ error: 'GITHUB_TOKEN 없음' });
  if (password !== adminPassword) return res.status(401).json({ error: '비밀번호 오류' });
  if (!title || !url) return res.status(400).json({ error: '제목/URL 필수' });

  try {
    // SHA 가져오기
    const getRes = await fetch(
      'https://api.github.com/repos/shhyun0816-hub/mvp-monthly/contents/data/post.json',
      { headers: { Authorization: `Bearer ${token}`, 'User-Agent': 'mvp-monthly' } }
    );
    const getJson = await getRes.json();

    if (!getJson.sha) {
      return res.status(500).json({ error: 'SHA 없음', detail: getJson });
    }

    const { summary, sub } = req.body;
    const payload = { title, summary, url, sub, updatedAt: new Date().toISOString() };
    const content = Buffer.from(JSON.stringify(payload, null, 2)).toString('base64');

    const putRes = await fetch(
      'https://api.github.com/repos/shhyun0816-hub/mvp-monthly/contents/data/post.json',
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'User-Agent': 'mvp-monthly',
        },
        body: JSON.stringify({ message: `update: ${title}`, content, sha: getJson.sha }),
      }
    );

    if (!putRes.ok) {
      const err = await putRes.json();
      return res.status(500).json({ error: 'PUT 실패', detail: err });
    }

    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: e.message, stack: e.stack });
  }
}
