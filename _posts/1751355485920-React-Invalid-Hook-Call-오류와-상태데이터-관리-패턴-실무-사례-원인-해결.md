# React ‘Invalid Hook Call’ 오류와 상태/데이터 관리 패턴 실무 사례, 원인, 해결


  

## 1. 문제 상황

### (1) 실제로 발생한 오류 메시지(원문/해석)

```
Warning: React has detected a change in the order of Hooks called by MaintenanceTable. This will lead to bugs and errors if not fixed. For more information, read the Rules of Hooks: https://reactjs.org/link/rules-of-hooks
```

> **해석:**
> React가 MaintenanceTable 컴포넌트에서 Hook 호출 순서가 바뀌는 것을 감지했습니다. 이 문제를 수정하지 않으면 버그와 오류가 발생할 수 있습니다. 자세한 내용은 Rules of Hooks 문서를 참고하세요.

```
Uncaught Error: Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons:
1. You might have mismatching versions of React and the renderer (such as React DOM)
2. You might be breaking the Rules of Hooks
3. You might have more than one copy of React in the same app
```

> **해석:**
> 에러: 잘못된 Hook 호출입니다. Hook은 반드시 함수형 컴포넌트 본문 내부에서만 호출해야 합니다. 아래 중 한 가지 이유로 인해 발생할 수 있습니다:
>
> 1. React와 렌더러(예: React DOM)의 버전이 일치하지 않을 때
> 2. Hook 규칙을 어길 때
> 3. 앱에 React가 두 번 이상 설치되어 있을 때

### (2) 문제 코드 예제 (실전 케이스)

```tsx
export function MaintenanceTable({ isLoading: loading, data }: Props) {
  // ...
  if (loading) {
    return <div>로딩 중...</div>;
  }
  useEffect(() => {
    // ...
  }, []);
  // ...
}
```

### (3) 부가적 현상: Dialog 수정 후 reload가 되지 않는 문제

* 모달(Dialog)에서 데이터를 수정/저장 후, 테이블(리스트)이 새로고침(reload)되지 않음

---

## 2. 원인 분석

### (1) React Hook 규칙 위반

* **React의 모든 Hook(useEffect, useState 등)은 컴포넌트 함수 최상단에서 조건 없이 호출**해야 함.
* if문, return문, 반복문 등 조건에 따라 훅이 호출되면, 렌더마다 순서가 달라져 위와 같은 오류가 발생함.
* [React 공식: Rules of Hooks](https://reactjs.org/docs/hooks-rules.html)

#### 예시 설명

* 타입스크립트/리액트 환경 모두 동일하게 적용
* 개발 시 hook 반환 타입(data, refetch 등)도 주의해서 다루기

### (2) 데이터 fetch와 reload의 구조 문제

* 데이터는 react-query의 useQuery로 fetch/관리하는데,
* zustand로 정의한 reload()는 실제로 react-query의 refetch를 트리거하지 않음
* 그래서 reload()를 호출해도 실제 리스트가 갱신되지 않는 현상 발생

### (3) 상태관리 혼용에서 오는 실무 문제

* UI 상태(모달 open, 선택행 등)는 zustand 등으로 관리
* 서버 데이터(fetch, 캐싱 등)는 react-query 등으로 관리해야 일관성↑
* 혼합 사용 시 데이터 불일치 등 버그가 잦음

---

## 3. 해결 방법 및 코드 예시

### (1) 올바른 Hook 위치로 수정

**문제 코드:**

```tsx
if (loading) return <div>로딩 중...</div>;
useEffect(() => {
  // ...
}, []);
```

**수정 코드:**

```tsx
useEffect(() => {
  // ...
}, []);
if (loading) return <div>로딩 중...</div>;
```

* 항상 컴포넌트 함수 최상단에서 hook 호출!

---

### (2) react-query 기반 reload 구조로 통일

#### 부모 컴포넌트(MaintenanceTab):

```tsx
import { useQuery, useQueryClient } from "@tanstack/react-query"

const queryClient = useQueryClient();
const { data, isLoading } = useQuery({
  queryKey: ["equip-maintenance", equipment.id],
  queryFn: () => EquipmentEndpoint.listMaintenance(equipment.id),
});

<MaintenanceTable
  isLoading={isLoading}
  data={data}
  reload={() => queryClient.invalidateQueries(["equip-maintenance", equipment.id])}
/>
```

#### 테이블 컴포넌트:

```tsx
export function MaintenanceTable({ isLoading, data, reload }) {
  // ...
  return (
    <>
      <DataTable ... />
      {activeItem && (
        <DialogEditMaintenance
          activeItem={activeItem}
          onSuccess={() => {
            setActiveItem(null);
            reload?.();  // react-query에서 리스트 리로드 트리거
          }}
        />
      )}
    </>
  );
}
```

#### DialogEditMaintenance:

```tsx
export const DialogEditMaintenance = ({ activeItem, onSuccess }) => {
  // ...
  async function onEditSubmit(data) {
    const res = await EquipMaintenanceEndpoint.update(activeItem.id, data);
    if (res.ok) {
      onSuccess?.();
    }
  }
  // ...
};
```

---

## 4. 실무/타입스크립트 팁

* 데이터 fetch/동기화는 react-query(SWR)로,
  UI/로컬 상태는 zustand/recoil로 분리하면 명확한 구조 확보 가능
* queryKey(캐싱키) 관리를 일관성 있게 하면 invalidateQueries가 예측대로 동작
* 타입스크립트 환경에서는 hook 반환 타입(data, refetch 등) 활용해 안정성↑
* Hook 관련 경고/에러는 반드시 개발 단계에서 해결할 것

---

## 5. 결론

* **Hook은 컴포넌트 최상단에서 조건 없이 호출**
* **데이터 reload는 react-query invalidate/refetch로 일원화**
* **상태/서버 데이터 관리 역할 분리로 실무 안전성·유지보수성 향상!**
