import json
import os
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession

from app.services.llm.gemini import GeminiProvider
from app.services.llm.groq import GroqProvider
from app.services.retrieval_service import retrieval_service
from app.schemas.resume_schema import ResumeResponse

class ResumeGenerator:
    def __init__(self):
        # Configure LLM Providers
        self.gemini = GeminiProvider()
        self.groq = GroqProvider()
        
        # Load prompt templates
        prompts_dir = os.path.join(
            os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
            "prompts"
        )
        with open(os.path.join(prompts_dir, "analyze_job.txt"), "r") as f:
            self.analyze_job_prompt = f.read()
        with open(os.path.join(prompts_dir, "generate_resume.txt"), "r") as f:
            self.generate_resume_prompt = f.read()

    async def analyze_job_description(self, job_description: str) -> dict:
        """
        Extract role information, technical skills, and soft skills from JD.
        Tries Groq first (extremely fast), falls back to Gemini if Groq is not configured or fails.
        """
        prompt = f"Please analyze this job description:\n\n{job_description}"
        
        try:
            # Try Groq first
            response_text = await self.groq.generate(
                prompt=prompt,
                system_instruction=self.analyze_job_prompt
            )
        except Exception as groq_exc:
            print(f"Groq JD analysis failed or unconfigured, falling back to Gemini. Error: {groq_exc}")
            # Fall back to Gemini
            response_text = await self.gemini.generate(
                prompt=prompt,
                system_instruction=self.analyze_job_prompt
            )

        try:
            return json.loads(response_text)
        except Exception as e:
            print(f"Failed to parse JD analysis JSON: {e}. Raw response: {response_text}")
            # Minimum fallback structure
            return {
                "role_type": "General Professional",
                "technical_keywords": [],
                "soft_skills": [],
                "important_requirements": []
            }

    async def generate_tailored_resume(
        self, 
        db: AsyncSession, 
        user_id: UUID, 
        user_name: str,
        job_description: str
    ) -> ResumeResponse:
        # 1. Analyze Job Description to find keywords and role profile
        job_analysis = await self.analyze_job_description(job_description)
        
        # 2. Build a search query based on Job Description & Analysis
        search_query = (
            f"Role: {job_analysis.get('role_type', '')}. "
            f"Keywords: {', '.join(job_analysis.get('technical_keywords', []))}. "
            f"Requirements: {', '.join(job_analysis.get('important_requirements', []))}"
        )
        
        # 3. Search vector space for top-5 matching experiences
        relevant_experiences = await retrieval_service.retrieve_relevant_experiences(
            db=db,
            user_id=user_id,
            query_text=search_query,
            limit=5
        )
        
        if not relevant_experiences:
            raise ValueError("No career experiences found. Please upload career history context first.")
            
        # 4. Formulate LLM input context
        context_items = []
        for index, exp in enumerate(relevant_experiences):
            skills_list = [s.name for s in exp.skills]
            context_item = (
                f"[{index + 1}] Title: {exp.title} | Organization: {exp.organization} | Type: {exp.experience_type}\n"
                f"Dates: {exp.start_date or 'N/A'} to {exp.end_date or 'N/A'}\n"
                f"Skills: {', '.join(skills_list)}\n"
                f"Description: {exp.raw_description}\n"
            )
            context_items.append(context_item)
            
        career_context_str = "\n---\n".join(context_items)
        
        # 5. Invoke Gemini (Gemini is better at full resume formatting constraints)
        prompt = (
            f"Target Job Description:\n{job_description}\n\n"
            f"User Profile Name: {user_name}\n\n"
            f"Retrieved Career Context:\n{career_context_str}"
        )
        
        response_text = await self.gemini.generate(
            prompt=prompt,
            system_instruction=self.generate_resume_prompt
        )
        
        try:
            parsed_resume = json.loads(response_text)
            # Guarantee user name is set
            parsed_resume["name"] = user_name
            return ResumeResponse(**parsed_resume)
        except Exception as e:
            print(f"Failed to parse generated resume JSON. Error: {e}. Raw response: {response_text}")
            raise ValueError(f"Resume generator output was invalid JSON format. Details: {str(e)}")

resume_generator = ResumeGenerator()
