// src/components/PostView.jsx
import React, { useState, useEffect, useCallback } from "react";
import { API_HANDLER_URL } from "../config";
import { parseMarkdown } from "../utils/markdownParser";
import TableOfContents from "./TableOfContents";
import Comments from "./Comments";

const PostView = ({ post, onBack, onEdit, isAdmin }) => {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [headings, setHeadings] = useState([]);

  useEffect(() => {
    const pageTitle =
      post && post.title ? `${post.title} - My Blog` : "My Blog";
    document.title = pageTitle;

    const fetchContent = async () => {
      if (!post || !post.sourceDir || !post.name) {
        console.error("PostView: Post data is incomplete:", post);
        setContent(
          post
            ? "<p>글 내용을 불러올 수 없습니다. 정보가 부족합니다.</p>"
            : "<p>선택된 게시물이 없습니다.</p>",
        );
        setLoading(false);
        return;
      }
      if (!API_HANDLER_URL) {
        console.error(
          "API_HANDLER_URL is not configured. Check VITE_API_HANDLER_URL environment variable.",
        );
        setContent("<p>블로그 설정을 확인해주세요 (API 주소 오류).</p>");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const response = await fetch(
          `${API_HANDLER_URL}/api/github/contents/${post.sourceDir}/${post.name}`,
        );
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({
            message: `API 핸들러 응답 오류: ${response.status}`,
          }));
          throw new Error(
            errorData.message || `API 핸들러 에러: ${response.status}`,
          );
        }
        const text = await response.text();
        const parsedHtml = parseMarkdown(text); // 유틸리티 함수 사용
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = parsedHtml;
        const extractedHeadings = [];
        let headingCounter = {}; // 중복 ID 방지용 카운터
        tempDiv.querySelectorAll("h1, h2, h3").forEach((headingEl) => {
          const originalText = headingEl.textContent.trim();
          let id = originalText
            .replace(/[^a-zA-Z0-9가-힣\s-]/g, "") // 특수문자 제거 (공백, 하이픈 유지)
            .replace(/\s+/g, "-") // 공백을 하이픈으로
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
        console.error("Error fetching post content via handler:", error);
        setContent(
          `<p>글 내용을 불러오는데 실패했습니다: ${error.message}</p>`,
        );
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
    return () => {
      document.title = "My Blog"; // 컴포넌트 언마운트 시 제목 복원
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
      const offsetPosition = elementPosition - headerOffset - 20; // 20px 추가 여유 공간
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
      window.history.pushState(null, "", `#${id}`); // URL 해시 업데이트
    }
  };

  if (loading) return <div className="loading">로딩 중...</div>;
  if (!post) return <div className="loading">게시물을 찾을 수 없습니다.</div>; // Post null 체크

  return (
    <div className="post-view-layout">
      <article className="post-view">
        <div className="post-view-header">
          <p className="post-date">
            {post.date && post.date !== 0
              ? new Date(post.date).toLocaleString("ko-KR", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                })
              : "날짜 없음"}
          </p>
          <div className="post-view-actions">
            {/* 관리자일 경우에만 수정 버튼 표시 */}
            {isAdmin && (
              <button onClick={() => onEdit(post)} className="edit-btn">
                수정
              </button>
            )}
            <button onClick={onBack} className="back-btn">
              ← 목록으로
            </button>
          </div>
        </div>
        <div
          className="post-content"
          dangerouslySetInnerHTML={{ __html: content }}
        />
        <div className="post-actions-bottom">
          <button onClick={onBack} className="back-btn">
            ← 목록으로
          </button>
        </div>
        <Comments postTitle={post.title} />
      </article>
      <TableOfContents
        headings={headings}
        onHeadingClick={handleHeadingClick}
      />
    </div>
  );
};

export default PostView;
