export default function Home() { return null; }

export async function getServerSideProps(context) {
  const { res } = context;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.write(`<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width"/>
<title>MVP 월간시황 관리자</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:sans-serif;max-width:600px;margin:0 auto;padding:2rem 1rem}
h2{font-size:16px;font-weight:500;margin-bottom:24px}
label{font-size:12px;color:#888;display:block;margin-bottom:4px;margin-top:14px}
input,textarea{width:100%;padding:8px 10px;border:1px solid #ccc;border-radius:6px;font-size:13px}
textarea{min-height:80px;resize:vertical;font-family:sans-serif}
#saveBtn{width:100%;padding:12px;background:#111;color:#fff;border:none;border-radius:8px;font-size:14px;font-weight:500;cursor:pointer;margin-top:16px}
#msg{margin-top:12px;padding:10px;border-radius:8px;font-size:13px;display:none}
.ok{background:#E1F5EE;color:#0F6E56}
.err{background:#FCEBEB;color:#A32D2D}
.tabs{display:flex;border-bottom:1px solid #eee;margin-bottom:24px}
.tab{padding:8px 16px;border:none;background:none;cursor:pointer;font-size:13px;border-bottom:2px solid transparent}
.tab.on{font-weight:500;border-bottom-color:#111}
.sec{display:none}.sec.on{display:block}
.row{display:flex;align-items:center;gap:8px;margin-bottom:8px}
.badge{font-size:11px;font-weight:500;padding:3px 8px;border-radius:4px;white-space:nowrap}
.mono{font-size:12px;font-family:monospace;background:#f5f5f5;padding:5px 9px;border-radius:5px;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#555}
.cpbtn{font-size:11px;padding:4px 10px;border:0.5px solid #ccc;border-radius:5px;cursor:pointer;background:none}
</style>
</head>
<body>
<h2>MVP 월간시황 관리자</h2>
<div class="tabs">
  <button class="tab on" onclick="sw('manage',this)">글 업데이트</button>
  <button class="tab" onclick="sw('urls',this)">URL 4개</button>
</div>
<div id="manage" class="sec on">
  <label>게시글 URL *</label>
  <input id="iurl" placeholder="https://miraeassetmvp.imweb.me/monthly/123"/>
  <label>게시글 제목 *</label>
  <input id="ititle" placeholder="2025년 7월 월간시황전망"/>
  <label>썸네일 소제목</label>
  <input id="isub" placeholder="글로벌 시장 변동성 점검"/>
  <label>200자 요약</label>
  <textarea id="isum" placeholder="요약 내용..."></textarea>
  <label>관리자 비밀번호 *</label>
  <input id="ipw" type="password" placeholder="비밀번호 (기본값: mvp2025)"/>
  <button id="saveBtn" onclick="doSave()">저장 및 4개 URL 즉시 반영</button>
  <div id="msg"></div>
</div>
<div id="urls" class="sec">
  <p style="font-size:12px;color:#888;margin-bottom:16px;line-height:1.6">아래 URL을 카카오채널에 한 번만 등록하면, 새 글이 올라올 때마다 자동으로 교체됩니다.</p>
  <div class="row"><span class="badge" style="background:#E6F1FB;color:#1A4A7A">섬네일 이미지</span><span class="mono" id="u1"></span><button class="cpbtn" onclick="cp('u1')">복사</button></div>
  <div class="row"><span class="badge" style="background:#E1F5EE;color:#085041">게시글 제목</span><span class="mono" id="u2"></span><button class="cpbtn" onclick="cp('u2')">복사</button></div>
  <div class="row"><span class="badge" style="background:#FAEEDA;color:#633806">200자 요약</span><span class="mono" id="u3"></span><button class="cpbtn" onclick="cp('u3')">복사</button></div>
  <div class="row"><span class="badge" style="background:#EEEDFE;color:#3C3489">게시글 바로가기</span><span class="mono" id="u4"></span><button class="cpbtn" onclick="cp('u4')">복사</button></div>
</div>
<script>
var b=location.origin;
document.getElementById('u1').textContent=b+'/api/thumbnail';
document.getElementById('u2').textContent=b+'/api/title';
document.getElementById('u3').textContent=b+'/api/summary';
document.getElementById('u4').textContent=b+'/api/link';
function sw(id,el){
  document.querySelectorAll('.sec').forEach(function(s){s.classList.remove('on')});
  document.querySelectorAll('.tab').forEach(function(t){t.classList.remove('on')});
  document.getElementById(id).classList.add('on');
  el.classList.add('on');
}
function msg(t,c){var e=document.getElementById('msg');e.textContent=t;e.className=c;e.style.display='block';}
function cp(id){navigator.clipboard.writeText(document.getElementById(id).textContent);msg('복사됨!','ok');}
async function doSave(){
  var url=document.getElementById('iurl').value.trim();
  var title=document.getElementById('ititle').value.trim();
  var sub=document.getElementById('isub').value.trim();
  var summary=document.getElementById('isum').value.trim();
  var pw=document.getElementById('ipw').value.trim();
  if(!url){alert('URL을 입력하세요');return;}
  if(!title){alert('제목을 입력하세요');return;}
  if(!pw){alert('비밀번호를 입력하세요');return;}
  document.getElementById('saveBtn').textContent='저장 중...';
  msg('저장 중...','');
  try{
    var r=await fetch('/api/save',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({url:url,title:title,sub:sub,summary:summary,password:pw})});
    var txt=await r.text();
    try{
      var d=JSON.parse(txt);
      if(d.ok)msg('✓ 저장 완료! 4개 URL이 업데이트되었습니다.','ok');
      else msg('오류: '+(d.error||JSON.stringify(d)),'err');
    }catch(e){msg('응답오류: '+txt.slice(0,200),'err');}
  }catch(e){msg('네트워크오류: '+e.message,'err');}
  document.getElementById('saveBtn').textContent='저장 및 4개 URL 즉시 반영';
}
</script>
</body>
</html>`);
  res.end();
  return { props: {} };
}
