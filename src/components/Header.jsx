import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const Header = ({ currentUser, isAdmin, onLogin, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const toggleMobileMenu = () => setIsMobileMenuOpen((open) => !open);

  // 메뉴 클릭 시 페이지 이동 + 메뉴 닫기
  const handleNavAndCloseMenu = (to) => {
    navigate(to);
    setIsMobileMenuOpen(false);
  };

  // 모바일 메뉴 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
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
        <h1 onClick={() => handleNavAndCloseMenu("/")} className="logo">
          My Blog
        </h1>
        <button
          className="mobile-nav-toggle"
          onClick={toggleMobileMenu}
          aria-label="네비게이션 메뉴 토글"
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? "✕" : "☰"}
        </button>
        <nav className={`nav ${isMobileMenuOpen ? "open" : ""}`} ref={navRef}>
          <button
            className={`nav-btn ${location.pathname === "/" ? "active" : ""}`}
            onClick={() => handleNavAndCloseMenu("/")}
          >
            홈
          </button>
          <button
            className={`nav-btn ${location.pathname.startsWith("/posts") && location.pathname !== "/write" && location.pathname !== "/edit" ? "active" : ""}`}
            onClick={() => handleNavAndCloseMenu("/posts")}
          >
            글목록
          </button>
          {isAdmin && (
            <button
              className={`nav-btn ${location.pathname === "/write" ? "active" : ""}`}
              onClick={() => handleNavAndCloseMenu("/write")}
            >
              글쓰기
            </button>
          )}
          <button
            className={`nav-btn ${location.pathname === "/portfolio" ? "active" : ""}`}
            onClick={() => handleNavAndCloseMenu("/portfolio")}
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
              setIsMobileMenuOpen(false);
            }}
          >
            GitHub
          </button>
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
