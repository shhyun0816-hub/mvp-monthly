const REPO = "shhyun0816-hub/mvp-monthly";
const FILE_PATH = "data/post.json";

async function crawlLatestPost() {
  const res = await fetch('https://miraeassetmvp.imweb.me/monthly', {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'ko-KR,ko;q=0.9',
    },
  });

  if (!res.ok) throw new Error(`크롤링 실패: ${res.status}`);
  const html = await res.text();

  // imweb 게시판 최신 글 파싱
  // 게시글 링크 추출
  const linkMatch = html.match(/href=["']?(\/monthly\/\d+)["']?/);
  if (!linkMatch) throw new Error('게시글 링크를 찾을 수 없음');
  const postPath = linkMatch[1];
  const postUrl = 'https://miraeassetmvp.imweb.me' + postPath;

  // 개별 게시글 크롤링
  const postRes = await fetch(postUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
    },
  });
  const postHtml = await postRes.text();

  // 제목 추출
  const titleMatch = postHtml.match(/<title>([^<]+)<\/title>/) ||
                     postHtml.match(/class="[^"]*title[^"]*"[^>]*>([^<]+)</) ||
                     postHtml.match(/<h1[^>]*>([^<]+)<\/h1>/);
  const title = titleMatch ? titleMatch[1].trim().replace(' - MVP PRISM', '').trim() : '월간시황전망';

  // 본문 텍스트 추출 (200자)
  const bodyMatch = postHtml.match(/<div[^>]*class="[^"]*content[^"]*"[^>]*>([\s\S]*?)<\/div>/);
  let summary = '';
  if (bodyMatch) {
    summary = bodyMatch[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim().slice(0, 200);
  }

  return { title, summary, url: postUrl, sub: '', postPath };
}

async function saveToGithub(data) {
  const token = process.env.GITHUB_TOKEN;
  const payload = { ...data, updatedAt: new Date().toISOString() };
  delete payload.postPath;

  const getRes = await fetch(
    `https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`,
    { headers: { Authorization: `Bearer ${token}`, 'User-Agent': 'mvp-monthly' } }
  );
  const getJson = await getRes.json();

  const content = Buffer.from(JSON.stringify(payload, null, 2)).toString('base64');
  const putRes = await fetch(
    `https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'User-Agent': 'mvp-monthly',
      },
      body: JSON.stringify({ message: `auto: ${data.title}`, content, sha: getJson.sha }),
    }
  );
  if (!putRes.ok) throw new Error('GitHub 저장 실패');
}

export default async function handler(req, res) {
  // Vercel Cron 또는 수동 호출
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && req.method !== 'GET') {
    return res.status(401).json({ error: '인증 실패' });
  }

  try {
    const post = await crawlLatestPost();
    
    // 현재 저장된 URL과 비교 - 새 글일 때만 저장
    const getRes = await fetch(
      `https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`,
      { headers: { Authorization: `Bearer ${process.env.GITHUB_TOKEN}`, 'User-Agent': 'mvp-monthly' } }
    );
    const getJson = await getRes.json();
    const current = JSON.parse(Buffer.from(getJson.content, 'base64').toString('utf-8'));

    if (current.url === post.url) {
      return res.status(200).json({ ok: true, message: '새 글 없음', url: post.url });
    }

    await saveToGithub(post);
    return res.status(200).json({ ok: true, message: '새 글 저장 완료', title: post.title, url: post.url });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
