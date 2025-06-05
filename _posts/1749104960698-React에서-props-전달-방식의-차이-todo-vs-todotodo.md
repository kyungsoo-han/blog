# React에서 props 전달 방식의 차이: `{...todo}` vs `todo={todo}`



React로 컴포넌트를 작성하다 보면 자식 컴포넌트에 props를 전달할 때 `todo={todo}`처럼 **객체 전체를 넘기는 방식**과 `{...todo}`처럼 **전개 연산자(spread)를 사용하는 방식**이 있습니다.

이 두 방식은 비슷해 보이지만, **컴포넌트 내부에서 데이터를 접근하는 방법이 완전히 달라집니다.**
잘못 사용하면 `undefined` 에러가 발생할 수 있으므로, 각각의 차이와 올바른 사용법을 명확히 이해하는 것이 중요합니다.

---

### ✅ 예제 상황 설명

예를 들어 `List`라는 컴포넌트가 있고, 그 안에서 `TodoItem` 컴포넌트를 반복적으로 렌더링한다고 가정합니다.

```jsx
{todos.map((todo) => (
  <TodoItem key={todo.id} {...todo} onUpdate={onUpdate} />
))}
```

위 코드에서 `...todo`는 `todo` 객체를 전개해서 각각의 속성을 `TodoItem`에 개별적으로 전달하는 방식입니다. 즉 다음과 같은 형태로 변환됩니다:

```jsx
<TodoItem
  id={todo.id}
  isDone={todo.isDone}
  content={todo.content}
  date={todo.date}
  onUpdate={onUpdate}
/>
```

이때 `TodoItem` 컴포넌트는 아래처럼 작성해야 정상적으로 동작합니다:

```js
const TodoItem = (props) => {
  console.log(props.id);       // ✅ 가능
  console.log(props.content);  // ✅ 가능
};
```

만약 아래처럼 `props.todo.id`처럼 작성한다면?

```js
const TodoItem = (props) => {
  console.log(props.todo.id);  // ❌ 에러 발생 (props.todo는 undefined)
};
```

→ `todo`라는 이름의 prop 자체가 존재하지 않기 때문에 **`undefined` 오류가 발생**합니다.

---

### 📌 두 가지 방식 비교

#### 1. `{...todo}` 방식 - 전개 연산자 사용

```jsx
<TodoItem {...todo} onUpdate={onUpdate} />
```

* `todo` 객체의 속성들이 모두 개별 props로 전달됨
* 예: `id`, `isDone`, `content`, `date` 각각 별도로 넘어감
* ✅ `props.id`, `props.content` 등으로 직접 접근 가능
* ❌ `props.todo`는 존재하지 않음

**컴포넌트 내부 사용 예:**

```js
const TodoItem = (props) => {
  console.log(props.id); // ✅ 정상
  console.log(props.todo); // ❌ undefined
};
```

#### 2. `todo={todo}` 방식 - 객체 자체를 prop으로 전달

```jsx
<TodoItem todo={todo} onUpdate={onUpdate} />
```

* `todo`라는 하나의 객체가 prop으로 전달됨
* ✅ `props.todo.id`, `props.todo.content` 등으로 접근 가능
* ❌ `props.id` 등은 존재하지 않음

**컴포넌트 내부 사용 예:**

```js
const TodoItem = (props) => {
  console.log(props.todo.id); // ✅ 정상
  console.log(props.id); // ❌ undefined
};
```

---

### ⚠️ 혼용 시 주의할 점

| 전달 방식         | 내부 접근 방식                            | 주의할 점                      |
| ------------- | ----------------------------------- | -------------------------- |
| `{...todo}`   | `props.id`, `props.content`         | 전개된 개별 props로 전달됨          |
| `todo={todo}` | `props.todo.id`                     | todo 객체 전체가 하나의 prop으로 전달됨 |
| ❌ 혼용 시 에러     | `props.todo` 또는 `props.id` 접근 오류 발생 | 전달 방식과 접근 방식이 일치해야 함       |

---

### 💡 어떤 방식을 써야 할까?

* **컴포넌트가 단순하고 prop 수가 적을 때**는 `...todo` 방식이 간결해서 좋습니다.
* **`todo` 자체를 한 객체로 묶어서 다루고 싶을 때**, 또는 하위 컴포넌트에서 객체 단위로 넘겨받고 싶은 경우는 `todo={todo}` 방식이 더 유리합니다.
* 팀 내 컨벤션이 있다면 반드시 그것을 따르는 것이 좋습니다.

---

### ✅ 추가 예시: 타입스크립트 사용 시

타입스크립트를 쓰는 경우 `todo` 객체 전체를 넘기는 방식이 타입 정의가 더 간단해지는 경우가 많습니다.

```tsx
interface Todo {
  id: number;
  content: string;
  isDone: boolean;
  date: string;
}

interface TodoItemProps {
  todo: Todo;
  onUpdate: (id: number) => void;
}

const TodoItem = ({ todo, onUpdate }: TodoItemProps) => {
  return (
    <div>
      <input onChange={() => onUpdate(todo.id)} />
      <span>{todo.content}</span>
    </div>
  );
};
```

---

### ✅ 마무리 정리

React에서 props를 전달할 때는 **전달 방식과 접근 방식이 반드시 일치해야** 합니다.

| 원하는 방식         | List에서 넘기는 방식              | TodoItem 내부에서 접근 방식                   |
| -------------- | -------------------------- | ------------------------------------- |
| 개별 속성으로 전달     | `<TodoItem {...todo} />`   | `props.id`, `props.content`, ...      |
| todo 객체 자체로 전달 | `<TodoItem todo={todo} />` | `props.todo.id`, `props.todo.content` |

혼용하면 런타임 에러가 발생하므로, props를 어떻게 넘길지와 어떻게 받을지를 항상 **세트로 고려**하세요!
