import flet as ft
from src.controllers import cadastrar_treino_completo

class LinhaExercicio(ft.Column):
    def __init__(self):
        super().__init__()
        self.campo_nome = ft.TextField(label="Exercicio", expand=True)
        self.campo_series = ft.TextField(label="Series", width=80, value="3")
        self.campo_repeticoes = ft.TextField(label="Reps", width=80, value="10")
        self.campo_carga = ft.TextField(label="Kg", width=80)
        self.campo_descanso = ft.TextField(label="Descanso", width=80, value="60")
        
        # Botão de remover
        self.btn_remover = ft.IconButton(
            icon=ft.Icons.DELETE_OUTLINE,
            icon_color="red",
            tooltip="Remover exercício",
            on_click=self.remover_a_mim_mesmo
        )

        self.controls = [
            ft.Row(
                controls=[
                    self.campo_nome,
                    self.campo_series,
                    self.campo_repeticoes,
                    self.campo_carga,
                    self.campo_descanso,
                    self.btn_remover
                ]
            )
        ]

    def remover_a_mim_mesmo(self, e):
        self.visible = False
        self.update()

class MontarTreinoView(ft.View):
    def __init__(self, page: ft.Page, aluno_id: int):
        super().__init__(route=f"/montar_treino/{aluno_id}")
        # CORREÇÃO: Renomeado self.page para self.main_page para evitar conflito com propriedade interna
        self.main_page = page
        self.aluno_id = aluno_id
        
        # Componentes da UI
        self.campo_nome_treino = ft.TextField(label="Nome do Treino (Ex: Treino A)", autofocus=True)
        self.lista_de_exercicios_ui = ft.Column(scroll=ft.ScrollMode.AUTO, height=400)
        
        # Adiciona um exercício inicial
        self.lista_de_exercicios_ui.controls.append(LinhaExercicio())

        # Monta a estrutura da View
        self.controls = [
            # CORREÇÃO: ft.colors -> ft.Colors e cor segura BLUE_GREY_50
            ft.AppBar(title=ft.Text("Montar Nova Ficha"), bgcolor=ft.Colors.BLUE_GREY_50),
            ft.Container(
                padding=20,
                content=ft.Column([
                    self.campo_nome_treino,
                    ft.Divider(),
                    ft.Text("Exercícios", size=20, weight="bold"),
                    self.lista_de_exercicios_ui,
                    ft.Row([
                        ft.ElevatedButton("Adicionar Exercício", icon=ft.Icons.ADD, on_click=self.adicionar_campo_exercicio),
                    ]),
                    ft.Divider(),
                    ft.Row([
                        ft.ElevatedButton("Salvar Treino", icon=ft.Icons.SAVE, on_click=self.salvar_treino_clicado, bgcolor="green", color="white"),
                        ft.OutlinedButton("Cancelar", on_click=lambda _: self.main_page.go("/"))
                    ], alignment=ft.MainAxisAlignment.END)
                ])
            )
        ]

    def adicionar_campo_exercicio(self, e):
        self.lista_de_exercicios_ui.controls.append(LinhaExercicio())
        self.lista_de_exercicios_ui.update()

    def salvar_treino_clicado(self, e):
        print("--- CLICOU EM SALVAR TREINO ---")
        if not self.campo_nome_treino.value:
            print("Erro: Nome do treino vazio")
            self.campo_nome_treino.error_text = "Dê um nome ao treino!"
            self.campo_nome_treino.update()
            return

        payload_exercicios = []
        print(f"Total de linhas na UI: {len(self.lista_de_exercicios_ui.controls)}")

        for i, linha in enumerate(self.lista_de_exercicios_ui.controls):
            if isinstance(linha, LinhaExercicio):
                print(f"Processando linha {i} (Visível: {linha.visible})")
                if linha.visible:
                    if not linha.campo_nome.value:
                        print(f"Linha {i} ignorada: Nome do exercício vazio")
                        continue # Pula exercícios sem nome

                    try:
                        dados_exercicio = {
                            "nome": linha.campo_nome.value,
                            "series": int(linha.campo_series.value or 0),
                            "repeticoes": linha.campo_repeticoes.value,
                            "carga": float(linha.campo_carga.value or 0),
                            "descanso": int(linha.campo_descanso.value or 60),
                        }
                        payload_exercicios.append(dados_exercicio)
                        print(f"Exercício adicionado: {dados_exercicio['nome']}")
                    except ValueError as erro:
                        print(f"Erro de valor na linha {i}: {erro}")
                        self.main_page.snack_bar = ft.SnackBar(ft.Text(f"Erro nos valores do exercício {linha.campo_nome.value}"))
                        self.main_page.snack_bar.open = True
                        self.main_page.update()
                        return

        print(f"Total de exercícios válidos: {len(payload_exercicios)}")

        if payload_exercicios:
            print("Enviando para o controller...")
            sucesso, msg = cadastrar_treino_completo(self.aluno_id, self.campo_nome_treino.value, payload_exercicios)
            print(f"Retorno do controller: {sucesso} - {msg}")
            
            cor = "green" if sucesso else "red"
            self.main_page.snack_bar = ft.SnackBar(ft.Text(msg), bgcolor=cor)
            self.main_page.snack_bar.open = True
            self.main_page.update()
            
            if sucesso:
                print("Navegando de volta para Dashboard...")
                # Volta para o dashboard após salvar
                self.main_page.go("/")
        else:
            print("Nenhum exercício válido encontrado.")
            self.main_page.snack_bar = ft.SnackBar(ft.Text("Adicione pelo menos um exercício!"))
            self.main_page.snack_bar.open = True
            self.main_page.update()
