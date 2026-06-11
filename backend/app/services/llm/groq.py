from groq import AsyncGroq
from app.core.config import settings
from app.services.llm.base import LLMProvider

class GroqProvider(LLMProvider):
    def __init__(self):
        self.api_key = settings.GROQ_API_KEY
        self.client = AsyncGroq(api_key=self.api_key) if self.api_key else None

    async def generate(self, prompt: str, system_instruction: str | None = None) -> str:
        if not self.client:
            raise ValueError("GROQ_API_KEY is not configured.")

        # Llama 3.1 8b instant is fast and cheap/free
        model_name = "llama-3.1-8b-instant"
        
        messages = []
        if system_instruction:
            messages.append({"role": "system", "content": system_instruction})
        messages.append({"role": "user", "content": prompt})

        response = await self.client.chat.completions.create(
            model=model_name,
            messages=messages,
            temperature=0.1,
            max_tokens=4096
        )
        
        text = response.choices[0].message.content or ""
        
        # Clean up markdown code blocks if any
        if text.strip().startswith("```"):
            lines = text.strip().splitlines()
            if lines[0].startswith("```json") or lines[0].startswith("```"):
                lines = lines[1:]
            if lines and lines[-1].strip() == "```":
                lines = lines[:-1]
            text = "\n".join(lines).strip()
            
        return text
