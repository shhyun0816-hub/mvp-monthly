# MVP 월간시황 콘텐츠 관리 시스템

카카오채널에 고정 URL 4개를 등록해두고, 새 게시글이 올라올 때마다 관리자 페이지에서 내용만 업데이트하면 URL 안의 콘텐츠가 자동으로 바뀌는 시스템입니다.

## URL 4개

| 용도 | 경로 |
|------|------|
| 800×400 섬네일 이미지 | `/api/thumbnail` |
| 게시글 제목 | `/api/title` |
| 200자 요약 | `/api/summary` |
| 게시글 바로가기 (리다이렉트) | `/api/link` |

## 배포 방법

### 1. GitHub에 올리기
```bash
git init
git add .
git commit -m "init"
git remote add origin https://github.com/YOUR_ID/mvp-monthly.git
git push -u origin main
```

### 2. Vercel에 배포
1. https://vercel.com 에서 로그인 (Google 계정 shhyun0816@gmail.com 사용)
2. "Add New Project" → GitHub 저장소 선택
3. Deploy 클릭

### 3. Vercel KV 설정 (데이터 저장소)
1. Vercel 대시보드 → Storage 탭
2. "Create Database" → KV 선택
3. 프로젝트에 Connect

### 4. 환경변수 설정
Vercel 대시보드 → Settings → Environment Variables:

| 키 | 값 |
|----|-----|
| `ADMIN_PASSWORD` | 원하는 비밀번호 (예: mvp2025!) |
| `ANTHROPIC_API_KEY` | Claude API 키 (AI 요약 기능용, 선택) |

KV 연결 시 `KV_URL`, `KV_REST_API_URL`, `KV_REST_API_TOKEN` 등은 자동 추가됩니다.

### 5. 재배포
환경변수 추가 후 Vercel에서 Redeploy 한 번 실행.

## 사용 방법

새 게시글이 올라올 때마다:
1. `https://your-project.vercel.app` 접속
2. URL·제목·소제목·요약 입력
3. 관리자 비밀번호 입력 후 저장

끝. 카카오채널 구독자는 항상 최신 내용을 보게 됩니다.

