from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from src import controllers, schemas, database
from src.models import Usuario
from src.security import get_current_user

router = APIRouter(tags=["Meu Perfil"])


@router.get("/alunos/me", response_model=schemas.AlunoPublic)
async def meu_perfil(
    current_user: Usuario = Depends(get_current_user),
    db: AsyncSession = Depends(database.get_db),
):
    if not current_user.aluno_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Usuário não vinculado a um aluno.",
        )
    return await controllers.get_aluno(db, current_user.aluno_id)
