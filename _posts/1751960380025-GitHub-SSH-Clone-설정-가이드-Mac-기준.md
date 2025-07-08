# GitHub SSH Clone 설정 가이드 (Mac 기준)

 

  
GitHub 비공개 저장소를 SSH로 clone 하기 위한 전체 설정 절차입니다.

---

## 1. SSH 키 생성 (없을 경우)

```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
```

* 기본 경로 `~/.ssh/id_ed25519`로 저장
* 패스프레이즈는 생략 가능 (엔터 두 번)

---

## 2. 공개키 GitHub에 등록

```bash
cat ~/.ssh/id_ed25519.pub
```

1. 위 명령어로 출력된 공개키 내용을 복사
2. GitHub 접속 → [SSH Key 등록 페이지](https://github.com/settings/keys)
3. "New SSH key" 클릭 후 붙여넣기 및 저장

---

## 3. SSH config 파일 설정

```bash
nano ~/.ssh/config
```

아래 내용 추가:

```ssh
Host github.com
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_ed25519
  IdentitiesOnly yes
  UseKeychain yes
  AddKeysToAgent yes
```

> 💡 키 이름이 `id_ed25519`가 아닌 경우 `IdentityFile` 경로를 해당 키로 수정하세요.

---

## 4. SSH Agent에 키 등록

```bash
ssh-add ~/.ssh/id_ed25519
```

> 커스텀 키일 경우:
>
> ```bash
> ssh-add ~/.ssh/사용한키이름
> ```

---

## 5. SSH 연결 확인

```bash
ssh -T git@github.com
```

### 성공 메시지 예시:

```
Hi your-github-username! You've successfully authenticated, but GitHub does not provide shell access.
```

---

## 6. Git 저장소 Clone

```bash
git clone git@github.com:iroisoft/gsc-lubedata-pad.git
```

---

## 7. 추가 확인사항 (Clone 안 될 경우)

* GitHub 저장소 초대 수락 여부: [https://github.com/notifications](https://github.com/notifications)
* 로그인된 GitHub 계정이 권한 있는 계정인지 확인
* `.ssh/config` 파일에 키 경로가 정확히 설정되었는지 확인
* `ssh -T` 명령 결과로 인증된 계정이 맞는지 확인

---

# 🔐 여러 GitHub 계정 사용하는 경우 (예: 개인 계정 + 회사 계정)

## 1. SSH 키 각각 생성

```bash
# 개인 계정 키
ssh-keygen -t ed25519 -C "personal@example.com" -f ~/.ssh/id_ed25519

# 회사 계정 키
ssh-keygen -t ed25519 -C "work@example.com" -f ~/.ssh/work_id_ed25519
```

---

## 2. 각각 GitHub에 공개키 등록

```bash
cat ~/.ssh/id_ed25519.pub            # 개인용 GitHub 계정에 등록
cat ~/.ssh/work_id_ed25519.pub       # 회사용 GitHub 계정에 등록
```

등록 위치: [https://github.com/settings/keys](https://github.com/settings/keys)

---

## 3. \~/.ssh/config 파일에 계정별 설정 추가

```ssh
# 개인 계정
Host github.com-personal
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_ed25519
  IdentitiesOnly yes

# 회사 계정
Host github.com-work
  HostName github.com
  User git
  IdentityFile ~/.ssh/work_id_ed25519
  IdentitiesOnly yes
```

> 💡 `Host`는 GitHub가 아닌 **내부용 별명**으로 사용됩니다.

---

## 4. 키 등록 (각각)

```bash
ssh-add ~/.ssh/id_ed25519
ssh-add ~/.ssh/work_id_ed25519
```

---

## 5. 연결 확인 (각 Host)

```bash
ssh -T git@github.com-personal   # 개인 계정 연결 확인
ssh -T git@github.com-work       # 회사 계정 연결 확인
```

---

## 6. 저장소 clone 시 Host alias 사용

* 개인 계정:

```bash
git clone git@github.com-personal:username/my-personal-repo.git
```

* 회사 계정:

```bash
git clone git@github.com-work:iroisoft/gsc-lubedata-pad.git
```


