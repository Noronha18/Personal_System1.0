import flet as ft

def main(page: ft.Page):
    page.add(ft.Text("Olá, Mentor Python! Se você está vendo isso, o Flet funciona."))

if __name__ == "__main__":
    ft.app(target=main)
