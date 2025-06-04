# React `useEffect`를 이용한 컴포넌트 라이프사이클 제어 정리



React의 `useEffect` 훅은 컴포넌트의 **마운트(Mount)**, **업데이트(Update)**, **언마운트(Unmount)** 시점을 제어할 수 있게 해주는 핵심 도구입니다. 아래는 예제 코드를 기준으로 `useEffect`의 동작 방식을 정리한 문서입니다.

---

## 🔹 1. Mount (마운트)

- 컴포넌트가 처음으로 렌더링될 때 실행됨
- 의존성 배열(`deps`)이 **빈 배열**인 경우 한 번만 실행됨

```jsx
useEffect(() => {
  console.log("mount");
}, []); // 최초 1회만 실행
```

### 💡 특징

- 이후 다시 렌더링되어도 실행되지 않음
- 서버에서 데이터를 처음 가져오거나 초기 설정 시 사용

---

## 🔹 2. Update (업데이트)

- 컴포넌트가 **리렌더링**될 때마다 실행됨
- 의존성 배열이 **없을 경우** 매 렌더링마다 실행
- 특정 값이 변경될 때만 실행하고 싶다면 `deps`에 해당 값을 명시

```jsx
useEffect(() => {
  if (!isMount.current) {
    isMount.current = true;
    return;
  }
  console.log("update");
});
```

### 💡 특징

- `useRef`로 최초 마운트를 구분해 update 시점만 감지 가능
- 상태 변화에 따른 동작을 구현할 때 활용

---

## 🔹 3. Unmount (언마운트)

- 컴포넌트가 화면에서 제거될 때 실행됨
- `useEffect`의 **return 함수**에서 정의

```jsx
useEffect(() => {
  return () => {
    console.log("unmount");
  };
}, []); // mount 시 등록 → unmount 시 실행
```

### 💡 특징

- 타이머 제거, 이벤트 리스너 정리 등에 사용
- `deps`가 빈 배열일 경우 컴포넌트 종료 시점에만 실행됨

---

## ✅ 의존성 배열 (`dependency array`, deps)

| 설정       | 동작 설명                 |
| ---------- | ------------------------ |
| 없음       | 매 렌더링마다 실행       |
| `[]`       | 최초 마운트 한 번만 실행 |
| `[a, b]`   | `a` 또는 `b`가 변경될 때 실행 |

---

## 🧪 참고: `Even` 컴포넌트의 언마운트 감지

```jsx
const Even = () => {
  useEffect(() => {
    return () => {
      console.log("unmount");
    };
  }, []);

  return <div>Even입니다.</div>;
};
```

- 이 컴포넌트는 `count`가 홀수로 바뀌면 조건부 렌더링에서 제외되면서 언마운트됨
- 그 시점에 `unmount` 로그 출력

---

## 🧾 전체 예제 코드

### App.jsx

```jsx
import "./App.css";
import Viewer from "./components/Viewer";
import Controller from "./components/Controller";
import { useEffect, useState, useRef } from "react";
import Even from "./components/Even.jsx";

function App() {
  const [count, setCount] = useState(0);
  const [input, setInput] = useState("");

  const isMount = useRef(false);

  useEffect(() => {
    console.log("mount");
  }, []);

  useEffect(() => {
    if (!isMount.current) {
      isMount.current = true;
      return;
    }
    console.log("update");
  });

  const onClickButton = (value) => {
    setCount(count + value);
  };

  return (
    <div className="App">
      <h1>Simple Counter</h1>
      <section>
        <input
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
          }}
        />
      </section>
      <section>
        <Viewer count={count} />
        {count % 2 === 0 ? <Even /> : null}
      </section>
      <section>
        <Controller onClickButton={onClickButton} />
      </section>
    </div>
  );
}

export default App;
```

### Even.jsx

```jsx
import { useEffect } from "react";

const Even = () => {
  useEffect(() => {
    return () => {
      console.log("unmount");
    };
  }, []);

  return <div>Even입니다.</div>;
};

export default Even;
```

---

## 🔚 요약

- `useEffect(() => {}, [])` → **마운트 시 1회 실행**
- `useEffect(() => {})` → **리렌더링마다 실행**
- `useEffect(() => { return () => {} }, [])` → **언마운트 시 실행**

컴포넌트 생명주기에 따라 적절한 `useEffect` 패턴을 사용하면, 효과적인 상태 관리와 자원 정리를 구현할 수 있습니다.