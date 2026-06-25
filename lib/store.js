const DEFAULT = {
  title: '월간시황전망',
  summary: '최신 월간시황전망을 확인하세요.',
  url: 'https://miraeassetmvp.imweb.me/monthly',
  sub: '글로벌 시장 동향 분석',
};

export async function getPost() {
  try {
    const res = await fetch(
      `https://blob.vercel-storage.com/mvp-post.json`,
      { headers: { Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}` } }
    );
    if (!res.ok) return DEFAULT;
    return await res.json();
  } catch {
    return DEFAULT;
  }
}

export async function savePost(data) {
  const { put } = await import('@vercel/blob');
  await put('mvp-post.json', JSON.stringify({ ...data, updatedAt: new Date().toISOString() }), {
    access: 'public',
    allowOverwrite: true,
    contentType: 'application/json',
  });
}
