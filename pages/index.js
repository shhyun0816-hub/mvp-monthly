import { useState, useEffect } from 'react';

export default function Admin() {
  const [tab, setTab] = useState('manage');
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [url, setUrl] = useState('');
  const [sub, setSub] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState('');
  const [copied, setCopied] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setBaseUrl(window.location.origin);
  }, []);

  const urls = [
    { label: '섬네일 이미지', key: 'thumbnail', path: '/api/thumbnail', color: '#1A4A7A', bg: '#E6F1FB' },
    { label: '게시글 제목', key: 'title', path: '/api/title', color: '#085041', bg: '#E1F5EE' },
    { label: '200자 요약', key: 'summary', path: '/api/summary', color: '#633806', bg: '#FAEEDA' },
    { label: '게시글 바로가기', key: 'link', path: '/api/link', color: '#3C3489', bg: '#EEEDFE' },
  ];

  const showMsg = (text, type) => {
    setMsg(text);
    setMsgType(type);
    setTimeout(() => setMsg(''), 4000);
  };

  const handleSave = async () => {
    if (!title) { alert('제목을 입력하세요.'); return; }
    if (!url) { alert('URL을 입력하세요.'); return; }
    if (!password) { alert('비밀번호를 입력하세요.'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, summary, url, sub, password }),
      });
      const data = await res.json();
      if (data.ok) {
        showMsg('✓ 저장 완료! 4개 URL이 즉시 업데이트되었습니다.', 'success');
      } else {
        showMsg(data.error || '오류가 발생했습니다.', 'error');
      }
    } catch (e) {
      showMsg('네트워크 오류: ' + e.message, 'error');
    }
    setLoading(false);
  };

  const copyUrl = (path, key) => {
    navigator.clipboard.writeText(baseUrl + path);
    setCopied(key);
    setTimeout(() => setCopied(''), 1500);
  };

  const s = {
    page: { fontFamily: "'Apple SD Gothic Neo','Noto Sans KR',sans-serif", maxWidth: 680, margin: '0 auto', padding: '2rem 1.25rem', color: '#111' },
    header: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 },
    dot: { width: 8, height: 8, borderRadius: '50%', background: '#1D9E75', flexShrink: 0 },
    tabBar: { display: 'flex', borderBottom: '1px solid #eee', marginBottom: 24, gap: 4 },
    tab: (active) => ({ padding: '8px 16px', fontSize: 13, cursor: 'pointer', border: 'none', background: 'none', color: active ? '#111' : '#888', borderBottom: active ? '2px solid #111' : '2px solid transparent', fontWeight: active ? 500 : 400 }),
    card: { background: '#fff', border: '0.5px solid #e5e5e5', borderRadius: 12, padding: '1.25rem', marginBottom: '1rem' },
    label: { fontSize: 12, color: '#888', marginBottom: 5, display: 'block' },
    input: { fontSize: 13, padding: '8px 10px', border: '0.5px solid #ccc', borderRadius: 8, width: '100%', fontFamily: 'inherit', marginBottom: 12, boxSizing: 'border-box' },
    textarea: { fontSize: 13, padding: '8px 10px', border: '0.5px solid #ccc', borderRadius: 8, width: '100%', fontFamily: 'inherit', minHeight: 90, resize: 'vertical', marginBottom: 4, boxSizing: 'border-box' },
    btn: { padding: '10px 20px', background: loading ? '#888' : '#111', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer', width: '100%' },
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

          <label style={s.label}>게시글 URL *</label>
          <input style={s.input} placeholder="https://miraeassetmvp.imweb.me/monthly/123" value={url} onChange={e => setUrl(e.target.value)} />

          <label style={s.label}>게시글 제목 *</label>
          <input style={s.input} placeholder="2025년 7월 월간시황전망" value={title} onChange={e => setTitle(e.target.value)} />

          <label style={s.label}>썸네일 소제목</label>
          <input style={s.input} placeholder="글로벌 시장 변동성 확대 국면" value={sub} onChange={e => setSub(e.target.value)} />

          <label style={s.label}>200자 요약</label>
          <textarea style={s.textarea} placeholder="게시글 요약 내용 입력..." value={summary} onChange={e => setSummary(e.target.value)} />
          <div style={{ fontSize: 11, color: summary.length > 200 ? '#E24B4A' : '#bbb', textAlign: 'right', marginBottom: 12 }}>
            {summary.length} / 200자
          </div>

          <div style={{ borderTop: '0.5px solid #eee', paddingTop: 14 }}>
            <label style={s.label}>관리자 비밀번호 *</label>
            <input style={s.input} type="password" placeholder="비밀번호 입력" value={password} onChange={e => setPassword(e.target.value)} />
            <button style={s.btn} onClick={handleSave} disabled={loading}>
              {loading ? '저장 중...' : '저장 및 4개 URL에 즉시 반영'}
            </button>
          </div>

          {msg && (
            <div style={{ fontSize: 13, color: msgType === 'success' ? '#0F6E56' : '#E24B4A', marginTop: 12, padding: '10px 12px', background: msgType === 'success' ? '#E1F5EE' : '#FCEBEB', borderRadius: 8 }}>
              {msg}
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
              /api/thumbnail → 800×400 이미지 (최신 제목 자동 반영)<br />
              /api/title → 최신 게시글 제목 텍스트<br />
              /api/summary → 200자 요약 텍스트<br />
              /api/link → 최신 게시글 URL로 자동 이동
            </div>
          </div>
        </>
      )}

      {tab === 'guide' && (
        <>
          {[
            ['새 글 올라올 때마다 이 페이지 접속', '글 업데이트 탭에서 URL·제목·소제목·요약 입력 후 저장합니다.'],
            ['비밀번호 확인', 'Vercel 환경변수 ADMIN_PASSWORD 값입니다. 설정 안 했으면 기본값은 mvp2025'],
            ['카카오채널에는 URL 4개만 등록', 'URL 탭의 4개 주소를 채널에 한 번만 등록하면 끝. 이후 수정 불필요.'],
          ].map(([t, d], i) => (
            <div key={i} style={s.step}>
              <div style={s.stepNum}>{i + 1}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 3 }}>{t}</div>
                <div style={{ fontSize: 12, color: '#666', lineHeight: 1.6 }}>{d}</div>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
