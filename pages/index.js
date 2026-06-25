import { useState, useEffect } from 'react';

export default function Admin() {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [sub, setSub] = useState('');
  const [summary, setSummary] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [tab, setTab] = useState('manage');
  const [baseUrl, setBaseUrl] = useState('');
  const [copied, setCopied] = useState('');

  useEffect(() => { setBaseUrl(window.location.origin); }, []);

  async function save() {
    if (!title) { alert('제목 입력'); return; }
    if (!url) { alert('URL 입력'); return; }
    if (!password) { alert('비밀번호 입력'); return; }
    setMsg('저장 중...');
    try {
      const r = await fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, url, sub, summary, password }),
      });
      const text = await r.text();
      let data;
      try { data = JSON.parse(text); } catch { setMsg('응답 오류: ' + text.slice(0, 100)); return; }
      if (data.ok) setMsg('✓ 저장 완료!');
      else setMsg('오류: ' + (data.error || JSON.stringify(data)));
    } catch (e) {
      setMsg('네트워크 오류: ' + e.message);
    }
  }

  const copyUrl = (path, key) => {
    navigator.clipboard.writeText(baseUrl + path);
    setCopied(key);
    setTimeout(() => setCopied(''), 1500);
  };

  const urls = [
    { label: '섬네일 이미지', key: 'thumbnail', path: '/api/thumbnail', color: '#1A4A7A', bg: '#E6F1FB' },
    { label: '게시글 제목', key: 'title', path: '/api/title', color: '#085041', bg: '#E1F5EE' },
    { label: '200자 요약', key: 'summary', path: '/api/summary', color: '#633806', bg: '#FAEEDA' },
    { label: '게시글 바로가기', key: 'link', path: '/api/link', color: '#3C3489', bg: '#EEEDFE' },
  ];

  return (
    <div style={{fontFamily:'sans-serif',maxWidth:600,margin:'0 auto',padding:'2rem 1rem'}}>
      <h2 style={{fontSize:16,fontWeight:500,marginBottom:24}}>MVP 월간시황 관리자</h2>

      <div style={{display:'flex',gap:8,marginBottom:24,borderBottom:'1px solid #eee',paddingBottom:0}}>
        {[['manage','글 업데이트'],['urls','URL 4개']].map(([k,l])=>(
          <button key={k} onClick={()=>setTab(k)} style={{padding:'8px 16px',border:'none',background:'none',cursor:'pointer',borderBottom:tab===k?'2px solid #111':'2px solid transparent',fontWeight:tab===k?500:400,fontSize:13}}>
            {l}
          </button>
        ))}
      </div>

      {tab === 'manage' && (
        <div>
          <div style={{marginBottom:12}}>
            <div style={{fontSize:12,color:'#888',marginBottom:4}}>게시글 URL *</div>
            <input value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://miraeassetmvp.imweb.me/monthly/123" style={{width:'100%',padding:'8px',border:'1px solid #ccc',borderRadius:6,fontSize:13,boxSizing:'border-box'}} />
          </div>
          <div style={{marginBottom:12}}>
            <div style={{fontSize:12,color:'#888',marginBottom:4}}>게시글 제목 *</div>
            <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="2025년 7월 월간시황전망" style={{width:'100%',padding:'8px',border:'1px solid #ccc',borderRadius:6,fontSize:13,boxSizing:'border-box'}} />
          </div>
          <div style={{marginBottom:12}}>
            <div style={{fontSize:12,color:'#888',marginBottom:4}}>썸네일 소제목</div>
            <input value={sub} onChange={e=>setSub(e.target.value)} placeholder="글로벌 시장 변동성 점검" style={{width:'100%',padding:'8px',border:'1px solid #ccc',borderRadius:6,fontSize:13,boxSizing:'border-box'}} />
          </div>
          <div style={{marginBottom:12}}>
            <div style={{fontSize:12,color:'#888',marginBottom:4}}>200자 요약</div>
            <textarea value={summary} onChange={e=>setSummary(e.target.value)} rows={4} placeholder="요약 내용..." style={{width:'100%',padding:'8px',border:'1px solid #ccc',borderRadius:6,fontSize:13,boxSizing:'border-box',resize:'vertical'}} />
          </div>
          <div style={{marginBottom:16}}>
            <div style={{fontSize:12,color:'#888',marginBottom:4}}>관리자 비밀번호 *</div>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="비밀번호" style={{width:'100%',padding:'8px',border:'1px solid #ccc',borderRadius:6,fontSize:13,boxSizing:'border-box'}} />
          </div>
          <button onClick={save} style={{width:'100%',padding:'11px',background:'#111',color:'#fff',border:'none',borderRadius:8,fontSize:14,fontWeight:500,cursor:'pointer'}}>
            저장 및 4개 URL 즉시 반영
          </button>
          {msg && <div style={{marginTop:12,padding:'10px 12px',background:msg.startsWith('✓')?'#E1F5EE':'#FFF3CD',borderRadius:8,fontSize:13,color:msg.startsWith('✓')?'#0F6E56':'#856404'}}>{msg}</div>}
        </div>
      )}

      {tab === 'urls' && (
        <div>
          <div style={{fontSize:12,color:'#888',marginBottom:16,lineHeight:1.6}}>
            아래 URL을 카카오채널에 한 번만 등록하면, 글이 바뀔 때마다 자동으로 교체됩니다.
          </div>
          {urls.map(u=>(
            <div key={u.key} style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}>
              <span style={{fontSize:11,fontWeight:500,padding:'3px 8px',borderRadius:4,background:u.bg,color:u.color,whiteSpace:'nowrap'}}>{u.label}</span>
              <span style={{fontSize:12,fontFamily:'monospace',color:'#555',background:'#f5f5f5',padding:'5px 9px',borderRadius:5,flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{baseUrl+u.path}</span>
              <button onClick={()=>copyUrl(u.path,u.key)} style={{fontSize:11,padding:'4px 10px',border:'0.5px solid #ccc',borderRadius:5,cursor:'pointer',background:'none',whiteSpace:'nowrap'}}>
                {copied===u.key?'복사됨!':'복사'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
