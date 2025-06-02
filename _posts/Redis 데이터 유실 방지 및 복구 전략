## ✅ Redis 데이터 유실 방지 및 복구 전략

### 1. Redis 영속화 방식

Redis는 메모리 기반 인메모리 데이터 저장소지만, 데이터를 디스크에 저장하여 유실을 방지할 수 있는 2가지 주요 방법이 있음.

### 📌 RDB (Snapshotting)

- 일정 주기마다 메모리 상태를 전체 덤프하여 `dump.rdb` 파일로 저장
- 설정 예시 (redis.conf):
    
    ```
    save 900 1        # 900초(15분) 동안 key 1개 이상 변경 시 저장
    save 300 10       # 5분 간 10개 이상 변경 시 저장
    save 60 10000     # 1분 간 10,000개 이상 변경 시 저장
    ```
    
- 장점: 빠른 로딩, 메모리 적게 사용
- 단점: 마지막 스냅샷 이후의 데이터 유실 가능성 있음

### 📌 AOF (Append Only File)

- 모든 write 명령어를 로그 파일(`appendonly.aof`)로 기록하여 복구 가능
- 설정 예시:
    
    ```
    appendonly yes
    appendfsync everysec   # 1초마다 fsync 호출 (default, 권장)
    # appendfsync always   # 매 write 마다 디스크 반영 (데이터 안전 최상, 성능 낮음)
    ```
    
- 장점: 가장 안전한 방식 (write 손실 최소)
- 단점: 디스크 사용량 큼, 복구 시간이 길어질 수 있음

### 2. Redis 데이터 확인 및 복구

- 현재 TTL 확인: `TTL <key>`
- Redis 수동 저장: `redis-cli SAVE` 또는 `BGSAVE`
- RDB 복구: `dump.rdb`를 redis-server 실행 디렉터리에 위치시킨 후 재시작
- AOF 복구: `appendonly.aof` 사용 시 자동 복구 수행
- AOF 파일 손상 시 복구 명령어: `redis-check-aof --fix appendonly.aof`

### 3. Redis 백업 관리 팁

- `CONFIG GET dir`로 저장 위치 확인 (보통 macOS는 ~ 또는 /usr/local/var/db/redis)
- 주기적으로 `dump.rdb` 또는 `appendonly.aof`를 백업
- 고가용성을 위해 Redis Sentinel 또는 Redis Cluster 도입 고려

---

## ✅ Kafka 메시지 유실 방지 및 복구 전략

### 1. Kafka Producer 유실 방지 설정

Kafka는 메시지를 보낼 때 Producer에서 신뢰성 설정을 통해 유실을 방지함.

### 📌 Producer 설정 예시 (Spring Boot)

```
spring:
  kafka:
    producer:
      acks: all                   # 모든 replica에 기록 완료 시 성공 처리
      retries: 3                  # 실패 시 최대 3회 재시도
      properties:
        enable.idempotence: true # 중복 메시지 방지
```

### ✅ 주요 설정 설명

| 설정 | 설명 |
| --- | --- |
| `acks=all` | leader 및 ISR(복제본)까지 기록되어야 ack 반환됨 |
| `retries=3` | 일시적 네트워크 오류나 leader fail 시 재전송 |
| `enable.idempotence=true` | 같은 메시지를 중복으로 보내더라도 Kafka가 자동으로 제거 |

### 2. Kafka Topic 복제 전략

- 토픽 생성 시 복제 수 설정 → Broker 장애 발생 시 ISR로 자동 failover

```
kafka-topics.sh --create --topic stock.inbound \
--bootstrap-server localhost:9092 \
--replication-factor 2 --partitions 3
```

- 최소 복제본 수를 만족하지 못하면 쓰기를 막음:

```
min.insync.replicas=2
```

→ 이 설정과 `acks=all`을 조합하면 하나의 replica만 남았을 경우 쓰기가 거부됨 (안정성 ↑)

### 3. Kafka Consumer 유실 방지

- 자동 커밋을 비활성화하고 수동으로 offset 커밋 수행

```
spring:
  kafka:
    consumer:
      enable-auto-commit: false
```

```
@KafkaListener(...)
public void listen(String msg, Acknowledgment ack) {
    try {
        // 메시지 처리 로직
        ack.acknowledge(); // 처리 완료 후 수동 커밋
    } catch (Exception e) {
        // 에러 처리 또는 DLQ로 전송
    }
}
```

### 4. Kafka 메시지 복구 전략

- Consumer offset은 Kafka 내부 또는 외부 DB에 저장 가능 (보통 Kafka 내부)
- 메시지는 기본적으로 보존 기간(`retention.ms`) 동안 유지됨
- 복구 시 `-from-beginning` 옵션으로 처음부터 다시 읽기 가능

```
kafka-console-consumer.sh --topic stock.inbound \
--bootstrap-server localhost:9092 \
--from-beginning
```

---

## ✅ 일반 운영 팁 (실무)

### Redis

- `redis-cli MONITOR` → 실시간 명령어 확인
- `redis-cli INFO` → 메모리 사용량, key 수 등 상태 확인
- `redis-cli CONFIG REWRITE` → 현재 설정을 redis.conf에 반영

### Kafka

- Kafka Topic 백업은 log 디렉토리 백업
- 운영 시 `Prometheus + Grafana`로 브로커 상태 모니터링
- 로그 위치: 기본 `/tmp/kafka-logs`
- 복제 로그 복구 또는 ISR 복원은 자동 처리되나 로그 디렉토리 손실 시 복구 어려움 → NAS 또는 고신뢰 디스크 사용 권장

---

## 📁 데이터 저장 위치 요약

| 시스템 | 기본 저장 경로 |
| --- | --- |
| Redis (Homebrew) | `~/dump.rdb` 또는 `/usr/local/var/db/redis` |
| Kafka | `/tmp/kafka-logs`, 설정: `log.dirs` |

---
