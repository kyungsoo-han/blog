import React, { useState, useEffect, useCallback, useRef } from "react";
import "./App.css";

// GitHub API 설정
const GITHUB_USERNAME = "kyungsoo-han"; // 실제 사용자 이름으로 변경
const REPO_NAME = "blog"; // 실제 저장소 이름으로 변경
const UTTERANCES_REPO = "kyungsoo-han/blog-comments"; // 실제 Utterances를 연동할 저장소 "사용자명/저장소명"
const POST_HANDLER_BASE_URL = import.meta.env.VITE_POST_HANDLER_URL;

// 마크다운 파서
const parseMarkdown = (markdown) => {
  let html = markdown;

  const codeBlocks = [];
  html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
    const index = codeBlocks.length;
    codeBlocks.push({ lang: lang || "", code: code.trim() });
    return `___CODEBLOCK_${index}___`;
  });

  const inlineCodes = [];
  html = html.replace(/`([^`]+)`/g, (match, code) => {
    const index = inlineCodes.length;
    inlineCodes.push(code);
    return `___INLINECODE_${index}___`;
  });

  const lines = html.split("\n");
  const processedLines = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (
      line.includes("|") &&
      i + 1 < lines.length &&
      lines[i + 1].includes("|") &&
      lines[i + 1].includes("-")
    ) {
      let tableLines = [];
      let j = i;
      while (j < lines.length && lines[j].includes("|")) {
        tableLines.push(lines[j]);
        j++;
      }
      if (tableLines.length >= 2) {
        let table = "<table>\n<thead>\n<tr>\n";
        const headers = tableLines[0]
          .split("|")
          .map((h) => h.trim())
          .filter((h) => h);
        headers.forEach((header) => {
          table += `<th>${header}</th>\n`;
        });
        table += "</tr>\n</thead>\n<tbody>\n";
        for (let k = 2; k < tableLines.length; k++) {
          const cells = tableLines[k]
            .split("|")
            .map((c) => c.trim())
            .filter((c) => c);
          if (cells.length > 0) {
            table += "<tr>\n";
            cells.forEach((cell) => {
              table += `<td>${cell}</td>\n`;
            });
            table += "</tr>\n";
          }
        }
        table += "</tbody>\n</table>";
        processedLines.push(`<div class="table-wrapper">${table}</div>`);
        i = j;
        continue;
      }
    }
    processedLines.push(line);
    i++;
  }
  html = processedLines.join("\n");

  html = html
    .replace(/^#{6} (.*$)/gim, "<h6>$1</h6>")
    .replace(/^#{5} (.*$)/gim, "<h5>$1</h5>")
    .replace(/^#{4} (.*$)/gim, "<h4>$1</h4>")
    .replace(/^### (.*$)/gim, "<h3>$1</h3>")
    .replace(/^## (.*$)/gim, "<h2>$1</h2>")
    .replace(/^# (.*$)/gim, "<h1>$1</h1>")
    .replace(/^---$/gim, "<hr>")
    .replace(/^\s*\- (.*$)/gim, "<li>$1</li>")
    .replace(/^\s*\* (.*$)/gim, "<li>$1</li>")
    .replace(/^\s*\d+\. (.*$)/gim, "<li>$1</li>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>',
    )
    .replace(/^> (.*$)/gim, "<blockquote>$1</blockquote>")
    .replace(/⇒/g, "→")
    .replace(/\n\n/g, "</p><p>");

  html = "<p>" + html + "</p>";
  html = html
    .replace(/<p>(<h[1-6]>)/g, "$1")
    .replace(/(<\/h[1-6]>)<\/p>/g, "$1");
  html = html
    .replace(/<p>(<blockquote>)/g, "$1")
    .replace(/(<\/blockquote>)<\/p>/g, "$1");
  html = html.replace(/<p>(<hr>)<\/p>/g, "$1");
  html = html.replace(/<p>(<table)/g, "$1").replace(/(<\/table>)<\/p>/g, "$1");
  html = html.replace(/<p><\/p>/g, "");
  html = html
    .replace(/<p>(<li>)/g, "<ul>$1")
    .replace(/(<\/li>)<\/p>/g, "$1</ul>");
  html = html.replace(/(<\/li>)<br>(<li>)/g, "$1$2").replace(/<\/ul><ul>/g, "");

  html = html.replace(/___CODEBLOCK_(\d+)___/g, (match, index) => {
    const { lang, code } = codeBlocks[parseInt(index)];
    const escapedCode = code
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
    let codeClassName = "";
    if (lang) {
      codeClassName = `language-${lang}`;
    } else {
      codeClassName = "language-plaintext";
    }
    return `<pre><code class="${codeClassName}">${escapedCode}</code></pre>`;
  });

  html = html.replace(/___INLINECODE_(\d+)___/g, (match, index) => {
    const code = inlineCodes[parseInt(index)];
    const escaped = code
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
    return `<code>${escaped}</code>`;
  });

  return html;
};

const Header = ({ onNavigate, currentPage }) => (
  <header className="header">
    <div className="container">
      <h1 onClick={() => onNavigate("home")} className="logo">
        My Blog
      </h1>
      <nav className="nav">
        <button
          className={`nav-btn ${currentPage === "home" ? "active" : ""}`}
          onClick={() => onNavigate("home")}
        >
          홈
        </button>
        <button
          className={`nav-btn ${currentPage === "list" ? "active" : ""}`}
          onClick={() => onNavigate("list")}
        >
          글목록
        </button>
        <button
          className={`nav-btn ${currentPage === "write" ? "active" : ""}`}
          onClick={() => onNavigate("write")}
        >
          글쓰기
        </button>
        <button
          className={`nav-btn ${currentPage === "portfolio" ? "active" : ""}`}
          onClick={() => onNavigate("portfolio")}
        >
          포트폴리오
        </button>
      </nav>
    </div>
  </header>
);

const Home = ({ posts, onPostClick }) => {
  const recentPosts = posts.slice(0, 8);
  return (
    <div className="home">
      <section className="hero">
        <h2>Welcome to My Blog</h2>
        <p>프로그래밍과 기술에 대한 이야기를 나눕니다</p>
      </section>
      <section className="recent-posts">
        <h3>최근 글</h3>
        <div className="post-grid">
          {recentPosts.length > 0 ? (
            recentPosts.map((post) => (
              <article
                key={post.sha}
                className="post-card"
                onClick={() => onPostClick(post)}
              >
                <h4>{post.title}</h4>
                <p className="post-date">
                  {post.date
                    ? new Date(post.date).toLocaleDateString("ko-KR")
                    : "날짜 정보 없음"}
                </p>
                <p className="post-preview">{post.preview}</p>
              </article>
            ))
          ) : (
            <p className="no-posts">아직 작성된 글이 없습니다.</p>
          )}
        </div>
      </section>
    </div>
  );
};

const PostList = ({ posts, onPostClick }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 10;
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(posts.length / postsPerPage);

  return (
    <div className="post-list">
      <h2>전체 글 목록</h2>
      <div className="posts">
        {currentPosts.length > 0 ? (
          currentPosts.map((post) => (
            <article
              key={post.sha}
              className="post-item"
              onClick={() => onPostClick(post)}
            >
              <h3>{post.title}</h3>
              <p className="post-meta">
                {post.date
                  ? new Date(post.date).toLocaleDateString("ko-KR")
                  : "날짜 정보 없음"}
              </p>
              <p className="post-preview">{post.preview}</p>
            </article>
          ))
        ) : (
          <p className="no-posts">글이 없습니다.</p>
        )}
      </div>
      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="page-btn"
          >
            이전
          </button>
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index + 1}
              onClick={() => setCurrentPage(index + 1)}
              className={`page-btn ${currentPage === index + 1 ? "active" : ""}`}
            >
              {index + 1}
            </button>
          ))}
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="page-btn"
          >
            다음
          </button>
        </div>
      )}
    </div>
  );
};

const TableOfContents = ({ headings, onHeadingClick }) => {
  const [activeId, setActiveId] = useState("");
  const scrollHandler = useCallback(() => {
    let currentActiveId = "";
    if (headings.length === 0) {
      setActiveId("");
      return;
    }
    for (let i = headings.length - 1; i >= 0; i--) {
      const heading = headings[i];
      const el = document.getElementById(heading.id);
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= 100) {
          currentActiveId = heading.id;
          break;
        }
      }
    }
    setActiveId(currentActiveId);
  }, [headings]);

  useEffect(() => {
    window.addEventListener("scroll", scrollHandler);
    scrollHandler();
    return () => window.removeEventListener("scroll", scrollHandler);
  }, [scrollHandler]);

  if (headings.length === 0) return null;
  return (
    <nav className="toc">
      <h3>목차</h3>
      <ul>
        {headings.map((heading) => (
          <li
            key={heading.id}
            className={activeId === heading.id ? "active" : ""}
          >
            <a
              href={`#${heading.id}`}
              onClick={(e) => onHeadingClick(e, heading.id)}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};

const Comments = ({ postTitle }) => {
  const commentsRef = useRef(null);
  const [key, setKey] = useState(Date.now());

  useEffect(() => {
    setKey(Date.now());
  }, [postTitle]);

  useEffect(() => {
    if (!commentsRef.current || !UTTERANCES_REPO) return;
    commentsRef.current.innerHTML = "";
    const script = document.createElement("script");
    script.src = "https://utteranc.es/client.js";
    script.async = true;
    script.setAttribute("repo", UTTERANCES_REPO);
    script.setAttribute("issue-term", "title"); // "pathname"에서 "title"로 변경
    script.setAttribute("label", "comment");
    script.setAttribute("theme", "github-light");
    script.setAttribute("crossorigin", "anonymous");
    commentsRef.current.appendChild(script);
  }, [key, UTTERANCES_REPO]);

  if (!UTTERANCES_REPO)
    return <p>댓글 기능을 사용하려면 UTTERANCES_REPO 설정을 확인해주세요.</p>;
  return <div ref={commentsRef} className="comments-section" key={key}></div>;
};

const PostView = ({ post, onBack }) => {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [headings, setHeadings] = useState([]);

  useEffect(() => {
    // 게시물 제목으로 document.title 설정
    if (post && post.title) {
      document.title = `${post.title} - My Blog`; // 블로그 이름을 함께 표시하거나 post.title만 사용
    } else {
      document.title = "My Blog"; // 기본 블로그 제목
    }

    const fetchContent = async () => {
      if (!post || !post.sourceDir || !post.name) {
        console.error("Post data is incomplete:", post);
        setLoading(false);
        setContent(
          post
            ? "<p>글 내용을 불러올 수 없습니다. 정보가 부족합니다.</p>"
            : "<p>선택된 게시물이 없습니다.</p>",
        );
        return;
      }
      try {
        setLoading(true);
        const response = await fetch(
          `https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/contents/${post.sourceDir}/${post.name}`,
          {
            headers: {
              Authorization: `token ${GITHUB_TOKEN}`,
              Accept: "application/vnd.github.v3.raw",
            },
          },
        );
        if (!response.ok)
          throw new Error(`GitHub API error: ${response.status}`);
        const text = await response.text();
        const parsedHtml = parseMarkdown(text);
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = parsedHtml;
        const extractedHeadings = [];
        let headingCounter = {};
        tempDiv.querySelectorAll("h1, h2, h3").forEach((headingEl) => {
          const originalText = headingEl.textContent.trim();
          let id = originalText
            .replace(/[^a-zA-Z0-9가-힣]/g, "-")
            .toLowerCase();
          if (headingCounter[id]) {
            headingCounter[id]++;
            id = `${id}-${headingCounter[id]}`;
          } else {
            headingCounter[id] = 1;
          }
          headingEl.setAttribute("id", id);
          extractedHeadings.push({
            id: id,
            text: originalText,
            level: parseInt(headingEl.tagName.substring(1)),
          });
        });
        setContent(tempDiv.innerHTML);
        setHeadings(extractedHeadings);
      } catch (error) {
        console.error("Error fetching post content:", error);
        setContent("<p>글 내용을 불러오는데 실패했습니다.</p>");
      } finally {
        setLoading(false);
      }
    };
    fetchContent();

    // 컴포넌트 언마운트 시 또는 post 변경 전에 document.title 초기화
    return () => {
      document.title = "My Blog"; // 기본 블로그 제목으로 복원
    };
  }, [post]);

  useEffect(() => {
    if (!loading && content && window.hljs) {
      document.querySelectorAll("pre code").forEach((block) => {
        window.hljs.highlightElement(block);
      });
    }
  }, [loading, content]);

  const handleHeadingClick = (e, id) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = document.querySelector(".header")?.offsetHeight || 0;
      const elementPosition =
        element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - headerOffset - 20;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
      window.history.pushState(null, "", `#${id}`);
    }
  };

  if (loading) return <div className="loading">로딩 중...</div>;
  return (
    <div className="post-view-layout">
      <article className="post-view">
        <div className="post-view-header">
          <p className="post-date">
            {post.date
              ? new Date(post.date).toLocaleDateString("ko-KR")
              : "날짜 없음"}
          </p>
          <button onClick={onBack} className="back-btn">
            ← 목록으로
          </button>
        </div>
        <div
          className="post-content"
          dangerouslySetInnerHTML={{ __html: content }}
        />
        <Comments postTitle={post.title} />
      </article>
      <TableOfContents
        headings={headings}
        onHeadingClick={handleHeadingClick}
      />
    </div>
  );
};

const PostWrite = ({ onNavigate }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      alert("제목과 내용을 모두 입력해주세요.");
      return;
    }
    setIsSubmitting(true);
    // 현재 날짜를 기반으로 타임스탬프 생성
    const timestamp = Date.now();

    // 제목에서 파일명으로 사용하기 어려운 문자들을 '-'로 변경
    const safeTitle = title.replace(/[^a-zA-Z0-9가-힣ㄱ-ㅎㅏ-ㅣ一-龠]/g, "-"); // 한글 자모 및 한자 포함 가능하도록 수정

    // 파일 이름 생성
    const fileName = `${timestamp}-${safeTitle}.md`;

    // 전체 마크다운 내용 생성
    const fullMdContent = `# ${title}\n\n${content}`;

    const targetDirectory = "posts";

    try {
      if (!POST_HANDLER_BASE_URL) {
        throw new Error(
          "API 핸들러 URL이 설정되지 않았습니다. (VITE_POST_HANDLER_URL)",
        );
      }
      const response = await fetch(
        `${POST_HANDLER_BASE_URL}/create-post`, // 수정된 URL
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            targetDir: targetDirectory,
            fileName: fileName,
            commitMessage: `Add new post: ${title}`,
            fileContent: fullMdContent,
          }),
        },
      );
      if (response.ok) {
        alert("글이 성공적으로 등록되었습니다!");
        onNavigate("list");
      } else {
        const errorData = await response.json();
        throw new Error(
          `Failed to create post: ${errorData.message || response.status}`,
        );
      }
    } catch (error) {
      console.error("Error creating post:", error);
      alert(`글 등록에 실패했습니다: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="post-write">
      <h2>새 글 작성</h2>
      <input
        type="text"
        placeholder="제목을 입력하세요"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="title-input"
      />
      <div className="editor-container">
        <div className="editor-section">
          <h3>마크다운 편집기</h3>
          <textarea
            placeholder="마크다운 형식으로 내용을 작성하세요..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="content-editor"
          />
        </div>
        <div className="preview-section">
          <h3>미리보기</h3>
          <div
            className="content-preview"
            dangerouslySetInnerHTML={{
              __html: parseMarkdown(
                content || "*내용을 입력하면 여기에 미리보기가 표시됩니다*",
              ),
            }}
          />
        </div>
      </div>
      <div className="button-group">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="submit-btn"
        >
          {isSubmitting ? "등록 중..." : "글 등록"}
        </button>
        <button onClick={() => onNavigate("list")} className="cancel-btn">
          취소
        </button>
      </div>
    </div>
  );
};

const Portfolio = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchPortfolioItems = async () => {
      setLoading(true);
      setTimeout(() => {
        setItems([
          {
            id: 1,
            title: "프로젝트 A",
            description: "멋진 프로젝트 A에 대한 설명입니다.",
            imageUrl: "https://via.placeholder.com/300x200?text=Project+A",
          },
          {
            id: 2,
            title: "프로젝트 B",
            description: "흥미로운 프로젝트 B의 내용입니다.",
            imageUrl: "https://via.placeholder.com/300x200?text=Project+B",
          },
        ]);
        setLoading(false);
      }, 1000);
    };
    fetchPortfolioItems();
  }, []);
  if (loading) return <div className="loading">포트폴리오 로딩 중...</div>;
  return (
    <div className="portfolio-page">
      <h2>포트폴리오</h2>
      <p>제가 진행했던 프로젝트와 작업물들을 소개합니다.</p>
      {items.length > 0 ? (
        <div className="portfolio-grid">
          {items.map((item) => (
            <div key={item.id} className="portfolio-item">
              {item.imageUrl && (
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="portfolio-image"
                />
              )}
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="no-posts">아직 등록된 포트폴리오가 없습니다.</p>
      )}
    </div>
  );
};

const App = () => {
  const [currentPage, setCurrentPage] = useState("home");
  const [selectedPost, setSelectedPost] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDirectoryContents = async (directory) => {
    try {
      const response = await fetch(
        `https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/contents/${directory}/`,
        { headers: { Authorization: `token ${GITHUB_TOKEN}` } },
      );
      if (!response.ok) {
        if (response.status === 404) {
          console.warn(`Directory not found: ${directory}`);
          return [];
        }
        throw new Error(`Failed to fetch ${directory}: ${response.status}`);
      }
      const files = await response.json();
      const mdFiles = files.filter(
        (file) => file.name.endsWith(".md") && file.type === "file",
      );
      return Promise.all(
        mdFiles.map(async (file) => {
          const contentResponse = await fetch(file.download_url); // Assumes GITHUB_TOKEN is not needed for download_url
          const contentText = await contentResponse.text();
          const lines = contentText.split("\n");
          let title = file.name.replace(/\.md$/, "");
          if (lines[0] && lines[0].startsWith("#")) {
            title = lines[0].replace(/^#+\s*/, "").trim();
          } else if (lines[0]) {
            title = lines[0].trim() || title;
          }
          const contentStartIndex =
            lines[0] && lines[0].startsWith("#") ? 1 : 0;
          const preview =
            lines
              .slice(contentStartIndex)
              .filter((line) => line.trim() !== "" && !line.startsWith("#"))
              .join(" ")
              .replace(/^#+\s*/gm, "")
              .substring(0, 150) + "...";
          let dateStr = file.name.split("-")[0];
          let date = new Date(NaN);
          if (/^\d{8}$/.test(dateStr)) {
            date = new Date(
              parseInt(dateStr.substring(0, 4)),
              parseInt(dateStr.substring(4, 2)) - 1,
              parseInt(dateStr.substring(6, 2)),
            );
          } else if (/^\d{13}$/.test(dateStr)) {
            date = new Date(parseInt(dateStr));
          }
          return {
            ...file,
            title,
            preview,
            date: date.getTime(),
            sourceDir: directory,
          };
        }),
      );
    } catch (error) {
      console.error(`Error fetching from ${directory}:`, error);
      return [];
    }
  };

  const fetchAllPosts = useCallback(async () => {
    setLoading(true);
    const directoriesToFetch = ["posts", "articles"];
    try {
      const results = await Promise.all(
        directoriesToFetch.map((dir) => fetchDirectoryContents(dir)),
      );
      const combinedPosts = results.flat();
      combinedPosts.sort((a, b) => {
        const dateA = isNaN(a.date) ? 0 : a.date;
        const dateB = isNaN(b.date) ? 0 : b.date;
        return dateB - dateA;
      });
      setPosts(combinedPosts);
    } catch (error) {
      console.error("Error fetching all posts:", error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, []); // GITHUB_USERNAME, REPO_NAME, GITHUB_TOKEN 은 최상위 스코프 상수이므로, 의존성 배열에서 생략 가능 (또는 명시)

  useEffect(() => {
    fetchAllPosts();
  }, [fetchAllPosts]);

  const handleNavigate = (page) => {
    setCurrentPage(page);
    setSelectedPost(null);
    if ((page === "list" || page === "home") && posts.length === 0) {
      fetchAllPosts();
    }
  };

  const handlePostClick = (post) => {
    setSelectedPost(post);
    setCurrentPage("view");
  };

  if (loading && posts.length === 0) {
    return <div className="loading">블로그 로딩 중...</div>;
  }

  return (
    <div className="app">
      <Header onNavigate={handleNavigate} currentPage={currentPage} />
      <main className="main">
        <div className="container">
          {currentPage === "home" && (
            <Home posts={posts} onPostClick={handlePostClick} />
          )}
          {currentPage === "list" && (
            <PostList posts={posts} onPostClick={handlePostClick} />
          )}
          {currentPage === "write" && <PostWrite onNavigate={handleNavigate} />}
          {currentPage === "portfolio" && <Portfolio />}
          {currentPage === "view" && selectedPost && (
            <PostView
              post={selectedPost}
              onBack={() => handleNavigate("list")}
            />
          )}
        </div>
      </main>
      <footer className="footer">
        <div className="container">
          <p>&copy; {new Date().getFullYear()} My Blog. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
