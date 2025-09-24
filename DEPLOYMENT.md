# Деплой QA Sobes на голую Ubuntu (без Docker)

Ручная установка и настройка всех компонентов на чистую Ubuntu.

## 1. Подготовка голого сервера Ubuntu

```bash
# Подключаемся к серверу
ssh root@your-server-ip

# Обновляем систему
apt update && apt upgrade -y

# Устанавливаем необходимые базовые пакеты
apt install -y curl git ufw nginx software-properties-common
```

## 2. Установка Python 3.11+

```bash
# Добавляем PPA для свежих версий Python
add-apt-repository ppa:deadsnakes/ppa -y
apt update

# Устанавливаем Python 3.11 и pip
apt install -y python3.11 python3.11-venv python3.11-dev python3-pip

# Проверяем версию
python3.11 --version

# Создаем симлинк для удобства
ln -sf /usr/bin/python3.11 /usr/local/bin/python3
```

## 3. Установка Node.js 18+

```bash
# Устанавливаем Node.js через NodeSource
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Проверяем версии
node --version
npm --version
```

## 4. Настройка файрвола

```bash
# Включаем файрвол
ufw --force enable

# Разрешаем SSH, HTTP и HTTPS
ufw allow ssh
ufw allow 80
ufw allow 443

# Проверяем статус
ufw status
```

## 5. Клонирование и настройка проекта

```bash
# Клонируем проект
git clone https://github.com/Wenfort/qa_sobes.git
cd qa_sobes
```

## 6. Настройка Backend (FastAPI)

```bash
# Переходим в папку backend
cd backend

# Создаем виртуальное окружение
python3.11 -m venv venv

# Активируем виртуальное окружение
source venv/bin/activate

# Устанавливаем зависимости
pip install --upgrade pip
pip install -r requirements.txt

# Создаем systemd сервис для backend
cat > /etc/systemd/system/qa-backend.service << 'EOF'
[Unit]
Description=QA Sobes Backend
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/root/qa_sobes/backend
Environment=PATH=/root/qa_sobes/backend/venv/bin
ExecStart=/root/qa_sobes/backend/venv/bin/uvicorn main:app --host 127.0.0.1 --port 8000
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF

# Перезагружаем systemd и запускаем сервис
systemctl daemon-reload
systemctl enable qa-backend
systemctl start qa-backend

# Проверяем статус
systemctl status qa-backend

cd ..
```

## 7. Настройка Frontend (Node.js/Vite)

```bash
# Переходим в папку frontend
cd frontend

# Устанавливаем зависимости
npm install

# Собираем проект
npm run build

cd ..
```

## 8. Настройка Nginx

```bash
# Создаем конфигурацию для сайта
cat > /etc/nginx/sites-available/qa-sobes << 'EOF'
server {
    listen 80;
    server_name qa-interview.ru www.qa-interview.ru;

    # Frontend статика
    root /root/qa_sobes/frontend/dist;
    index index.html;

    # Обслуживание статических файлов
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Проксирование API запросов к backend
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Обслуживание примеров
    location /example/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Включаем сайт
ln -sf /etc/nginx/sites-available/qa-sobes /etc/nginx/sites-enabled/

# Удаляем дефолтный сайт если есть
rm -f /etc/nginx/sites-enabled/default

# Проверяем конфигурацию nginx
nginx -t

# Перезагружаем nginx
systemctl restart nginx
systemctl enable nginx
```

🎉 **Готово!** Сайт уже работает на `http://ваш-домен`

## 9. Настройка SSL (Let's Encrypt)

```bash
# Устанавливаем certbot
apt install -y certbot python3-certbot-nginx

# Получаем SSL сертификат
certbot --nginx -d qa-interview.ru -d www.qa-interview.ru

# Проверяем автообновление сертификата
certbot renew --dry-run
```

🔒 **SSL готов!** Сайт работает на `https://qa-interview.ru`

## 10. Обновление проекта

```bash
# Заходим в папку проекта
cd qa_sobes

# Забираем изменения из GitHub
git pull

# Обновляем backend
cd backend
source venv/bin/activate
pip install -r requirements.txt
systemctl restart qa-backend
cd ..

# Обновляем frontend
cd frontend
npm install
npm run build
cd ..

# Перезагружаем nginx
systemctl reload nginx
```

## 11. Полезные команды

```bash
# Проверить статус backend
systemctl status qa-backend

# Посмотреть логи backend
journalctl -u qa-backend -f

# Проверить статус nginx
systemctl status nginx

# Посмотреть логи nginx
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# Проверка работоспособности
curl -I http://localhost
curl -I http://localhost/example/1
```

## 12. Мониторинг

```bash
# Проверка использования ресурсов
htop

# Проверка портов
netstat -tlnp | grep :80
netstat -tlnp | grep :8000

# Проверка процессов
ps aux | grep uvicorn
ps aux | grep nginx
```

## Структура проекта

```
qa_sobes/
├── backend/
│   ├── venv/              # Виртуальное окружение Python
│   ├── main.py            # FastAPI приложение
│   └── requirements.txt   # Python зависимости
├── frontend/
│   ├── dist/              # Собранная статика
│   ├── node_modules/      # Node.js модули
│   └── package.json       # Node.js зависимости
└── DEPLOYMENT.md          # Эта инструкция
```

## 13. Решение проблем

### Если backend не запускается:

```bash
# Проверяем логи
journalctl -u qa-backend -n 50

# Проверяем что Python и зависимости установлены
cd /root/qa_sobes/backend
source venv/bin/activate
python3 -c "import fastapi; print('FastAPI OK')"

# Перезапускаем сервис
systemctl restart qa-backend
```

### Если frontend не собирается:

```bash
cd /root/qa_sobes/frontend

# Очищаем кеш и переустанавливаем зависимости
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Если nginx выдает ошибки:

```bash
# Проверяем конфигурацию
nginx -t

# Проверяем что файлы существуют
ls -la /root/qa_sobes/frontend/dist/
ls -la /etc/nginx/sites-enabled/

# Проверяем права доступа
chmod 755 /root/qa_sobes/frontend/dist/
```

## Итоговые адреса страниц

После деплоя сайт доступен на:
- `https://qa-interview.ru/example/1` - Ошибка 403 с подсказкой перейти на /example/2
- `https://qa-interview.ru/example/2` - Листинг пород кошек с багом в пагинации
- `https://qa-interview.ru/example/3` - Поиск товаров с множественными багами
- `https://qa-interview.ru/example/4` - Форма создания тикета

**Репозиторий:** https://github.com/Wenfort/qa_sobes

---

*Время деплоя: ~20-30 минут ручной настройки*