# 📝 개인 블로그 프로젝트 소개 (React + Node.js + GitHub + Markdown)

> GitHub 저장소를 CMS처럼 활용한, React 기반의 개인 블로그를 소개합니다.
> Markdown으로 작성된 글을 GitHub에 업로드하고, 다시 불러와 렌더링하며, 댓글 기능까지 지원합니다.
 
---

## 🔧 사용 기술 스택

| 구성 요소        | 기술 스택                                   |
| ------------ | --------------------------------------- |
| **Frontend** | React (Vite), TailwindCSS, Marked.js    |
| **Backend**  | Node.js (Express)                       |
| **API 연동**   | GitHub REST API + Personal Access Token |
| **배포**       | GitHub Actions → 개인 서버 자동 배포            |
| **댓글**       | Utterances (GitHub 기반 댓글 시스템)           |

---

## 📌 주요 특징

### ✅ Markdown 기반 콘텐츠 관리

* 블로그 글은 GitHub 저장소 내 `posts/`, `articles/` 폴더에 `.md` 파일로 저장
* React 앱에서 해당 파일 목록을 불러와 리스트로 표시
* 클릭 시 마크다운 내용을 HTML로 렌더링

### ✅ 실시간 업로드/조회

* React에서 작성한 글은 Node.js 서버를 통해 GitHub 저장소에 업로드 (`PUT` API 호출)
* 기존 글은 GitHub API를 통해 내용 fetch 후 마크다운 렌더링

### ✅ Node.js 서버를 이용한 보안 처리

* GitHub Token 및 시크릿 ID를 클라이언트에 노출하지 않기 위해 백엔드 구성
* `.env` 파일을 통해 안전하게 인증 정보 관리

### ✅ 댓글 기능 연동 (Utterances)

* GitHub 이슈 기반 댓글 시스템인 Utterances 사용
* 방문자는 GitHub 계정으로 로그인 후 댓글 작성 가능
* 댓글 내용은 GitHub Issue로 저장되며, 페이지마다 고유 이슈로 분리됨

---

## 🔐 인증 및 보안

```env
# .env 파일 예시
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxx
GITHUB_USERNAME=kyungsoo-han
GITHUB_REPO=blog
```

* 백엔드에서만 GitHub API 토큰 사용 (프론트엔드에 노출되지 않음)
* `Authorization: Bearer` 헤더로 GitHub API 호출 시 인증 처리

---

## 🚀 배포 구조

### GitHub Actions + 개인 서버 자동 배포

* `vite build`로 생성된 정적 파일을 `/app/servers/blog`에 배포
* GitHub Actions에서 포트 50011에서 실행되도록 구성
* 기존 포트에서 실행 중인 프로세스 종료 후 `npx serve`로 재시작

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
├── .env
└── README.md
```

---

## 🎯 앞으로의 개선 방향

* [ ] 글 검색 기능
* [ ] 태그 및 카테고리 분류
* [ ] 이미지 업로드 및 미리보기
* [ ] 작성 중 자동 저장 기능

---

## 📬 마무리

이 블로그는 정적 사이트의 간편함과 CMS의 유연함을 함께 담고자 만든 프로젝트입니다.
GitHub를 백엔드 저장소처럼 활용하면서도, 보안과 배포 효율성까지 고려한 구조로 구현했으며,
댓글 기능까지 갖춘 완성도 높은 개인 블로그로 발전시켜가고 있습니다.

> 👉 GitHub 저장소: [kyungsoo-han/blog](https://github.com/kyungsoo-han/blog)

