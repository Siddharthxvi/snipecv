import google.generativeai as genai
from app.core.config import settings
from app.services.llm.base import LLMProvider

class GeminiProvider(LLMProvider):
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        if self.api_key:
            genai.configure(api_key=self.api_key)

    async def generate(self, prompt: str, system_instruction: str | None = None) -> str:
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY is not configured.")

        # Using gemini-2.0-flash as it's the primary fast model with high context
        model_name = "gemini-2.0-flash"
        
        # Configure model
        generation_config = {
            "temperature": 0.2,
            "top_p": 0.95,
            "top_k": 40,
            "max_output_tokens": 8192,
        }

        # google-generativeai SDK's GenerativeModel does not natively support async generation via `generate_content_async`
        # in some versions, but we can call it. Let's use it asynchronously.
        model = genai.GenerativeModel(
            model_name=model_name,
            generation_config=generation_config,
            system_instruction=system_instruction
        )
        
        # Run asynchronous content generation
        response = await model.generate_content_async(prompt)
        text = response.text
        
        # Quick clean up if model responds with ```json markdown blocks
        if text.strip().startswith("```"):
            lines = text.strip().splitlines()
            if lines[0].startswith("```json") or lines[0].startswith("```"):
                lines = lines[1:]
            if lines and lines[-1].strip() == "```":
                lines = lines[:-1]
            text = "\n".join(lines).strip()
            
        return text
