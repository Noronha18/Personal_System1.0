import asyncio
from src.database import engine, Base

async def resetar_banco():
    async with engine.begin() as conn:
        print("🗑️  Apagando tabelas antigas...")
        await conn.run_sync(Base.metadata.drop_all)
        
        print("✨ Criando tabelas novas...")
        await conn.run_sync(Base.metadata.create_all)
        
    print("✅ Banco de dados resetado com sucesso!")

if __name__ == "__main__":
    asyncio.run(resetar_banco())
