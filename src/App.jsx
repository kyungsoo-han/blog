// src/App.jsx
import React, { useState, useEffect, useCallback } from "react";
import "./App.css"; // 전역 CSS 임포트

// 유틸리티 및 설정 파일 임포트
import {
  API_HANDLER_URL,
  GITHUB_USERNAME,
  GITHUB_ADMIN_USERNAME,
  GITHUB_OAUTH_CLIENT_ID,
  GITHUB_OAUTH_REDIRECT_URI,
} from "./config";

// 컴포넌트 임포트
import Header from "./components/Header";
import Home from "./components/Home";
import PostList from "./components/PostList";
import PostView from "./components/PostView";
import PostWrite from "./components/PostWrite";
import PostEdit from "./components/PostEdit";
import Portfolio from "./components/Portfolio";
import PlanningCalendar from "./components/PlanningCalendar"; // 새로 추가된 컴포넌트 임포트

const App = () => {
  // 페이지 및 콘텐츠 상태
  const [currentPage, setCurrentPage] = useState("home");
  const [selectedPost, setSelectedPost] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true); // 콘텐츠 로딩 상태

  // 인증 관련 상태
  const [authLoading, setAuthLoading] = useState(true); // 인증 처리 중 로딩 상태
  const [currentUser, setCurrentUser] = useState(null); // 로그인한 사용자 정보
  const [isAdmin, setIsAdmin] = useState(false); // 관리자 여부
  // localStorage에서 토큰을 읽어오는 것을 초기값으로만 사용
  const [githubTokenInternal, setGithubTokenInternal] = useState(() =>
    localStorage.getItem("githubToken"),
  );

  // githubToken 상태를 업데이트하고 localStorage에도 반영하는 함수
  const setGithubToken = (token) => {
    if (token) {
      localStorage.setItem("githubToken", token);
    } else {
      localStorage.removeItem("githubToken");
    }
    setGithubTokenInternal(token);
  };

  // GitHub 로그인 시작
  const handleGitHubLogin = () => {
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_OAUTH_CLIENT_ID}&redirect_uri=${encodeURIComponent(GITHUB_OAUTH_REDIRECT_URI)}&scope=read:user`;
    window.location.href = githubAuthUrl;
  };

  // 로그아웃 처리
  const handleLogout = () => {
    setCurrentUser(null);
    setIsAdmin(false);
    setGithubToken(null); // 이 함수 내부에서 localStorage.removeItem("githubToken") 호출됨
    handleNavigate("home"); // 로그아웃 후 홈으로 이동
  };

  // 페이지 이동 핸들러 (useCallback으로 메모이제이션)
  const handleNavigate = useCallback(
    (page, postData = null) => {
      // 인증 로딩 중이 아닐 때만 권한 체크 (authLoading 중에는 isAdmin, currentUser가 확정되지 않았을 수 있음)
      if ((page === "write" || page === "edit") && !isAdmin && !authLoading) {
        alert("권한이 없습니다.");
        if (!currentUser) {
          // 로그인이 안 되어 있으면 로그인 유도
          handleGitHubLogin();
        }
        return; // 페이지 이동 중단
      }

      setCurrentPage(page);
      if (postData) {
        setSelectedPost(postData);
      } else if (page !== "edit" && page !== "view") {
        // 수정/보기 페이지로 이동하는 경우가 아니면 선택된 포스트 초기화
        setSelectedPost(null);
      }
      window.scrollTo(0, 0); // 페이지 변경 시 스크롤 상단으로
    },
    [isAdmin, currentUser, authLoading],
  ); // 의존성 배열: isAdmin, currentUser, authLoading 값이 변경되면 함수 재생성

  // OAuth 콜백 처리 및 초기 사용자 인증 상태 확인
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    // const state = urlParams.get("state"); // CSRF 방지를 위해 state 파라미터 사용 시 필요

    // GitHub 액세스 토큰을 사용하여 사용자 정보를 가져오고 상태를 업데이트하는 함수
    const verifyTokenAndFetchUser = async (token) => {
      setAuthLoading(true); // 사용자 정보 가져오기 시작 시 로딩 상태 true
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
          setGithubToken(token); // 토큰 상태 및 localStorage 업데이트
          return true; // 성공
        } else {
          console.error(
            "Failed to fetch user with token (status: " +
              response.status +
              "), or token expired.",
          );
          handleLogout(); // 유효하지 않은 토큰이면 로그아웃 처리
          return false; // 실패
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        handleLogout();
        return false;
      } finally {
        setAuthLoading(false); // 사용자 정보 가져오기 완료 시 로딩 상태 false
      }
    };

    // GitHub로부터 받은 code를 백엔드로 보내 토큰으로 교환하는 함수
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
          if (token) {
            // 백엔드가 GitHub 액세스 토큰을 직접 반환한 경우
            authSuccess = await verifyTokenAndFetchUser(token);
          } else if (user) {
            // 백엔드가 이미 사용자 정보까지 처리해서 준 경우
            setCurrentUser({
              login: user.login,
              avatar_url: user.avatar_url,
              name: user.name,
            });
            setIsAdmin(user.login === GITHUB_ADMIN_USERNAME);
            // 백엔드가 자체 세션/JWT 토큰을 발행했다면 그것을 setGithubToken 또는 다른 방식으로 저장해야 함
            // 여기서는 GitHub 토큰 기반이므로, 백엔드가 user 정보만 줬다면 토큰은 없는 상태
            setAuthLoading(false); // 수동으로 로딩 완료 처리
            authSuccess = true;
          } else {
            throw new Error("Token or user not received from backend");
          }

          if (authSuccess) {
            // 인증 성공 시 URL을 깨끗하게 정리하고 홈페이지로 이동
            window.history.replaceState({}, document.title, "/"); // 예: 루트 경로로 변경
            handleNavigate("home"); // 앱 내부 페이지 상태도 홈으로 변경 (선택적)
          } else {
            // verifyTokenAndFetchUser에서 이미 handleLogout 처리됨
            // 추가로 홈으로 보내거나 에러 메시지 표시 가능
            window.history.replaceState({}, document.title, "/");
            handleNavigate("home");
          }
        } else {
          const errorData = await response.json().catch(() => ({
            message: "백엔드 응답 파싱 실패 또는 텍스트 응답",
          }));
          throw new Error(
            errorData.message ||
              `Failed to exchange code with backend (status: ${response.status})`,
          );
        }
      } catch (error) {
        console.error("Error exchanging code with backend:", error);
        alert(`로그인 처리 중 오류가 발생했습니다: ${error.message}`);
        handleLogout();
        setAuthLoading(false); // 여기에서도 로딩 상태 해제
        window.history.replaceState({}, document.title, "/"); // 오류 시에도 URL 정리
        handleNavigate("home");
      }
    };

    if (code) {
      // URL에 code 파라미터가 있으면 OAuth 콜백 처리 시작
      console.log("GitHub OAuth code received, initiating token exchange...");
      // 중요: URL에서 code 파라미터를 즉시 제거 (새로고침 시 재처리 방지)
      // 현재 경로(예: /callback)는 유지한 채 쿼리 파라미터만 제거.
      const cleanPath = window.location.pathname;
      window.history.replaceState({}, document.title, cleanPath);

      exchangeCodeForToken(code);
    } else if (githubTokenInternal) {
      // 기존에 저장된 토큰(localStorage에서 읽어온)이 있으면 사용자 정보 로드 시도
      console.log("Existing token found, verifying...");
      verifyTokenAndFetchUser(githubTokenInternal);
    } else {
      // 코드도 없고 저장된 토큰도 없으면 비로그인 상태로 간주, 인증 로딩 완료
      console.log("No code and no existing token. User is not authenticated.");
      setAuthLoading(false);
    }
  }, []); // 초기 마운트 시 한 번만 실행 (code는 URL에서, githubTokenInternal은 state에서 읽음)

  // 데이터 페칭 로직 (useCallback으로 메모이제이션)
  const fetchDirectoryContents = useCallback(async (directoryPath) => {
    if (!API_HANDLER_URL) {
      console.error("API_HANDLER_URL is not configured.");
      return [];
    }
    try {
      const response = await fetch(
        `${API_HANDLER_URL}/api/github/contents/${directoryPath}`,
      );
      if (!response.ok) {
        if (response.status === 404) {
          console.warn(`Directory not found: ${directoryPath}`);
          return [];
        }
        const errorData = await response
          .json()
          .catch(() => ({ message: `HTTP error ${response.status}` }));
        throw new Error(
          errorData.message ||
            `API error for ${directoryPath}: ${response.status}`,
        );
      }
      const files = await response.json();
      if (!Array.isArray(files)) {
        console.warn(
          `Received non-array response for directory ${directoryPath}:`,
          files,
        );
        return [];
      }
      const postsData = await Promise.all(
        files
          .filter((f) => f.name && f.name.endsWith(".md") && f.type === "file")
          .map(async (file) => {
            try {
              const contentResponse = await fetch(
                `${API_HANDLER_URL}/api/github/contents/${directoryPath}/${file.name}`,
              );
              if (!contentResponse.ok) {
                console.error(
                  `Failed to fetch content for ${file.name} (status: ${contentResponse.status})`,
                );
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
            } catch (innerError) {
              console.error(
                `Error processing inner file ${file.name}:`,
                innerError,
              );
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
    } catch (error) {
      console.error(`Error fetching directory ${directoryPath}:`, error);
      return [];
    }
  }, []); // API_HANDLER_URL은 앱 수명 동안 거의 변하지 않으므로, 의존성 배열에서 제외하거나 앱 초기화 시 한 번만 설정되도록 할 수 있습니다. 여기서는 []로 두어 마운트 시 한 번만 생성되도록 합니다.

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
          // sha가 없는 경우 path로 fallback
          uniquePostsMap.set(post.path, post);
        } else if (!post.sha && !post.path && post.name) {
          // 최후의 수단으로 이름과 디렉토리 조합 (덜 고유함)
          const uniqueKey = `${post.sourceDir}/${post.name}`;
          if (!uniquePostsMap.has(uniqueKey)) {
            uniquePostsMap.set(uniqueKey, post);
          }
        }
      });
      const combinedPosts = Array.from(uniquePostsMap.values());
      combinedPosts.sort((a, b) => (b.date || 0) - (a.date || 0));
      setPosts(combinedPosts);
    } catch (error) {
      console.error("Error fetching all posts:", error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [fetchDirectoryContents]);

  useEffect(() => {
    if (!API_HANDLER_URL) {
      alert("블로그 API 설정을 확인해주세요. (VITE_API_HANDLER_URL)");
      setLoading(false);
      setAuthLoading(false); // API 핸들러 없으면 인증도 진행 불가
      return;
    }
    fetchAllPosts();
  }, [fetchAllPosts]); // fetchAllPosts는 useCallback으로 메모이징되어 있으므로 의존성 배열에 포함

  const handlePostClick = (post) => {
    setSelectedPost(post);
    setCurrentPage("view");
    window.scrollTo(0, 0);
  };

  const handleStartEdit = (post) => {
    if (!isAdmin) {
      alert("수정 권한이 없습니다.");
      if (!currentUser) handleGitHubLogin(); // 로그인이 안되어 있으면 로그인 유도
      return;
    }
    setSelectedPost(post);
    setCurrentPage("edit");
    window.scrollTo(0, 0);
  };

  const handlePostUpdateSuccess = (updatedPost) => {
    setPosts((prevPosts) =>
      prevPosts
        .map((p) =>
          p.path === updatedPost.path ||
          (p.sourceDir === updatedPost.sourceDir && p.name === updatedPost.name)
            ? { ...p, ...updatedPost }
            : p,
        )
        .sort((a, b) => (b.date || 0) - (a.date || 0)),
    );
    setSelectedPost(updatedPost);
    setCurrentPage("view");
    window.scrollTo(0, 0);
  };

  // 인증 정보 로딩 중일 때 표시할 UI
  if (authLoading) {
    return <div className="loading">인증 정보를 확인 중입니다...</div>;
  }

  return (
    <div className="app">
      <Header
        onNavigate={handleNavigate}
        currentPage={currentPage}
        currentUser={currentUser}
        isAdmin={isAdmin}
        onLogin={handleGitHubLogin}
        onLogout={handleLogout}
      />
      <main className="main">
        <div className="container">
          {/* 콘텐츠 로딩 중일 때 (인증 로딩과는 별개) */}
          {loading && currentPage !== "write" && currentPage !== "edit" && (
            <div className="loading">블로그 콘텐츠 로딩 중...</div>
          )}

          {/* API 핸들러 URL이 없을 경우의 메시지 */}
          {!API_HANDLER_URL &&
            !loading &&
            currentPage !== "write" &&
            currentPage !== "edit" && (
              <div className="error-page">
                <p>
                  블로그 API 설정을 불러올 수 없습니다. 관리자에게 문의하세요.
                </p>
              </div>
            )}

          {/* 콘텐츠 로딩 완료 후 페이지 렌더링 */}
          {!loading && API_HANDLER_URL && (
            <>
              {currentPage === "home" && (
                <Home posts={posts} onPostClick={handlePostClick} />
              )}
              {currentPage === "list" && (
                <PostList posts={posts} onPostClick={handlePostClick} />
              )}

              {currentPage === "write" &&
                (isAdmin ? (
                  <PostWrite onNavigate={handleNavigate} />
                ) : (
                  <div className="error-page">
                    <p>
                      글을 작성할 권한이 없습니다. 먼저 관리자로 로그인해주세요.
                    </p>
                    {!currentUser && (
                      <button
                        onClick={handleGitHubLogin}
                        className="login-prompt-btn"
                      >
                        GitHub으로 로그인
                      </button>
                    )}
                  </div>
                ))}

              {currentPage === "portfolio" && <Portfolio />}

              {/* 플래너 페이지 렌더링 추가 */}
              {currentPage === "planner" && <PlanningCalendar />}
              {currentPage === "view" && selectedPost && (
                <PostView
                  post={selectedPost}
                  onBack={() => handleNavigate("list")}
                  onEdit={handleStartEdit}
                  isAdmin={isAdmin}
                />
              )}

              {currentPage === "edit" &&
                selectedPost &&
                (isAdmin ? (
                  <PostEdit
                    postToEdit={selectedPost}
                    onNavigate={handleNavigate}
                    onUpdateSuccess={handlePostUpdateSuccess}
                  />
                ) : (
                  <div className="error-page">
                    <p>글을 수정할 권한이 없습니다.</p>
                  </div>
                ))}
            </>
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
