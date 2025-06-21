# Java - Stream에서 map과 forEach의 차이


 

Java Stream API를 사용하다 보면 `map()`과 `forEach()`를 자주 만나게 된다. 두 메서드는 비슷해 보이지만 목적과 사용하는 상황이 다르다. 이 글에서는 `map()`과 `forEach()`의 차이를 실제 예제와 함께 정리한다.

---

## 1. map() : 변환(Transformation)에 사용

* **설명**: `map()`은 스트림의 각 요소를 특정 방식으로 변환할 때 사용한다.
* **리턴값**: 변환된 값들로 새로운 스트림(Stream)을 생성한다.
* **주 용도**: 데이터를 가공하거나 타입을 변경해야 할 때 사용한다.
* **중간 연산**: map은 중간 연산이다. 즉, map 이후에 또 다른 스트림 연산이 이어질 수 있다.

### 예시

```java
List<String> names = Arrays.asList("홍길동", "이순신", "강감찬");
List<Integer> nameLengths = names.stream()
    .map(String::length) // 각 이름의 길이로 변환
    .collect(Collectors.toList()); // 결과를 리스트로 수집
```

* `map(String::length)` 부분에서 각 문자열을 그 길이로 변환한다.
* 변환된 값들은 새로운 스트림으로 이어진다.

---

## 2. forEach() : 소비(Consumption)에 사용

* **설명**: `forEach()`는 스트림의 각 요소를 소비(Consume)할 때 사용한다.
* **리턴값**: 반환값이 없다(void). 결과를 저장하지 않는다.
* **주 용도**: 최종적으로 무언가를 출력하거나, DB에 저장, 외부 시스템과 연동 등 부수효과(side-effect)가 필요할 때 사용한다.
* **최종 연산**: forEach는 최종 연산이다. forEach 이후에는 더 이상 스트림 연산이 이어질 수 없다.

### 예시

```java
List<String> names = Arrays.asList("홍길동", "이순신", "강감찬");
names.stream()
    .forEach(name -> System.out.println(name)); // 각 요소를 출력
```

* 각 요소에 대해 print 작업만 하고, 새로운 값을 만들지 않는다.

---

## 3. map() vs forEach() 차이 정리

| 구분    | map()              | forEach()          |
| ----- | ------------------ | ------------------ |
| 용도    | 변환(Transformation) | 소비(Consumption)    |
| 리턴값   | 변환된 스트림            | 없음(void)           |
| 연산종류  | 중간 연산              | 최종 연산              |
| 주 사용처 | 값 가공/타입 변경/파이프라인   | 출력/저장/외부 연동 등 부수효과 |

---

## 4. map과 forEach를 함께 쓰는 경우

보통 데이터를 변환한 후, 그 결과를 소비해야 할 때 두 메서드를 조합해서 사용한다.

### 예시

```java
List<String> names = Arrays.asList("홍길동", "이순신", "강감찬");
names.stream()
    .map(String::toUpperCase) // 모든 이름을 대문자로 변환
    .forEach(System.out::println); // 변환된 값을 출력
```

* map으로 변환 후, forEach로 결과를 출력한다.

---

## 5. 주의할 점

* map을 사용해도 forEach처럼 부수효과만 남기는 코드를 작성하면 안된다. (map은 반드시 변환 용도로만)
* forEach에서 값을 가공해도 결과를 저장하지 않기 때문에 데이터 변환에는 적합하지 않다.

---

## 6. 결론

* 데이터를 변환(가공)할 때는 `map()`
* 데이터를 최종적으로 소비(출력, 저장)할 때는 `forEach()`
* map은 중간 연산, forEach는 최종 연산

각 메서드의 역할과 용도를 잘 구분해서 사용해야 코드를 더 읽기 쉽고 유지보수하기 편하다.
