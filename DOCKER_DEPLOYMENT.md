# Простой деплой с Docker для qa-interview.ru

## Локальная разработка

```bash
# Клонируем проект
git clone https://github.com/Wenfort/qa_sobes.git
cd qa_sobes

# Запускаем локально
docker-compose up --build

# Сайт доступен на http://localhost
```

## Деплой на сервер (Ubuntu)

### 1. Установка Docker на сервер

```bash
# Обновляем систему
sudo apt update

# Устанавливаем Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Добавляем пользователя в группу docker
sudo usermod -aG docker $USER
newgrp docker

# Устанавливаем Docker Compose
sudo apt install docker-compose-plugin
```

### 2. Простой деплой без SSL

```bash
# Клонируем на сервер
git clone https://github.com/Wenfort/qa_sobes.git
cd qa_sobes

# Запускаем
docker compose up -d --build

# Сайт сразу доступен на http://ваш-домен
```

### 3. Деплой с SSL (рекомендуемый)

```bash
# Устанавливаем certbot
sudo apt install certbot

# Останавливаем контейнеры если они запущены
docker compose down

# Получаем SSL сертификат
sudo certbot certonly --standalone -d qa-interview.ru -d www.qa-interview.ru

# Запускаем продакшн версию с SSL
docker compose -f docker-compose.prod.yml up -d --build
```

### 4. Обновление проекта

```bash
# Забираем изменения
git pull

# Перезапускаем с обновлением
docker compose down
docker compose up -d --build
```

### 5. Полезные команды

```bash
# Посмотреть логи
docker compose logs -f

# Посмотреть статус контейнеров
docker compose ps

# Остановить
docker compose down

# Очистить всё (осторожно!)
docker system prune -a
```

## Структура проекта

```
qa_sobes/
├── docker-compose.yml          # Локальная разработка
├── docker-compose.prod.yml     # Продакшн с SSL
├── Dockerfile.backend          # Backend (FastAPI)
├── Dockerfile.frontend         # Frontend (React + Nginx)
├── nginx.conf                  # Nginx для разработки
├── nginx-ssl.conf             # Nginx с SSL
├── backend/
│   ├── main.py
│   └── requirements.txt
└── frontend/
    ├── src/
    ├── package.json
    └── ...
```

## Итоговые адреса

После деплоя сайт доступен на:
- `https://qa-interview.ru/example/1` - Ошибка 403 с подсказкой
- `https://qa-interview.ru/example/2` - Листинг кошек с багом пагинации
- `https://qa-interview.ru/example/3` - Поиск товаров с багами
- `https://qa-interview.ru/example/4` - Форма создания тикета

## Преимущества Docker деплоя

✅ **Один файл** - вся конфигурация в docker-compose.yml
✅ **Изоляция** - все зависимости в контейнерах
✅ **Переносимость** - работает одинаково везде
✅ **Простота** - `docker compose up` и всё работает
✅ **Обновления** - `git pull && docker compose up --build`

Репозиторий: https://github.com/Wenfort/qa_sobes