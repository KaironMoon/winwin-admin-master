#!/bin/bash

# WinWin Web 자동 배포 스크립트
# 사용법: ./deploy.sh

set -e  # 에러 발생 시 스크립트 중단

echo "🚀 WinWin Web 배포 시작..."

# 서버 정보
SERVER_HOST="54.255.176.21"
SERVER_USER="ubuntu"
SSH_KEY="/Users/cyhcnk/.ssh/winwin.pem"
PROJECT_DIR="/home/ubuntu/winwin-admin"
SOURCE_DIR="/home/ubuntu/winwin-admin-source"
GITHUB_REPO="https://github.com/soonseek/winwin-admin.git"

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 로그 함수
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# SSH 키 확인
if [ ! -f "$SSH_KEY" ]; then
    log_error "SSH 키 파일을 찾을 수 없습니다: $SSH_KEY"
    log_info "SSH 키 파일의 정확한 경로를 확인해주세요."
    log_info "예시: ~/.ssh/winwin.pem 또는 /path/to/your/key.pem"
    echo ""
    read -p "SSH 키 파일의 정확한 경로를 입력하세요: " SSH_KEY_PATH
    if [ -n "$SSH_KEY_PATH" ]; then
        SSH_KEY="$SSH_KEY_PATH"
    else
        log_error "SSH 키 경로가 제공되지 않았습니다. 배포를 중단합니다."
        exit 1
    fi
fi

# SSH 키 권한 확인
if [ -f "$SSH_KEY" ]; then
    SSH_KEY_PERMS=$(stat -c "%a" "$SSH_KEY" 2>/dev/null || stat -f "%Lp" "$SSH_KEY" 2>/dev/null)
    if [ "$SSH_KEY_PERMS" != "600" ]; then
        log_warning "SSH 키 파일 권한을 600으로 변경합니다..."
        chmod 600 "$SSH_KEY"
    fi
fi

# SSH 연결 테스트
log_info "서버 연결 테스트 중..."
if ! ssh -i "$SSH_KEY" -o ConnectTimeout=10 -o BatchMode=yes $SERVER_USER@$SERVER_HOST "echo 'SSH 연결 성공'" 2>/dev/null; then
    log_error "서버에 연결할 수 없습니다. 다음을 확인해주세요:"
    log_error "1. SSH 키 파일 경로: $SSH_KEY"
    log_error "2. 서버 호스트: $SERVER_HOST"
    log_error "3. 사용자명: $SERVER_USER"
    log_error "4. 서버가 실행 중인지 확인"
    echo ""
    log_info "수동으로 서버에 연결하여 다음 명령어를 실행하세요:"
    echo "ssh -i $SSH_KEY $SERVER_USER@$SERVER_HOST"
    exit 1
fi

log_success "서버 연결 성공"

# 서버에서 실행할 명령어들
log_info "서버에서 배포 작업 시작..."

ssh -i "$SSH_KEY" $SERVER_USER@$SERVER_HOST << 'EOF'
set -e

# .netrc 파일 자동 생성 (깃허브 PAT)
echo "machine github.com
login soonseek
password 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" > ~/.netrc
chmod 600 ~/.netrc

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 시스템 업데이트
log_info "시스템 패키지 업데이트 중..."
sudo apt update -y

# Node.js 설치 (없는 경우)
if ! command -v node &> /dev/null; then
    log_info "Node.js 설치 중..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
    log_success "Node.js 설치 완료"
else
    log_info "Node.js가 이미 설치되어 있습니다."
fi

# nginx 설치 (없는 경우)
if ! command -v nginx &> /dev/null; then
    log_info "Nginx 설치 중..."
    sudo apt install -y nginx
    sudo systemctl enable nginx
    sudo systemctl start nginx
    log_success "Nginx 설치 완료"
else
    log_info "Nginx가 이미 설치되어 있습니다."
fi

# 프로젝트 디렉토리 생성
log_info "프로젝트 디렉토리 설정 중..."
mkdir -p /home/ubuntu/winwin-admin-source
mkdir -p /home/ubuntu/winwin-admin



# 프로젝트 클론 또는 업데이트
cd /home/ubuntu/winwin-admin-source
if [ -d ".git" ]; then
    log_info "기존 프로젝트 업데이트 중..."
    git fetch origin
    # 기본 브랜치 자동 감지
    DEFAULT_BRANCH=$(git remote show origin | grep 'HEAD branch' | cut -d' ' -f5)
    if [ -z "$DEFAULT_BRANCH" ]; then
        DEFAULT_BRANCH="master"
    fi
    log_info "기본 브랜치: $DEFAULT_BRANCH"
    git reset --hard origin/$DEFAULT_BRANCH
else
    log_info "프로젝트 클론 중..."
    git clone https://github.com/soonseek/winwin-admin.git .
fi

# 의존성 설치
log_info "Node.js 의존성 설치 중..."
npm install

# 프로덕션 환경변수 설정
log_info "프로덕션 환경변수 설정 중..."
cat > .env << 'ENV_CONFIG'
# API Configuration
REACT_APP_API_BASE_URL=https://api.winwin-td.com

# Development Environment
NODE_ENV=production
ENV_CONFIG

# 프로덕션 빌드
log_info "프로덕션 빌드 중..."
npm run build

# 기존 배포 파일 삭제 및 새 빌드 파일 복사
log_info "배포 파일 복사 중..."
sudo rm -rf /home/ubuntu/winwin-admin/*
sudo cp -r build/* /home/ubuntu/winwin-admin/

# 권한 설정
log_info "권한 설정 중..."
sudo chown -R www-data:www-data /home/ubuntu/winwin-admin
sudo chmod -R 755 /home/ubuntu/winwin-admin

# Nginx 설정
log_info "Nginx 설정 중..."
sudo tee /etc/nginx/sites-available/winwin-admin << 'NGINX_CONFIG'
server {
    listen 80;
    server_name winwin-td.com www.winwin-td.com;
    
    root /home/ubuntu/winwin-admin;
    index index.html;
    
    # Gzip 압축
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript;
    
    # 보안 헤더
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # React Router를 위한 설정
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # 정적 파일 캐싱
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # API 프록시 (필요한 경우)
    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
NGINX_CONFIG

# Nginx 사이트 활성화
sudo ln -sf /etc/nginx/sites-available/winwin-admin /etc/nginx/sites-enabled/

# 기본 사이트 비활성화
sudo rm -f /etc/nginx/sites-enabled/default

# Nginx 설정 테스트
log_info "Nginx 설정 테스트 중..."
sudo nginx -t

# Nginx 재시작
log_info "Nginx 재시작 중..."
sudo systemctl reload nginx

# SSL 인증서 설치 (Let's Encrypt)
log_info "SSL 인증서 설치 중..."
if ! command -v certbot &> /dev/null; then
    sudo apt install -y certbot python3-certbot-nginx
fi

# SSL 인증서 발급
sudo certbot --nginx -d winwin-td.com -d www.winwin-td.com --non-interactive --agree-tos --email admin@winwin-td.com

# 방화벽 설정
log_info "방화벽 설정 중..."
sudo ufw allow 'Nginx Full'
sudo ufw allow ssh
sudo ufw --force enable

log_success "배포 완료!"
log_info "사이트 URL: https://winwin-td.com"

EOF

log_success "배포 스크립트 실행 완료!"
echo ""
echo "🎉 WinWin Web이 성공적으로 배포되었습니다!"
echo "📱 접속 URL: https://winwin-td.com"
echo ""
echo "📋 다음 단계:"
echo "1. 브라우저에서 https://winwin-td.com 접속"
echo "2. 모든 기능이 정상 작동하는지 확인"
echo "3. OKX 연동 기능 테스트"
echo ""
echo "🔧 문제가 발생하면 다음을 확인하세요:"
echo "- 서버 로그: sudo journalctl -u nginx"
echo "- SSL 인증서: sudo certbot certificates"
echo "- 방화벽 상태: sudo ufw status"
echo "- 빌드 로그: tail -f /home/ubuntu/winwin-admin-source/npm-debug.log" 