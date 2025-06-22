# React + Zustand + react-hook-form CRUD 구조 정리



이 문서에서는 실무에서 가장 많이 사용하는 React의 CRUD 페이지 구조를 예시 코드와 함께 완전히 해부한다. Zustand 기반 전역 상태관리, react-hook-form의 배열 동적 관리, 액션과 상태 흐름, 그리고 실전에서 자주 등장하는 패턴을 단계별로 쉽게 설명한다.

---

## 1. 주요 아키텍처 요약

* **Zustand**: 전역 상태(회사 목록, 현재 편집/선택 중인 데이터 등) 관리
* **react-hook-form**: 복잡한 폼(입력, 검증, 동적 배열) 관리
* **react-query**: 서버에서 데이터 fetch/caching 등 비동기 상태관리
* 각 컴포넌트(목록, 상세/수정/추가, 폼 등)가 props 없이 자연스럽게 상태 공유/업데이트

---

## 2. 주요 개념/문법 설명

### 2-1. Zustand Store 생성 흐름

* `CrudState<T>`, `CrudActions<T>`: 상태/액션 타입 분리
* `genCrudPageSlice<T>()`: 상태+액션이 합쳐진 객체를 반환
* `useCompanyPageStore = create<Store>(...)`: 실제 Store(전역 상태 저장소) 생성
* `useCompanyPageActions`: 액션만 쉽게 꺼내쓰는 커스텀 훅

### 2-2. Store의 상태 흐름

* **최초 실행**: `activeItem` 등은 기본값(null, \[])
* **행 선택(setActiveItem)**: 목록에서 행을 클릭하면 선택된 객체가 Store의 activeItem에 저장됨
* **컴포넌트 어디서나**: `useCompanyPageStore((s) => s.activeItem)`으로 최신 선택값 조회 가능

### 2-3. react-hook-form과 배열필드 관리

* useForm<FormValues>({ defaultValues: ... })

  * `<FormValues>`: 폼에서 입력받는 모든 값의 타입(제네릭)
  * `defaultValues`: 폼의 초기값 세팅
* useFieldArray({ control: form.control, name: "managers" })

  * `control`: 폼 전체 상태 연결 (반드시 form.control)
  * `name`: 동적으로 다루고 싶은 배열필드명 (예: "managers", "employees" 등)
  * 반환값: fields, append, remove, update 등 (각각 별명 붙여서 여러 배열 관리 가능)

---

## 3. 동작 전체 흐름 예시

1. **초기 로딩**: activeItem = null → 목록만 보임
2. **목록(ListView)에서 행 클릭**: setActiveItem(행 객체) → activeItem 갱신
3. **상세/수정/추가 Sheet/다이얼로그**: activeItem 값에 따라 자동 열림/닫힘
4. **폼에서 저장/삭제/취소**: clearActiveItem() → Sheet 닫힘 → 목록 리로드
5. **AddCompanyDialog 등 신규등록**: setActiveItem(null) → 빈 폼으로 열림

---

## 4. 타입스크립트 문법/유틸리티 상세

* Omit\<T, K>: T 타입에서 K(키)를 제외한 타입 생성
* 인터섹션 타입(&): 여러 타입의 속성을 모두 합친 새 타입 생성
* useFieldArray 여러 개 쓸 때는 구조분해 할당 변수명 별칭 필수
* 상태와 액션 모두 Store에서 전역으로 관리하고 필요할 때마다 꺼내씀

---

## 5. 자주 하는 질문(FAQ)

### Q1. activeItem은 언제 어떻게 세팅되는가?

* 최초에는 null (아무것도 선택되지 않음)
* 행 선택, 등록, 수정 시 setActiveItem(객체)로 값 세팅
* 저장/삭제/취소 등에서는 clearActiveItem()으로 초기화

### Q2. control: form.control은 꼭 저 이름이어야 하나?

* 네, useFieldArray 등 react-hook-form 훅에서 반드시 저 키로 연결해야 한다

### Q3. 배열 필드 여러 개 관리할 때 구조분해 변수명은?

* fields: managerFields, append: appendManager 등 배열별로 별칭 붙여서 충돌 방지

### Q4. Context와는 무슨 차이?

* Context는 Provider 하위에서만 접근/전달, Zustand는 전역 어디서나 직접 접근/구독
* 코드가 더 단순하고 전역 관리가 편함

---

## 6. 대표 코드 예시/구조

```ts
// 1. Store 생성
export const useCompanyPageStore = create<CrudStore<CompanyDTO>>((...a) => ({
  ...genCrudPageSlice<CompanyDTO>()(...a),
}))

// 2. Store 사용(읽기/변경)
const activeItem = useCompanyPageStore((s) => s.activeItem)
const { setActiveItem, clearActiveItem } = useCompanyPageActions()

// 3. 배열 동적 폼
const {
  fields: managerFields,
  append: appendManager,
  remove: removeManager,
  update: updateManager,
} = useFieldArray({ control: form.control, name: "managers" })

// 4. Omit + 인터섹션
Omit<CompanyDTO, "managers"> & { managers: EditableCompanyManager[] }
```

---

## 7. 실전 팁/확장 포인트

* 여러 엔티티에 CRUD store 확장도 쉬움: genCrudPageSlice<T> 이용
* Store 구조로 props drilling 완전 제거 가능
* react-hook-form의 동적 배열, 상태 관리, 서버 연동 모두 깔끔하게 분리
* Context API보다 전역 확장/구독/성능 관리에 훨씬 유리함

---
