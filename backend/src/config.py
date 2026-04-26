from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field
from typing import Optional

class Settings(BaseSettings):
    # Campos de Banco Obrigatórios para Postgres
    DB_USER: str
    DB_PASS: str
    DB_HOST: str
    DB_PORT: str
    DB_NAME: str
    
    PROJECT_NAME: str = "Personal System"
    VERSION: str = "0.1.0"
    CORS_ORIGINS: list[str] = ["*"]

    # Segurança
    SECRET_KEY: str = "mudar_para_uma_chave_muito_segura_em_producao"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 dia

    @property
    def DATABASE_URL(self) -> str:
        # URL assíncrona para o motor da API
        return f"postgresql+asyncpg://{self.DB_USER}:{self.DB_PASS}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"

    @property
    def ALEMBIC_DATABASE_URL(self) -> str:
        # URL síncrona para o Alembic rodar as migrações
        return f"postgresql://{self.DB_USER}:{self.DB_PASS}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"

    # Configuração para ler do arquivo .env
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
