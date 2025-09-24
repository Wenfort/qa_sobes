# Инструкция по развертыванию QA Sobes на Ubuntu с доменом qa-interview.ru

## 1. Подготовка сервера

```bash
# Обновляем систему
sudo apt update && sudo apt upgrade -y

# Устанавливаем необходимые пакеты
sudo apt install -y curl git nginx certbot python3-certbot-nginx

# Устанавливаем Node.js (версия 18)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Устанавливаем Python и pip
sudo apt install -y python3 python3-pip python3-venv

# Проверяем версии
node --version
npm --version
python3 --version
```

## 2. Клонируем и настраиваем проект

```bash
# Переходим в директорию веб-сервера
cd /var/www

# Клонируем проект
sudo git clone https://github.com/Wenfort/qa_sobes.git
sudo chown -R $USER:$USER qa_sobes
cd qa_sobes
```

## 3. Настраиваем Backend (FastAPI)

```bash
# Переходим в папку backend
cd backend

# Создаем виртуальное окружение
python3 -m venv venv
source venv/bin/activate

# Устанавливаем зависимости
pip install fastapi uvicorn python-multipart

# Создаем systemd сервис для backend
sudo tee /etc/systemd/system/qa-backend.service > /dev/null << EOF
[Unit]
Description=QA Sobes Backend
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=/var/www/qa_sobes/backend
Environment=PATH=/var/www/qa_sobes/backend/venv/bin
ExecStart=/var/www/qa_sobes/backend/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target
EOF

# Запускаем и включаем сервис
sudo systemctl daemon-reload
sudo systemctl enable qa-backend
sudo systemctl start qa-backend

# Проверяем статус
sudo systemctl status qa-backend
```

## 4. Настраиваем Frontend (React)

```bash
# Переходим в папку frontend
cd /var/www/qa_sobes/frontend

# Устанавливаем зависимости
npm install

# Собираем продакшн версию
npm run build

# Проверяем, что папка build создалась
ls -la build/
```

## 5. Настраиваем Nginx

```bash
# Создаем конфигурацию для сайта
sudo tee /etc/nginx/sites-available/qa-interview.ru > /dev/null << 'EOF'
server {
    listen 80;
    server_name qa-interview.ru www.qa-interview.ru;

    # Frontend (React)
    root /var/www/qa_sobes/frontend/build;
    index index.html;

    # Обслуживание статических файлов React
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Проксирование API запросов на backend
    location /api/ {
        proxy_pass http://127.0.0.1:8000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Проксирование example routes на backend
    location /example/ {
        proxy_pass http://127.0.0.1:8000/example/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Включаем сайт
sudo ln -s /etc/nginx/sites-available/qa-interview.ru /etc/nginx/sites-enabled/

# Удаляем дефолтный сайт
sudo rm -f /etc/nginx/sites-enabled/default

# Проверяем конфигурацию nginx
sudo nginx -t

# Перезапускаем nginx
sudo systemctl restart nginx
```

## 6. Настраиваем SSL с Let's Encrypt

```bash
# Получаем SSL сертификат
sudo certbot --nginx -d qa-interview.ru -d www.qa-interview.ru

# Проверяем автообновление сертификата
sudo certbot renew --dry-run
```

## 7. Настраиваем файрвол (опционально)

```bash
# Включаем UFW
sudo ufw enable

# Разрешаем SSH, HTTP и HTTPS
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'

# Проверяем статус
sudo ufw status
```

## 8. Обновляем Frontend для продакшена

Отредактируйте файл `/var/www/qa_sobes/frontend/src/App.js`:

```javascript
// Измените эту строку
const API_BASE = process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:8000';

// На эту (для работы с example routes)
const API_BASE = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:8000';
```

Пересоберите frontend:
```bash
cd /var/www/qa_sobes/frontend
npm run build
```

## 9. Проверка работы

```bash
# Проверяем статус сервисов
sudo systemctl status qa-backend
sudo systemctl status nginx

# Проверяем логи backend
sudo journalctl -u qa-backend -f

# Проверяем логи nginx
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

## 10. Полезные команды для управления

```bash
# Перезапуск backend
sudo systemctl restart qa-backend

# Обновление кода
cd /var/www/qa_sobes
sudo git pull
cd frontend && npm run build
sudo systemctl restart qa-backend

# Просмотр логов
sudo journalctl -u qa-backend -n 50
```

## Структура проекта на сервере:

```
/var/www/qa_sobes/
├── backend/
│   ├── venv/
│   ├── main.py
│   └── ...
└── frontend/
    ├── build/          # Собранные файлы React
    ├── src/
    └── ...
```

## Итоговые адреса страниц:

После выполнения всех шагов сайт будет доступен по адресу `https://qa-interview.ru` с рабочими страницами:
- `https://qa-interview.ru/example/1` - Страница с ошибкой 403 и подсказкой
- `https://qa-interview.ru/example/2` - Листинг пород кошек с багом в пагинации
- `https://qa-interview.ru/example/3` - Поиск товаров с багами в поиске
- `https://qa-interview.ru/example/4` - Форма создания тикета

## Репозиторий проекта:
https://github.com/Wenfort/qa_sobes