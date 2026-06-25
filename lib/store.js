import { kv } from '@vercel/kv';

const KEY = 'monthly_post';

export async function getPost() {
  try {
    const data = await kv.get(KEY);
    return data || {
      title: '월간시황전망',
      summary: '최신 월간시황전망을 확인하세요.',
      url: 'https://miraeassetmvp.imweb.me/monthly',
      sub: '글로벌 시장 동향 분석',
      updatedAt: new Date().toISOString(),
    };
  } catch {
    return {
      title: '월간시황전망',
      summary: '최신 월간시황전망을 확인하세요.',
      url: 'https://miraeassetmvp.imweb.me/monthly',
      sub: '글로벌 시장 동향 분석',
      updatedAt: new Date().toISOString(),
    };
  }
}

export async function savePost(data) {
  await kv.set(KEY, { ...data, updatedAt: new Date().toISOString() });
}
