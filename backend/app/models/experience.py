import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from pgvector.sqlalchemy import Vector
from app.database.connection import Base

class Experience(Base):
    __tablename__ = "experiences"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String, nullable=False)
    organization = Column(String, nullable=False)
    experience_type = Column(String, nullable=False)  # e.g. internship, project, research, leadership
    raw_description = Column(Text, nullable=False)
    summary = Column(Text, nullable=True)
    start_date = Column(String, nullable=True)
    end_date = Column(String, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    user = relationship("User")
    skills = relationship("Skill", back_populates="experience", cascade="all, delete-orphan", lazy="selectin")
    embedding = relationship("ExperienceEmbedding", back_populates="experience", uselist=False, cascade="all, delete-orphan", lazy="selectin")

class ExperienceEmbedding(Base):
    __tablename__ = "experience_embeddings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    experience_id = Column(UUID(as_uuid=True), ForeignKey("experiences.id", ondelete="CASCADE"), nullable=False, unique=True)
    embedding = Column(Vector(384), nullable=False)

    experience = relationship("Experience", back_populates="embedding")
