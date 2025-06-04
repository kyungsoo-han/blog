// src/components/PostList.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const PostList = ({ posts }) => {
  const navigate = useNavigate();
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
              key={post.sha || post.path} // 고유한 key 사용
              className="post-item"
              onClick={() =>
                navigate(`/posts/${encodeURIComponent(post.name)}`)
              }
            >
              <h3>{post.title}</h3>
              <p className="post-meta">
                {post.date && post.date !== 0 // post.date가 유효한 timestamp(0이 아닌)인지 확인
                  ? new Date(post.date).toLocaleString("ko-KR", {
                      year: "numeric",
                      month: "2-digit", // 'long' (예: 6월) 또는 '2-digit' (예: 06)
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                      // second: '2-digit', // 초 단위까지 필요하면 주석 해제
                      hour12: false, // 24시간제로 표시 (선택 사항)
                    })
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

export default PostList;
