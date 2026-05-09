from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from src.database import get_db
from src import controllers
from src.schemas import PagamentoCreate, PagamentoPublic, EstatisticasFinanceirasPublic
from src.models import Usuario
from src.security import get_current_trainer, resolve_tenant_filter

router = APIRouter(
    prefix="/pagamentos",
    tags=["Pagamentos"],
    dependencies=[Depends(get_current_trainer)]
)


@router.get("/", response_model=list[PagamentoPublic])
async def listar_pagamentos(
    current_user: Usuario = Depends(get_current_trainer),
    db: AsyncSession = Depends(get_db)
):
    return await controllers.listar_pagamentos(db, trainer_id=resolve_tenant_filter(current_user))


@router.get("/estatisticas", response_model=EstatisticasFinanceirasPublic)
async def obter_estatisticas_financeiras(
    current_user: Usuario = Depends(get_current_trainer),
    db: AsyncSession = Depends(get_db)
):
    return await controllers.calcular_estatisticas_financeiras(db, trainer_id=resolve_tenant_filter(current_user))


@router.post("/", response_model=PagamentoPublic, status_code=status.HTTP_201_CREATED)
async def criar_pagamento(
    dados: PagamentoCreate,
    current_user: Usuario = Depends(get_current_trainer),
    db: AsyncSession = Depends(get_db)
):
    return await controllers.registrar_pagamento(db, dados, trainer_id=resolve_tenant_filter(current_user))


@router.get("/{pagamento_id}", response_model=PagamentoPublic)
async def buscar_pagamento(
    pagamento_id: int,
    current_user: Usuario = Depends(get_current_trainer),
    db: AsyncSession = Depends(get_db)
):
    return await controllers.get_pagamento(db, pagamento_id, trainer_id=resolve_tenant_filter(current_user))


@router.put("/{pagamento_id}", response_model=PagamentoPublic)
async def editar_pagamento(
    pagamento_id: int,
    dados: PagamentoCreate,
    current_user: Usuario = Depends(get_current_trainer),
    db: AsyncSession = Depends(get_db)
):
    return await controllers.atualizar_pagamento(db, pagamento_id, dados, trainer_id=resolve_tenant_filter(current_user))


@router.delete("/{pagamento_id}", status_code=status.HTTP_200_OK)
async def cancelar_pagamento(
    pagamento_id: int,
    current_user: Usuario = Depends(get_current_trainer),
    db: AsyncSession = Depends(get_db)
):
    return await controllers.deletar_pagamento(db, pagamento_id, trainer_id=resolve_tenant_filter(current_user))
