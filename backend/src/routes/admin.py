from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from src import controllers, schemas, database
from src.security import get_current_admin

router = APIRouter(
    prefix="/admin",
    tags=["Admin"],
    dependencies=[Depends(get_current_admin)],
)


@router.get("/usuarios", response_model=list[schemas.UsuarioAdminPublic])
async def listar_usuarios(db: AsyncSession = Depends(database.get_db)):
    return await controllers.listar_todos_usuarios(db)


@router.post("/trainers", response_model=schemas.UsuarioAdminPublic, status_code=201)
async def criar_trainer(
    trainer: schemas.TrainerCreate,
    db: AsyncSession = Depends(database.get_db),
):
    return await controllers.criar_trainer(db, trainer)


@router.post("/usuarios/{usuario_id}/verificar-senha", response_model=schemas.VerificarSenhaResponse)
async def verificar_senha(
    usuario_id: int,
    payload: schemas.VerificarSenhaRequest,
    db: AsyncSession = Depends(database.get_db),
):
    valida = await controllers.verificar_senha_usuario(db, usuario_id, payload.senha)
    return schemas.VerificarSenhaResponse(valida=valida)


@router.patch("/usuarios/{usuario_id}/senha", response_model=schemas.UsuarioAdminPublic)
async def resetar_senha(
    usuario_id: int,
    payload: schemas.SenhaResetRequest,
    db: AsyncSession = Depends(database.get_db),
):
    return await controllers.resetar_senha_usuario(db, usuario_id, payload.nova_senha)
