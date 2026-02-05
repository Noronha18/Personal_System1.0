import flet as ft
from src.controllers import (
    listar_alunos_ativos, registrar_sessao, listar_historico_aluno,
    editar_aluno, excluir_aluno, registrar_pagamento_real
)
import datetime
import traceback

# Classe auxiliar para guardar o estado da tela
class EstadoDashboard:
    def __init__(self):
        self.aluno_id_selecionado = None
        self.edit_id_selecionado = None
        self.pagamento_aluno_id = None

def DashboardView(page: ft.Page):
    print("--- INICIANDO DASHBOARD VIEW ---")
    lista_cards = ft.ListView(expand=True, spacing=10, padding=20)

    # --- Estado da View ---
    estado = EstadoDashboard()

    # --- FUNÇÃO AUXILIAR PARA ABRIR DIÁLOGOS COM SEGURANÇA ---
    def abrir_dialogo_seguro(dlg):
        if dlg in page.overlay:
            page.overlay.remove(dlg)
        page.overlay.append(dlg)
        dlg.open = True
        page.update()

    def fechar_dialogo_seguro(dlg):
        dlg.open = False
        page.update()

    # --- ELEMENTOS DO MODAL DE REGISTRO ---
    campo_treino = ft.TextField(label="Descrição do Treino (Ex: Pernas A)", multiline=True, max_lines=3)
    switch_falta = ft.Switch(label="Aluno Faltou?", value=False)
    check_reposicao = ft.Checkbox(label="Haverá Reposição?", value=False, visible=False)
    
    # NOVOS CAMPOS DE DATA E HORA
    campo_data = ft.TextField(label="Data", width=140)
    campo_hora = ft.TextField(label="Hora", width=100)

    def abrir_modal_pagamento(e):
        print(f"Clicou em Pagamento. Data: {e.control.data}")
        try:
            aluno = e.control.data
            estado.pagamento_aluno_id = aluno.id
            
            valor_sugerido = getattr(aluno, 'valor_mensalidade', 0.0)
            pagamento_valor.value = f"{valor_sugerido:.2f}"
            pagamento_obs.value = ""
            
            abrir_dialogo_seguro(dialogo_pagamento)
            print("Dialogo Pagamento Aberto via Overlay")
        except Exception as ex:
            print(f"Erro ao abrir pagamento: {ex}")
            traceback.print_exc()

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
        print("Confirmando registro...")
        if not estado.aluno_id_selecionado:
            print("Erro: Nenhum aluno selecionado")
            return

        try:
            data_str = campo_data.value
            hora_str = campo_hora.value
            data_hora_obj = datetime.datetime.strptime(f"{data_str} {hora_str}", "%d/%m/%Y %H:%M")
        except ValueError:
            page.snack_bar = ft.SnackBar(ft.Text("Data ou Hora inválida! Use DD/MM/AAAA e HH:MM"), bgcolor=ft.Colors.RED)
            page.snack_bar.open = True
            page.update()
            return

        sucesso, msg = registrar_sessao(
            aluno_id=estado.aluno_id_selecionado,
            obs=campo_treino.value,
            realizada=not switch_falta.value,
            reposicao=check_reposicao.value,
            data_hora=data_hora_obj
        )
        dialogo_registro.open = False
        
        page.snack_bar = ft.SnackBar(ft.Text(msg), bgcolor=ft.Colors.GREEN if sucesso else ft.Colors.RED)
        page.snack_bar.open = True

        campo_treino.value = ""
        switch_falta.value = False
        check_reposicao.visible = False
        carregar_dados()
        page.update()

    dialogo_registro = ft.AlertDialog(
        modal=True,
        title=ft.Text("Registrar Atividade"),
        content=ft.Column([
            ft.Text("Quando foi?"),
            ft.Row([campo_data, campo_hora]),
            ft.Divider(),
            ft.Text("Detalhes do dia:"),
            switch_falta,
            check_reposicao,
            campo_treino
        ], tight=True, width=400),
        actions=[
            ft.TextButton("Cancelar", on_click=lambda e: fechar_dialogo_seguro(dialogo_registro)),
            ft.ElevatedButton("Salvar", on_click=confirmar_registro, bgcolor=ft.Colors.BLUE_700, color=ft.Colors.WHITE),
        ],
    )
    
    def abrir_modal_registro(e):
        print(f"Clicou em Registrar Aula. ID: {e.control.data}")
        try:
            estado.aluno_id_selecionado = e.control.data
            
            agora = datetime.datetime.now()
            campo_data.value = agora.strftime("%d/%m/%Y")
            campo_hora.value = agora.strftime("%H:%M")
            
            abrir_dialogo_seguro(dialogo_registro)
            print("Dialogo Registro Aberto via Overlay")
        except Exception as ex:
            print(f"Erro ao abrir registro: {ex}")

    # --- ELEMENTOS DO MODAL DE HISTÓRICO ---
    coluna_historico = ft.Column(scroll=ft.ScrollMode.AUTO, height=300)

    dialogo_historico = ft.AlertDialog(
        title=ft.Text("Histórico de Aulas"),
        content=ft.Container(content=coluna_historico, width=400),
        actions=[ft.TextButton("Fechar", on_click=lambda e: fechar_dialogo_seguro(dialogo_historico))],
    )

    def abrir_historico(e):
        print(f"Clicou em Histórico. ID: {e.control.data}")
        try:
            aluno_id = e.control.data
            aulas = listar_historico_aluno(aluno_id)
            coluna_historico.controls.clear()
            if not aulas:
                coluna_historico.controls.append(ft.Text("Nenhum registro encontrado."))
            else:
                for aula in aulas:
                    data_str = aula.data_hora.strftime("%d/%m às %H:%M")
                    
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
            
            abrir_dialogo_seguro(dialogo_historico)
            print("Dialogo Histórico Aberto via Overlay")
        except Exception as ex:
            print(f"Erro ao abrir histórico: {ex}")
            traceback.print_exc()

    # --- ELEMENTOS DO MODAL DE EDIÇÃO ---
    edit_nome = ft.TextField(label="Nome")
    edit_idade = ft.TextField(label="Idade", width=100)
    edit_freq = ft.TextField(label="Frequência", keyboard_type=ft.KeyboardType.NUMBER)
    edit_valor = ft.TextField(label="Valor", prefix=ft.Text("R$ "), keyboard_type=ft.KeyboardType.NUMBER)
    edit_objetivo = ft.TextField(label="Objetivo")
    edit_restricoes = ft.TextField(label="Restrições", multiline=True)

    def salvar_edicao(e):
        try:
            freq = int(edit_freq.value)
            val = float(edit_valor.value.replace(",", "."))
            idd = int(edit_idade.value) if edit_idade.value else 0
            
            if not estado.edit_id_selecionado:
                return

            # CORREÇÃO: Empacotando os dados em um dicionário
            dados_para_atualizar = {
                "nome": edit_nome.value,
                "frequencia_semanal_plano": freq,
                "valor_mensalidade": val,
                "idade": idd,
                "objetivo": edit_objetivo.value,
                "restricoes": edit_restricoes.value
            }

            sucesso, msg = editar_aluno(
                estado.edit_id_selecionado,
                dados_para_atualizar # Passando o dicionário
            )
            page.snack_bar = ft.SnackBar(ft.Text(msg), bgcolor=ft.Colors.GREEN if sucesso else ft.Colors.RED)
            page.snack_bar.open = True
            
            dialogo_edicao.open = False
            carregar_dados()
            page.update()
        except Exception as ex:
            print(f"Erro ao salvar edição: {ex}")
            traceback.print_exc()
            page.snack_bar = ft.SnackBar(ft.Text("Erro nos valores"), bgcolor=ft.Colors.RED)
            page.snack_bar.open = True
            page.update()

    def acao_excluir(e):
        if not estado.edit_id_selecionado:
            return

        sucesso, msg = excluir_aluno(estado.edit_id_selecionado)
        page.snack_bar = ft.SnackBar(ft.Text(msg), bgcolor=ft.Colors.GREEN if sucesso else ft.Colors.RED)
        page.snack_bar.open = True
        
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
        print(f"Clicou em Editar. Data: {e.control.data}")
        try:
            aluno = e.control.data
            estado.edit_id_selecionado = aluno.id
            
            edit_nome.value = aluno.nome
            edit_freq.value = str(aluno.frequencia_semanal_plano)
            edit_valor.value = str(aluno.valor_mensalidade)
            edit_idade.value = str(aluno.idade) if aluno.idade else ""
            edit_objetivo.value = aluno.objetivo if aluno.objetivo else ""
            edit_restricoes.value = aluno.restricoes if aluno.restricoes else ""
            
            abrir_dialogo_seguro(dialogo_edicao)
            print("Dialogo Edição Aberto via Overlay")
        except Exception as ex:
            print(f"Erro ao abrir edição: {ex}")

    # --- VARIÁVEIS E MODAL FINANCEIRO ---
    pagamento_valor = ft.TextField(label="Valor (R$)", keyboard_type=ft.KeyboardType.NUMBER, prefix=ft.Text("R$ "))
    pagamento_forma = ft.Dropdown(
        label="Forma de Pagamento",
        options=[
            ft.dropdown.Option("PIX"),
            ft.dropdown.Option("Dinheiro"),
            ft.dropdown.Option("Cartão Crédito"),
            ft.dropdown.Option("Cartão Débito"),
        ],
        value="PIX"
    )
    pagamento_obs = ft.TextField(label="Observação (Ex: Adiantamento)", multiline=True)

    def confirmar_pagamento(e):
        try:
            if not estado.pagamento_aluno_id:
                return

            val_str = pagamento_valor.value.replace(",", ".")
            val_float = float(val_str) if val_str else 0.0
            sucesso, msg = registrar_pagamento_real(
                aluno_id=estado.pagamento_aluno_id,
                valor=val_float,
                forma=pagamento_forma.value,
                obs=pagamento_obs.value
            )
            dialogo_pagamento.open = False
            
            page.snack_bar = ft.SnackBar(ft.Text(msg), bgcolor=ft.Colors.GREEN if sucesso else ft.Colors.RED)
            page.snack_bar.open = True
            
            carregar_dados()
            page.update()
        except ValueError:
            page.snack_bar = ft.SnackBar(ft.Text("Valor inválido!"), bgcolor=ft.Colors.RED)
            page.snack_bar.open = True
            page.update()

    dialogo_pagamento = ft.AlertDialog(
        title=ft.Text("Registrar Pagamento"),
        content=ft.Column([
            ft.Text("Referência: Mês Atual"),
            pagamento_valor,
            pagamento_forma,
            pagamento_obs
        ], tight=True, width=350),
        actions=[
            ft.TextButton("Cancelar", on_click=lambda e: fechar_dialogo_seguro(dialogo_pagamento)),
            ft.ElevatedButton("Confirmar Recebimento", on_click=confirmar_pagamento, bgcolor=ft.Colors.GREEN,
                              color=ft.Colors.WHITE),
        ],
    )

    # --- CARREGAMENTO PRINCIPAL ---
    def carregar_dados():
        print("--- CARREGANDO DADOS ---")
        lista_cards.controls.clear()
        try:
            alunos = listar_alunos_ativos()
            print(f"Alunos encontrados: {len(alunos)}")

            if not alunos:
                lista_cards.controls.append(ft.Text("Nenhum aluno cadastrado."))
            else:
                for aluno in alunos:
                    meta = aluno.frequencia_semanal_plano * 4
                    progresso = 0
                    if meta > 0:
                        progresso = aluno.aulas_feitas_mes / meta
                        if progresso > 1: progresso = 1

                    cor_financeiro = ft.Colors.GREY
                    icone_financeiro = ft.Icons.MONETIZATION_ON_OUTLINED
                    tooltip_fin = "Status: Pendente"

                    if aluno.status_financeiro in ["atrasado", "esgotado"]:
                        cor_financeiro = ft.Colors.RED
                        icone_financeiro = ft.Icons.MONEY_OFF
                        if aluno.status_financeiro == "esgotado":
                            tooltip_fin = "AULAS ACABARAM! Clique para renovar o ciclo."
                        else:
                            tooltip_fin = "MENSALIDADE VENCIDA! Clique para renovar."
                    elif aluno.status_financeiro == "em_dia":
                        cor_financeiro = ft.Colors.GREEN
                        icone_financeiro = ft.Icons.MONETIZATION_ON
                        tooltip_fin = "Plano Ativo e com Créditos"
                    
                    linha_botoes = ft.Row([
                        ft.IconButton(
                            icon=icone_financeiro,
                            icon_color=cor_financeiro,
                            tooltip=tooltip_fin,
                            on_click=abrir_modal_pagamento,
                            data=aluno
                        ),
                        ft.IconButton(icon=ft.Icons.HISTORY, icon_color="blue", tooltip="Histórico",
                                      on_click=abrir_historico, data=aluno.id),
                        ft.IconButton(icon=ft.Icons.EDIT_DOCUMENT, tooltip="Registrar Aula", icon_color=ft.Colors.BLUE_700,
                                      on_click=abrir_modal_registro, data=aluno.id),
                        ft.IconButton(
                            icon=ft.Icons.FITNESS_CENTER, 
                            tooltip="Montar Treino", 
                            icon_color="orange",
                            on_click=lambda e, id=aluno.id: page.go(f"/montar_treino/{id}")
                        ),
                        ft.IconButton(icon=ft.Icons.SETTINGS, icon_color="grey", tooltip="Editar Aluno",
                                      on_click=abrir_edicao, data=aluno),
                    ], alignment=ft.MainAxisAlignment.SPACE_BETWEEN)

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
            print("Cards criados com sucesso.")
        except Exception as e:
            print(f"❌ ERRO AO CARREGAR DADOS: {e}")
            traceback.print_exc()
            lista_cards.controls.append(ft.Text(f"Erro ao carregar dados: {e}", color="red"))
        
        page.update()

    carregar_dados()

    print("Retornando View do Dashboard...")
    return ft.View(
        route="/dashboard",
        controls=[
            ft.AppBar(title=ft.Text("Gestão de Aulas"), bgcolor=ft.Colors.BLUE_700, color=ft.Colors.WHITE),
            lista_cards
        ],
        floating_action_button=ft.FloatingActionButton(icon=ft.Icons.ADD, on_click=lambda _: page.go("/cadastro_aluno"))
    )
