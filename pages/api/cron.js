const REPO = "shhyun0816-hub/mvp-monthly";
const FILE_PATH = "data/post.json";

async function crawlLatestPost() {
  // imweb 게시판 API 직접 호출 시도
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/plain, */*',
    'Referer': 'https://miraeassetmvp.imweb.me/monthly',
  };

  // imweb 내부 API 패턴들 시도
  const apiUrls = [
    'https://miraeassetmvp.imweb.me/api/board/posts?code=monthly&limit=1',
    'https://miraeassetmvp.imweb.me/api/posts?board=monthly&limit=1',
    'https://miraeassetmvp.imweb.me/_api/board?page_code=monthly&limit=1',
  ];

  let apiData = null;
  let usedUrl = '';
  for (const url of apiUrls) {
    try {
      const r = await fetch(url, { headers });
      const text = await r.text();
      if (r.ok && text.includes('title')) {
        apiData = JSON.parse(text);
        usedUrl = url;
        break;
      }
    } catch {}
  }

  if (apiData) {
    // API 성공
    const item = apiData.list?.[0] || apiData.data?.[0] || apiData[0];
    return {
      title: item?.title || '월간시황전망',
      summary: (item?.content || '').replace(/<[^>]+>/g, '').slice(0, 200),
      url: `https://miraeassetmvp.imweb.me/monthly/${item?.code || item?.id}`,
      sub: '',
    };
  }

  // API 실패 시 HTML 파싱
  const res = await fetch('https://miraeassetmvp.imweb.me/monthly', { headers });
  const html = await res.text();

  // Next.js / Nuxt 등 SSR 데이터 추출
  const jsonPatterns = [
    /__NEXT_DATA__[^>]*>({.*?})<\/script>/s,
    /window\.__INITIAL_STATE__\s*=\s*({.*?});\s*<\/script>/s,
    /window\.__nuxt__\s*=\s*({.*?});\s*<\/script>/s,
    /<script[^>]*type="application\/json"[^>]*>({.*?})<\/script>/s,
  ];

  for (const pattern of jsonPatterns) {
    const m = html.match(pattern);
    if (m) {
      try {
        const data = JSON.parse(m[1]);
        const posts = data?.props?.pageProps?.posts ||
                      data?.posts || data?.list || [];
        if (posts.length > 0) {
          const post = posts[0];
          return {
            title: post.title || '월간시황전망',
            summary: (post.content || post.summary || '').replace(/<[^>]+>/g, '').slice(0, 200),
            url: `https://miraeassetmvp.imweb.me/monthly/${post.code || post.id || post.no}`,
            sub: '',
          };
        }
      } catch {}
    }
  }

  // 마지막 수단: og 태그에서 추출
  const ogUrl = html.match(/property="og:url"\s+content="([^"]+)"/)
             || html.match(/name="og:url"\s+content="([^"]+)"/);
  const ogTitle = html.match(/property="og:title"\s+content="([^"]+)"/)
               || html.match(/name="og:title"\s+content="([^"]+)"/);
  const ogDesc = html.match(/property="og:description"\s+content="([^"]+)"/)
              || html.match(/name="og:description"\s+content="([^"]+)"/);

  // 디버그: html 앞 2000자 반환
  throw new Error('파싱실패. HTML앞2000자: ' + html.slice(0, 2000));
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
    return res.status(500).json({ error: e.message.slice(0, 1000) });
  }
}
