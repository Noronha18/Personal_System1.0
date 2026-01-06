import flet as ft
# Aqui estamos fora da pasta src, então conseguimos importar dela corretamente
from src.main import main

if __name__ == "__main__":
    ft.app(target=main)
