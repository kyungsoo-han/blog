# React - useQueryClient().invalidateQueries

React Query의 `queryClient.invalidateQueries()`는 **특정 queryKey에 해당하는 캐시를 무효화**하여 `useQuery`가 자동으로 다시 데이터를 fetch 하게 만드는 함수입니다.

```ts
const queryClient = useQueryClient()
queryClient.invalidateQueries({ queryKey: ["commCodeList"] })
``` 

### 🚀 효과

* 해당 queryKey를 사용하는 모든 useQuery가 **자동으로 재실행됨**
* 서버에서 최신 데이터를 다시 가져오게 됨
* 로딩 스피너 표시, 캐시 업데이트 자동 처리

### 🎯 주요 옵션

* `queryKey`: 어떤 쿼리를 무효화할지 지정 (배열 형태)
* `exact`: 정확히 일치하는 키만 무효화할지 여부 (`true` 설정 시 \["user"]는 \["user", 1]과는 별개)

### ✅ 왜 쓰는가?

* React Query는 기본적으로 서버에서 받은 데이터를 캐시에 저장함
* 하지만 사용자가 어떤 행동을 하면 (ex. 코드 추가/삭제), 이 캐시는 **더 이상 최신이 아닐 수 있음**
* 이럴 때 invalidateQueries를 쓰면 해당 데이터를 자동으로 다시 가져와서 최신 상태로 유지

### ✅ 언제 쓰는가?

* 저장/삭제/수정 후 목록을 다시 불러오고 싶을 때
* "새로고침" 버튼 클릭 시 강제 데이터 재요청할 때

### ✅ 백엔드 API와의 관계

* `invalidateQueries`는 직접 백엔드 호출을 하지 않음
* 대신 해당 queryKey를 가진 `useQuery`를 **자동으로 다시 실행**시킴
* 이 때 `useQuery`가 호출했던 API (`queryFn`)가 다시 백엔드로 요청됨 → **최신 상태 반영**

