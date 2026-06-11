import uuid
from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database.connection import Base

class Skill(Base):
    __tablename__ = "skills"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    experience_id = Column(UUID(as_uuid=True), ForeignKey("experiences.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False, index=True)
    category = Column(String, nullable=True) # e.g. backend, frontend, devops, soft_skill, etc.

    experience = relationship("Experience", back_populates="skills")
