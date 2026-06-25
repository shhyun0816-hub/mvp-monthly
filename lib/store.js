import { createClient } from '@vercel/edge-config';

const DEFAULT = {
  title: '월간시황전망',
  summary: '최신 월간시황전망을 확인하세요.',
  url: 'https://miraeassetmvp.imweb.me/monthly',
  sub: '글로벌 시장 동향 분석',
};

export async function getPost() {
  try {
    const client = createClient(process.env.EDGE_CONFIG);
    const data = await client.get('monthly_post');
    return data || DEFAULT;
  } catch {
    return DEFAULT;
  }
}

export async function savePost(data) {
  const res = await fetch(
    `https://api.vercel.com/v1/edge-config/${process.env.EDGE_CONFIG_ID}/items`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${process.env.VERCEL_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: [
          {
            operation: 'upsert',
            key: 'monthly_post',
            value: { ...data, updatedAt: new Date().toISOString() },
          },
        ],
      }),
    }
  );
  if (!res.ok) throw new Error('저장 실패');
}
