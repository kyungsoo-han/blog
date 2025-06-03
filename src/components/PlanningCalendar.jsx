// src/components/PlanningCalendar.jsx
import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css"; // react-calendar 기본 CSS

// 날짜를 'YYYY-MM-DD' 형식의 문자열로 변환하는 헬퍼 함수
const formatDate = (date) => {
  if (!date) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const PlanningCalendar = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [plans, setPlans] = useState({}); // {'YYYY-MM-DD': ['계획1', '계획2'], ...}
  const [currentPlanInput, setCurrentPlanInput] = useState("");

  // 로컬 스토리지에서 계획 불러오기 (컴포넌트 마운트 시)
  useEffect(() => {
    const storedPlans = localStorage.getItem("calendarPlans");
    if (storedPlans) {
      setPlans(JSON.parse(storedPlans));
    }
  }, []);

  // 계획이 변경될 때마다 로컬 스토리지에 저장
  useEffect(() => {
    localStorage.setItem("calendarPlans", JSON.stringify(plans));
  }, [plans]);

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const handleAddPlan = () => {
    if (!currentPlanInput.trim()) {
      alert("계획 내용을 입력해주세요.");
      return;
    }
    const dateKey = formatDate(selectedDate);
    const updatedPlansForDate = [
      ...(plans[dateKey] || []),
      currentPlanInput.trim(),
    ];

    setPlans((prevPlans) => ({
      ...prevPlans,
      [dateKey]: updatedPlansForDate,
    }));
    setCurrentPlanInput(""); // 입력 필드 초기화
  };

  const handleDeletePlan = (dateKey, planIndex) => {
    const plansForDate = plans[dateKey];
    if (!plansForDate) return;

    const newPlansForDate = plansForDate.filter(
      (_, index) => index !== planIndex,
    );

    if (newPlansForDate.length === 0) {
      // 해당 날짜의 모든 계획이 삭제되면, plans 객체에서 해당 dateKey를 제거
      const newPlans = { ...plans };
      delete newPlans[dateKey];
      setPlans(newPlans);
    } else {
      setPlans((prevPlans) => ({
        ...prevPlans,
        [dateKey]: newPlansForDate,
      }));
    }
  };

  const selectedDateKey = formatDate(selectedDate);
  const plansForSelectedDate = plans[selectedDateKey] || [];

  // 달력 타일에 계획이 있는지 표시하는 함수 (간단한 점으로 표시)
  const tileContent = ({ date, view }) => {
    if (view === "month") {
      const dateKey = formatDate(date);
      if (plans[dateKey] && plans[dateKey].length > 0) {
        return <div className="plan-indicator-dot"></div>;
      }
    }
    return null;
  };

  return (
    <div className="planning-calendar-container">
      <h2>플래너 / 계획표</h2>
      <div className="calendar-main-layout">
        <div className="calendar-view">
          <Calendar
            onChange={handleDateChange}
            value={selectedDate}
            locale="ko-KR" // 한국어 설정 (기본은 영어)
            tileContent={tileContent} // 날짜 타일에 내용 추가
            // calendarType="gregory" // 기본값
            // formatDay={(locale, date) => new Intl.DateTimeFormat(locale, {day: 'numeric'}).format(date)} // 일 표시 형식
          />
        </div>
        <div className="plan-details">
          <h3>
            {selectedDate.toLocaleDateString("ko-KR", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
            의 계획
          </h3>
          <div className="plan-input-area">
            <input
              type="text"
              value={currentPlanInput}
              onChange={(e) => setCurrentPlanInput(e.target.value)}
              placeholder="새 계획 입력..."
              className="plan-input-field"
            />
            <button onClick={handleAddPlan} className="add-plan-btn">
              추가
            </button>
          </div>
          {plansForSelectedDate.length > 0 ? (
            <ul className="plan-list">
              {plansForSelectedDate.map((plan, index) => (
                <li key={index} className="plan-item">
                  <span>{plan}</span>
                  <button
                    onClick={() => handleDeletePlan(selectedDateKey, index)}
                    className="delete-plan-btn"
                  >
                    삭제
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-plans-text">이 날짜에는 아직 계획이 없습니다.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlanningCalendar;
