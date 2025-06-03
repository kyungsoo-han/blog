# ⚛️ 리액트 사이드 이펙트(Side Effect)란 무엇일까? (feat. useEffect)



리액트 컴포넌트의 가장 중요한 임무는 UI를 화면에 그리는 것(렌더링)이다. 하지만 실제 애플리케이션은 단순히 화면만 그리는 것 이상의 일을 해야 한다. 이렇게 **컴포넌트의 주된 역할인 렌더링 외에 발생하는 모든 부가적인 작업을 "사이드 이펙트(Side Effect)" 또는 "부수 효과"**라고 부른다.

---

## 🤔 사이드 이펙트(Side Effect), 정확히 뭘까?

함수형 프로그래밍에서 사이드 이펙트는 함수가 결과값을 반환하는 것 외에 외부 세계에 영향을 미치거나 받는 모든 작업을 의미한다.  
리액트 컴포넌트(특히 함수형 컴포넌트)는 순수 함수처럼 동작하도록 설계되지만, 실제로는 다양한 사이드 이펙트가 필요하다.

> 쉽게 말해, 컴포넌트의 순수한 렌더링 흐름 바깥에서 일어나는 모든 종류의 일들이라고 생각할 수 있다.

---

## 📋 대표적인 사이드 이펙트 예시

- 🌐 **API 데이터 요청**  
  서버로부터 데이터를 가져오거나 서버로 데이터를 전송하는 작업이다. (예: fetch, axios)

- 📄 **DOM 직접 조작**  
  React의 선언적 방식 외에 직접 DOM 요소를 변경하는 작업이다. (예: document.title 변경, 외부 DOM 라이브러리 연동)

- 🔔 **구독 (Subscriptions)**  
  외부 데이터 소스를 구독하고 변경에 반응한다. (예: setInterval, setTimeout, 웹소켓, 이벤트 리스너)

- 💾 **로컬 스토리지 / 세션 스토리지 접근**  
  브라우저 저장소에 데이터를 읽거나 쓰는 작업

- ✍️ **로깅 (Logging)**  
  사용자 행동이나 에러를 콘솔 또는 외부 서비스에 기록

---

## ✨ 왜 "사이드(Side)" 이펙트라고 부를까?

컴포넌트의 핵심 기능은 UI를 렌더링하는 것이다. 사이드 이펙트는 이 핵심 기능 **"옆에서(side)"** 일어나는 부수적인 작업들이기 때문에 이렇게 불린다.

> 순수 함수는 동일 입력에 항상 동일 출력을 보장하고 외부 상태를 변경하지 않지만, 사이드 이펙트는 외부 상태에 의존하거나 외부 상태를 변경할 수 있다.

---

## 🛠️ 리액트에서 사이드 이펙트 다루기: `useEffect` Hook

함수형 컴포넌트에서는 `useEffect` Hook을 사용하여 이러한 사이드 이펙트를 관리한다.  
`useEffect`는 컴포넌트가 **렌더링된 이후**에 특정 작업을 수행하도록 한다.

### 🔤 기본 사용법

```jsx
import React, { useState, useEffect } from 'react';

function MyComponent({ userId }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // 1. 사이드 이펙트: API 호출
    console.log(`${userId} 사용자의 데이터를 가져옵니다.`);
    fetch(`/api/users/${userId}`)
      .then(response => response.json())
      .then(data => setUser(data));

    // 2. 정리 함수 (cleanup)
    return () => {
      console.log(`${userId} 사용자에 대한 이전 구독 또는 타이머를 정리합니다.`);
    };
  }, [userId]);

  if (!user) {
    return <p>{userId} 사용자 정보를 불러오는 중...</p>;
  }

  return (
    <div>
      <h1>{user.name}</h1>
      <p>이메일: {user.email}</p>
    </div>
  );
}```