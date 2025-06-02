// src/components/Comments.jsx
import React, { useRef, useEffect, useState } from "react";
import { UTTERANCES_REPO } from "../config";

const Comments = ({ postTitle }) => {
  const commentsRef = useRef(null);
  const [key, setKey] = useState(Date.now()); // postTitle 변경 시 Utterances 재로드

  useEffect(() => {
    setKey(Date.now()); // 강제 리렌더링을 위해 key 변경
  }, [postTitle]);

  useEffect(() => {
    if (!commentsRef.current || !UTTERANCES_REPO) return;
    commentsRef.current.innerHTML = ""; // 이전 댓글 내용 초기화
    const script = document.createElement("script");
    script.src = "https://utteranc.es/client.js";
    script.async = true;
    script.setAttribute("repo", UTTERANCES_REPO);
    script.setAttribute("issue-term", "title"); // 게시글 제목으로 이슈 매칭
    script.setAttribute("label", "comment"); // 원하는 라벨
    script.setAttribute("theme", "github-light"); // 원하는 테마
    script.setAttribute("crossorigin", "anonymous");
    commentsRef.current.appendChild(script);
  }, [key]); // key가 변경될 때마다 실행

  if (!UTTERANCES_REPO)
    return <p>댓글 기능을 사용하려면 UTTERANCES_REPO 설정을 확인해주세요.</p>;

  return <div ref={commentsRef} className="comments-section" key={key}></div>;
};

export default Comments;
