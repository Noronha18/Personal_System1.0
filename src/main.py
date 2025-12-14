# src/main.py
import flet as ft
from src.views.login_view import LoginView
from src.views.cadastrar_aluno_view import CadastrarAlunoView
from src.views.dashboard_view import DashboardView


def main(page: ft.Page):
    page.title = "Sistema Personal Trainer"
    page.window_width = 800
    page.window_height = 600

    # Sistema de Rotas (Navegação)
    def route_change(route):
        page.views.clear()

        if page.route == "/login":
            page.views.append(LoginView(page))
        elif page.route == "/cadastro_aluno":
            page.views.append(CadastrarAlunoView(page))
        elif page.route == "/dashboard":
            page.views.append(DashboardView(page))

        page.update()

    page.on_route_change = route_change
    page.go("/dashboard")


if __name__ == "__main__":
    ft.app(target=main)
