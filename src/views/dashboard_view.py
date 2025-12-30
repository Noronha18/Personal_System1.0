import flet as ft
from src.controllers import listar_alunos_ativos, registrar_detalhado, listar_historico_aluno, editar_aluno, \
    excluir_aluno, registrar_aula_v2, registrar_pagamento


def DashboardView(page: ft.Page):
    lista_cards = ft.ListView(expand=True, spacing=10, padding=20)

    # --- Variáveis Globais da View ---
    aluno_id_selecionado = ft.Ref[int]()
    edit_id_selecionado = ft.Ref[int]()

    # --- ELEMENTOS DO MODAL DE REGISTRO ---
    campo_treino = ft.TextField(label="Descrição do Treino (Ex: Pernas A)", multiline=True, max_lines=3)
    switch_falta = ft.Switch(label="Aluno Faltou?", value=False)
    check_reposicao = ft.Checkbox(label="Haverá Reposição?", value=False, visible=False)

    def acao_pagar(e):
        aluno = e.control.data
        sucesso, msg = registrar_pagamento(aluno.id)

        cor = ft.Colors.GREEN if sucesso else ft.Colors.RED
        page.snack_bar = ft.SnackBar(ft.Text(msg), bgcolor=cor)
        page.snack_bar.open = True

        carregar_dados()
        page.update()

    def mudar_tipo_registro(e):
        if switch_falta.value:
            campo_treino.label = "Motivo da Falta"
            check_reposicao.visible = True
        else:
            campo_treino.label = "Descrição do Treino"
            check_reposicao.visible = False
        page.update()

    switch_falta.on_change = mudar_tipo_registro

    def confirmar_registro(e):
        sucesso, msg = registrar_detalhado(
            aluno_id=aluno_id_selecionado.current,
            obs=campo_treino.value,
            realizada=not switch_falta.value,
            reposicao=check_reposicao.value
        )
        dialogo_registro.open = False
        page.open(ft.SnackBar(ft.Text(msg), bgcolor=ft.Colors.GREEN if sucesso else ft.Colors.RED))

        # Resetar campos
        campo_treino.value = ""
        switch_falta.value = False
        check_reposicao.visible = False

        carregar_dados()
        page.update()

    dialogo_registro = ft.AlertDialog(
        modal=True,
        title=ft.Text("Registrar Atividade"),
        content=ft.Column([
            ft.Text("Detalhes do dia:"),
            switch_falta,
            check_reposicao,
            campo_treino
        ], tight=True, width=400),
        actions=[
            ft.TextButton("Cancelar", on_click=lambda e: page.close(dialogo_registro)),
            ft.ElevatedButton("Salvar", on_click=confirmar_registro, bgcolor=ft.Colors.BLUE_700, color=ft.Colors.WHITE),
        ],
    )

    def abrir_modal_registro(e):
        aluno_id_selecionado.current = e.control.data
        page.open(dialogo_registro)

    # --- ELEMENTOS DO MODAL DE HISTÓRICO ---
    coluna_historico = ft.Column(scroll=ft.ScrollMode.AUTO, height=300)

    dialogo_historico = ft.AlertDialog(
        title=ft.Text("Histórico de Aulas"),
        content=ft.Container(content=coluna_historico, width=400),
        actions=[ft.TextButton("Fechar", on_click=lambda e: page.close(dialogo_historico))],
    )

    def abrir_historico(e):
        aluno_id = e.control.data
        aulas = listar_historico_aluno(aluno_id)

        # Limpa a lista anterior com segurança
        coluna_historico.controls.clear()

        if not aulas:
            coluna_historico.controls.append(ft.Text("Nenhum registro encontrado."))
        else:
            for aula in aulas:
                data_str = aula.data_hora.strftime("%d/%m %H:%M")

                if aula.realizada:
                    icone = ft.Icons.CHECK_CIRCLE
                    cor = ft.Colors.GREEN
                    txt_titulo = f"Aula - {data_str}"
                else:
                    icone = ft.Icons.CANCEL
                    cor = ft.Colors.RED
                    txt_titulo = f"FALTA - {data_str}"
                    if aula.tem_reposicao:
                        txt_titulo += " (Repor)"

                item = ft.ListTile(
                    leading=ft.Icon(icone, color=cor),
                    title=ft.Text(txt_titulo, weight="bold", size=14),
                    subtitle=ft.Text(aula.observacao or "Sem obs"),
                )
                coluna_historico.controls.append(item)
                coluna_historico.controls.append(ft.Divider(height=1))

        page.open(dialogo_historico)

    # --- ELEMENTOS DO MODAL DE EDIÇÃO ---
    edit_nome = ft.TextField(label="Nome")
    edit_idade = ft.TextField(label="Idade", width=100)
    edit_freq = ft.TextField(label="Frequência", keyboard_type=ft.KeyboardType.NUMBER)
    edit_valor = ft.TextField(label="Valor", prefix_text="R$ ", keyboard_type=ft.KeyboardType.NUMBER)

    edit_objetivo = ft.TextField(label="Objetivo")
    edit_restricoes = ft.TextField(label="Restrições", multiline=True)

    def salvar_edicao(e):
        try:
            freq = int(edit_freq.value)
            val = float(edit_valor.value.replace(",", "."))
            idd = int(edit_idade.value) if edit_idade.value else 0

            # Atualiza chamada da função
            sucesso, msg = editar_aluno(
                edit_id_selecionado.current,
                edit_nome.value,
                freq,
                val,
                idd,  # idade
                edit_objetivo.value,  # obj
                edit_restricoes.value  # restricoes
            )
            page.open(ft.SnackBar(ft.Text(msg), bgcolor=ft.Colors.GREEN if sucesso else ft.Colors.RED))
            dialogo_edicao.open = False
            carregar_dados()
            page.update()
        except:
            page.open(ft.SnackBar(ft.Text("Erro nos valores"), bgcolor=ft.Colors.RED))

    def acao_excluir(e):
        sucesso, msg = excluir_aluno(edit_id_selecionado.current)
        page.open(ft.SnackBar(ft.Text(msg), bgcolor=ft.Colors.GREEN if sucesso else ft.Colors.RED))
        dialogo_edicao.open = False
        carregar_dados()
        page.update()

    dialogo_edicao = ft.AlertDialog(
        title=ft.Text("Ficha do Aluno"),
        content=ft.Container(
            content=ft.Column([
                edit_nome,
                ft.Row([edit_idade, edit_freq]),
                edit_valor,
                ft.Divider(),
                ft.Text("Anamnese", weight="bold"),
                edit_objetivo,
                edit_restricoes,
                ft.Divider(),
                ft.TextButton("Excluir Aluno", on_click=acao_excluir, style=ft.ButtonStyle(color=ft.Colors.RED)),
                ft.ElevatedButton("Salvar Alterações", on_click=salvar_edicao, bgcolor=ft.Colors.BLUE_700,
                                  color=ft.Colors.WHITE)
            ], tight=True, scroll=ft.ScrollMode.AUTO),
            height=400, width=400
        )
    )

    def abrir_edicao(e):
        aluno = e.control.data
        edit_id_selecionado.current = aluno.id
        edit_nome.value = aluno.nome
        edit_freq.value = str(aluno.frequencia_semanal_plano)
        edit_valor.value = str(aluno.valor_mensalidade)

        # Preenche novos campos (tratando se for None)
        edit_idade.value = str(aluno.idade) if aluno.idade else ""
        edit_objetivo.value = aluno.objetivo if aluno.objetivo else ""
        edit_restricoes.value = aluno.restricoes if aluno.restricoes else ""

        page.open(dialogo_edicao)

    # --- CARREGAMENTO PRINCIPAL ---
    def carregar_dados():
        lista_cards.controls.clear()
        alunos = listar_alunos_ativos()

        if not alunos:
            lista_cards.controls.append(ft.Text("Nenhum aluno cadastrado."))
        else:
            for aluno in alunos:
                meta = aluno.frequencia_semanal_plano * 4
                progresso = 0
                if meta > 0:
                    progresso = aluno.aulas_feitas_mes / meta
                    if progresso > 1: progresso = 1

                def abrir_ficha(e):
                    # Placeholder para ficha
                    print(f"Abrindo ficha de {aluno.nome}")

                def abrir_avaliacao(e):
                    # Placeholder para avaliação
                    print(f"Abrindo avaliação de {aluno.nome}")

                # --- LÓGICA DO BOTÃO FINANCEIRO ---
                cor_financeiro = ft.Colors.GREY
                icone_financeiro = ft.Icons.MONETIZATION_ON_OUTLINED
                tooltip_fin = "Status: Pendente"

                # Status Vermelho (Atrasado por data ou Esgotou as aulas)
                if aluno.status_financeiro in ["atrasado", "esgotado"]:
                    cor_financeiro = ft.Colors.RED
                    icone_financeiro = ft.Icons.MONEY_OFF

                    if aluno.status_financeiro == "esgotado":
                        tooltip_fin = "AULAS ACABARAM! Clique para renovar o ciclo."
                    else:
                        tooltip_fin = "MENSALIDADE VENCIDA! Clique para renovar."

                # Status Verde
                elif aluno.status_financeiro == "em_dia":
                    cor_financeiro = ft.Colors.GREEN
                    icone_financeiro = ft.Icons.MONETIZATION_ON
                    tooltip_fin = "Plano Ativo e com Créditos"
                # --- LINHA DE BOTÕES UNIFICADA ---
                linha_botoes = ft.Row([
                    # 1. Financeiro
                    ft.IconButton(
                        icon=icone_financeiro,
                        icon_color=cor_financeiro,
                        tooltip=tooltip_fin,
                        on_click=acao_pagar,
                        data=aluno
                    ),

                    # 2. Histórico
                    ft.IconButton(icon=ft.Icons.HISTORY, icon_color="blue", tooltip="Histórico",
                                  on_click=lambda e, a=aluno: abrir_historico(a), data=aluno.id),

                    # 3. Registrar Aula (Modal Azul)
                    ft.IconButton(icon=ft.Icons.EDIT_DOCUMENT, tooltip="Registrar Aula", icon_color=ft.Colors.BLUE_700,
                                  on_click=abrir_modal_registro, data=aluno.id),

                    # 4. Avaliação (Roxo)
                    ft.IconButton(icon=ft.Icons.MONITOR_WEIGHT, tooltip="Avaliação Física", icon_color="purple",
                                  on_click=abrir_avaliacao),

                    # 5. Config/Editar (Cinza)
                    ft.IconButton(icon=ft.Icons.SETTINGS, icon_color="grey", tooltip="Editar Aluno",
                                  on_click=abrir_edicao, data=aluno),

                ], alignment=ft.MainAxisAlignment.SPACE_BETWEEN)

                # Cria o Card
                card = ft.Card(
                    content=ft.Container(
                        padding=10,
                        content=ft.Column([
                            ft.ListTile(
                                leading=ft.Icon(ft.Icons.PERSON, size=40, color=ft.Colors.BLUE_700),
                                title=ft.Text(aluno.nome, weight="bold"),
                                subtitle=ft.Text(
                                    f"Plano: {aluno.frequencia_semanal_plano}x | R$ {aluno.valor_mensalidade}"),
                            ),
                            # Barra de Progresso
                            ft.ProgressBar(value=progresso, color=ft.Colors.BLUE, bgcolor=ft.Colors.BLUE_50),
                            ft.Text(f"Frequência Mês: {aluno.aulas_feitas_mes}/{meta}", size=12,
                                    text_align=ft.TextAlign.CENTER),

                            # Espaçamento
                            ft.Divider(height=10, color="transparent"),

                            # Botões de Ação
                            linha_botoes
                        ])
                    )
                )
                lista_cards.controls.append(card)
        page.update()

    carregar_dados()

    return ft.View(
        "/dashboard",
        controls=[
            ft.AppBar(title=ft.Text("Gestão de Aulas"), bgcolor=ft.Colors.BLUE_700, color=ft.Colors.WHITE),
            lista_cards
        ],
        floating_action_button=ft.FloatingActionButton(icon=ft.Icons.ADD, on_click=lambda _: page.go("/cadastro_aluno"))
    )
