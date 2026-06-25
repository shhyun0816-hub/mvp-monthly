const REPO = "shhyun0816-hub/mvp-monthly";
const FILE_PATH = "data/post.json";

const DEFAULT = {
  title: '월간시황전망',
  summary: '최신 월간시황전망을 확인하세요.',
  url: 'https://miraeassetmvp.imweb.me/monthly',
  sub: '글로벌 시장 동향 분석',
};

export async function getPost() {
  try {
    const token = process.env.GITHUB_TOKEN;
    const res = await fetch(
      `https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'User-Agent': 'mvp-monthly',
          Accept: 'application/vnd.github.raw+json',
        },
        cache: 'no-store',
      }
    );
    if (!res.ok) return DEFAULT;
    return await res.json();
  } catch {
    return DEFAULT;
  }
}
