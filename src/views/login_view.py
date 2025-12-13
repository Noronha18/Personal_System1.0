# src/views/login_view.py
import flet as ft
from src.database import get_db
from src.models import Usuario


def LoginView(page: ft.Page):
    # --- Lógica do Botão ---
    def fazer_login(e):
        username = campo_usuario.value
        password = campo_senha.value

        if not username or not password:
            campo_usuario.error_text = "Digite o usuário" if not username else None
            campo_senha.error_text = "Digite a senha" if not password else None
            page.update()
            return

        # Conexão com o banco para verificar
        # Nota de Sênior: Normalmente colocaríamos isso num Controller, mas vamos simplificar hoje.
        db = next(get_db())
        user_db = db.query(Usuario).filter(Usuario.username == username).first()

        if user_db and user_db.senha == password:
            page.snack_bar = ft.SnackBar(ft.Text("Login realizado com sucesso!"), bgcolor=ft.Colors.GREEN)
            page.snack_bar.open = True
            # AQUI NO FUTURO VAMOS NAVEGAR PARA O DASHBOARD
            # page.go("/dashboard")
        else:
            page.snack_bar = ft.SnackBar(ft.Text("Usuário ou senha incorretos"), bgcolor=ft.Colors.RED)
            page.snack_bar.open = True

        page.update()

    # --- Elementos da Interface ---
    campo_usuario = ft.TextField(label="Usuário", width=300)
    campo_senha = ft.TextField(label="Senha", password=True, can_reveal_password=True, width=300)

    btn_entrar = ft.ElevatedButton(
        text="ENTRAR",
        width=300,
        on_click=fazer_login,
        style=ft.ButtonStyle(
            color=ft.Colors.WHITE,
            bgcolor=ft.Colors.BLUE_700,
            shape=ft.RoundedRectangleBorder(radius=10)
        )
    )

    # --- Layout (Card Centralizado) ---
    conteudo = ft.Container(
        content=ft.Column(
            [
                ft.Text("Gym System", size=30, weight="bold", color=ft.Colors.BLUE_700),
                ft.Text("Faça login para continuar", size=14, color=ft.Colors.GREY),
                ft.Divider(height=20, color="transparent"),
                campo_usuario,
                campo_senha,
                ft.Divider(height=20, color="transparent"),
                btn_entrar
            ],
            alignment=ft.MainAxisAlignment.CENTER,
            horizontal_alignment=ft.CrossAxisAlignment.CENTER,
        ),
        padding=40,
        bgcolor=ft.Colors.WHITE,
        border_radius=20,
        shadow=ft.BoxShadow(blur_radius=20, color=ft.Colors.with_opacity(0.2, ft.Colors.BLACK))
    )

    # Retorna uma View (que é como uma "página" no Flet)
    return ft.View(
        "/login",
        controls=[
            ft.Container(
                content=conteudo,
                expand=True,
                alignment=ft.alignment.center,
                bgcolor=ft.Colors.BLUE_GREY_50  # Cor de fundo da janela
            )
        ]
    )
