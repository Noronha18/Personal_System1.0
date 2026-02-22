from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from sqlalchemy.orm import Session
from typing import List


from src.database import get_db, engine, Base
from src import controllers, schemas, exceptions, models
from src.routes import alunos, planos, pagamentos, sessoes



@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield



app = FastAPI(
    title="Personal System API",
    description="API profissional para Personal Trainers",
    version="1.1.0"
)

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
# --- MIDDLEWARES ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Em produção, restrinja para o seu domínio de frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- EXCEPTION HANDLERS ---
@app.exception_handler(exceptions.ResourceNotFoundError)
async def resource_not_found_handler(request: Request, exc: exceptions.ResourceNotFoundError):
    return JSONResponse(
        status_code=404,
        content={"message": str(exc), "type": "ResourceNotFound"}
    )

@app.exception_handler(exceptions.BusinessRuleError)
async def business_rule_handler(request: Request, exc: exceptions.BusinessRuleError):
    return JSONResponse(
        status_code=409,
        content={"message": str(exc), "type": "BusinessRuleViolation"}
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = exc.errors()
    first_error = errors[0]
    msg = first_error.get('msg', "Erro de validacao.")
    clean_msg = msg.replace("Value error, ", "")
    return JSONResponse(
        status_code=422,
        content={"message": clean_msg, "type": "ValidationError", "field": first_error.get("loc")[-1]}
    )
# --- ROTAS DE SAÚDE ---

@app.get("/")
def read_root():
    return{"status": "online", "version": "1.1.0"}

# --- ROTAS DE ALUNOS ---

app.include_router(alunos.router) 
app.include_router(planos.router)
app.include_router(pagamentos.router)
app.include_router(sessoes.router)

