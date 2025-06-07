# React에서 useContext를 사용하기 전과 후의 구조 비교

 

React에서 여러 컴포넌트가 동일한 데이터를 공유하고 조작해야 할 경우, props를 깊게 전달하는 방식은 유지보수가 어렵고 구조가 복잡해지기 쉽다. 이럴 때 `useContext`를 사용하면, 전역적으로 데이터를 관리할 수 있어 코드가 훨씬 깔끔해진다. 아래에서는 `useContext` 적용 전후의 차이점을 코드와 함께 비교해 보자.

---

## 1. useContext를 사용하지 않았을 때의 구조

### ✅ 특징

* `App` 컴포넌트에서 `todos`, `onCreate`, `onUpdate`, `onDelete`를 정의하고 `props`로 하위 컴포넌트에 전달한다.
* `List`, `Editor`, `TodoItem` 등 모든 하위 컴포넌트는 이 props를 계속해서 받아야 하며, 구조가 깊어질수록 관리가 어려워진다.

```jsx
<List todos={todos} onUpdate={onUpdate} onDelete={onDelete} />
<Editor onCreate={onCreate} />
```

`TodoItem`에서도 마찬가지로 `onUpdate`, `onDelete`를 계속 전달받는다.

```jsx
<TodoItem {...todo} onUpdate={onUpdate} onDelete={onDelete} />
```

### ❌ 단점

* 컴포넌트 트리 하단까지 계속 props를 전달해야 함 (prop drilling)
* 컴포넌트 간 의존성이 많아지고, 재사용성이 낮아짐
* 리렌더링 최적화가 어려움 (불필요한 props로 인해 memo 무효화 가능성)

---

## 2. useContext를 사용했을 때의 구조

### ✅ 적용 방식

* `TodoStateContext`, `TodoDispatchContext`를 `createContext()`로 생성
* `App` 컴포넌트에서 Provider로 하위 컴포넌트를 감싸 전역 상태와 dispatch 함수를 전달

```jsx
<TodoStateContext.Provider value={todos}>
  <TodoDispatchContext.Provider value={memoizedDispatch}>
    <Editor />
    <List />
  </TodoDispatchContext.Provider>
</TodoStateContext.Provider>
```

* 하위 컴포넌트에서는 `useContext`를 통해 직접 필요한 값만 가져와 사용

```jsx
const todos = useContext(TodoStateContext);
const { onUpdate, onDelete } = useContext(TodoDispatchContext);
```

### ✅ 장점

* props를 더 이상 전달할 필요 없음 → 코드 간결
* 컴포넌트가 독립적으로 동작 가능 → 재사용성 증가
* 필요한 데이터만 선택적으로 사용할 수 있음
* 구조가 명확하고, 규모가 커질수록 유지보수가 쉬움

---

## 3. 예제 비교: TodoItem 컴포넌트

### ⛔ useContext 적용 전

```jsx
const TodoItem = ({ id, isDone, content, date, onUpdate, onDelete }) => {
  const onChangeCheckbox = () => onUpdate(id);
  const onClickDeleteButton = () => onDelete(id);
  return (...);
};
```

### ✅ useContext 적용 후

```jsx
const { onUpdate, onDelete } = useContext(TodoDispatchContext);
const TodoItem = ({ id, isDone, content, date }) => {
  const onChangeCheckbox = () => onUpdate(id);
  const onClickDeleteButton = () => onDelete(id);
  return (...);
};
```

* props에서 함수 제거 → 호출하는 쪽의 의존성 감소

---

## 4. useContext가 적절한 시점은?

* 상태나 함수가 여러 컴포넌트에서 반복적으로 공유되고 있을 때
* 깊은 props 전달로 인해 코드가 복잡해질 때
* 상태와 로직을 전역적으로 공유해도 무방한 경우

> ❗ 단, 모든 상태에 무작정 useContext를 적용하는 것은 오히려 성능 저하나 예측 가능성 저하를 불러올 수 있음. 상태가 자주 바뀌고, 컴포넌트 간 결합이 강한 경우는 오히려 props나 Redux, Zustand 같은 별도 상태관리 툴이 더 적합할 수 있다.

---

## 5. 추가 예제: 로그인 사용자 정보 공유

```jsx
// context.js
export const UserContext = createContext(null);

// App.jsx
<UserContext.Provider value={{ name: "Han" }}>
  <Profile />
</UserContext.Provider>

// Profile.jsx
const user = useContext(UserContext);
return <p>환영합니다, {user.name}님</p>;
```

---

## ✨ 마무리

`useContext`는 props 전달의 번거로움을 줄이고, 전역 데이터를 효율적으로 관리할 수 있게 해준다. 구조가 단순해지고 가독성이 좋아지며, 특히 상태 변경 로직까지 함께 전달하면 비즈니스 로직이 컴포넌트로부터 분리되어 테스트와 유지보수가 쉬워진다.

적절한 시점에 `useContext`를 도입하면, React 앱의 구조를 한층 더 깔끔하게 개선할 수 있다.
