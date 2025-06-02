# 📝 개인 블로그 프로젝트 소개 (React + Node.js + GitHub + Markdown)

> GitHub 저장소를 CMS처럼 활용한, React 기반의 개인 블로그를 소개합니다.
> Markdown으로 작성된 글을 GitHub에 업로드하고, 다시 불러와 렌더링하는 구조입니다.

---

## 🔧 사용 기술 스택

* **Frontend**: React (Vite), TailwindCSS, Marked.js
* **Backend**: Node.js (Express)
* **인증 및 연동**: GitHub REST API + Personal Access Token (PAT)
* **배포**: GitHub Actions → 개인 서버 자동 배포

---

## 📌 주요 특징

### ✅ Markdown 기반 콘텐츠 관리

* 블로그 글은 GitHub 저장소 내 `posts/`, `articles/` 폴더에 `.md` 파일로 저장
* React 앱에서 해당 파일 목록을 가져와 리스트로 표시
* 글을 클릭하면 마크다운 내용을 HTML로 렌더링하여 보여줌

### ✅ GitHub API를 통한 실시간 업로드/수정

* React 앱에서 글 작성 후 업로드 → Node.js 서버로 전달
* 서버에서 GitHub API를 통해 해당 경로에 `.md` 파일 생성 (혹은 수정)
* 토큰 및 시크릿 키는 `.env`로 보호하고, 절대 클라이언트에 노출되지 않음

### ✅ Node.js 백엔드를 둔 이유

* GitHub API 호출 시 인증 토큰이 필요 → 클라이언트에서 직접 호출하면 보안 문제 발생
* Node.js 서버를 중간에 두어 토큰은 서버 측에서만 사용

---

## 🔐 인증 및 보안

```env
# .env 파일 예시
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxx
GITHUB_USERNAME=kyungsoo-han
GITHUB_REPO=blog
```

* 프론트엔드는 `.env`에 저장된 환경변수를 직접 참조하지 않고, 백엔드 API만 호출
* Node.js 서버에서 `Authorization: Bearer` 헤더를 이용해 안전하게 GitHub와 통신

---

## 🚀 배포 구조

### GitHub Actions + 개인 서버 자동 배포

* Vite 기반 React 프로젝트는 `npm run build` 후 정적 파일(`dist/`) 생성
* GitHub Actions에서 빌드 후 개인 서버(`/app/servers/blog`)로 자동 복사
* 기존 포트(예: 50011)가 열려 있으면 프로세스 종료 후 `npx serve`로 다시 실행

```yml
# GitHub Actions 요약
- name: Build and Deploy React Blog
- steps:
  - checkout + install
  - npm run build
  - scp dist/ → 개인 서버
  - ssh 접속 후 serve 실행 (기존 serve 프로세스 종료 포함)
```

---

## 📂 프로젝트 구조 (요약)

```
📦 blog
├── frontend/      # React 앱
│   ├── pages/
│   └── App.jsx
├── backend/       # Node.js 서버 (GitHub API proxy)
│   └── index.js
├── .github/workflows/deploy.yml
└── .env
```

---

## 🎯 앞으로의 개선 방향

* [ ] 글 검색 기능
* [ ] 태그 및 카테고리 분류
* [ ] 댓글 기능 (GitHub Discussions 또는 utterances)
* [ ] 이미지 업로드 지원

---

## 📬 마무리

이 블로그는 정적 사이트의 간편함과 CMS의 유연함을 함께 담고자 만든 프로젝트입니다.
GitHub를 백엔드 저장소처럼 활용하면서도, 보안과 배포 효율성까지 고려한 구조로 구현했습니다.

> 👉 GitHub 저장소: [kyungsoo-han/blog](https://github.com/kyungsoo-han/blog)
