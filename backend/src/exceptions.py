class PersonalSystemError(Exception):
    def __init__(self, message: str = "Ocorreu um erro interno no sistema."):
        self.message = message
        super().__init__(self.message)
    pass


class ResourceNotFoundError(PersonalSystemError):
    """Exceção levantada quando um recurso não é encontrado."""
    pass

class BusinessRuleError(PersonalSystemError):
    """Exceção levantada quando uma regra de negócio é violada(e.g., Treino sem descanso)."""
    pass

class AlunoNotFoundError(ResourceNotFoundError):
    """Exceção levantada quando um aluno não é encontrado."""
    def __init__(self, aluno_id: int | None = None, message: str | None = None):
        self.aluno_id = aluno_id
        if message:
            self.message = message
        elif aluno_id:
            self.message = f"Aluno com ID {aluno_id} não encontrado"
        else:
            self.message = "Aluno não encontrado"
        super().__init__(self.message)


