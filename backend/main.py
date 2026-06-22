from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import chat, lifestyle, travel

app = FastAPI(title="Zyva API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat.router)
app.include_router(travel.router)
app.include_router(lifestyle.router)


@app.get("/health")
def health():
    return {"status": "ok"}
