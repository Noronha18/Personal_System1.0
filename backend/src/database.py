from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase
from src.config import settings


# Configuração do engine
# echo=False em produção para evitar vazar dados sensíveis (PII) nos logs do Render
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,
    connect_args={"ssl": "prefer"} 
)

SessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)

class Base(DeclarativeBase):
    pass


async def get_db():
    async with SessionLocal() as db:
        try:
            yield db
        finally:
            await db.close()