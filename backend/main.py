from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="QA Interview Platform", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/example/1")
async def example_1():
    raise HTTPException(status_code=403, detail="Для корректного отображения листинга, необходимо перейти на example/2")

@app.get("/example/2")
async def example_2(page: int = 1, limit: int = 3):
    cat_breeds = [
        {"id": 1, "name": "Британская короткошёрстная", "origin": "Великобритания"},
        {"id": 2, "name": "Мейн-кун", "origin": "США"},
        {"id": 3, "name": "Персидская", "origin": "Иран"},
        {"id": 4, "name": "Сиамская", "origin": "Таиланд"},
        {"id": 5, "name": "Русская голубая", "origin": "Россия"},
        {"id": 6, "name": "Шотландская вислоухая", "origin": "Шотландия"},
        {"id": 7, "name": "Рэгдолл", "origin": "США"},
        {"id": 8, "name": "Абиссинская", "origin": "Эфиопия"}
    ]

    total = len(cat_breeds)
    start = (page - 1) * limit
    end = start + limit

    # БАГ: неправильная логика пагинации - используется page вместо start
    paginated_breeds = cat_breeds[page:end]

    return {
        "data": paginated_breeds,
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": (total + limit - 1) // limit
    }

@app.get("/example/3")
async def example_3(search: str = ""):
    products = [
        {"id": 1, "name": "MacBook Pro", "price": 2500, "category": "Laptop"},
        {"id": 2, "name": "iPhone 15", "price": 999, "category": "Phone"},
        {"id": 3, "name": "iPad Air", "price": 599, "category": "Tablet"},
        {"id": 4, "name": "AirPods Pro", "price": 249, "category": "Audio"},
        {"id": 5, "name": "Apple Watch", "price": 399, "category": "Wearable"},
        {"id": 6, "name": "iMac", "price": 1299, "category": "Desktop"},
        {"id": 7, "name": "Mac mini", "price": 599, "category": "Desktop"},
        {"id": 8, "name": "MacBook Air", "price": 1099, "category": "Laptop"}
    ]

    if search:
        # БАГ 1: поиск работает только для точного совпадения
        # БАГ 2: поиск по пустым пробелам возвращает пустой результат
        # БАГ 3: поиск не trim'ает пробелы в начале/конце
        # БАГ 4: специальные символы ломают поиск
        search_trimmed = search.strip()

        if search_trimmed == "":
            # БАГ: пустой поиск после trim должен показывать все товары, но показывает 0
            filtered_products = []
        elif search_trimmed == "   ":
            # БАГ: только пробелы тоже ломают поиск
            filtered_products = []
        elif "&" in search or "<" in search or ">" in search:
            # БАГ: специальные HTML символы ломают поиск полностью
            raise HTTPException(status_code=500, detail="Search contains invalid characters")
        else:
            filtered_products = [p for p in products if p["name"] == search]
    else:
        filtered_products = products

    return {
        "products": filtered_products,
        "search_query": search,
        "total_found": len(filtered_products)
    }

@app.post("/example/4")
async def create_ticket(title: str, description: str):
    if not title or not description:
        raise HTTPException(status_code=400, detail="Title and description are required")

    ticket_id = f"TICKET-{len(title) + len(description)}"

    return {
        "id": ticket_id,
        "title": title,
        "description": description,
        "status": "created",
        "message": "Тикет успешно создан"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)