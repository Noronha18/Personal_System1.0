from fastapi.testclient import TestClient
from src.api import app
import random

client = TestClient(app)

def gerar_cpf_valido() -> str:
    """Gera um CPF válido para testes."""
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

def test_fluxo_aluno_e_plano():
    # 1. Criar Aluno
    cpf = gerar_cpf_valido()
    aluno_payload = {
        "nome": "Aluno Teste Sênior",
        "cpf": cpf,
        "valor_mensalidade": 200.0,
        "frequencia_semanal_plano": 3,
        "dia_vencimento": 10
    }
    res_aluno = client.post("/alunos/", json=aluno_payload)
    assert res_aluno.status_code == 201
    aluno_id = res_aluno.json()["id"]

    # 2. Criar Plano de Treino (Nova Estrutura)
    plano_payload = {
        "titulo": "Plano A - Hipertrofia",
        "objetivo_estrategico": "Ganho de massa magra",
        "esta_ativo": True,
        "prescricoes": [
            {
                "nome_exercicio": "Supino Reto",
                "series": 4,
                "repeticoes": "10",
                "carga_kg": 60.0,
                "tempo_descanso_segundos": 90,
                "notas_tecnicas": "Cadência 2-0-2"
            },
            {
                "nome_exercicio": "Agachamento",
                "series": 3,
                "repeticoes": "12",
                "carga_kg": 80.0,
                "tempo_descanso_segundos": 120
            }
        ]
    }
    # Rota atualizada: /planos
    res_plano = client.post(f"/alunos/{aluno_id}/planos", json=plano_payload)
    
    assert res_plano.status_code == 201
    data = res_plano.json()
    assert data["titulo"] == "Plano A - Hipertrofia"
    assert len(data["prescricoes"]) == 2
    assert data["prescricoes"][0]["nome_exercicio"] == "Supino Reto"

def test_cpf_duplicado_bloqueio():
    cpf = gerar_cpf_valido()
    payload = {
        "nome": "Clone",
        "cpf": cpf,
        "valor_mensalidade": 100,
        "frequencia_semanal_plano": 1,
        "dia_vencimento": 1
    }
    # Primeiro cadastro
    client.post("/alunos/", json=payload)
    # Segundo cadastro (mesmo CPF)
    response = client.post("/alunos/", json=payload)
    
    assert response.status_code == 409
    assert response.json()["type"] == "BusinessRuleViolation"
