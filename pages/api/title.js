import { getPost } from '../../lib/store';

export default async function handler(req, res) {
  const post = await getPost();
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.status(200).send(post.title);
}
