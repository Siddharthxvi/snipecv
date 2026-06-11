from pydantic import BaseModel, Field

class ResumeRequest(BaseModel):
    job_description: str

class ResumeExperienceItem(BaseModel):
    title: str
    organization: str = ""
    start_date: str = ""
    end_date: str = ""
    bullets: list[str] = Field(default_factory=list, description="Tailored accomplishment statements using the Action-Verb + Context + Impact formula.")

class ResumeProjectItem(BaseModel):
    title: str = Field(..., description="Project name")
    bullets: list[str] = Field(default_factory=list, description="Bullets outlining context, tech stack, and output.")

class ResumeSkillItem(BaseModel):
    category: str = Field(..., description="e.g. Languages, Frameworks, Tools, Soft Skills")
    skills: list[str] = Field(default_factory=list)

class ResumeResponse(BaseModel):
    name: str = ""
    summary: str = Field(..., description="A professional summary tailored specifically to the targeted job description.")
    experience: list[ResumeExperienceItem] = Field(default_factory=list, description="Work experience section including internships, full time, research roles.")
    projects: list[ResumeProjectItem] = Field(default_factory=list, description="Technical projects matching the job description.")
    skills: list[ResumeSkillItem] = Field(default_factory=list, description="Categorized list of key technical and soft skills.")
