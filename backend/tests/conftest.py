import pytest
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.pool import StaticPool

from src.api import app
from src.database import Base, get_db
from src import models  # noqa: F401 — registra os models no metadata

# Banco de teste isolado: SQLite em memória compartilhado entre conexões
engine_teste = create_async_engine(
    "sqlite+aiosqlite://",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

SessionTeste = async_sessionmaker(bind=engine_teste, class_=AsyncSession, expire_on_commit=False)


async def _get_db_teste():
    async with SessionTeste() as session:
        yield session


app.dependency_overrides[get_db] = _get_db_teste


@pytest.fixture(autouse=True)
async def _banco_limpo():
    """Cria o schema antes de cada teste e derruba depois — testes independentes."""
    async with engine_teste.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with engine_teste.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
