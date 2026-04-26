# 🧠 Contexto do Projeto — FastAPI Backend

## 👤 Sobre o Desenvolvedor
- Nível: Desenvolvedor em evolução — gerencia projetos reais em produção com FastAPI
- Objetivo duplo: **Entregar código funcional** e **aprender arquitetura e engenharia de software** ao mesmo tempo
- Precisa de explicações do "porquê" de cada decisão técnica, não apenas do "como"

---

## 🛠️ Stack Principal

| Camada | Tecnologia |
|---|---|
| Linguagem | Python 3.12+ |
| Framework Web | FastAPI |
| Validação | Pydantic v2 |
| ORM | SQLAlchemy 2.x (async) |
| Migrations | Alembic |
| Autenticação | JWT com Bearer Token |
| Servidor | Uvicorn / Gunicorn |
| Gerenciador de pacotes | uv |
| Testes | pytest + httpx |
| Containerização | Docker / Docker Compose |

---

## 📁 Estrutura de Pastas Padrão

```
app/
├── main.py              # Entry point — instância do FastAPI, middlewares, lifespan
├── core/
│   ├── config.py        # Settings com Pydantic BaseSettings
│   ├── security.py      # Funções JWT, hashing de senhas
│   └── database.py      # Engine async, SessionDep
├── routers/
│   └── {recurso}.py     # Um arquivo por domínio (users, products, auth...)
├── models/
│   └── {recurso}.py     # Modelos SQLAlchemy (tabelas do banco)
├── schemas/
│   └── {recurso}.py     # Schemas Pydantic (request/response)
├── services/
│   └── {recurso}.py     # Regras de negócio — separadas dos routers
├── repositories/
│   └── {recurso}.py     # Queries ao banco — separadas dos services
└── dependencies/
    └── auth.py          # Dependências de autenticação reutilizáveis
```

---

## 📐 Princípios de Arquitetura Adotados

### 1. Separação de Responsabilidades (SoC)
- **Router**: recebe a requisição, valida com Pydantic, chama o Service
- **Service**: contém a lógica de negócio, chama o Repository
- **Repository**: única camada que faz queries ao banco
- **Nunca** colocar queries SQL diretamente no router

### 2. Dependency Injection nativa do FastAPI
- Usar `Depends()` para injetar SessionDB, usuário autenticado, permissões
- Preferir `Annotated[T, Depends(...)]` ao invés de parâmetros soltos

### 3. Tipagem Forte
- **Sempre** usar type hints em funções, parâmetros e retornos
- Pydantic v2 para todos os schemas de entrada e saída
- `Optional[T]` apenas quando o campo realmente pode ser None

### 4. Async First
- Todas as rotas e funções que acessam banco devem ser `async def`
- Usar `await` corretamente — nunca misturar código sync bloqueante em contexto async

### 5. Configuração via Ambiente
- Todas as configurações sensíveis via `.env` + Pydantic `BaseSettings`
- Nunca hardcodar senhas, secrets ou URLs no código

---

## ✅ Padrões de Código

```python
# ✅ Exemplo de Router correto
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.user import UserCreate, UserResponse
from app.services.user import UserService
from app.core.database import SessionDep

router = APIRouter(prefix="/users", tags=["Users"])

@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    user_data: UserCreate,
    session: SessionDep,
    service: Annotated[UserService, Depends()]
) -> UserResponse:
    return await service.create(session, user_data)
```

---

## 🚫 Anti-Padrões — Nunca Fazer

- ❌ Queries SQL dentro dos routers
- ❌ Lógica de negócio dentro dos schemas Pydantic
- ❌ `session = SessionLocal()` global — sempre via Dependency Injection
- ❌ `async def` sem `await` interno (use `def` comum nesses casos)
- ❌ Retornar modelos SQLAlchemy diretamente — sempre serializar com schema Pydantic
- ❌ Variáveis de ambiente hardcodadas no código
- ❌ Routers gigantes com centenas de linhas — dividir por domínio

---

## 🎓 Modo de Aprendizado

Quando sugerir qualquer implementação, seguir este padrão didático:

1. **Conceito** 🎓 — explique o padrão arquitetural antes do código
2. **Implementação** ✅ — código limpo, tipado, com comentários apenas onde necessário
3. **Por quê isso importa** ⚠️ — consequências de não seguir o padrão
4. **Trade-offs** 🔄 — quando essa abordagem faz sentido e quando não faz

---

## 🔍 Contexto de Testes

```bash
# Rodar testes
pytest

# Rodar com cobertura
pytest --cov=app --cov-report=term-missing

# Testar endpoints manualmente
# Swagger disponível em: http://localhost:8000/docs
```

---

## 📦 Comandos Frequentes

```bash
# Instalar dependências
uv pip install -r requirements.txt

# Rodar o servidor em desenvolvimento
uvicorn app.main:app --reload --port 8000

# Criar nova migration
alembic revision --autogenerate -m "descricao da migration"

# Aplicar migrations
alembic upgrade head
```

---

## 💬 Como me ajudar

- Antes de propor mudanças, leia os arquivos relevantes do projeto
- Respeite a estrutura de pastas e padrões já estabelecidos
- Mostre o Diff antes de aplicar qualquer alteração
- Quando refatorar, explique o ganho arquitetural da mudança
- Se eu fizer algo errado, corrija com explicação didática — "esse erro acontece porque..."
