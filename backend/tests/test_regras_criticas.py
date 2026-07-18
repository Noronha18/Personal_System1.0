import pytest
from httpx import AsyncClient, ASGITransport

from src.api import app
from src.security import get_current_user
from src import models

TRAINER_A = models.Usuario(id=1, username="trainer_a", role="trainer")
TRAINER_B = models.Usuario(id=2, username="trainer_b", role="trainer")


@pytest.fixture
def como_usuario():
    """Troca o usuário autenticado durante o teste e restaura ao final."""
    anterior = app.dependency_overrides.get(get_current_user)

    def _trocar(user):
        async def _override():
            return user
        app.dependency_overrides[get_current_user] = _override

    yield _trocar

    if anterior is not None:
        app.dependency_overrides[get_current_user] = anterior
    else:
        app.dependency_overrides.pop(get_current_user, None)


@pytest.fixture
async def ac(como_usuario):
    como_usuario(TRAINER_A)
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        yield client


async def _criar_aluno(ac: AsyncClient, **extras) -> int:
    payload = {"nome": "Aluno Teste", **extras}
    res = await ac.post("/alunos/", json=payload)
    assert res.status_code == 201, res.text
    return res.json()["id"]


@pytest.mark.anyio
async def test_frequencia_mensal_retorna_schema_correto(ac: AsyncClient):
    """Regressão: o schema de frequência divergia do controller e quebrava o endpoint."""
    aluno_id = await _criar_aluno(ac, frequencia_semanal_plano=3)

    await ac.post("/sessoes/", json={"aluno_id": aluno_id, "realizada": True})

    res = await ac.get(f"/sessoes/frequencia/{aluno_id}")
    assert res.status_code == 200, res.text
    corpo = res.json()
    assert corpo["sessoes_realizadas"] == 1
    assert corpo["sessoes_previstas"] > 0
    assert 0 <= corpo["taxa_adesao"] <= 1


@pytest.mark.anyio
async def test_checkin_debita_saldo_de_pacote_e_avisa_quando_zera(ac: AsyncClient):
    aluno_id = await _criar_aluno(ac, tipo_pagamento="pacote", saldo_aulas=1)

    # 1º check-in: debita 1 aula, sem aviso
    res1 = await ac.post("/sessoes/", json={"aluno_id": aluno_id, "realizada": True})
    assert res1.status_code == 201, res1.text
    assert res1.json()["aviso"] is None

    res_aluno = await ac.get(f"/alunos/{aluno_id}")
    assert res_aluno.json()["saldo_aulas"] == 0

    # 2º check-in sem saldo: registra a sessão, não deixa negativo e avisa
    res2 = await ac.post("/sessoes/", json={"aluno_id": aluno_id, "realizada": True})
    assert res2.status_code == 201, res2.text
    assert res2.json()["aviso"] is not None

    res_aluno = await ac.get(f"/alunos/{aluno_id}")
    assert res_aluno.json()["saldo_aulas"] == 0


@pytest.mark.anyio
async def test_isolamento_multi_tenant(ac: AsyncClient, como_usuario):
    aluno_id = await _criar_aluno(ac)

    # Trainer B não enxerga o aluno do Trainer A
    como_usuario(TRAINER_B)
    res_lista = await ac.get("/alunos/")
    assert res_lista.status_code == 200
    assert res_lista.json() == []

    res_detalhe = await ac.get(f"/alunos/{aluno_id}")
    assert res_detalhe.status_code == 404


@pytest.mark.anyio
async def test_trainer_nao_pode_reatribuir_aluno(ac: AsyncClient):
    """Segurança: trainer_id no PATCH só pode ser alterado por admin."""
    aluno_id = await _criar_aluno(ac)

    res = await ac.patch(f"/alunos/{aluno_id}", json={"trainer_id": 999, "nome": "Renomeado"})
    assert res.status_code == 200, res.text
    corpo = res.json()
    assert corpo["nome"] == "Renomeado"
    assert corpo["trainer_id"] == TRAINER_A.id


@pytest.mark.anyio
async def test_status_invalido_rejeitado(ac: AsyncClient):
    aluno_id = await _criar_aluno(ac)
    res = await ac.patch(f"/alunos/{aluno_id}/status", params={"status": "invalido"})
    assert res.status_code == 422
