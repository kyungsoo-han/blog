// src/components/TableOfContents.jsx
import React, { useState, useEffect, useCallback } from "react";

const TableOfContents = ({ headings, onHeadingClick }) => {
  const [activeId, setActiveId] = useState("");

  const scrollHandler = useCallback(() => {
    let currentActiveId = "";
    if (headings.length === 0) {
      setActiveId("");
      return;
    }
    // 현재 화면 상단에 가장 가까운 heading을 찾되, 헤더 높이를 고려
    const headerHeight = document.querySelector(".header")?.offsetHeight || 60;
    const offset = headerHeight + 20; // 헤더 높이 + 추가 여유 공간

    for (let i = headings.length - 1; i >= 0; i--) {
      const heading = headings[i];
      const el = document.getElementById(heading.id);
      if (el) {
        const rect = el.getBoundingClientRect();
        // 요소의 상단이 offset (헤더 높이 + 여유공간)보다 작거나 같으면 활성화
        if (rect.top <= offset) {
          currentActiveId = heading.id;
          break;
        }
      }
    }
    // 만약 아무것도 활성화되지 않았다면, 첫 번째 heading을 활성화 (스크롤이 맨 위일 때)
    if (!currentActiveId && headings.length > 0) {
      const firstEl = document.getElementById(headings[0].id);
      if (
        firstEl &&
        firstEl.getBoundingClientRect().top >= 0 &&
        firstEl.getBoundingClientRect().top <= window.innerHeight / 2
      ) {
        // currentActiveId = headings[0].id; // 주석 처리 또는 다른 로직으로 대체
      }
    }
    setActiveId(currentActiveId);
  }, [headings]);

  useEffect(() => {
    window.addEventListener("scroll", scrollHandler);
    scrollHandler(); // 초기 로드 시 실행
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
            className={`${activeId === heading.id ? "active" : ""} toc-level-${heading.level}`}
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

export default TableOfContents;
