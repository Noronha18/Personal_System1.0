import asyncio
from sqlalchemy import select
from src.database import SessionLocal
from src.models import Usuario
from src.security import get_password_hash

async def create_initial_admin():
    async with SessionLocal() as db:
        # Verifica se já existe um admin (por role ou pelo username reservado)
        result = await db.execute(
            select(Usuario).where((Usuario.role == "admin") | (Usuario.username == "admin"))
        )
        existing = result.scalar_one_or_none()
        if existing:
            if existing.role != "admin":
                existing.role = "admin"
                await db.commit()
                print("✅ Usuário 'admin' promovido para role=admin.")
            else:
                print("✅ Já existe um usuário Admin cadastrado.")
            return

        admin = Usuario(
            username="admin",
            email="admin@personal.com",
            hashed_password=get_password_hash("admin123"),
            role="admin",
            is_active=True
        )

        db.add(admin)
        await db.commit()
        print("🚀 Usuário Admin criado com sucesso!")
        print("👤 Login: admin")
        print("🔑 Senha: admin123")
        print("⚠️ Lembre-se de alterar essa senha no primeiro acesso.")

if __name__ == "__main__":
    asyncio.run(create_initial_admin())