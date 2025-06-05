# React에서 `useState`를 `useReducer`로 대체하는 간단 예제

 

상태가 단순할 땐 `useState`를 쓰는 것이 편하지만, 복잡해질 경우 `useReducer`가 더 깔끔하고 명확한 코드를 만들어 줍니다. 이 글에서는 **간단한 카운터 예제**를 통해 `useState`와 `useReducer`의 차이를 비교해보겠습니다.

---

### ✅ `useState` 버전

```jsx
import { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>{count}</p>
      <button onClick={() => setCount(count + 1)}>+1</button>
    </div>
  );
}

export default Counter;
```

* `useState`를 사용해 상태(count)를 관리합니다.
* `setCount`를 통해 직접 상태를 변경합니다.

---

### ✅ `useReducer` 버전

```jsx
import { useReducer } from "react";

function reducer(state, action) {
  switch (action) {
    case "INCREMENT":
      return state + 1;
    default:
      return state;
  }
}

function Counter() {
  const [count, dispatch] = useReducer(reducer, 0);

  return (
    <div>
      <p>{count}</p>
      <button onClick={() => dispatch("INCREMENT")}>+1</button>
    </div>
  );
}

export default Counter;
```

* `useReducer`는 상태를 처리할 `reducer` 함수와 `dispatch` 함수를 사용합니다.
* `dispatch("INCREMENT")`를 호출하면, reducer 함수에서 해당 액션을 처리하여 상태를 업데이트합니다.

---

### 🔍 언제 `useReducer`를 사용할까?

| 상황                       | 적절한 훅          |
| ------------------------ | -------------- |
| 상태가 단순하고 하나만 있음          | `useState`     |
| 상태가 여러 개거나, 복잡한 조건 분기 필요 | `useReducer` ✅ |
| Redux 스타일처럼 액션 기반 상태 관리  | `useReducer` ✅ |

---

### ✨ 마무리

* `useState`는 간단하고 직관적입니다.
* `useReducer`는 상태 변경 로직을 함수로 분리해 **더 명확한 구조**를 만들 수 있습니다.
* 단순한 UI라면 `useState`, 로직이 분기되고 복잡하다면 `useReducer`를 고려해보세요.

React를 좀 더 구조적으로 작성하고 싶다면 `useReducer`는 좋은 시작점이 됩니다.
