const REPO = "shhyun0816-hub/mvp-monthly";
const FILE_PATH = "data/post.json";
const SITE_CODE = "miraeassetmvp";

async function crawlLatestPost() {
  // imweb 게시판 API 직접 호출
  const apis = [
    // imweb 공식 API
    `https://api.imweb.me/v2/shop/board-posts?site_code=${SITE_CODE}&limit=1`,
    // imweb 게시판 RSS
    `https://miraeassetmvp.imweb.me/monthly?rss=1`,
    `https://miraeassetmvp.imweb.me/monthly?format=json`,
  ];

  const headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
    'Referer': 'https://miraeassetmvp.imweb.me/',
  };

  // 메인 페이지 HTML 가져오기
  const res = await fetch('https://miraeassetmvp.imweb.me/monthly', { headers });
  const html = await res.text();

  // 다양한 패턴으로 링크 추출 시도
  const patterns = [
    /href=["']?(\/monthly\/[\w-]+)["']?/g,
    /href=["']?(https:\/\/miraeassetmvp\.imweb\.me\/monthly\/[\w-]+)["']?/g,
    /"url"\s*:\s*["'](\/monthly\/[\w-]+)["']/g,
    /data-url=["'](\/monthly\/[\w-]+)["']/g,
    /link=["'](\/monthly\/[\w-]+)["']/g,
    /'(\/monthly\/\d+)'/g,
  ];

  let postPath = null;
  for (const pattern of patterns) {
    const matches = [...html.matchAll(pattern)];
    if (matches.length > 0) {
      postPath = matches[0][1];
      break;
    }
  }

  // 디버그용 HTML 일부 반환
  if (!postPath) {
    const snippet = html.slice(0, 2000);
    throw new Error(`링크 못찾음. HTML 앞부분: ${snippet}`);
  }

  const postUrl = postPath.startsWith('http') ? postPath : 'https://miraeassetmvp.imweb.me' + postPath;

  // 게시글 상세 크롤링
  const postRes = await fetch(postUrl, { headers });
  const postHtml = await postRes.text();

  // 제목 추출
  const titlePatterns = [
    /<h1[^>]*>([^<]+)<\/h1>/,
    /<title>([^<]+)<\/title>/,
    /class="[^"]*view[^"]*title[^"]*"[^>]*>([^<]+)</,
    /property="og:title"\s+content="([^"]+)"/,
    /name="title"\s+content="([^"]+)"/,
  ];
  let title = '월간시황전망';
  for (const p of titlePatterns) {
    const m = postHtml.match(p);
    if (m && m[1].trim()) {
      title = m[1].trim().replace(/\s*[-|]\s*MVP PRISM.*$/i, '').trim();
      break;
    }
  }

  // 본문 요약
  const bodyMatch = postHtml.match(/property="og:description"\s+content="([^"]+)"/) ||
                    postHtml.match(/name="description"\s+content="([^"]+)"/);
  const summary = bodyMatch ? bodyMatch[1].trim().slice(0, 200) : '';

  return { title, summary, url: postUrl, sub: '' };
}

async function getCurrentPost() {
  const token = process.env.GITHUB_TOKEN;
  const res = await fetch(
    `https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`,
    { headers: { Authorization: `Bearer ${token}`, 'User-Agent': 'mvp-monthly' } }
  );
  const json = await res.json();
  return {
    data: JSON.parse(Buffer.from(json.content, 'base64').toString('utf-8')),
    sha: json.sha,
  };
}

async function saveToGithub(data, sha) {
  const token = process.env.GITHUB_TOKEN;
  const payload = { ...data, updatedAt: new Date().toISOString() };
  const content = Buffer.from(JSON.stringify(payload, null, 2)).toString('base64');
  const res = await fetch(
    `https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'User-Agent': 'mvp-monthly',
      },
      body: JSON.stringify({ message: `auto: ${data.title}`, content, sha }),
    }
  );
  if (!res.ok) throw new Error('GitHub 저장 실패');
}

export default async function handler(req, res) {
  try {
    const post = await crawlLatestPost();
    const { data: current, sha } = await getCurrentPost();

    if (current.url === post.url) {
      return res.status(200).json({ ok: true, message: '새 글 없음', url: post.url });
    }

    await saveToGithub(post, sha);
    return res.status(200).json({ ok: true, message: '새 글 저장 완료', title: post.title, url: post.url });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
