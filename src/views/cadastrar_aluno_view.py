import flet as ft
from src.controllers import criar_aluno


def CadastroView(page: ft.Page):
    # --- 1. Criação dos Campos ---
    nome = ft.TextField(label="Nome do Aluno")

    # Campos novos de Anamnese
    idade = ft.TextField(label="Idade", keyboard_type=ft.KeyboardType.NUMBER, width=100)
    objetivo = ft.TextField(label="Objetivo (Ex: Emagrecimento)")
    restricoes = ft.TextField(label="Restrições Médicas/Dores", multiline=True, max_lines=3)

    frequencia = ft.Dropdown(
        label="Freq. Semanal",
        options=[
            ft.dropdown.Option("2"),
            ft.dropdown.Option("3"),
            ft.dropdown.Option("4"),
            ft.dropdown.Option("5"),
            ft.dropdown.Option("6"),
        ],
        width=150
    )

    # Estes campos estavam faltando no seu código original:
    valor = ft.TextField(label="Valor Mensal", prefix_text="R$ ", keyboard_type=ft.KeyboardType.NUMBER, width=150)
    dia_pagamento = ft.TextField(label="Dia Pagamento", keyboard_type=ft.KeyboardType.NUMBER, width=150)

    # --- 2. Função de Salvar ---
    def salvar(e):
        # Validação Básica
        if not nome.value or not frequencia.value or not valor.value or not dia_pagamento.value:
            page.open(ft.SnackBar(ft.Text("Preencha os campos obrigatórios!"), bgcolor=ft.Colors.RED))
            return

        try:
            # Tratamento de valores vazios/conversão
            idade_int = int(idade.value) if idade.value else 0
            objetivo_str = objetivo.value if objetivo.value else ""
            restricoes_str = restricoes.value if restricoes.value else ""

            sucesso, msg = criar_aluno(
                nome=nome.value,
                frequencia=int(frequencia.value),
                valor=float(valor.value.replace(",", ".")),
                dia_pag=int(dia_pagamento.value),
                idade=idade_int,
                objetivo=objetivo_str,
                restricoes=restricoes_str
            )

            if sucesso:
                page.open(ft.SnackBar(ft.Text(msg), bgcolor=ft.Colors.GREEN))
                page.go("/")  # Volta para o Dashboard
            else:
                page.open(ft.SnackBar(ft.Text(msg), bgcolor=ft.Colors.RED))

        except ValueError:
            page.open(
                ft.SnackBar(ft.Text("Verifique se digitou números em Valor, Dia e Idade!"), bgcolor=ft.Colors.RED))

    # --- 3. Retorno da Tela (View) ---
    return ft.View(
        "/cadastro_aluno",
        controls=[
            ft.AppBar(
                title=ft.Text("Novo Aluno"),
                bgcolor=ft.Colors.BLUE_700,
                color=ft.Colors.WHITE,
                leading=ft.IconButton(ft.Icons.ARROW_BACK, icon_color=ft.Colors.WHITE, on_click=lambda _: page.go("/"))
            ),
            ft.Container(
                padding=20,
                content=ft.Column([
                    ft.Text("Dados Pessoais", size=16, weight="bold"),
                    nome,
                    ft.Row([idade, objetivo]),  # Idade e Objetivo lado a lado
                    restricoes,
                    ft.Divider(),

                    ft.Text("Plano Financeiro", size=16, weight="bold"),
                    ft.Row([frequencia, dia_pagamento]),
                    valor,

                    ft.Container(height=20),  # Espaço vazio

                    ft.ElevatedButton(
                        "Salvar Cadastro",
                        on_click=salvar,
                        bgcolor=ft.Colors.BLUE_700,
                        color=ft.Colors.WHITE,
                        height=50,
                        width=200
                    )
                ], scroll=ft.ScrollMode.AUTO)  # Scroll caso a tela seja pequena
            )
        ]
    )
