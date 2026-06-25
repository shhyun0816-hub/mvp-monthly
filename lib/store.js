const DEFAULT = {
  title: '월간시황전망',
  summary: '최신 월간시황전망을 확인하세요.',
  url: 'https://miraeassetmvp.imweb.me/monthly',
  sub: '글로벌 시장 동향 분석',
};

export async function getPost() {
  try {
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    const res = await fetch(
      'https://api.vercel.com/v1/blob?prefix=mvp-post.json',
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const data = await res.json();
    const blob = data.blobs?.[0];
    if (!blob) return DEFAULT;
    const fileRes = await fetch(blob.url);
    return await fileRes.json();
  } catch {
    return DEFAULT;
  }
}

export async function savePost(data) {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  const body = JSON.stringify({ ...data, updatedAt: new Date().toISOString() });
  await fetch('https://api.vercel.com/v1/blob?filename=mvp-post.json&multipart=false', {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'x-allow-overwrite': 'true',
    },
    body,
  });
}
