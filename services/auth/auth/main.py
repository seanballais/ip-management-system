from fastapi import FastAPI

from .config import settings

app = FastAPI()


@app.get('/')
async def index():
    print(settings)
    return { 'Hello': 'World' }
