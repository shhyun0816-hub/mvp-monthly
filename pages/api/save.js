import { savePost } from '../../lib/store';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const adminPassword = process.env.ADMIN_PASSWORD || 'mvp2025';
  const { password, title, summary, url, sub } = req.body;

  if (password !== adminPassword) {
    return res.status(401).json({ error: '비밀번호가 올바르지 않습니다.' });
  }
  if (!title || !url) {
    return res.status(400).json({ error: '제목과 URL은 필수입니다.' });
  }

  await savePost({ title, summary, url, sub });
  return res.status(200).json({ ok: true });
}
