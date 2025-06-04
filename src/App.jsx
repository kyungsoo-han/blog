import React, { useEffect, useState, useCallback } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import "./App.css";

import {
  API_HANDLER_URL,
  GITHUB_USERNAME,
  GITHUB_ADMIN_USERNAME,
  GITHUB_OAUTH_CLIENT_ID,
  GITHUB_OAUTH_REDIRECT_URI,
} from "./config";

import Header from "./components/Header";
import Home from "./components/Home";
import PostList from "./components/PostList";
import PostView from "./components/PostView";
import PostWrite from "./components/PostWrite";
import PostEdit from "./components/PostEdit";
import Portfolio from "./components/Portfolio";
import PlanningCalendar from "./components/PlanningCalendar";

const App = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // 상태는 동일하게 유지
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [githubTokenInternal, setGithubTokenInternal] = useState(() =>
    localStorage.getItem("githubToken"),
  );

  // githubToken 상태 업데이트 함수
  const setGithubToken = (token) => {
    if (token) localStorage.setItem("githubToken", token);
    else localStorage.removeItem("githubToken");
    setGithubTokenInternal(token);
  };

  // 로그인, 로그아웃, 인증 콜백 등은 기존과 동일하게 구현
  const handleGitHubLogin = () => {
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_OAUTH_CLIENT_ID}&redirect_uri=${encodeURIComponent(GITHUB_OAUTH_REDIRECT_URI)}&scope=read:user`;
    window.location.href = githubAuthUrl;
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsAdmin(false);
    setGithubToken(null);
    navigate("/");
  };

  // 인증 체크 useEffect (코드 동일)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");

    const verifyTokenAndFetchUser = async (token) => {
      setAuthLoading(true);
      try {
        const response = await fetch("https://api.github.com/user", {
          headers: { Authorization: `token ${token}` },
        });
        if (response.ok) {
          const userData = await response.json();
          setCurrentUser({
            login: userData.login,
            avatar_url: userData.avatar_url,
            name: userData.name,
          });
          setIsAdmin(userData.login === GITHUB_ADMIN_USERNAME);
          setGithubToken(token);
          return true;
        } else {
          handleLogout();
          return false;
        }
      } catch {
        handleLogout();
        return false;
      } finally {
        setAuthLoading(false);
      }
    };

    const exchangeCodeForToken = async (authCode) => {
      setAuthLoading(true);
      try {
        const response = await fetch(`${API_HANDLER_URL}/api/auth/github`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: authCode }),
        });

        if (response.ok) {
          const { token, user } = await response.json();
          let authSuccess = false;
          if (token) authSuccess = await verifyTokenAndFetchUser(token);
          else if (user) {
            setCurrentUser({
              login: user.login,
              avatar_url: user.avatar_url,
              name: user.name,
            });
            setIsAdmin(user.login === GITHUB_ADMIN_USERNAME);
            setAuthLoading(false);
            authSuccess = true;
          } else throw new Error("Token or user not received from backend");
          if (authSuccess) {
            window.history.replaceState({}, document.title, "/");
            navigate("/");
          } else {
            window.history.replaceState({}, document.title, "/");
            navigate("/");
          }
        } else {
          handleLogout();
          setAuthLoading(false);
          window.history.replaceState({}, document.title, "/");
          navigate("/");
        }
      } catch {
        handleLogout();
        setAuthLoading(false);
        window.history.replaceState({}, document.title, "/");
        navigate("/");
      }
    };

    if (code) {
      const cleanPath = window.location.pathname;
      window.history.replaceState({}, document.title, cleanPath);
      exchangeCodeForToken(code);
    } else if (githubTokenInternal) {
      verifyTokenAndFetchUser(githubTokenInternal);
    } else {
      setAuthLoading(false);
    }
  }, []);

  // 글 데이터 페칭
  const fetchDirectoryContents = useCallback(async (directoryPath) => {
    if (!API_HANDLER_URL) return [];
    try {
      const response = await fetch(
        `${API_HANDLER_URL}/api/github/contents/${directoryPath}`,
      );
      if (!response.ok) return [];
      const files = await response.json();
      if (!Array.isArray(files)) return [];
      const postsData = await Promise.all(
        files
          .filter((f) => f.name && f.name.endsWith(".md") && f.type === "file")
          .map(async (file) => {
            try {
              const contentResponse = await fetch(
                `${API_HANDLER_URL}/api/github/contents/${directoryPath}/${file.name}`,
              );
              if (!contentResponse.ok) {
                return {
                  ...file,
                  title: file.name.replace(/\.md$/, ""),
                  preview: "내용 로드 실패",
                  date: 0,
                  sourceDir: directoryPath,
                };
              }
              const contentText = await contentResponse.text();
              const lines = contentText.split("\n");
              let title = file.name.replace(/\.md$/, "");
              if (lines[0] && lines[0].startsWith("# ")) {
                title = lines[0].substring(2).trim();
              }
              const contentStartIndex =
                lines[0] && lines[0].startsWith("# ") ? 1 : 0;
              const preview =
                lines
                  .slice(contentStartIndex)
                  .filter((l) => l.trim() !== "" && !l.startsWith("#"))
                  .join(" ")
                  .substring(0, 150) + "...";
              let date = new Date(NaN);
              const timestampMatch = file.name.match(/^(\d{13})-/);
              if (timestampMatch && timestampMatch[1]) {
                date = new Date(parseInt(timestampMatch[1], 10));
              } else {
                const yyyymmddMatch = file.name.match(
                  /^(\d{4})(\d{2})(\d{2})-/,
                );
                if (yyyymmddMatch) {
                  date = new Date(
                    parseInt(yyyymmddMatch[1], 10),
                    parseInt(yyyymmddMatch[2], 10) - 1,
                    parseInt(yyyymmddMatch[3], 10),
                  );
                } else {
                  const yyyy_mm_ddMatch = file.name.match(
                    /^(\d{4})-(\d{2})-(\d{2})-/,
                  );
                  if (yyyy_mm_ddMatch) {
                    date = new Date(
                      parseInt(yyyy_mm_ddMatch[1], 10),
                      parseInt(yyyy_mm_ddMatch[2], 10) - 1,
                      parseInt(yyyy_mm_ddMatch[3], 10),
                    );
                  }
                }
              }
              return {
                ...file,
                title,
                preview,
                date: isNaN(date.getTime()) ? 0 : date.getTime(),
                sourceDir: directoryPath,
              };
            } catch {
              return {
                ...file,
                title: file.name.replace(/\.md$/, ""),
                preview: "내용 처리 오류",
                date: 0,
                sourceDir: directoryPath,
              };
            }
          }),
      );
      return postsData.filter((p) => p && p.title);
    } catch {
      return [];
    }
  }, []);

  const fetchAllPosts = useCallback(async () => {
    setLoading(true);
    const directoriesToFetch = ["_posts", "_articles"];
    try {
      const results = await Promise.all(
        directoriesToFetch.map((dir) => fetchDirectoryContents(dir)),
      );
      const combinedPostsRaw = results.flat().filter((post) => post);

      const uniquePostsMap = new Map();
      combinedPostsRaw.forEach((post) => {
        if (post.sha && !uniquePostsMap.has(post.sha)) {
          uniquePostsMap.set(post.sha, post);
        } else if (!post.sha && post.path && !uniquePostsMap.has(post.path)) {
          uniquePostsMap.set(post.path, post);
        } else if (!post.sha && !post.path && post.name) {
          const uniqueKey = `${post.sourceDir}/${post.name}`;
          if (!uniquePostsMap.has(uniqueKey)) {
            uniquePostsMap.set(uniqueKey, post);
          }
        }
      });
      const combinedPosts = Array.from(uniquePostsMap.values());
      combinedPosts.sort((a, b) => (b.date || 0) - (a.date || 0));
      setPosts(combinedPosts);
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [fetchDirectoryContents]);

  useEffect(() => {
    if (!API_HANDLER_URL) {
      alert("블로그 API 설정을 확인해주세요. (VITE_API_HANDLER_URL)");
      setLoading(false);
      setAuthLoading(false);
      return;
    }
    fetchAllPosts();
  }, [fetchAllPosts]);

  // 인증 로딩 중일 때
  if (authLoading) {
    return <div className="loading">인증 정보를 확인 중입니다...</div>;
  }

  return (
    <div className="app">
      <Header
        currentUser={currentUser}
        isAdmin={isAdmin}
        onLogin={handleGitHubLogin}
        onLogout={handleLogout}
      />
      <main className="main">
        <div className="container">
          {loading && <div className="loading">블로그 콘텐츠 로딩 중...</div>}
          {!loading && (
            <Routes>
              <Route path="/" element={<Home posts={posts} />} />
              <Route path="/posts" element={<PostList posts={posts} />} />
              <Route
                path="/posts/:postName"
                element={
                  <PostView
                    posts={posts}
                    isAdmin={isAdmin}
                    currentUser={currentUser}
                  />
                }
              />
              <Route
                path="/write"
                element={
                  isAdmin ? (
                    <PostWrite />
                  ) : (
                    <div className="error-page">
                      <p>
                        글을 작성할 권한이 없습니다. 먼저 관리자로
                        로그인해주세요.
                      </p>
                      {!currentUser && (
                        <button onClick={handleGitHubLogin}>
                          GitHub으로 로그인
                        </button>
                      )}
                    </div>
                  )
                }
              />
              <Route
                path="/edit/:postName"
                element={
                  isAdmin ? (
                    <PostEdit posts={posts} />
                  ) : (
                    <div className="error-page">
                      <p>글을 수정할 권한이 없습니다.</p>
                    </div>
                  )
                }
              />
              <Route path="/portfolio" element={<Portfolio />} />
              <Route path="/planner" element={<PlanningCalendar />} />
              {/* ✅ GitHub OAuth 콜백 경로 처리 추가 */}
              <Route
                path="/callback"
                element={<div>GitHub 로그인 처리 중입니다...</div>}
              />
            </Routes>
          )}
        </div>
      </main>
      <footer className="footer">
        <div className="container">
          <p>
            &copy; {new Date().getFullYear()} {GITHUB_USERNAME}'s Blog. All
            rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
