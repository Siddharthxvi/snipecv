from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.experience import Experience, ExperienceEmbedding
from app.services.embedding_service import embedding_service

class RetrievalService:
    async def retrieve_relevant_experiences(
        self, 
        db: AsyncSession, 
        user_id: UUID, 
        query_text: str, 
        limit: int = 5
    ) -> list[Experience]:
        # 1. Generate query embedding
        query_vector = embedding_service.embed_text(query_text)
        
        # 2. Query Postgres pgvector using cosine distance
        # '<=>' operator in pgvector represents cosine distance. We order by cosine distance ascending (closest first)
        # SQLAlchemy supports pgvector operations via the 'cosine_distance' helper or direct expression.
        # ExperienceEmbedding.embedding.cosine_distance(query_vector) is the standard pgvector-sqlalchemy syntax.
        stmt = (
            select(Experience)
            .join(ExperienceEmbedding, Experience.id == ExperienceEmbedding.experience_id)
            .where(Experience.user_id == user_id)
            .order_by(ExperienceEmbedding.embedding.cosine_distance(query_vector))
            .limit(limit)
        )
        
        result = await db.execute(stmt)
        experiences = result.scalars().all()
        return list(experiences)

retrieval_service = RetrievalService()
