from src.database import get_db
from src.models import Aula, Aluno
from datetime import datetime


def investigar():
    db = next(get_db())
    try:
        print("-" * 50)
        print(f"🕒 Hora do Sistema (Python): {datetime.now()}")

        # 1. Verificar Intervalo do Mês
        agora = datetime.now()
        inicio_mes = agora.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        print(f"📅 Filtro usado pelo sistema: Tudo depois de {inicio_mes}")
        print("-" * 50)

        # 2. Listar TODAS as aulas no banco
        aulas = db.query(Aula).all()
        print(f"📂 Total de aulas no banco: {len(aulas)}")

        if not aulas:
            print("⚠️ Nenhuma aula encontrada no banco de dados!")
            return

        print("\n🔍 EXAMINANDO AULAS:")
        print(f"{'ID':<5} | {'DATA/HORA':<20} | {'REALIZADA?':<10} | {'ALUNO ID':<10} | {'CONTA?'}")
        print("-" * 70)

        for aula in aulas:
            # Verifica se passa no filtro de data
            data_ok = aula.data_hora >= inicio_mes
            # Verifica se é presença
            status_ok = aula.realizada == True

            conta = "✅ SIM" if (data_ok and status_ok) else "❌ NÃO"

            # Motivo do não
            motivo = ""
            if not data_ok: motivo = "(Data antiga)"
            if not status_ok: motivo = "(É Falta)"

            if conta == "❌ NÃO":
                conta = f"❌ {motivo}"

            print(
                f"{aula.id:<5} | {aula.data_hora.strftime('%d/%m/%Y %H:%M')} | {str(aula.realizada):<10} | {aula.aluno_id:<10} | {conta}")

    except Exception as e:
        print(f"Erro fatal: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    investigar()
