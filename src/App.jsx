// src/App.jsx
import React, { useState, useEffect, useCallback } from "react";
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
// ... (다른 컴포넌트 임포트)
import Portfolio from "./components/Portfolio";
import PostList from "./components/PostList";
import PostView from "./components/PostView";
import PostWrite from "./components/PostWrite";
import PostEdit from "./components/PostEdit";

const App = () => {
  const [currentPage, setCurrentPage] = useState("home");
  const [selectedPost, setSelectedPost] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true); // 전체 페이지 로딩
  const [authLoading, setAuthLoading] = useState(true); // 인증 로딩

  // 인증 상태
  const [currentUser, setCurrentUser] = useState(null); // 예: { login: 'username', avatar_url: '...' }
  const [isAdmin, setIsAdmin] = useState(false);
  const [githubToken, setGithubToken] = useState(
    localStorage.getItem("githubToken"),
  ); // 실제로는 백엔드 세션/JWT 토큰

  // GitHub 로그인 시작 함수
  const handleGitHubLogin = () => {
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_OAUTH_CLIENT_ID}&redirect_uri=${encodeURIComponent(GITHUB_OAUTH_REDIRECT_URI)}&scope=read:user`; // 필요한 스코프
    window.location.href = githubAuthUrl;
  };

  // 로그아웃 함수
  const handleLogout = () => {
    setCurrentUser(null);
    setIsAdmin(false);
    setGithubToken(null);
    localStorage.removeItem("githubToken"); // 또는 백엔드에 로그아웃 요청
    // 필요하다면 홈으로 리디렉션
    handleNavigate("home");
  };

  // OAuth 콜백 처리 및 초기 사용자 정보 로드
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");

    const verifyTokenAndFetchUser = async (token) => {
      try {
        // 이 부분은 실제로는 백엔드 API를 통해 토큰 유효성 검사 후 사용자 정보를 받아옵니다.
        // 여기서는 GitHub API를 직접 호출하는 예시 (클라이언트 사이드 OAuth의 한계)
        // 실제 운영에서는 백엔드에서 GitHub API를 호출하고, 그 결과를 받아와야 합니다.
        const response = await fetch("https://api.github.com/user", {
          headers: {
            Authorization: `token ${token}`,
          },
        });
        if (response.ok) {
          const userData = await response.json();
          setCurrentUser({
            login: userData.login,
            avatar_url: userData.avatar_url,
            name: userData.name,
          });
          setIsAdmin(userData.login === GITHUB_ADMIN_USERNAME);
          localStorage.setItem("githubToken", token); // 데모용. 실제로는 안전한 저장 방식 사용
          setGithubToken(token);
        } else {
          // 토큰이 유효하지 않은 경우
          handleLogout(); // 로그아웃 처리
          console.error("Failed to fetch user with token, or token expired.");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        handleLogout();
      } finally {
        setAuthLoading(false);
      }
    };

    if (code) {
      // GitHub로부터 코드를 받아옴 -> 백엔드로 보내서 토큰으로 교환해야 함
      setAuthLoading(true);
      console.log("GitHub OAuth code received:", code);
      // URL에서 code 파라미터 제거 (새로고침 시 재요청 방지)
      window.history.replaceState({}, document.title, window.location.pathname);

      // !!! 중요 !!!
      // 아래는 백엔드 API 핸들러(/api/auth/github)를 호출하여 code를 토큰으로 교환하고
      // 사용자 정보를 받아오는 이상적인 로직의 프론트엔드 부분입니다.
      // 이 API 핸들러를 직접 구현해야 합니다.
      const exchangeCodeForToken = async (authCode) => {
        try {
          // 예시: POST 요청으로 백엔드에 코드 전달
          const response = await fetch(`${API_HANDLER_URL}/api/auth/github`, {
            // 백엔드 콜백 핸들러 주소
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code: authCode }),
          });
          if (response.ok) {
            const { token, user } = await response.json(); // 백엔드가 토큰과 사용자 정보를 반환한다고 가정

            // 여기서는 반환된 GitHub 액세스 토큰을 사용하거나, 백엔드가 발행한 JWT/세션 토큰을 사용합니다.
            // 아래는 GitHub 액세스 토큰을 직접 사용하는 예시 (실제로는 백엔드가 user 정보까지 주는게 좋음)
            if (token) {
              await verifyTokenAndFetchUser(token); // 이 함수가 내부적으로 setCurrentUser, setIsAdmin 등 호출
            } else if (user) {
              // 백엔드가 이미 user 정보까지 처리해서 줬다면
              setCurrentUser({
                login: user.login,
                avatar_url: user.avatar_url,
                name: user.name,
              });
              setIsAdmin(user.login === GITHUB_ADMIN_USERNAME);
              // 백엔드가 준 자체 토큰을 저장 (예: localStorage.setItem('myAppToken', token_from_backend))
              setAuthLoading(false);
            } else {
              throw new Error("Token or user not received from backend");
            }
          } else {
            const errorData = await response.json();
            throw new Error(
              errorData.message ||
                "Failed to exchange code for token with backend",
            );
          }
        } catch (error) {
          console.error("Error exchanging code with backend:", error);
          alert(`로그인 처리 중 오류가 발생했습니다: ${error.message}`);
          handleLogout(); // 오류 시 로그아웃 처리
          setAuthLoading(false);
        }
      };
      exchangeCodeForToken(code);
    } else if (githubToken) {
      // 기존에 저장된 토큰이 있으면 사용자 정보 로드 시도
      setAuthLoading(true);
      verifyTokenAndFetchUser(githubToken);
    } else {
      // 코드도 없고 저장된 토큰도 없으면 비로그인 상태
      setAuthLoading(false);
    }
  }, []); // 컴포넌트 마운트 시 한 번만 실행 (githubToken 의존성 제거)

  // ... (fetchDirectoryContents, fetchAllPosts 등 기존 함수들) ...
  // 날짜 파싱 로직 등은 이전 답변의 최종본을 사용한다고 가정합니다.
  const fetchDirectoryContents = useCallback(async (directoryPath) => {
    if (!API_HANDLER_URL) return [];
    try {
      const response = await fetch(
        `${API_HANDLER_URL}/api/github/contents/${directoryPath}`,
      );
      if (!response.ok) {
        if (response.status === 404) return [];
        throw new Error(`API 핸들러 에러 (목록): ${response.status}`);
      }
      const files = await response.json();
      const postsData = await Promise.all(
        files
          .filter((f) => f.name && f.name.endsWith(".md") && f.type === "file")
          .map(async (file) => {
            // 간소화된 목록 정보 (실제로는 제목, 날짜, 미리보기 등 파싱 필요)
            const contentResponse = await fetch(
              `${API_HANDLER_URL}/api/github/contents/${directoryPath}/${file.name}`,
            );
            if (!contentResponse.ok)
              return {
                ...file,
                title: file.name.replace(/\.md$/, ""),
                preview: "내용 로드 실패",
                date: 0,
                sourceDir: directoryPath,
              };
            const contentText = await contentResponse.text();
            const lines = contentText.split("\n");
            let title = file.name.replace(/\.md$/, "");
            if (lines[0] && lines[0].startsWith("# "))
              title = lines[0].substring(2).trim();

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
            if (timestampMatch && timestampMatch[1])
              date = new Date(parseInt(timestampMatch[1], 10));
            // 기타 날짜 형식 파싱 ... (이전 답변 참고)

            return {
              ...file,
              title,
              preview,
              date: isNaN(date.getTime()) ? 0 : date.getTime(),
              sourceDir: directoryPath,
            };
          }),
      );
      return postsData.filter((p) => p && p.title);
    } catch (error) {
      console.error(`Error fetching dir ${directoryPath}:`, error);
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
        if (post.sha && !uniquePostsMap.has(post.sha))
          uniquePostsMap.set(post.sha, post);
        else if (!post.sha && post.path && !uniquePostsMap.has(post.path))
          uniquePostsMap.set(post.path, post);
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
      alert("블로그 API 설정을 확인해주세요.");
      setLoading(false); // 전체 로딩도 false로
      setAuthLoading(false); // 인증 로딩도 false로
      return;
    }
    // fetchAllPosts는 인증 상태와 무관하게 호출될 수 있음
    // 단, 글쓰기/수정 API는 인증 필요
    fetchAllPosts();
  }, [fetchAllPosts]); // API_HANDLER_URL 변경 시에도 호출 (보통은 안 변함)

  const handleNavigate = (page, postData = null) => {
    // 관리자가 아닌데 글쓰기/수정 페이지로 가려고 하면 막기
    if ((page === "write" || page === "edit") && !isAdmin) {
      alert("권한이 없습니다.");
      if (!currentUser) handleGitHubLogin(); // 로그인이 안되어있으면 로그인 유도
      return;
    }

    setCurrentPage(page);
    if (postData) {
      setSelectedPost(postData);
    } else if (page !== "edit" && page !== "view") {
      setSelectedPost(null);
    }
    window.scrollTo(0, 0);
  };

  const handlePostClick = (post) => {
    /* ... 기존과 동일 ... */ setSelectedPost(post);
    setCurrentPage("view");
    window.scrollTo(0, 0);
  };
  const handleStartEdit = (post) => {
    /* ... 기존과 동일 ... */ if (!isAdmin) {
      alert("수정 권한이 없습니다.");
      return;
    }
    setSelectedPost(post);
    setCurrentPage("edit");
    window.scrollTo(0, 0);
  };
  const handlePostUpdateSuccess = (updatedPost) => {
    /* ... 기존과 동일 ... */
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

  if (authLoading) {
    // 인증 정보 로딩 중일 때
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
          {/* 페이지 로딩 상태를 posts.length 대신 loading 상태로 판단 */}
          {loading && currentPage !== "write" && currentPage !== "edit" && (
            <div className="loading">블로그 로딩 중...</div>
          )}
          {!loading && currentPage === "home" && (
            <Home posts={posts} onPostClick={handlePostClick} />
          )}
          {!loading && currentPage === "list" && (
            <PostList posts={posts} onPostClick={handlePostClick} />
          )}
          {currentPage === "write" && isAdmin && (
            <PostWrite onNavigate={handleNavigate} />
          )}
          {currentPage === "write" && !isAdmin && (
            <div className="error-page">
              <p>글을 작성할 권한이 없습니다. 먼저 관리자로 로그인해주세요.</p>
              <button onClick={handleGitHubLogin} className="login-prompt-btn">
                GitHub으로 로그인
              </button>
            </div>
          )}

          {currentPage === "portfolio" && <Portfolio />}

          {currentPage === "view" && selectedPost && (
            <PostView
              post={selectedPost}
              onBack={() => handleNavigate("list")}
              onEdit={handleStartEdit} // onEdit은 내부에서 isAdmin 체크하도록 PostView 자체를 수정하거나, 여기서 isAdmin을 넘겨줘야함
              isAdmin={isAdmin} // PostView에 isAdmin 전달
            />
          )}
          {/* 글 수정 페이지 접근 제어 */}
          {currentPage === "edit" && selectedPost && isAdmin && (
            <PostEdit
              postToEdit={selectedPost}
              onNavigate={handleNavigate}
              onUpdateSuccess={handlePostUpdateSuccess}
            />
          )}
          {currentPage === "edit" && selectedPost && !isAdmin && (
            <div className="error-page">
              <p>글을 수정할 권한이 없습니다.</p>
            </div>
          )}

          {!API_HANDLER_URL &&
            !loading &&
            currentPage !== "write" &&
            currentPage !== "edit" && (
              <div className="loading">
                블로그 API 설정을 불러올 수 없습니다.
              </div>
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
