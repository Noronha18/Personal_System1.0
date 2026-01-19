import flet as ft
# Aqui estamos fora da pasta src, então conseguimos importar dela corretamente
from src.main import main

if __name__ == "__main__":
    # MUDANÇA ESTRATÉGICA:
    # Devido a problemas com drivers OpenGL no Linux (erro epoxy_get_proc_address),
    # vamos rodar no modo WEB_BROWSER. Isso usa o navegador para renderizar,
    # contornando o problema das bibliotecas nativas.
    print("🚀 Iniciando Sistema Personal no Navegador...")
    ft.app(target=main, view=ft.AppView.WEB_BROWSER)
