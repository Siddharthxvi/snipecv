from abc import ABC, abstractmethod

class LLMProvider(ABC):
    @abstractmethod
    async def generate(self, prompt: str, system_instruction: str | None = None) -> str:
        """
        Asynchronously generates text from the LLM given a prompt.
        """
        pass
