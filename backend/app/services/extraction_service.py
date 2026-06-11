import json
import os
from sqlalchemy.ext.asyncio import AsyncSession
from app.services.llm.gemini import GeminiProvider
from app.schemas.experience_schema import ExperienceCreate, SkillCreate

class ExtractionService:
    def __init__(self):
        self.provider = GeminiProvider()
        # Read the prompt
        prompt_path = os.path.join(
            os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
            "prompts",
            "extract_context.txt"
        )
        with open(prompt_path, "r") as f:
            self.system_prompt = f.read()

    async def extract_career_context(self, raw_text: str) -> list[ExperienceCreate]:
        prompt = f"Please extract structured career objects from the following document:\n\n{raw_text}"
        
        response_text = await self.provider.generate(
            prompt=prompt,
            system_instruction=self.system_prompt
        )
        
        try:
            parsed_json = json.loads(response_text)
            experiences_data = parsed_json.get("experiences", [])
            
            experiences = []
            for item in experiences_data:
                # Map fields
                skills_list = []
                for s in item.get("skills", []):
                    if isinstance(s, dict):
                        skills_list.append(SkillCreate(name=s.get("name", ""), category=s.get("category")))
                    elif isinstance(s, str):
                        skills_list.append(SkillCreate(name=s, category="general"))
                
                exp = ExperienceCreate(
                    title=item.get("title", "Unknown Role"),
                    organization=item.get("organization", "Unknown Organization"),
                    experience_type=item.get("experience_type", "work"),
                    raw_description=item.get("raw_description") or item.get("description") or "",
                    summary=item.get("summary"),
                    start_date=item.get("start_date"),
                    end_date=item.get("end_date"),
                    skills=skills_list
                )
                experiences.append(exp)
            
            return experiences
        except Exception as e:
            # Fallback simple parser in case LLM output isn't clean JSON
            print(f"Error parsing JSON from Gemini extraction: {e}. Raw response: {response_text}")
            raise ValueError(f"Failed to extract structured resume context. Invalid JSON: {str(e)}")
        
extraction_service = ExtractionService()
