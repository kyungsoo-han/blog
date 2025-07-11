// src/utils/config.js

export const GITHUB_USERNAME = "kyungsoo-han"; // 블로그 소유자 (기존)
export const REPO_NAME = "blog";
export const UTTERANCES_REPO = "kyungsoo-han/blog-comments";

export const API_HANDLER_URL = import.meta.env.VITE_API_HANDLER_URL;

// GitHub OAuth 애플리케이션의 Client ID (GitHub에서 발급받은 값으로 변경)
export const GITHUB_OAUTH_CLIENT_ID = import.meta.env
  .VITE_GITHUB_OAUTH_CLIENT_ID;

// GitHub OAuth 리디렉션 URI (GitHub OAuth 앱에 등록한 값과 일치해야 함)
// 개발 시: http://localhost:50011/ (또는 특정 콜백 경로 예: /auth/callback)
// 배포 시: https://your-blog-domain.com/ (또는 특정 콜백 경로)
export const GITHUB_OAUTH_REDIRECT_URI = import.meta.env
  .VITE_GITHUB_OAUTH_REDIRECT_URI;

// 관리자 GitHub 사용자명 (실제 관리자 계정으로 변경하세요)
export const GITHUB_ADMIN_USERNAME = "kyungsoo-han";
