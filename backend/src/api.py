from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

from src import exceptions
from src.routes import alunos, planos, pagamentos, sessoes
from src.config import settings # Importa as configurações

@asynccontextmanager
async def lifespan(app: FastAPI):
    # A criação de tabelas agora é gerida via Alembic Migrations.
    # O lifespan agora apenas sinaliza a prontidão do sistema.
    print(f"Sistema {settings.PROJECT_NAME} (v{settings.VERSION}) pronto!")
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="API profissional para Personal Trainers",
    version=settings.VERSION
)

# --- MIDDLEWARES ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,  # Em produção, restrinja para o seu domínio de frontend
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
    return{"status": "online", "version": settings.VERSION}

# --- ROTAS DE ALUNOS ---

app.include_router(alunos.router) 
app.include_router(planos.router)
app.include_router(pagamentos.router)
app.include_router(sessoes.router)
