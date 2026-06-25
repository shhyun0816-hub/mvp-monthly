import { getPost } from '../../lib/store';

export default async function handler(req, res) {
  const post = await getPost();
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.redirect(302, post.url);
}
