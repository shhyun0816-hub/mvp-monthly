export default async function handler(req, res) {
  try {
    const response = await fetch('https://miraeassetmvp.imweb.me/monthly', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'ko-KR,ko;q=0.9',
      },
    });
    const html = await response.text();
    // 앞 3000자만 반환해서 구조 파악
    return res.status(200).json({
      status: response.status,
      length: html.length,
      preview: html.slice(0, 3000),
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
