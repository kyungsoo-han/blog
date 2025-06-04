import React from "react";
import { useNavigate } from "react-router-dom";

const Home = ({ posts }) => {
  const navigate = useNavigate();
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
                key={post.path}
                className="post-card"
                onClick={() =>
                  navigate(`/posts/${encodeURIComponent(post.name)}`)
                }
              >
                <h4>{post.title}</h4>
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

export default Home;
