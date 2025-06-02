// src/components/Header.jsx
import React from "react";

const Header = ({
  onNavigate,
  currentPage,
  currentUser,
  isAdmin,
  onLogin,
  onLogout,
}) => (
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
        {/* 관리자일 경우에만 글쓰기 버튼 표시 */}
        {isAdmin && (
          <button
            className={`nav-btn ${
              currentPage === "write" || currentPage === "edit" ? "active" : ""
            }`}
            onClick={() => onNavigate("write")}
          >
            글쓰기
          </button>
        )}
        <button
          className={`nav-btn ${currentPage === "portfolio" ? "active" : ""}`}
          onClick={() => onNavigate("portfolio")}
        >
          포트폴리오
        </button>
      </nav>
      <div className="auth-section">
        {currentUser ? (
          <div className="user-profile">
            {currentUser.avatar_url && (
              <img
                src={currentUser.avatar_url}
                alt={currentUser.login}
                className="user-avatar"
              />
            )}
            <span className="user-name">
              {currentUser.name || currentUser.login}
            </span>
            <button onClick={onLogout} className="nav-btn logout-btn">
              로그아웃
            </button>
          </div>
        ) : (
          <button onClick={onLogin} className="nav-btn login-btn">
            GitHub 로그인
          </button>
        )}
      </div>
    </div>
  </header>
);

export default Header;
