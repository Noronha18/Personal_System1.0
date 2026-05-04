from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field
from typing import Optional

class Settings(BaseSettings):
    # Campos individuais (opcionais se DATABASE_URL for fornecida)
    DB_USER: Optional[str] = None
    DB_PASS: Optional[str] = None
    DB_HOST: Optional[str] = None
    DB_PORT: Optional[str] = "5432"
    DB_NAME: Optional[str] = None
    
    # URL Direta (Padrão Supabase/Neon)
    # Ex: postgresql://user:pass@host:5432/dbname
    DATABASE_URL_DIRECT: Optional[str] = None

    PROJECT_NAME: str = "PTRoster"
    VERSION: str = "0.1.0"
    CORS_ORIGINS: list[str] = ["*"]

    # Segurança
    SECRET_KEY: str = "mudar_para_uma_chave_muito_segura_em_producao"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 dia

    @property
    def DATABASE_URL(self) -> str:
        # Se tiver uma URL direta, apenas injeta o driver asyncpg
        if self.DATABASE_URL_DIRECT:
            return self.DATABASE_URL_DIRECT.replace("postgresql://", "postgresql+asyncpg://")
        
        # Caso contrário, monta a partir dos campos individuais
        return f"postgresql+asyncpg://{self.DB_USER}:{self.DB_PASS}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"

    @property
    def ALEMBIC_DATABASE_URL(self) -> str:
        # Alembic precisa de uma URL síncrona (sem asyncpg)
        if self.DATABASE_URL_DIRECT:
            return self.DATABASE_URL_DIRECT
        
        return f"postgresql://{self.DB_USER}:{self.DB_PASS}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"

    # Configuração para ler do arquivo .env
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
