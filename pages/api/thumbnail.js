import { getPost } from '../../lib/store';

function wrapText(text, maxChars) {
  const words = text.split('');
  const lines = [];
  let line = '';
  for (const ch of words) {
    if (line.length >= maxChars) {
      lines.push(line);
      line = ch;
    } else {
      line += ch;
    }
  }
  if (line) lines.push(line);
  return lines.slice(0, 3);
}

export default async function handler(req, res) {
  const post = await getPost();
  const now = new Date();
  const dateStr = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}`;

  const titleLines = wrapText(post.title || '월간시황전망', 18);
  const subLine = (post.sub || '').slice(0, 28);

  const titleY = 195 - (titleLines.length - 1) * 22;
  const titleSvg = titleLines
    .map((line, i) =>
      `<text x="400" y="${titleY + i * 44}" font-family="'Apple SD Gothic Neo','Noto Sans KR','Malgun Gothic',sans-serif" font-size="36" font-weight="600" fill="white" text-anchor="middle" dominant-baseline="middle">${line}</text>`
    )
    .join('');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="400" viewBox="0 0 800 400">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0D2137"/>
      <stop offset="55%" style="stop-color:#1A4A7A"/>
      <stop offset="100%" style="stop-color:#0D6E56"/>
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#3ABFFF;stop-opacity:0.6"/>
      <stop offset="100%" style="stop-color:#1D9E75;stop-opacity:0.6"/>
    </linearGradient>
  </defs>

  <rect width="800" height="400" fill="url(#bg)"/>

  <circle cx="650" cy="80" r="180" fill="white" fill-opacity="0.03"/>
  <circle cx="120" cy="340" r="120" fill="white" fill-opacity="0.03"/>

  <line x1="0" y1="72" x2="800" y2="72" stroke="white" stroke-opacity="0.08" stroke-width="0.5"/>
  <line x1="0" y1="328" x2="800" y2="328" stroke="white" stroke-opacity="0.08" stroke-width="0.5"/>

  <rect x="32" y="20" width="160" height="32" rx="4" fill="white" fill-opacity="0.08"/>
  <text x="112" y="40" font-family="'Apple SD Gothic Neo','Noto Sans KR','Malgun Gothic',sans-serif" font-size="13" fill="white" fill-opacity="0.85" text-anchor="middle" dominant-baseline="middle" letter-spacing="2">MVP · 미래에셋생명</text>

  <text x="769" y="36" font-family="'Apple SD Gothic Neo','Noto Sans KR','Malgun Gothic',sans-serif" font-size="13" fill="white" fill-opacity="0.5" text-anchor="end" dominant-baseline="middle">${dateStr}</text>

  <rect x="160" y="136" width="480" height="2" rx="1" fill="url(#accent)"/>

  ${titleSvg}

  <rect x="160" y="258" width="480" height="2" rx="1" fill="url(#accent)"/>

  ${subLine ? `<text x="400" y="294" font-family="'Apple SD Gothic Neo','Noto Sans KR','Malgun Gothic',sans-serif" font-size="16" fill="white" fill-opacity="0.65" text-anchor="middle" dominant-baseline="middle">${subLine}</text>` : ''}

  <rect x="310" y="346" width="180" height="30" rx="15" fill="white" fill-opacity="0.12"/>
  <text x="400" y="361" font-family="'Apple SD Gothic Neo','Noto Sans KR','Malgun Gothic',sans-serif" font-size="13" fill="white" fill-opacity="0.8" text-anchor="middle" dominant-baseline="middle" letter-spacing="1">월간 시황 전망 보기 →</text>
</svg>`;

  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.status(200).send(svg);
}
