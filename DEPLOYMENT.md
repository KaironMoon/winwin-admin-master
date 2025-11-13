# 배포 가이드 (Deployment Guide)

WinWin Admin 플랫폼을 AWS EC2 환경에 배포하는 상세 가이드입니다.

## 📋 목차

- [서버 요구사항](#서버-요구사항)
- [초기 서버 설정](#초기-서버-설정)
- [애플리케이션 배포](#애플리케이션-배포)
- [Nginx 설정](#nginx-설정)
- [SSL 인증서 설정](#ssl-인증서-설정)
- [배포 업데이트](#배포-업데이트)
- [모니터링 및 관리](#모니터링-및-관리)
- [트러블슈팅](#트러블슈팅)

## 🖥 서버 요구사항

### 최소 사양
- **OS**: Ubuntu 20.04 LTS 이상
- **CPU**: 2 vCPU
- **RAM**: 4GB
- **Storage**: 20GB SSD
- **Network**: 공인 IP 주소

### 권장 사양
- **OS**: Ubuntu 22.04 LTS
- **CPU**: 4 vCPU
- **RAM**: 8GB
- **Storage**: 40GB SSD
- **Network**: 고정 IP 주소 + 도메인

### 필수 도구
- Node.js 20.x
- npm 또는 yarn
- PM2 (프로세스 관리자)
- Nginx (웹 서버)
- Certbot (SSL 인증서)

## 🛠 초기 서버 설정

### 1. 기본 패키지 설치

```bash
# 시스템 업데이트
sudo apt update && sudo apt upgrade -y

# 필수 패키지 설치
sudo apt install -y git curl nginx certbot python3-certbot-nginx build-essential
```

### 2. NVM 및 Node.js 설치

```bash
# NVM 설치
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# NVM 환경 변수 로드
export NVM_DIR="$HOME/.nvm"
source "$NVM_DIR/nvm.sh"

# 쉘 재시작 시 자동 로드 설정
echo 'export NVM_DIR="$HOME/.nvm"' >> ~/.bashrc
echo '[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"' >> ~/.bashrc
source ~/.bashrc

# Node.js 20 설치
nvm install 20
nvm alias default 20

# 설치 확인
node -v  # v20.x.x
npm -v   # 10.x.x
```

### 3. PM2 설치

```bash
# PM2 전역 설치
npm install -g pm2

# PM2 버전 확인
pm2 -v
```

### 4. 애플리케이션 디렉토리 설정

```bash
# 웹 애플리케이션 디렉토리 생성
sudo mkdir -p /var/www/react-app

# 소유권 변경 (ubuntu 사용자)
sudo chown ubuntu:ubuntu /var/www/react-app

# 디렉토리로 이동
cd /var/www/react-app
```

## 📦 애플리케이션 배포

### 1. GitHub 인증 설정

```bash
# .netrc 파일 생성 (GitHub Personal Access Token 사용)
cat <<EOF > ~/.netrc
machine github.com
login <GitHub_이메일>
password <GitHub_Personal_Access_Token>
EOF

# 보안을 위한 권한 설정
chmod 600 ~/.netrc
```

**GitHub Personal Access Token 생성 방법:**
1. GitHub Settings → Developer settings → Personal access tokens
2. Generate new token (classic)
3. Select scopes: `repo` (전체 저장소 접근)
4. 생성된 토큰을 안전하게 보관

### 2. 저장소 클론

```bash
# 저장소 클론
git clone https://github.com/soonseek/winwin-admin.git .

# 또는 SSH 사용
git clone git@github.com:soonseek/winwin-admin.git .

# 브랜치 확인
git branch
```

### 3. 의존성 설치 및 빌드

```bash
# npm 의존성 설치
npm install

# 프로덕션 빌드
npm run build

# 빌드 결과 확인
ls -la build/
```

### 4. PM2로 앱 서빙

```bash
# serve 패키지 전역 설치
npm install -g serve

# PM2로 정적 파일 서버 시작
pm2 start "serve -s build -l 3000" --name react-app

# 시스템 재부팅 시 자동 시작 설정
pm2 startup systemd -u ubuntu --hp /home/ubuntu

# 위 명령어가 출력하는 명령어를 실행 (예시)
# sudo env PATH=$PATH:/home/ubuntu/.nvm/versions/node/v20.x.x/bin ...

# 현재 PM2 프로세스 목록 저장
pm2 save

# PM2 상태 확인
pm2 list
pm2 logs react-app
```

## 🌐 Nginx 설정

### 1. Nginx 설정 파일 생성

```bash
# Nginx 사이트 설정 파일 생성
sudo tee /etc/nginx/sites-available/react-app > /dev/null <<'EOF'
server {
    listen 80;
    server_name megabit-td.com www.megabit-td.com;

    # 로그 파일
    access_log /var/log/nginx/react-app-access.log;
    error_log /var/log/nginx/react-app-error.log;

    # 리버스 프록시 설정
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;

        # WebSocket 지원
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';

        # 헤더 설정
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # 캐시 바이패스
        proxy_cache_bypass $http_upgrade;

        # 타임아웃 설정
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # 정적 파일 캐싱 (선택사항)
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://localhost:3000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Gzip 압축
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript
               application/x-javascript application/xml+rss
               application/javascript application/json;
}
EOF
```

### 2. Nginx 활성화

```bash
# 심볼릭 링크 생성
sudo ln -s /etc/nginx/sites-available/react-app /etc/nginx/sites-enabled/

# 기본 사이트 비활성화 (선택사항)
sudo rm /etc/nginx/sites-enabled/default

# Nginx 설정 테스트
sudo nginx -t

# Nginx 재시작
sudo systemctl reload nginx
sudo systemctl status nginx
```

## 🔒 SSL 인증서 설정

### 1. Let's Encrypt SSL 발급

```bash
# Certbot으로 SSL 인증서 발급 및 자동 설정
sudo certbot --nginx \
  -d megabit-td.com \
  -d www.megabit-td.com \
  --non-interactive \
  --agree-tos \
  -m support@megabit-td.com \
  --redirect
```

**설명:**
- `--nginx`: Nginx 플러그인 사용
- `-d`: 도메인 지정 (여러 개 가능)
- `--non-interactive`: 대화형 프롬프트 비활성화
- `--agree-tos`: 서비스 약관 동의
- `-m`: 이메일 주소 (갱신 알림용)
- `--redirect`: HTTP → HTTPS 자동 리다이렉트

### 2. SSL 인증서 자동 갱신

```bash
# Certbot 자동 갱신 테스트
sudo certbot renew --dry-run

# 자동 갱신은 systemd 타이머로 설정됨
sudo systemctl status certbot.timer

# 수동 갱신 (필요시)
sudo certbot renew
```

### 3. SSL 설정 확인

Certbot이 Nginx 설정을 자동으로 수정합니다:

```nginx
server {
    listen 443 ssl;
    server_name megabit-td.com www.megabit-td.com;

    ssl_certificate /etc/letsencrypt/live/megabit-td.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/megabit-td.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # ... 기존 location 설정 ...
}

server {
    listen 80;
    server_name megabit-td.com www.megabit-td.com;
    return 301 https://$host$request_uri;
}
```

## 🔄 배포 업데이트

### 수동 배포 프로세스

```bash
# 1. 애플리케이션 디렉토리로 이동
cd /var/www/react-app

# 2. 최신 코드 가져오기
git pull origin main  # 또는 master

# 3. 의존성 업데이트
npm install

# 4. 프로덕션 빌드
npm run build

# 5. PM2 재시작
pm2 restart react-app

# 6. 로그 확인
pm2 logs react-app --lines 50
```

### 자동 배포 스크립트

`deploy.sh` 파일 생성:

```bash
#!/bin/bash

# 배포 스크립트
echo "🚀 Starting deployment..."

# 변수 설정
APP_DIR="/var/www/react-app"
APP_NAME="react-app"
BRANCH="main"

# 디렉토리 이동
cd $APP_DIR || exit

# Git pull
echo "📥 Pulling latest code..."
git pull origin $BRANCH

# 의존성 설치
echo "📦 Installing dependencies..."
npm install

# 빌드
echo "🏗️  Building application..."
npm run build

# PM2 재시작
echo "🔄 Restarting PM2 process..."
pm2 restart $APP_NAME

# 로그 확인
echo "✅ Deployment complete!"
pm2 list
pm2 logs $APP_NAME --lines 20
```

실행 권한 부여:

```bash
chmod +x deploy.sh
./deploy.sh
```

## 📊 모니터링 및 관리

### PM2 관리 명령어

```bash
# 프로세스 상태 확인
pm2 list
pm2 status

# 로그 확인
pm2 logs react-app
pm2 logs react-app --lines 100

# 프로세스 재시작
pm2 restart react-app

# 프로세스 중지/시작
pm2 stop react-app
pm2 start react-app

# 프로세스 삭제
pm2 delete react-app

# 메모리/CPU 사용량 모니터링
pm2 monit
```

### Nginx 로그 확인

```bash
# 접근 로그
sudo tail -f /var/log/nginx/react-app-access.log

# 에러 로그
sudo tail -f /var/log/nginx/react-app-error.log

# 전체 Nginx 에러
sudo tail -f /var/log/nginx/error.log
```

### 시스템 리소스 모니터링

```bash
# CPU, 메모리 사용량
htop

# 디스크 사용량
df -h

# 네트워크 상태
sudo netstat -tulpn | grep LISTEN

# 프로세스 확인
ps aux | grep node
```

## 🔧 트러블슈팅

### 1. 앱이 시작되지 않음

```bash
# PM2 로그 확인
pm2 logs react-app --err

# 포트 3000이 사용 중인지 확인
sudo lsof -i :3000
sudo netstat -tulpn | grep 3000

# 프로세스 종료 후 재시작
pm2 delete react-app
pm2 start "serve -s build -l 3000" --name react-app
```

### 2. Nginx 502 Bad Gateway

```bash
# PM2 프로세스 상태 확인
pm2 list

# Nginx 에러 로그 확인
sudo tail -f /var/log/nginx/error.log

# Nginx 설정 테스트
sudo nginx -t

# PM2가 3000 포트에서 실행 중인지 확인
curl http://localhost:3000
```

### 3. SSL 인증서 문제

```bash
# 인증서 상태 확인
sudo certbot certificates

# 인증서 갱신
sudo certbot renew --force-renewal

# Nginx 재시작
sudo systemctl restart nginx
```

### 4. Git Pull 실패

```bash
# 로컬 변경사항 확인
git status

# 로컬 변경사항 제거 (주의!)
git reset --hard HEAD
git clean -fd

# 다시 pull
git pull origin main
```

### 5. 빌드 실패

```bash
# Node 버전 확인
node -v

# npm 캐시 클리어
npm cache clean --force

# node_modules 재설치
rm -rf node_modules package-lock.json
npm install
npm run build
```

## 📈 성능 최적화

### PM2 클러스터 모드 (선택사항)

```bash
# 클러스터 모드로 실행 (CPU 코어 수만큼 인스턴스 생성)
pm2 start "serve -s build -l 3000" --name react-app -i max

# 인스턴스 수 지정
pm2 start "serve -s build -l 3000" --name react-app -i 2
```

### Nginx 캐싱 설정

`/etc/nginx/sites-available/react-app`에 추가:

```nginx
# 캐시 경로 설정 (http 블록에)
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m max_size=1g
                 inactive=60m use_temp_path=off;

# server 블록 내 location에 추가
location / {
    proxy_cache my_cache;
    proxy_cache_use_stale error timeout http_500 http_502 http_503 http_504;
    proxy_cache_valid 200 60m;
    add_header X-Cache-Status $upstream_cache_status;

    # ... 기존 proxy 설정 ...
}
```

## 🔐 보안 권장사항

1. **방화벽 설정**
```bash
sudo ufw enable
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw status
```

2. **SSH 키 인증 사용**
```bash
# 비밀번호 인증 비활성화
sudo nano /etc/ssh/sshd_config
# PasswordAuthentication no
sudo systemctl restart sshd
```

3. **정기적인 업데이트**
```bash
sudo apt update && sudo apt upgrade -y
npm outdated
npm update
```

4. **환경 변수 보호**
- API 키는 환경 변수로 관리
- .env 파일은 절대 Git에 커밋하지 않음
- 프로덕션 환경에서는 시스템 환경 변수 사용

## ✅ 배포 확인

```bash
# 1. 로컬 서버 응답 확인
curl http://localhost:3000

# 2. HTTP 응답 확인
curl -I http://megabit-td.com

# 3. HTTPS 응답 확인
curl -I https://megabit-td.com

# 4. SSL 인증서 확인
curl -vI https://megabit-td.com 2>&1 | grep 'SSL certificate verify'

# 5. PM2 상태 확인
pm2 list
pm2 logs react-app --lines 20

# 6. Nginx 상태 확인
sudo systemctl status nginx
```

## 📞 지원

배포 관련 문의사항이 있으시면:
- **이메일**: support@megabit-td.com
- **문서**: [README.md](./README.md)
- **이슈 트래커**: GitHub Issues

---

**마지막 업데이트**: 2025-11-11
