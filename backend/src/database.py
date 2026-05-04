from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase
from src.config import settings


# Configuração do engine com suporte a SSL (necessário para bancos externos como Supabase/Neon)
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=True,
    connect_args={"ssl": "prefer"}  # Tenta usar SSL se disponível (padrão em clouds)
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