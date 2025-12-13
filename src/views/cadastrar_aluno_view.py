import flet as ft
from src.controllers import criar_aluno


def CadastrarAlunoView(page: ft.Page):
    # --- Campos do Formulário ---
    nome_field = ft.TextField(label="Nome do Aluno", width=400)

    # Slider para Frequência (Visual e Prático)
    freq_text = ft.Text("Frequência Semanal: 3x")

    def slider_change(e):
        freq_text.value = f"Frequência Semanal: {int(e.control.value)}x"
        page.update()

    freq_slider = ft.Slider(min=1, max=7, divisions=6, value=3, label="{value}x", on_change=slider_change, width=400)

    valor_field = ft.TextField(label="Valor Mensalidade (R$)", value="0.00", width=400,
                               keyboard_type=ft.KeyboardType.NUMBER)
    dia_field = ft.Dropdown(
        label="Dia de Pagamento",
        width=400,
        options=[ft.dropdown.Option(str(i)) for i in range(1, 32)],
        value="5"
    )

    # --- Ação de Salvar ---
    def salvar_click(e):
        if not nome_field.value:
            nome_field.error_text = "Nome é obrigatório"
            page.update()
            return

        try:
            valor_float = float(valor_field.value.replace(",", "."))
            freq_int = int(freq_slider.value)
            dia_int = int(dia_field.value)
        except ValueError:
            page.snack_bar = ft.SnackBar(ft.Text("Valores inválidos! Verifique preço e dia."), bgcolor=ft.Colors.RED)
            page.snack_bar.open = True
            page.update()
            return

        # Chama o Controller (Back-end)
        sucesso, msg = criar_aluno(nome_field.value, freq_int, valor_float, dia_int)

        cor = ft.Colors.GREEN if sucesso else ft.Colors.RED
        page.snack_bar = ft.SnackBar(ft.Text(msg), bgcolor=cor)
        page.snack_bar.open = True

        if sucesso:
            # Limpa campos
            nome_field.value = ""
            valor_field.value = "0.00"
            page.update()
            # Opcional: Voltar para lista
            # page.go("/dashboard")

        page.update()

    # --- Montagem da Tela ---
    return ft.View(
        "/cadastro_aluno",
        controls=[
            ft.AppBar(title=ft.Text("Novo Aluno"), bgcolor=ft.Colors.BLUE_700, color=ft.Colors.WHITE),
            ft.Container(
                padding=20,
                content=ft.Column(
                    [
                        ft.Text("Dados do Contrato", size=20, weight="bold"),
                        nome_field,
                        ft.Divider(),
                        freq_text,
                        freq_slider,
                        valor_field,
                        dia_field,
                        ft.Divider(height=20, color="transparent"),
                        ft.ElevatedButton(
                            "SALVAR ALUNO",
                            on_click=salvar_click,
                            height=50,
                            style=ft.ButtonStyle(bgcolor=ft.Colors.GREEN, color=ft.Colors.WHITE)
                        )
                    ],
                    horizontal_alignment=ft.CrossAxisAlignment.CENTER
                )
            )
        ]
    )
