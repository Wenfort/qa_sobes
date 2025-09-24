# Деплой QA Sobes на голую Ubuntu с Docker

Простая установка на чистую Ubuntu с помощью Docker - никаких мучений с настройкой сервисов!

## 1. Подготовка голого сервера Ubuntu

```bash
# Подключаемся к серверу
ssh root@your-server-ip

# Обновляем систему
apt update && apt upgrade -y

# Устанавливаем необходимые базовые пакеты
apt install -y curl git ufw
```

## 2. Установка Docker

```bash
# Устанавливаем Docker одной командой
curl -fsSL https://get.docker.com | sh

# Добавляем пользователя в группу docker (если не root)
usermod -aG docker $USER

# Устанавливаем Docker Compose
apt install -y docker-compose-plugin

# Запускаем Docker daemon и включаем автозапуск
systemctl start docker
systemctl enable docker

# Проверяем что Docker daemon работает
systemctl status docker

# Проверяем установку
docker --version
docker compose version
```

## 3. Настройка файрвола

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

## 4. Клонирование и запуск проекта

```bash
# Клонируем проект
git clone https://github.com/Wenfort/qa_sobes.git
cd qa_sobes

# ВАЖНО: Проверяем что Docker daemon запущен
docker info

# Если Docker daemon не запущен, запускаем его:
# sudo systemctl start docker

# Запускаем проект (без SSL)
docker compose up -d --build

# Проверяем что контейнеры запустились
docker compose ps
```

🎉 **Готово!** Сайт уже работает на `http://ваш-домен`

## 5. Настройка SSL (Let's Encrypt)

```bash
# Устанавливаем certbot
apt install -y certbot

# Останавливаем контейнеры для получения сертификата
docker compose down

# Получаем SSL сертификат
certbot certonly --standalone -d qa-interview.ru -d www.qa-interview.ru

# Запускаем продакшн версию с SSL
docker compose -f docker-compose.prod.yml up -d --build
```

🔒 **SSL готов!** Сайт работает на `https://qa-interview.ru`

## 6. Обновление проекта

```bash
# Заходим в папку проекта
cd qa_sobes

# Забираем изменения из GitHub
git pull

# Перезапускаем с обновлением
docker compose down
docker compose up -d --build
```

## 7. Решение проблем с Docker

### Если Docker daemon не запускается:

```bash
# Проверяем логи Docker для диагностики
journalctl -u docker.service -n 50

# Если ошибка "iptables" или "kernel needs to be upgraded":
# Устанавливаем/обновляем iptables
apt update
apt install -y iptables

# Загружаем модули ядра для iptables
modprobe ip_tables
modprobe iptable_nat
modprobe iptable_filter

# Проверяем что containerd запущен
systemctl status containerd
systemctl start containerd

# Очищаем временные файлы Docker
rm -rf /var/lib/docker/tmp/*

# Перезапускаем Docker после исправления
systemctl restart docker
systemctl status docker
```

### Если проблемы с правами:

```bash
# Исправляем права на Docker socket
chmod 666 /var/run/docker.sock

# Или добавляем пользователя в группу docker
usermod -aG docker $USER
newgrp docker
```

## 8. Полезные команды

```bash
# Проверить статус Docker daemon
systemctl status docker

# Запустить Docker daemon если не запущен
sudo systemctl start docker

# Посмотреть логи всех сервисов
docker compose logs -f

# Посмотреть логи только backend
docker compose logs -f qa-backend

# Посмотреть статус контейнеров
docker compose ps

# Остановить все контейнеры
docker compose down

# Перезапустить
docker compose restart

# Полная очистка (осторожно!)
docker system prune -a
```

## 9. Мониторинг

```bash
# Просмотр использования ресурсов
docker stats

# Логи nginx
docker compose exec qa-frontend tail -f /var/log/nginx/access.log

# Проверка работоспособности
curl -I http://localhost
curl -I http://localhost/example/1
```

## Структура проекта

```
qa_sobes/
├── docker-compose.yml          # Основная конфигурация
├── docker-compose.prod.yml     # Продакшн с SSL
├── Dockerfile.backend          # Backend контейнер
├── Dockerfile.frontend         # Frontend контейнер
├── nginx.conf                  # Nginx конфигурация
├── nginx-ssl.conf             # Nginx с SSL
└── backend/frontend/          # Исходный код
```

## Итоговые адреса страниц

После деплоя сайт доступен на:
- `https://qa-interview.ru/example/1` - Ошибка 403 с подсказкой перейти на /example/2
- `https://qa-interview.ru/example/2` - Листинг пород кошек с багом в пагинации
- `https://qa-interview.ru/example/3` - Поиск товаров с множественными багами
- `https://qa-interview.ru/example/4` - Форма создания тикета

## Почему Docker лучше?

✅ **Быстро**: `git clone && docker compose up` - готово!
✅ **Надёжно**: всё изолировано в контейнерах
✅ **Просто**: не нужно настраивать Python, Node.js, nginx отдельно
✅ **Переносимо**: работает одинаково на любом сервере
✅ **Обновляемо**: `git pull && docker compose up --build`

**Репозиторий:** https://github.com/Wenfort/qa_sobes

---

*Время деплоя с нуля: ~5-10 минут вместо часа ручной настройки!*