from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

router = APIRouter()

@router.get("/users/{user_id}")
async def get_user_vulnerable(user_id: str, db: AsyncSession = Depends()):
    # ruleid: fastapi-sqlalchemy-sqli
    result = await db.execute(text(f"SELECT * FROM users WHERE id = '{user_id}'"))
    return result.all()

@router.get("/users-safe/{user_id}")
async def get_user_safe(user_id: int, db: AsyncSession = Depends()):
    # ok: fastapi-sqlalchemy-sqli
    query = text("SELECT * FROM users WHERE id = :user_id").bindparams(user_id=user_id)
    result = await db.execute(query)
    return result.all()

@router.get("/users-var/{user_id}")
async def get_user_vulnerable_var(user_id: str, db: AsyncSession = Depends()):
    # ruleid: fastapi-sqlalchemy-sqli
    query = f"SELECT * FROM users WHERE id = '{user_id}'"
    result = await db.execute(text(query))
    return result.all()
