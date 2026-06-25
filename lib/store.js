const REPO = "shhyun0816-hub/mvp-monthly";
const FILE_PATH = "data/post.json";
const BRANCH = "main";

const DEFAULT = {
  title: "월간시황전망",
  summary: "최신 월간시황전망을 확인하세요.",
  url: "https://miraeassetmvp.imweb.me/monthly",
  sub: "글로벌 시장 동향 분석",
};

export async function getPost() {
  try {
    const res = await fetch(
      `https://raw.githubusercontent.com/${REPO}/${BRANCH}/${FILE_PATH}`,
      { cache: "no-store" }
    );
    if (!res.ok) return DEFAULT;
    return await res.json();
  } catch {
    return DEFAULT;
  }
}

export async function savePost(data) {
  const token = process.env.GITHUB_TOKEN;
  const payload = { ...data, updatedAt: new Date().toISOString() };

  // 현재 파일 SHA 가져오기
  const getRes = await fetch(
    `https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const getJson = await getRes.json();
  const sha = getJson.sha;

  // 파일 업데이트
  const content = Buffer.from(JSON.stringify(payload, null, 2)).toString("base64");
  const updateRes = await fetch(
    `https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: `update: ${data.title}`,
        content,
        sha,
        branch: BRANCH,
      }),
    }
  );
  if (!updateRes.ok) {
    const err = await updateRes.json();
    throw new Error(err.message || "저장 실패");
  }
}
