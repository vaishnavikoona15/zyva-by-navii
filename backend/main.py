import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import buying, chat, lifestyle, memory, travel

app = FastAPI(title="Zyva API")

# FRONTEND_URL lets the deployed Vercel URL be set per-environment (e.g. on Render)
# without a code change, since it isn't known until the frontend is actually deployed.
allow_origins = ["http://localhost:3000"]
frontend_url = os.getenv("FRONTEND_URL")
if frontend_url:
    allow_origins.append(frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat.router)
app.include_router(travel.router)
app.include_router(lifestyle.router)
app.include_router(buying.router)
app.include_router(memory.router)


@app.get("/health")
def health():
    return {"status": "ok"}
