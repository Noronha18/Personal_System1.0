from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from src.database import get_db
from src.controllers import registrar_pagamento
from src.schemas import PagamentoCreate, PagamentoPublic  # ✅ IMPORTANDO CORRETO?

router = APIRouter(prefix="/pagamentos", tags=["Pagamentos"])

@router.post(
    "/", 
    response_model=PagamentoPublic,  # ✅ Response é Public
    status_code=status.HTTP_201_CREATED
)
async def criar_pagamento(
    dados: PagamentoCreate,  # ✅ ESTE É O SCHEMA CORRETO?
    db: AsyncSession = Depends(get_db)
):
    """Registra pagamento de aluno"""
    return await registrar_pagamento(db, dados)

@router.get("/{pagamento_id}", response_model=PagamentoPublic, summary="Buscar pagamento por ID")           
async def buscar_pagamento(pagamento_id: int, db: AsyncSession = Depends(get_db)):
    from src.controllers import get_pagamento
    return await get_pagamento(db, pagamento_id)

@router.put("/{pagamento_id}",
            response_model=PagamentoPublic,
            summary="Atualizar pagamento por ID"
            )
async def editar_pagamento(pagamento_id:int, dados: PagamentoCreate, db: AsyncSession = Depends(get_db)):
    from src.controllers import atualizar_pagamento
    return await atualizar_pagamento(db, pagamento_id, dados)

@router.delete("/{pagamento_id}", status_code=status.HTTP_200_OK, summary="Deletar pagamento por ID")
async def cancelar_pagamento(pagamento_id: int, db: AsyncSession = Depends(get_db)):
    from src.controllers import deletar_pagamento
    return await deletar_pagamento(db, pagamento_id)
 