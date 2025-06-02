import React, { useState, useEffect } from "react";

const Portfolio = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPortfolioItems = async () => {
      setLoading(true);
      // 실제 포트폴리오 데이터 로딩 로직 구현 (예: API 호출 또는 로컬 JSON)
      setTimeout(() => {
        // 임시 데이터
        setItems([
          {
            id: 1,
            title: "프로젝트 A",
            description: "멋진 프로젝트 A에 대한 설명입니다.",
            imageUrl: "https://via.placeholder.com/300x200?text=Project+A",
          },
          {
            id: 2,
            title: "프로젝트 B",
            description: "흥미로운 프로젝트 B의 내용입니다.",
            imageUrl: "https://via.placeholder.com/300x200?text=Project+B",
          },
        ]);
        setLoading(false);
      }, 1000);
    };
    fetchPortfolioItems();
  }, []);

  if (loading) return <div className="loading">포트폴리오 로딩 중...</div>;

  return (
    <div className="portfolio-page">
      <h2>포트폴리오</h2>
      <p>제가 진행했던 프로젝트와 작업물들을 소개합니다.</p>
      {items.length > 0 ? (
        <div className="portfolio-grid">
          {items.map((item) => (
            <div key={item.id} className="portfolio-item">
              {item.imageUrl && (
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="portfolio-image"
                />
              )}
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="no-posts">아직 등록된 포트폴리오가 없습니다.</p>
      )}
    </div>
  );
};

export default Portfolio;
