const REPO = "shhyun0816-hub/mvp-monthly";
const FILE_PATH = "data/post.json";

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const adminPassword = process.env.ADMIN_PASSWORD || 'mvp2025';
  const { password, title, summary, url, sub } = req.body;

  if (password !== adminPassword) {
    return res.status(401).json({ error: '비밀번호가 올바르지 않습니다.' });
  }
  if (!title || !url) {
    return res.status(400).json({ error: '제목과 URL은 필수입니다.' });
  }

  const token = process.env.GITHUB_TOKEN;
  if (!token) return res.status(500).json({ error: 'GITHUB_TOKEN 환경변수가 없습니다.' });

  try {
    const payload = { title, summary, url, sub, updatedAt: new Date().toISOString() };

    // 현재 파일 SHA 가져오기
    const getRes = await fetch(
      `https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`,
      { headers: { Authorization: `Bearer ${token}`, 'User-Agent': 'mvp-monthly' } }
    );
    const getJson = await getRes.json();
    const sha = getJson.sha;

    if (!sha) return res.status(500).json({ error: 'SHA 가져오기 실패: ' + JSON.stringify(getJson) });

    // 파일 업데이트
    const content = Buffer.from(JSON.stringify(payload, null, 2)).toString('base64');
    const updateRes = await fetch(
      `https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'User-Agent': 'mvp-monthly',
        },
        body: JSON.stringify({ message: `update: ${title}`, content, sha }),
      }
    );

    if (!updateRes.ok) {
      const err = await updateRes.json();
      return res.status(500).json({ error: '저장 실패: ' + JSON.stringify(err) });
    }

    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
