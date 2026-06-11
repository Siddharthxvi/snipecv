from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, Field

class SkillBase(BaseModel):
    name: str
    category: str | None = None

class SkillCreate(SkillBase):
    pass

class SkillResponse(SkillBase):
    id: UUID

    class Config:
        from_attributes = True

class ExperienceBase(BaseModel):
    title: str
    organization: str
    experience_type: str  # internship, project, research, leadership, etc.
    raw_description: str
    summary: str | None = None
    start_date: str | None = None
    end_date: str | None = None

class ExperienceCreate(ExperienceBase):
    skills: list[SkillCreate] = Field(default_factory=list)

class ExperienceResponse(ExperienceBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    skills: list[SkillResponse] = Field(default_factory=list)

    class Config:
        from_attributes = True
        
class ExperienceSummaryResponse(BaseModel):
    title: str
    type: str = Field(..., alias="experience_type")
    skills: list[str] = Field(default_factory=list)

    class Config:
        from_attributes = True
        populate_by_name = True
