#  CompanyEditForm.tsx 상세 설명

 

 
이 문서는 `CompanyEditForm` 컴포넌트가 **어떻게 동작하는지**, **React + TypeScript 환경에서 어떤 기능들이 연동되어 있는지**를 **아주 구체적으로 설명**합니다.

---

## 1. 주요 목적

`CompanyEditForm` 컴포넌트는 다음 목적을 갖고 동작합니다:

* 회사 정보(이름, 주소, 태그)를 입력받아 서버로 저장한다
* 해당 회사에 소속된 "담당자 목록"을 동적으로 조회/추가/편집/삭제한다
* 수정 중인 행만 저장되도록 한다 (성능/정합성 향상)

---

## 2. 사용된 주요 기술 스택 및 그 이유

| 기술                      | 역할                 | 선택 이유                                |
| ----------------------- | ------------------ | ------------------------------------ |
| `react-hook-form`       | Form 상태 관리         | 성능 최적화와 불변성 유지, useFieldArray로 배열 지원 |
| `@tanstack/react-query` | 비동기 데이터 Fetch + 캐싱 | 서버 상태와 클라이언트 상태를 자동 동기화함             |
| `zustand`               | 페이지 상태 관리          | 전역 저장소를 간단하게 관리 (Redux보다 가벼움)        |
| `TypeScript`            | 정적 타입 검사           | 데이터 구조 예측 가능성 증가 및 유지보수 용이           |

---

## 3. 상태 흐름 및 데이터 동기화 흐름

### 1) `activeItem` 가져오기 (Zustand)

* `useCompanyPageStore()`에서 현재 편집 중인 회사 데이터를 가져옵니다.
* 이 값은 `form.defaultValues`로 사용되며, 없는 경우 기본값을 줍니다.

### 2) `useForm` 으로 form 상태 초기화

* `defaultValues`에 따라 `form.control`, `form.register`, `form.watch`, `form.getValues` 등의 hook들이 동작함.
* 내부적으로 `useReducer` 기반 상태머신을 가지며, 각 필드 상태는 독립적으로 관리됩니다.

### 3) `useQuery`로 companyManagers 비동기 조회

* `activeItem.id`가 존재할 경우, 해당 회사의 담당자 목록을 서버에서 가져옴.
* 이 목록은 `react-query`가 관리하며, 자동 캐싱 및 재시도 기능도 내장됨.

### 4) `useEffect`로 폼 상태 초기화

* `companyManagers`가 응답되면 form에 반영 (form.reset 호출)
* 이 시점에서 `useFieldArray`의 `fields` 값도 최신 목록으로 동기화됨

---

## 4. 담당자 목록 관리 (useFieldArray)

### 작동 방식

* `useFieldArray`는 배열 형태의 form 필드를 다룰 수 있게 해주는 훅입니다.
* 내부적으로 `fields`라는 배열과 `append`, `remove` 등의 조작 함수를 제공합니다.
* 각 필드는 `key`, `id`, `name` 등의 고유 식별자와 함께 관리됩니다.

### 추가 동작

* `append()`를 호출하면 새로운 필드가 생성되고 `editableRows`에 해당 index를 추가함
* 이 index는 나중에 `편집 중인지 아닌지`를 판단하는 기준이 됨

### 삭제 동작

* `id`가 존재하면 서버 API 호출하여 삭제 후 remove()
* `id`가 없으면 클라이언트에서만 remove() 실행

---

## 5. 편집 상태 관리 (`editableRows`)

### 목적

* 어떤 row가 실제로 편집 중인지 판단하기 위함
* 상태 기반으로 input vs span 으로 구분하여 렌더링

### 동작 흐름

* 신규 append 시 `fields.length`를 editableRows에 push
* 편집 버튼 클릭 시 toggle (`includes` 기반)
* 저장 시 `editableRows.map(index => 전체 데이터[index])`로 실제 변경된 행만 추출

### 왜 필요한가?

* 성능 최적화 (전체 데이터 저장 방지)
* UX 개선: 사용자 실수 최소화
* 명확한 변경 추적

---

## 6. 저장 동작 전체 흐름

1. `onSubmit()` 실행 (SubmitButton 클릭 or Enter)
2. `form.getValues("managers")`로 모든 행의 최신 값 가져옴
3. `editableRows`에 포함된 index만 추출해서 `editedManagers` 생성
4. 이를 `value.managers`에 대입하여 서버로 전송
5. 성공 시:

   * 알림(toast.success)
   * 부모 콜백(onSuccess)
   * 필요 시 editableRows 초기화

---

## 7. UI 컴포넌트 별 기능 정리

### `DetailSection`

* 제목, 설명(desc), action 버튼, children slot을 포함하는 레이아웃

### `TextField`

* form과 연결된 기본 입력 필드 (label, validation 자동 연동)

### `InputCompanyTag`

* 커스텀 태그 입력기, string 또는 array 기반으로 작동 가능

### `Table`, `TableRow`, `TableCell`

* 커스텀 디자인 테이블 구성요소
* 기본적으로 head/body 분리, semantic 구조 유지

---

## 8. 최종 정리: 왜 이 구조인가?

* ✅ **비즈니스 로직과 UI의 분리**: `CompanyEndpoint`가 API를 추상화하고, 컴포넌트는 상태만 다룬다
* ✅ **부분 저장 가능**: `editableRows` 개념을 도입함으로써, 실제 변경된 데이터만 추적 및 전송
* ✅ **확장 용이성**: form hook과 react-query를 사용함으로써 컴포넌트간 상태 의존도 최소화
* ✅ **유지보수성**: TypeScript를 통한 타입 보장, 직관적인 훅 기반 설계로 관리 포인트 최소화

---

## ✅ 추천 확장 아이디어

* `isNew` / `isDeleted` 상태 관리하여 상태별 뱃지 추가
* `yup` + `resolver` 연동으로 schema 기반 검증 강화
* `onBlur` 시 자동 저장 기능 추가
* row 이동(순서 변경) 기능 추가

---

이 문서는 실제 개발자가 구조와 작동 원리를 완전히 이해하고 유지보수 및 확장에 참고할 수 있도록 작성되었습니다. 필요 시 리덕스/쿼리 상태 통합, SSR 연동 예시도 추가할 수 있습니다.
