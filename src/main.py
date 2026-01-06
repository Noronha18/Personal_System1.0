import flet as ft
# Certifique-se que os imports estão com os nomes corretos dos seus arquivos
from src.views.dashboard_view import DashboardView
from src.views.cadastrar_aluno_view import CadastroView
from src.init_db import init_db


def main(page: ft.Page):
    page.title = "Sistema Personal"
    page.theme_mode = ft.ThemeMode.LIGHT

    # --- FUNÇÃO QUE CONTROLA A TROCA DE TELAS ---
    def route_change(route):
        # 1. Limpa as views anteriores (para não sobrepor ou dar tela branca)
        page.views.clear()

        # 2. Verifica qual é a rota atual e adiciona a View correspondente
        if page.route == "/":
            print("Navegando para Dashboard...")
            page.views.append(DashboardView(page))

        elif page.route == "/cadastro_aluno":
            print("Navegando para Cadastro...")
            page.views.append(CadastroView(page))

        # 3. Atualiza a página para mostrar a mudança
        page.update()

    # --- FUNÇÃO PARA O BOTÃO "VOLTAR" DO NAVEGADOR/ANDROID ---
    def view_pop(view):
        page.views.pop()
        top_view = page.views[-1]
        page.go(top_view.route)

    # Configura os eventos na página
    page.on_route_change = route_change
    page.on_view_pop = view_pop

    # Força a ir para a rota inicial agora
    page.go(page.route)


if __name__ == "__main__":
    ft.app(target=main)
