# [1] 기본 패키지 설치
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl nginx certbot python3-certbot-nginx build-essential

# [2] NVM 설치 및 Node.js 20 설치
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
export NVM_DIR="$HOME/.nvm"
source "$NVM_DIR/nvm.sh"
nvm install 20
nvm alias default 20
node -v && npm -v

# [3] PM2 설치
npm install -g pm2

# [4] 앱 디렉토리 설정 및 GitHub 인증
sudo mkdir -p /var/www/react-app
sudo chown ubuntu:ubuntu /var/www/react-app
cd /var/www/react-app

cat <<EOF > ~/.netrc
machine github.com
login <GitHub_이메일>
password <GitHub_PAT>
EOF
chmod 600 ~/.netrc

# [5] 앱 클론 및 빌드
git clone https://github.com/soonseek/app.git .
npm install
npm run build

# [6] PM2로 정적 파일 서빙
npm install -g serve
pm2 start "serve -s build -l 3000" --name react-app
pm2 startup systemd -u ubuntu --hp /home/ubuntu
pm2 save

# [7] Nginx 리버스 프록시 설정
sudo tee /etc/nginx/sites-available/react-app > /dev/null <<EOF
server {
    listen 80;
    server_name megabit-td.com www.megabit-td.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

sudo ln -s /etc/nginx/sites-available/react-app /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# [8] SSL 발급 및 리디렉션 설정
sudo certbot --nginx -d megabit-td.com -d www.megabit-td.com \
  --non-interactive --agree-tos -m your-email@example.com --redirect

# [9] 배포 후 코드 업데이트 절차
cd /var/www/react-app
git pull origin master
npm install
npm run build
pm2 restart react-app

# [10] 확인
pm2 list
curl -I https://megabit-td.com
curl -I https://www.megabit-td.com
