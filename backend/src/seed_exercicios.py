import asyncio
from src.database import SessionLocal
from src.models import Exercicio

exercicios_base = [
    # Peito
    {"nome": "Supino Reto com Barra", "grupo_muscular": "Peito"},
    {"nome": "Supino Inclinado com Halteres", "grupo_muscular": "Peito"},
    {"nome": "Crucifixo Máquina", "grupo_muscular": "Peito"},
    # Costas
    {"nome": "Puxada Pulley Frente", "grupo_muscular": "Costas"},
    {"nome": "Remada Curvada", "grupo_muscular": "Costas"},
    {"nome": "Remada Baixa", "grupo_muscular": "Costas"},
    # Pernas
    {"nome": "Agachamento Livre", "grupo_muscular": "Pernas"},
    {"nome": "Leg Press 45", "grupo_muscular": "Pernas"},
    {"nome": "Cadeira Extensora", "grupo_muscular": "Pernas"},
    {"nome": "Mesa Flexora", "grupo_muscular": "Pernas"},
    # Ombros
    {"nome": "Desenvolvimento com Halteres", "grupo_muscular": "Ombros"},
    {"nome": "Elevação Lateral", "grupo_muscular": "Ombros"},
    # Braços
    {"nome": "Rosca Direta", "grupo_muscular": "Bíceps"},
    {"nome": "Tríceps Pulley", "grupo_muscular": "Tríceps"},
]

async def seed():
    async with SessionLocal() as db:
        for ex_data in exercicios_base:
            # Verifica se já existe
            from sqlalchemy import select
            stmt = select(Exercicio).where(Exercicio.nome == ex_data["nome"])
            result = await db.execute(stmt)
            if not result.scalar_one_or_none():
                db.add(Exercicio(**ex_data))
        
        await db.commit()
        print("✅ Biblioteca de exercícios inicializada com sucesso!")

if __name__ == "__main__":
    asyncio.run(seed())
