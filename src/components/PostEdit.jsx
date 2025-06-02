// src/components/PostEdit.jsx
import React, { useState, useEffect } from "react";
import { API_HANDLER_URL } from "../config";
import { parseMarkdown } from "../utils/markdownParser";

const PostEdit = ({ postToEdit, onNavigate, onUpdateSuccess }) => {
  const [title, setTitle] = useState(""); // 제목 상태는 유지 (표시용)
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!postToEdit || !postToEdit.name || !postToEdit.sourceDir) {
      setError("수정할 게시물 정보가 올바르지 않습니다.");
      setIsLoading(false);
      return;
    }

    const fetchRawContent = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `${API_HANDLER_URL}/api/github/contents/${postToEdit.sourceDir}/${postToEdit.name}`,
        );
        if (!response.ok) {
          throw new Error(
            `원본 내용을 불러오지 못했습니다: ${response.status}`,
          );
        }
        const rawMarkdown = await response.text();
        const lines = rawMarkdown.split("\n");
        let extractedTitle = postToEdit.title;
        let extractedContent = rawMarkdown;

        if (lines.length > 0 && lines[0].startsWith("# ")) {
          extractedTitle = lines[0].substring(2).trim();
          extractedContent = lines.slice(1).join("\n").trimStart();
        }

        setTitle(extractedTitle); // 제목 설정
        setContent(extractedContent);
        document.title = `글 수정: ${extractedTitle} - My Blog`;
      } catch (err) {
        console.error("Error fetching raw content for edit:", err);
        setError(`글 내용을 불러오는 중 오류 발생: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRawContent();

    return () => {
      document.title = "My Blog";
    };
  }, [postToEdit]);

  const handleSubmit = async () => {
    // 제목 유효성 검사는 더 이상 필요 없음 (수정 불가)
    if (!content.trim()) {
      // 내용만 검사
      alert("내용을 입력해주세요.");
      return;
    }
    if (
      !postToEdit ||
      !postToEdit.sha ||
      !postToEdit.name ||
      !postToEdit.sourceDir
    ) {
      alert(
        "게시물 정보가 올바르지 않아 수정할 수 없습니다. (SHA, 경로 또는 파일명 누락)",
      );
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(true);
    // 제목은 기존 postToEdit.title 또는 useEffect에서 설정된 title 상태 값을 사용
    const finalTitle = title; // useEffect에서 설정된 초기 제목 사용
    const fullMdContent = `# ${finalTitle}\n\n${content}`;
    const filePath = `${postToEdit.sourceDir}/${postToEdit.name}`;

    if (!API_HANDLER_URL) {
      alert("API 핸들러 URL이 설정되지 않았습니다. (VITE_API_HANDLER_URL)");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch(`${API_HANDLER_URL}/update-post`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filePath: filePath,
          newContent: fullMdContent,
          commitMessage: `Update post: ${finalTitle}`, // 커밋 메시지에도 기존 제목 사용
          sha: postToEdit.sha,
        }),
      });

      const responseData = await response.json();
      if (response.ok) {
        alert(
          `글이 성공적으로 수정되었습니다! (${responseData.message || ""})`,
        );
        if (onUpdateSuccess) {
          const updatedPostData = {
            ...postToEdit,
            title: finalTitle, // 제목은 변경되지 않음
            preview: content.substring(0, 150) + "...",
            sha:
              responseData.newSha ||
              (responseData.content && responseData.content.sha) ||
              postToEdit.sha,
          };
          onUpdateSuccess(updatedPostData);
        } else {
          onNavigate("list");
        }
      } else {
        throw new Error(
          responseData.message ||
            `글 수정 실패 (서버 상태: ${response.status})`,
        );
      }
    } catch (error) {
      console.error("Error updating post via handler:", error);
      alert(`글 수정 중 오류 발생: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="loading">수정할 글 로딩 중...</div>;
  if (error)
    return (
      <div className="error-message">
        오류: {error}{" "}
        <button
          onClick={() => onNavigate("view", postToEdit)}
          className="back-btn"
        >
          원래 글로 돌아가기
        </button>
      </div>
    );
  if (!postToEdit)
    return <div className="loading">게시물 정보를 찾을 수 없습니다.</div>;

  return (
    <div className="post-write post-edit">
      <h2>글 수정</h2>
      <input
        type="text"
        placeholder="제목 (수정 불가)" // Placeholder 변경 가능
        value={title} // 값은 표시하되
        // onChange={(e) => setTitle(e.target.value)} // onChange 핸들러 제거 또는 주석 처리
        readOnly // input 필드를 읽기 전용으로 설정
        className="title-input title-input-readonly" // 스타일링을 위한 추가 클래스
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
          {isSubmitting ? "수정 중..." : "글 수정 완료"}
        </button>
        <button
          onClick={() => onNavigate("view", postToEdit)}
          className="cancel-btn"
        >
          취소
        </button>
      </div>
    </div>
  );
};

export default PostEdit;
