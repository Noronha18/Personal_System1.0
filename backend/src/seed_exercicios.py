import asyncio
from sqlalchemy import select
from src.database import SessionLocal
from src.models import Exercicio

exercicios_base = [
    # PEITO
    {"nome": "Supino Reto Barra", "grupo_muscular": "Peito"},
    {"nome": "Supino Inclinado Halteres", "grupo_muscular": "Peito"},
    {"nome": "Crucifixo Máquina (Peck Deck)", "grupo_muscular": "Peito"},
    {"nome": "Crossover Polia Alta", "grupo_muscular": "Peito"},
    {"nome": "Supino Declinado Barra", "grupo_muscular": "Peito"},
    {"nome": "Flexão de Braços (Push up)", "grupo_muscular": "Peito"},

    # COSTAS
    {"nome": "Puxada Aberta Pulley", "grupo_muscular": "Costas"},
    {"nome": "Remada Curvada Barra", "grupo_muscular": "Costas"},
    {"nome": "Remada Baixa Triângulo", "grupo_muscular": "Costas"},
    {"nome": "Barra Fixa (Pull up)", "grupo_muscular": "Costas"},
    {"nome": "Levantamento Terra", "grupo_muscular": "Costas"},
    {"nome": "Pullover Polia Alta", "grupo_muscular": "Costas"},
    {"nome": "Remada Unilateral (Serrote)", "grupo_muscular": "Costas"},

    # PERNAS (QUADRÍCEPS)
    {"nome": "Agachamento Livre Barra", "grupo_muscular": "Pernas"},
    {"nome": "Leg Press 45º", "grupo_muscular": "Pernas"},
    {"nome": "Cadeira Extensora", "grupo_muscular": "Pernas"},
    {"nome": "Afundo com Halteres", "grupo_muscular": "Pernas"},
    {"nome": "Hack Squat", "grupo_muscular": "Pernas"},

    # PERNAS (POSTERIOR/GLÚTEO)
    {"nome": "Stiff Barra", "grupo_muscular": "Pernas"},
    {"nome": "Mesa Flexora", "grupo_muscular": "Pernas"},
    {"nome": "Cadeira Flexora", "grupo_muscular": "Pernas"},
    {"nome": "Elevação Pélvica", "grupo_muscular": "Pernas"},
    {"nome": "Cadeira Abdutora", "grupo_muscular": "Pernas"},
    {"nome": "Cadeira Adutora", "grupo_muscular": "Pernas"},

    # OMBROS (DELTOIDES)
    {"nome": "Desenvolvimento Halteres", "grupo_muscular": "Ombros"},
    {"nome": "Elevação Lateral Halteres", "grupo_muscular": "Ombros"},
    {"nome": "Elevação Frontal Polia", "grupo_muscular": "Ombros"},
    {"nome": "Crucifixo Inverso Halteres", "grupo_muscular": "Ombros"},
    {"nome": "Desenvolvimento Arnold", "grupo_muscular": "Ombros"},

    # BRAÇOS (BÍCEPS)
    {"nome": "Rosca Direta Barra W", "grupo_muscular": "Bíceps"},
    {"nome": "Rosca Alternada Halteres", "grupo_muscular": "Bíceps"},
    {"nome": "Rosca Martelo", "grupo_muscular": "Bíceps"},
    {"nome": "Rosca Concentrada", "grupo_muscular": "Bíceps"},
    {"nome": "Rosca Scott Máquina", "grupo_muscular": "Bíceps"},

    # BRAÇOS (TRÍCEPS)
    {"nome": "Tríceps Pulley Corda", "grupo_muscular": "Tríceps"},
    {"nome": "Tríceps Testa Barra", "grupo_muscular": "Tríceps"},
    {"nome": "Tríceps Francês Halter", "grupo_muscular": "Tríceps"},
    {"nome": "Tríceps Coice Polia", "grupo_muscular": "Tríceps"},
    {"nome": "Mergulho Paralelas", "grupo_muscular": "Tríceps"},

    # CORE / ABDÔMEN
    {"nome": "Abdominal Supra Solo", "grupo_muscular": "Core"},
    {"nome": "Prancha Isométrica", "grupo_muscular": "Core"},
    {"nome": "Elevação de Pernas Suspenso", "grupo_muscular": "Core"},
    {"nome": "Abdominal Infra no Banco", "grupo_muscular": "Core"},
    {"nome": "Russian Twist", "grupo_muscular": "Core"},

    # CARDIO / OUTROS
    {"nome": "Corrida Esteira", "grupo_muscular": "Cardio"},
    {"nome": "Bicicleta Ergométrica", "grupo_muscular": "Cardio"},
    {"nome": "Elíptico", "grupo_muscular": "Cardio"},
    {"nome": "Burpee", "grupo_muscular": "Funcional"},
    {"nome": "Kettlebell Swing", "grupo_muscular": "Funcional"},
]

async def seed(db: AsyncSession = None):
    if db is None:
        async with SessionLocal() as session:
            return await _run_seed(session)
    else:
        return await _run_seed(db)

async def _run_seed(db: AsyncSession):
    print(f"🌱 Iniciando atualização da biblioteca com {len(exercicios_base)} exercícios...")
    count = 0
    for ex_data in exercicios_base:
        stmt = select(Exercicio).where(Exercicio.nome == ex_data["nome"])
        result = await db.execute(stmt)
        if not result.scalar_one_or_none():
            db.add(Exercicio(**ex_data))
            count += 1
    
    await db.commit()
    print(f"✅ Sucesso! {count} novos exercícios adicionados.")
    return count

if __name__ == "__main__":
    from src.database import SessionLocal
    from sqlalchemy.ext.asyncio import AsyncSession
    asyncio.run(seed())
