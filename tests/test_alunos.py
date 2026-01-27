from fastapi.testclient import TestClient
from src.api import app
import random

client = TestClient(app)

def gerar_cpf_valido() -> str:
    """Gera um CPF válido para testes (algoritmo simples)."""
    def calcula_digito(digs):
        s = 0
        qtd = len(digs)
        peso = qtd + 1
        for i in range(qtd):
            s += digs[i] * peso
            peso -= 1
        r = 11 - (s % 11)
        return 0 if r > 9 else r

    cpf = [random.randint(0, 9) for _ in range(9)]
    cpf.append(calcula_digito(cpf))
    cpf.append(calcula_digito(cpf))
    return "".join(map(str, cpf))

def test_fluxo_cadastro_aluno():
    # 1. Preparação (Arrange)
    cpf = gerar_cpf_valido()
    payload = {
        "nome": "Aluno Automacao",
        "cpf": cpf,
        "valor_mensalidade": 150.00,
        "frequencia_semanal_plano": 3,
        "dia_vencimento": 5
    }

    # 2. Teste Sucesso (Act & Assert)
    response = client.post("/alunos/", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["cpf"] == cpf
    assert data["nome"] == "Aluno Automacao"

    # 3. Teste Duplicidade (Re-Act & Assert)
    response_dup = client.post("/alunos/", json=payload)
    assert response_dup.status_code == 409
    assert response_dup.json()["type"] == "BusinessRuleViolation"

def test_cpf_invalido():
    payload = {
        "nome": "Aluno Errado",
        "cpf": "00000000000", # Inválido
        "valor_mensalidade": 100,
        "frequencia_semanal_plano": 1,
        "dia_vencimento": 1
    }
    response = client.post("/alunos/", json=payload)
    assert response.status_code == 422
    # O detalhe do erro vem do Pydantic, geralmente em "detail"
    assert "CPF inválido" in response.text or "Value error" in response.text
