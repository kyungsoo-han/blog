// src/components/PostWrite.jsx
import React, { useState } from "react";
import { API_HANDLER_URL } from "../config"; // 경로 수정
import { parseMarkdown } from "../utils/markdownParser";
import { useNavigate } from "react-router-dom";

const PostWrite = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDir, setSelectedDir] = useState("_posts");

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      alert("제목과 내용을 모두 입력해주세요.");
      return;
    }
    if (!selectedDir) {
      alert("카테고리를 선택해주세요.");
      return;
    }

    setIsSubmitting(true);
    const timestamp = Date.now();
    const safeTitle = title
      .replace(/[^a-zA-Z0-9가-힣ㄱ-ㅎㅏ-ㅣ一-龠\s-]/g, "")
      .replace(/\s+/g, "-");
    const fileName = `${timestamp}-${safeTitle || "untitled"}.md`;
    const fullMdContent = `# ${title}\n\n${content}`;
    const targetDirectory = selectedDir;

    if (!API_HANDLER_URL) {
      alert("API 핸들러 URL이 설정되지 않았습니다. (VITE_API_HANDLER_URL)");
      setIsSubmitting(false);
      return;
    }
    try {
      const response = await fetch(`${API_HANDLER_URL}/api/create-post`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetDir: targetDirectory,
          fileName: fileName,
          commitMessage: `Add new post: ${title}`,
          fileContent: fullMdContent,
        }),
      });
      const responseData = await response.json();
      if (response.ok) {
        alert(
          `글이 성공적으로 '${targetDirectory === "_posts" ? "글" : "자료"}' 카테고리에 등록되었습니다! (${responseData.message || ""})`,
        );
        navigate("/posts");
      } else {
        throw new Error(
          responseData.message ||
            `글 등록 실패 (서버 상태: ${response.status})`,
        );
      }
    } catch (error) {
      console.error("Error creating post via handler:", error);
      alert(`글 등록 중 오류 발생: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="post-write">
      <h2>새 글 작성</h2>

      <div className="form-group directory-selector">
        <label htmlFor="directory-select">카테고리:</label>
        <div className="select-wrapper">
          {" "}
          {/* 화살표 아이콘을 위한 래퍼 추가 */}
          <select
            id="directory-select"
            value={selectedDir}
            onChange={(e) => setSelectedDir(e.target.value)}
            className="directory-select-input"
          >
            <option value="_posts">글</option>
            <option value="_articles">자료</option>
          </select>
        </div>
      </div>

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
        <button onClick={() => navigate("/posts")} className="cancel-btn">
          취소
        </button>
      </div>
    </div>
  );
};

export default PostWrite;
