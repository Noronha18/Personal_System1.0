import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from src import exceptions
from src.routes import alunos, planos, pagamentos, sessoes, auth
from src.config import settings # Importa as configurações

# Configuração básica de logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

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

@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    # Padroniza erros do próprio FastAPI (como 404 ou 405)
    return JSONResponse(
        status_code=exc.status_code,
        content={"message": exc.detail, "type": "HTTPError"}
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

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    # Registra o erro detalhado no servidor para o desenvolvedor
    logger.error(f"Erro inesperado: {str(exc)}", exc_info=True)
    
    return JSONResponse(
        status_code=500,
        content={"message": "Ocorreu um erro interno inesperado no servidor.", "type": "InternalError"}
    )

# --- ROTAS DE SAÚDE ---

@app.get("/")
def read_root():
    return{"status": "online", "version": settings.VERSION}

# --- ROTAS DE ALUNOS ---

app.include_router(auth.router)
app.include_router(alunos.router) 
app.include_router(planos.router)
app.include_router(pagamentos.router)
app.include_router(sessoes.router)
