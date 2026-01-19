from datetime import datetime, date
from sqlalchemy.orm import Session
from src.database import get_db
# Adicionando Treino e Exercicio aos imports
from src.models import Aluno, Aula, Pagamento, Treino, Exercicio


def listar_alunos_ativos():
    """Retorna lista de alunos e VERIFICA se pagaram"""
    print("--- CONTROLLER: Listando Alunos ---")
    session: Session = next(get_db())
    try:
        alunos = session.query(Aluno).order_by(Aluno.nome).all()
        print(f"Alunos encontrados no banco: {len(alunos)}")

        # Define o mês atual (Ex: "01/2026")
        hoje = date.today()
        ref_mes = f"{hoje.month:02d}/{hoje.year}"
        inicio_mes = datetime(hoje.year, hoje.month, 1) # DateTime para comparar com DateTime

        for aluno in alunos:
            # 1. Busca se existe pagamento para este mês
            pagamento = session.query(Pagamento).filter(
                Pagamento.aluno_id == aluno.id,
                Pagamento.referencia_mes == ref_mes
            ).first()

            # 2. Define o status (AQUI É A MÁGICA)
            if pagamento:
                aluno.status_financeiro = "em_dia"
            else:
                aluno.status_financeiro = "atrasado"  # Vai ficar vermelho

            # 3. Conta aulas (Mantém sua lógica de progresso)
            total_aulas = session.query(Aula).filter(
                Aula.aluno_id == aluno.id,
                Aula.data_aula >= inicio_mes,
                Aula.realizada == True # Só conta se foi realizada
            ).count()
            aluno.aulas_feitas_mes = total_aulas
            print(f"Aluno {aluno.nome}: {total_aulas} aulas este mês ({ref_mes})")

        return alunos
    except Exception as e:
        print(f"Erro ao listar: {e}")
        return []
    finally:
        session.close()


def registrar_detalhado(aluno_id, obs, realizada=True, reposicao=False, data_hora=None):
    """Registra uma aula ou falta no banco"""
    print(f"--- CONTROLLER: Registrando Aula para ID {aluno_id} ---")
    session: Session = next(get_db())
    try:
        # Se não passar data, usa agora
        data_final = data_hora if data_hora else datetime.now()

        nova_aula = Aula(
            aluno_id=aluno_id,
            observacoes_do_dia=obs if realizada else None, 
            realizada=realizada,
            motivo_falta=obs if not realizada else None,
            reposicao_prevista=reposicao,
            data_aula=data_final
        )
        session.add(nova_aula)
        session.commit()
        print(f"Aula salva com ID: {nova_aula.id} | Data: {nova_aula.data_aula}")

        tipo = "Aula" if realizada else "Falta"
        return True, f"{tipo} registrada com sucesso!"
    except Exception as e:
        session.rollback()
        print(f"ERRO AO SALVAR AULA: {e}")
        return False, f"Erro ao registrar: {e}"
    finally:
        session.close()


def listar_historico_aluno(aluno_id):
    """Pega as últimas 10 aulas do aluno"""
    print(f"--- CONTROLLER: Buscando Histórico ID {aluno_id} ---")
    session: Session = next(get_db())
    try:
        aulas = session.query(Aula).filter(Aula.aluno_id == aluno_id) \
            .order_by(Aula.data_aula.desc(), Aula.id.desc()).limit(10).all()
        
        print(f"Aulas encontradas: {len(aulas)}")

        # Adaptador simples para a View ler
        for aula in aulas:
            # Se data_aula já for datetime, usa direto. Se for date, converte.
            if isinstance(aula.data_aula, datetime):
                aula.data_hora = aula.data_aula
            else:
                aula.data_hora = datetime.combine(aula.data_aula, datetime.min.time())

            aula.observacao = aula.observacoes_do_dia if aula.realizada else aula.motivo_falta
            aula.tem_reposicao = aula.reposicao_prevista

        return aulas
    except Exception as e:
        print(f"Erro histórico: {e}")
        return []
    finally:
        session.close()



def editar_aluno(aluno_id: int, dados_atualizados: dict):
    """
    Atualiza dados do aluno de forma segura.
    Passamos um dict para facilitar: se amanhã mudar um campo,
    não precisamos mudar a assinatura da função.
    """
    # O 'with' garante que a sessão feche mesmo se o PC explodir
    with next(get_db()) as session:
        try:
            aluno = session.get(Aluno, aluno_id)
            if not aluno:
                return False, "Aluno não encontrado"

            # Técnica Sênior: Atualização Dinâmica
            # Em vez de aluno.nome = nome, aluno.idade = idade...
            for chave, valor in dados_atualizados.items():
                if hasattr(aluno, chave):
                    setattr(aluno, chave, valor)

            session.commit()
            return True, "Cadastro do aluno atualizado com sucesso!"

        except Exception as e:
            session.rollback()
            return False, f"Erro ao salvar no banco: {str(e)}"

def excluir_aluno(id):
    session: Session = next(get_db())
    try:
        aluno = session.query(Aluno).get(id)
        if aluno:
            session.delete(aluno)
            session.commit()
            return True, "Aluno excluído."
        return False, "Não encontrado."
    except Exception as e:
        return False, f"Erro: {e}"
    finally:
        session.close()


def registrar_pagamento_real(aluno_id, valor, forma="PIX", obs=""):
    """Registra um pagamento financeiro real no banco"""
    session: Session = next(get_db())
    try:
        # Define o mês atual como referência (Ex: "01/2026")
        hoje = date.today()
        ref = f"{hoje.month:02d}/{hoje.year}"

        novo_pag = Pagamento(
            aluno_id=aluno_id,
            valor=valor,
            referencia_mes=ref,
            forma_pagamento=forma,
            observacao=obs,
            data_pagamento=hoje
        )
        session.add(novo_pag)
        session.commit()
        return True, f"Pagamento de R$ {valor:.2f} registrado!"
    except Exception as e:
        session.rollback()
        return False, f"Erro financeiro: {e}"
    finally:
        session.close()


def verificar_status_financeiro(aluno_id):
    """Verifica se o aluno pagou o mês atual"""
    session: Session = next(get_db())
    try:
        hoje = date.today()
        ref = f"{hoje.month:02d}/{hoje.year}"

        pagamento = session.query(Pagamento).filter(
            Pagamento.aluno_id == aluno_id,
            Pagamento.referencia_mes == ref
        ).first()

        return "em_dia" if pagamento else "atrasado"
    finally:
        session.close()

# Funções legadas para compatibilidade (se ainda usadas)
def registrar_aula_v2(id):
    return registrar_detalhado(id, "Treino Rápido")


# ... (outros imports e funções existentes)

def criar_aluno(nome, frequencia, valor, dia_pag=None, idade=None, objetivo=None, restricoes=None):
    """Cria um novo aluno no banco de dados com TODOS os campos"""
    session: Session = next(get_db())
    try:
        # Tratamento de tipos (segurança contra strings vazias)
        freq_int = int(frequencia) if frequencia else 3
        valor_float = float(str(valor).replace(",", ".")) if valor else 0.0
        dia_venc_int = int(dia_pag) if dia_pag else 5
        idade_int = int(idade) if idade else 0

        novo_aluno = Aluno(
            nome=nome,
            frequencia_semanal_plano=freq_int,
            valor_mensalidade=valor_float,
            dia_vencimento=dia_venc_int,
            idade=idade_int,
            objetivo=objetivo,
            restricoes=restricoes,
        )
        session.add(novo_aluno)
        session.commit()
        return True, "Aluno cadastrado com sucesso!"
    except Exception as e:
        session.rollback()
        # Log do erro no console para ajudar no debug
        print(f"Erro detalhado ao cadastrar: {e}")
        return False, f"Erro ao cadastrar: {e}"
    finally:
        session.close()


def cadastrar_treino_completo(aluno_id: int, nome_treino: str, lista_exercicios:list[dict]):
    # Usando context manager para garantir fechamento da sessão
    with next(get_db()) as session:
        try:
            # 1. Cria o Treino (Cabeçalho)
            novo_treino = Treino(aluno_id=aluno_id, nome=nome_treino)
            session.add(novo_treino)
            
            # Flush envia para o banco e gera o ID do treino, mas ainda não commita
            session.flush() 

            # 2. Cria os Exercícios vinculados a esse treino
            for ex_data in lista_exercicios:
                novo_exercicio = Exercicio(
                    treino_id=novo_treino.id, # Agora temos o ID graças ao flush()
                    nome=ex_data.get('nome'),
                    series=ex_data.get('series'),
                    repeticoes=ex_data.get('repeticoes'),
                    carga=ex_data.get('carga', 0),
                    descanso=ex_data.get('descanso', 60)
                )
                session.add(novo_exercicio)
            
            # 3. Commit ÚNICO no final (Atomicidade)
            session.commit()
            return True, "Treino e exercicios salvos!"
            
        except Exception as e:
            session.rollback()
            return False, str(e)
