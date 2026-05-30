from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.routers import auth, users, categories, locations, ads, favorites, messages, reports, admin

app = FastAPI(
    title="Bazar Clone API",
    description="Backend API за marketplace платформа, подобна на Bazar.bg",
    version="1.0.0"
)

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

app.mount("/static", StaticFiles(directory="app/static"), name="static")

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(categories.router)
app.include_router(locations.router)
app.include_router(ads.router)
app.include_router(favorites.router)
app.include_router(messages.router)
app.include_router(reports.router)
app.include_router(admin.router)


@app.get("/")
def root():
    return {
        "message": "Bazar Clone API работи успешно."
    }


@app.get("/health")
def health_check():
    return {
        "status": "ok"
    }
