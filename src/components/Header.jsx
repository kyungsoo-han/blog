// src/components/Header.jsx
import React, { useState, useEffect, useRef } from "react";

const Header = ({
  onNavigate,
  currentPage,
  currentUser,
  isAdmin,
  onLogin,
  onLogout,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navRef = useRef(null); // 모바일 메뉴 외부 클릭 감지를 위해

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // 네비게이션 항목 클릭 시 모바일 메뉴 닫기
  const handleNavAndCloseMenu = (page) => {
    onNavigate(page);
    setIsMobileMenuOpen(false);
  };

  // 모바일 메뉴 외부 클릭 시 메뉴 닫기 (선택적 고급 기능)
  useEffect(() => {
    const handleClickOutside = (event) => {
      // event.target.closest('.mobile-nav-toggle') : 햄버거 버튼 자체를 클릭한 경우는 제외
      if (
        navRef.current &&
        !navRef.current.contains(event.target) &&
        !event.target.closest(".mobile-nav-toggle")
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  return (
    <header className="header">
      <div className="container">
        <h1 onClick={() => handleNavAndCloseMenu("home")} className="logo">
          My Blog
        </h1>

        {/* 모바일용 햄버거 토글 버튼 */}
        <button
          className="mobile-nav-toggle"
          onClick={toggleMobileMenu}
          aria-label="네비게이션 메뉴 토글"
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? "✕" : "☰"} {/* 열렸을 때 X, 닫혔을 때 ☰ */}
        </button>

        <nav className={`nav ${isMobileMenuOpen ? "open" : ""}`} ref={navRef}>
          <button
            className={`nav-btn ${currentPage === "home" ? "active" : ""}`}
            onClick={() => handleNavAndCloseMenu("home")}
          >
            홈
          </button>
          <button
            className={`nav-btn ${currentPage === "list" ? "active" : ""}`}
            onClick={() => handleNavAndCloseMenu("list")}
          >
            글목록
          </button>
          {isAdmin && (
            <button
              className={`nav-btn ${
                currentPage === "write" || currentPage === "edit"
                  ? "active"
                  : ""
              }`}
              onClick={() => handleNavAndCloseMenu("write")}
            >
              글쓰기
            </button>
          )}
          <button
            className={`nav-btn ${currentPage === "portfolio" ? "active" : ""}`}
            onClick={() => handleNavAndCloseMenu("portfolio")}
          >
            포트폴리오
          </button>
          <button
            className="nav-btn"
            onClick={() => {
              window.open(
                "https://github.com/kyungsoo-han",
                "_blank",
                "noopener,noreferrer",
              );
              setIsMobileMenuOpen(false); // 외부 링크 클릭 시에도 메뉴 닫기
            }}
          >
            GitHub
          </button>

          {/* 인증 관련 UI (모바일 메뉴의 일부가 됨) */}
          <div className="nav-auth-item">
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
                <button
                  onClick={() => {
                    onLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="nav-btn logout-btn"
                >
                  로그아웃
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  onLogin();
                  setIsMobileMenuOpen(false);
                }}
                className="nav-btn login-btn"
              >
                GitHub 로그인
              </button>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
