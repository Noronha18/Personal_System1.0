# --- Estágio 1: Build do Frontend (React + Vite) ---
FROM node:20-slim AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
# A variável de API em produção geralmente é a mesma URL (relativa)
ENV VITE_API_URL=""
RUN npm run build

# --- Estágio 2: Setup do Backend e Imagem Final ---
FROM python:3.12-slim
WORKDIR /app

# Instala dependências do sistema necessárias para o psycopg2 ou outras libs C
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Instala o 'uv' para gerenciamento ultra-rápido de dependências
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# Copia arquivos de dependências do backend e o README (necessário para o pyproject.toml)
COPY backend/pyproject.toml backend/uv.lock README.md ./

# Instala as dependências diretamente no sistema do container
RUN uv pip install --system -r pyproject.toml

# Copia o código do backend
COPY backend/src ./src
COPY backend/alembic ./alembic
COPY backend/alembic.ini ./

# Copia o build do frontend para dentro do backend (pasta static)
COPY --from=frontend-build /app/frontend/dist ./static

# Define a porta padrão do Cloud Run / Render
ENV PORT=8080
EXPOSE 8080

# Comando para rodar as migrações, criar o admin inicial e iniciar o servidor
CMD ["sh", "-c", "alembic upgrade head && python -m src.create_admin && uvicorn src.api:app --host 0.0.0.0 --port ${PORT}"]
