import { useState, useEffect } from 'react';

export default function Admin() {
  const [tab, setTab] = useState('manage');
  const [form, setForm] = useState({ title: '', summary: '', url: '', sub: '', password: '' });
  const [charCount, setCharCount] = useState(0);
  const [msg, setMsg] = useState({ text: '', type: '' });
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState('');
  const [baseUrl, setBaseUrl] = useState('');

  useEffect(() => {
    setBaseUrl(window.location.origin);
  }, []);

  const urls = [
    { label: '섬네일 이미지', key: 'thumbnail', path: '/api/thumbnail', color: '#1A4A7A', bg: '#E6F1FB' },
    { label: '게시글 제목', key: 'title', path: '/api/title', color: '#085041', bg: '#E1F5EE' },
    { label: '200자 요약', key: 'summary', path: '/api/summary', color: '#633806', bg: '#FAEEDA' },
    { label: '게시글 바로가기', key: 'link', path: '/api/link', color: '#3C3489', bg: '#EEEDFE' },
  ];

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    if (k === 'summary') setCharCount(v.length);
  };

  const handleSave = async () => {
    if (!form.title || !form.url) return showMsg('제목과 URL을 입력하세요.', 'error');
    if (!form.password) return showMsg('관리자 비밀번호를 입력하세요.', 'error');
    const res = await fetch('/api/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (data.ok) showMsg('✓ 저장 완료! 4개 URL이 즉시 업데이트되었습니다.', 'success');
    else showMsg(data.error || '오류가 발생했습니다.', 'error');
  };

  const handleAI = async () => {
    if (!form.title && !form.summary) return showMsg('제목과 본문을 먼저 입력하세요.', 'error');
    setIsGenerating(true);
    try {
      const res = await fetch('/api/ai-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: form.title, body: form.summary }),
      });
      const data = await res.json();
      if (data.summary) set('summary', data.summary);
    } catch { showMsg('AI 요약 실패. 직접 입력해주세요.', 'error'); }
    setIsGenerating(false);
  };

  const showMsg = (text, type) => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: '', type: '' }), 3500);
  };

  const copyUrl = (path, key) => {
    navigator.clipboard.writeText(baseUrl + path);
    setCopied(key);
    setTimeout(() => setCopied(''), 1500);
  };

  const s = {
    page: { fontFamily: "'Apple SD Gothic Neo','Noto Sans KR',sans-serif", maxWidth: 680, margin: '0 auto', padding: '2rem 1.25rem', color: '#111' },
    header: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 },
    dot: { width: 8, height: 8, borderRadius: '50%', background: '#1D9E75' },
    tabBar: { display: 'flex', borderBottom: '1px solid #eee', marginBottom: 24, gap: 4 },
    tab: (active) => ({ padding: '8px 16px', fontSize: 13, cursor: 'pointer', border: 'none', background: 'none', color: active ? '#111' : '#888', borderBottom: active ? '2px solid #111' : '2px solid transparent', fontWeight: active ? 500 : 400 }),
    card: { background: '#fff', border: '0.5px solid #e5e5e5', borderRadius: 12, padding: '1.25rem', marginBottom: '1rem' },
    label: { fontSize: 12, color: '#888', marginBottom: 5, display: 'block' },
    input: { fontSize: 13, padding: '8px 10px', border: '0.5px solid #ccc', borderRadius: 8, width: '100%', fontFamily: 'inherit', marginBottom: 10 },
    textarea: { fontSize: 13, padding: '8px 10px', border: '0.5px solid #ccc', borderRadius: 8, width: '100%', fontFamily: 'inherit', minHeight: 90, resize: 'vertical' },
    btn: { padding: '9px 20px', background: '#111', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer' },
    btnAI: { padding: '5px 12px', background: '#EEEDFE', color: '#3C3489', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: 'pointer', marginLeft: 8 },
    urlRow: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 },
    urlText: { fontSize: 12, fontFamily: 'monospace', color: '#555', background: '#f5f5f5', padding: '5px 9px', borderRadius: 5, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
    copyBtn: { fontSize: 11, padding: '4px 10px', border: '0.5px solid #ccc', borderRadius: 5, cursor: 'pointer', background: 'none', color: '#555', whiteSpace: 'nowrap' },
    step: { display: 'flex', gap: 12, marginBottom: 18 },
    stepNum: { width: 26, height: 26, borderRadius: '50%', background: '#f3f3f3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 500, flexShrink: 0, color: '#666' },
    infoBox: { background: '#f8f8f8', borderRadius: 8, padding: '12px 14px', marginBottom: 12 },
  };

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div style={s.dot}></div>
        <span style={{ fontSize: 14, fontWeight: 500 }}>MVP 월간시황 콘텐츠 관리자</span>
        <span style={{ fontSize: 11, color: '#999', marginLeft: 'auto' }}>{baseUrl}</span>
      </div>

      <div style={s.tabBar}>
        {[['manage','글 업데이트'], ['urls','URL 4개'], ['guide','사용 방법']].map(([k, label]) => (
          <button key={k} style={s.tab(tab===k)} onClick={() => setTab(k)}>{label}</button>
        ))}
      </div>

      {tab === 'manage' && (
        <div style={s.card}>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 14 }}>새 게시글 정보 입력</div>
          <label style={s.label}>게시글 URL (imweb 링크)</label>
          <input style={s.input} placeholder="https://miraeassetmvp.imweb.me/monthly/123" value={form.url} onChange={e => set('url', e.target.value)} />

          <label style={s.label}>게시글 제목</label>
          <input style={s.input} placeholder="2025년 7월 월간시황전망" value={form.title} onChange={e => set('title', e.target.value)} />

          <label style={s.label}>
            썸네일 소제목 <span style={{ color: '#bbb' }}>(이미지에 표시)</span>
          </label>
          <input style={s.input} placeholder="글로벌 시장 변동성 확대 국면" value={form.sub} onChange={e => set('sub', e.target.value)} />

          <label style={s.label}>
            200자 요약
            <button style={s.btnAI} onClick={handleAI} disabled={isGenerating}>
              {isGenerating ? '생성 중...' : 'AI 자동 요약'}
            </button>
          </label>
          <textarea
            style={s.textarea}
            placeholder="게시글 본문을 붙여넣으면 AI가 200자 요약으로 변환해드립니다."
            value={form.summary}
            onChange={e => set('summary', e.target.value)}
          />
          <div style={{ fontSize: 11, color: charCount > 200 ? '#E24B4A' : '#bbb', textAlign: 'right', marginBottom: 12 }}>
            {charCount} / 200자
          </div>

          <div style={{ borderTop: '0.5px solid #eee', paddingTop: 14, marginTop: 4 }}>
            <label style={s.label}>관리자 비밀번호</label>
            <input style={{ ...s.input, marginBottom: 12 }} type="password" placeholder="설정한 비밀번호 입력" value={form.password} onChange={e => set('password', e.target.value)} />
            <button style={s.btn} onClick={handleSave}>저장 및 4개 URL에 즉시 반영</button>
          </div>

          {msg.text && (
            <div style={{ fontSize: 12, color: msg.type === 'success' ? '#0F6E56' : '#E24B4A', marginTop: 10 }}>
              {msg.text}
            </div>
          )}
        </div>
      )}

      {tab === 'urls' && (
        <>
          <div style={s.card}>
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 12 }}>카카오채널에 고정 등록할 URL 4개</div>
            <div style={{ fontSize: 12, color: '#888', marginBottom: 14, lineHeight: 1.6 }}>
              아래 URL을 카카오채널에 한 번만 등록하면, 글이 바뀔 때마다 내용이 자동으로 교체됩니다.
            </div>
            {urls.map(u => (
              <div key={u.key} style={s.urlRow}>
                <span style={{ fontSize: 11, fontWeight: 500, padding: '3px 8px', borderRadius: 4, background: u.bg, color: u.color, whiteSpace: 'nowrap' }}>{u.label}</span>
                <span style={s.urlText}>{baseUrl + u.path}</span>
                <button style={s.copyBtn} onClick={() => copyUrl(u.path, u.key)}>
                  {copied === u.key ? '복사됨!' : '복사'}
                </button>
              </div>
            ))}
          </div>
          <div style={s.infoBox}>
            <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 4 }}>각 URL이 반환하는 내용</div>
            <div style={{ fontSize: 12, color: '#666', lineHeight: 1.7 }}>
              /api/thumbnail → 800×400 SVG 이미지 (최신 제목·날짜 자동 반영)<br />
              /api/title → 최신 게시글 제목 텍스트<br />
              /api/summary → 200자 요약 텍스트<br />
              /api/link → 최신 게시글 URL로 자동 리다이렉트
            </div>
          </div>
        </>
      )}

      {tab === 'guide' && (
        <>
          {[
            ['Vercel KV 연동 확인', 'Vercel 대시보드 → Storage → KV Database를 생성하고 이 프로젝트에 연결하세요. 환경변수(KV_URL 등)가 자동으로 추가됩니다.'],
            ['환경변수 설정', 'Vercel 대시보드 → Settings → Environment Variables에서 ADMIN_PASSWORD (원하는 비밀번호)와 ANTHROPIC_API_KEY (AI 요약용)를 설정하세요.'],
            ['URL 4개를 카카오채널에 등록', '카카오 채널 관리자 센터에서 4개 URL을 한 번만 입력합니다. 이후 다시 수정할 필요 없습니다.'],
            ['새 글 올라올 때마다 이 페이지에서 업데이트', 'URL·제목·요약을 입력하고 저장 버튼만 누르면 끝. 30초면 완료됩니다.'],
          ].map(([title, desc], i) => (
            <div key={i} style={s.step}>
              <div style={s.stepNum}>{i + 1}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 3 }}>{title}</div>
                <div style={{ fontSize: 12, color: '#666', lineHeight: 1.6 }}>{desc}</div>
              </div>
            </div>
          ))}
          <div style={s.infoBox}>
            <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 4 }}>GitHub 저장소</div>
            <div style={{ fontSize: 12, color: '#666' }}>
              이 프로젝트를 GitHub에 push한 후 Vercel에서 Import하면 자동 배포됩니다.
            </div>
          </div>
        </>
      )}
    </div>
  );
}
