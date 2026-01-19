import flet as ft
from src.views.dashboard_view import DashboardView
from src.views.cadastrar_aluno_view import CadastroView
from src.views.montar_treino_view import MontarTreinoView
import traceback

def main(page: ft.Page):
    print("--- INICIANDO MAIN ---")
    page.title = "Sistema Personal"
    page.theme_mode = ft.ThemeMode.LIGHT

    def route_change(route):
        # O argumento 'route' pode ser um objeto RouteChangeEvent ou uma string
        # Vamos normalizar para string
        rota_atual = route.route if hasattr(route, 'route') else route
        
        print(f"--- MUDANÇA DE ROTA DETECTADA: {rota_atual} ---")
        page.views.clear()
        
        try:
            # Rota: Dashboard (Home)
            if page.route == "/" or page.route == "":
                print("Carregando DashboardView...")
                page.views.append(DashboardView(page))
                print("DashboardView carregada.")

            # Rota: Cadastro de Aluno
            elif page.route == "/cadastro_aluno":
                print("Carregando CadastroView...")
                page.views.append(CadastroView(page))

            # Rota: Montar Treino (Dinâmica)
            elif page.route.startswith("/montar_treino/"):
                try:
                    aluno_id = int(page.route.split("/")[-1])
                    print(f"Carregando MontarTreinoView para ID {aluno_id}...")
                    page.views.append(MontarTreinoView(page, aluno_id))
                except ValueError:
                    print("Erro: ID do aluno inválido na URL")
                    page.go("/")
            
            page.update()
            print("--- PÁGINA ATUALIZADA ---")

        except Exception as e:
            print(f"❌ ERRO CRÍTICO NA ROTA: {e}")
            traceback.print_exc()
            page.add(ft.Text(f"Erro ao carregar tela: {e}", color="red"))

    def view_pop(view):
        page.views.pop()
        top_view = page.views[-1]
        page.go(top_view.route)

    page.on_route_change = route_change
    page.on_view_pop = view_pop
    
    print(f"Rota inicial da página: '{page.route}'")
    
    # Se a rota estiver vazia, forçamos "/"
    if page.route == "":
        page.go("/")
    else:
        # Dispara manualmente para garantir que carregue na primeira vez
        route_change(page.route)

if __name__ == "__main__":
    print("Script main.py executado.")
    ft.app(target=main)
