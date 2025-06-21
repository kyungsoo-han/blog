# TypeScript `Omit<T, K>` 정리


 

## 1. Omit이란?

`Omit<T, K>`는 **기존 타입(T)에서 특정 속성(K)을 제외한 새로운 타입**을 만들 때 사용한다.

* `T`: 원본 타입
* `K`: 제외하고 싶은 속성의 key(문자열, 유니언 가능)

`Omit`은 TypeScript에 기본 내장되어 있으며, 실제로는 Mapped Types와 keyof, Exclude, Pick을 조합해서 동작한다.

---

## 2. 기본 사용법

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  password: string;
}

// password 필드를 제외한 User 타입
type UserWithoutPassword = Omit<User, 'password'>;

const user: UserWithoutPassword = {
  id: 1,
  name: "홍길동",
  email: "hong@test.com"
  // password는 넣을 수 없음!
};
```

* `UserWithoutPassword` 타입에는 `id`, `name`, `email`만 존재
* `password`를 넣으면 에러 발생

---

## 3. Omit의 내부 구현

```typescript
type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;
```

* `Exclude<keyof T, K>`: T의 모든 key 중에서 K에 해당하는 것을 제외
* `Pick<T, ...>`: 남은 key만 골라서 새로운 타입 생성

---

## 4. 여러 개의 key도 제외 가능

```typescript
interface Post {
  id: number;
  title: string;
  content: string;
  authorId: number;
  createdAt: Date;
}

// id와 createdAt을 제외
type PostInput = Omit<Post, 'id' | 'createdAt'>;

const newPost: PostInput = {
  title: "제목",
  content: "내용",
  authorId: 123
  // id, createdAt은 사용 불가
};
```

---

## 5. Omit의 대표적 활용 예시

* DTO/Request/Response에서 불필요한 값 제거
* form 상태 관리 시 password, token 등 민감 정보 제외
* 상속받은 타입에서 일부 필드 제거

#### 예시: 비밀번호 제외 후 전달

```typescript
function sendUser(user: Omit<User, 'password'>) {
  // password 필드 없이 user 정보 전달
}
```

---

## 6. Omit과 Pick, Partial 등과의 비교

| 유틸리티        | 역할                       |
| ----------- | ------------------------ |
| Pick\<T, K> | T에서 K에 해당하는 속성만 선택       |
| Omit\<T, K> | T에서 K에 해당하는 속성을 제외       |
| Partial<T>  | T의 모든 속성을 선택적(Optional)로 |
| Required<T> | T의 모든 속성을 필수로            |

---

## 7. 실무 팁

* Form 타입에서 특정 필드만 입력받고 싶을 때
* API 응답에서 DB 고유값(id)나 내부관리값 제외

---

## 8. 참고 코드: Omit, Pick, Partial 조합

```typescript
type UserForm = Omit<Partial<User>, 'id' | 'password'>;
// User의 모든 필드를 Optional로 바꾸고, id와 password를 제외
```

---

## 정리

* **Omit은 타입에서 특정 속성을 제외할 때 사용하는 강력한 유틸리티 타입**
* 실무에서 다양한 상황에서 매우 유용하게 활용된다.
