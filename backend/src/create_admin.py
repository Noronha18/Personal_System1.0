import asyncio
from sqlalchemy import select
from src.database import SessionLocal
from src.models import Usuario
from src.security import get_password_hash

async def create_initial_admin():
    async with SessionLocal() as db:
        # Verifica se já existe um admin
        result = await db.execute(select(Usuario).where(Usuario.role == "trainer"))
        if result.scalar_one_or_none():
            print("✅ Já existe um usuário Trainer cadastrado.")
            return

        admin = Usuario(
            username="admin",
            email="admin@personal.com",
            hashed_password=get_password_hash("admin123"),
            role="trainer",
            is_active=True
        )
        
        db.add(admin)
        await db.commit()
        print("🚀 Usuário Trainer criado com sucesso!")
        print("👤 Login: admin")
        print("🔑 Senha: admin123")
        print("⚠️ Lembre-se de alterar essa senha no primeiro acesso.")

if __name__ == "__main__":
    asyncio.run(create_initial_admin())