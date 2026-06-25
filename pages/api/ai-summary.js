export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { title, body } = req.body;
  if (!title && !body) return res.status(400).json({ error: '내용을 입력하세요.' });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API 키가 설정되지 않았습니다.' });

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 300,
      messages: [{
        role: 'user',
        content: `다음 금융 시황 게시글을 카카오채널 공지용으로 정확히 200자(띄어쓰기 포함) 이내로 핵심만 요약해줘. 마크다운 없이 순수 텍스트로만.\n\n제목: ${title}\n\n본문: ${body}`,
      }],
    }),
  });

  const data = await response.json();
  const text = data.content?.[0]?.text || '';
  return res.status(200).json({ summary: text.slice(0, 200) });
}
