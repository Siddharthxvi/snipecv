from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.routes.auth import get_current_user
from app.database.connection import get_db
from app.models.user import User
from app.models.experience import Experience, ExperienceEmbedding
from app.models.skill import Skill
from app.services.document_parser import DocumentParser
from app.services.extraction_service import extraction_service
from app.services.embedding_service import embedding_service

router = APIRouter(prefix="/context", tags=["upload"])

@router.post("/upload", status_code=status.HTTP_201_CREATED)
async def upload_career_context(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # 1. Read file bytes
    file_bytes = await file.read()
    
    # 2. Parse file to raw text
    raw_text = DocumentParser.parse_file(file.filename, file_bytes)
    if not raw_text.strip():
        raise HTTPException(
            status_code=400,
            detail="The uploaded document contains no readable text."
        )

    # 3. Use LLM extraction to get structured experience objects
    try:
        extracted_experiences = await extraction_service.extract_career_context(raw_text)
    except Exception as exc:
        raise HTTPException(
            status_code=422,
            detail=f"Career context extraction failed: {str(exc)}"
        )

    # 4. Save experiences, skills, and compute/save embeddings
    experiences_created = 0
    for exp_schema in extracted_experiences:
        # Save Experience
        db_experience = Experience(
            user_id=current_user.id,
            title=exp_schema.title,
            organization=exp_schema.organization,
            experience_type=exp_schema.experience_type,
            raw_description=exp_schema.raw_description,
            summary=exp_schema.summary,
            start_date=exp_schema.start_date,
            end_date=exp_schema.end_date
        )
        db.add(db_experience)
        await db.flush() # Populate experience ID

        # Save Skills
        skill_names = []
        for s in exp_schema.skills:
            if s.name.strip():
                db_skill = Skill(
                    experience_id=db_experience.id,
                    name=s.name,
                    category=s.category
                )
                db.add(db_skill)
                skill_names.append(s.name)

        # 5. Compute embedding
        embedding_vector = embedding_service.embed_experience(
            title=db_experience.title,
            description=db_experience.raw_description,
            skills=skill_names
        )

        # Save Embedding
        db_embedding = ExperienceEmbedding(
            experience_id=db_experience.id,
            embedding=embedding_vector
        )
        db.add(db_embedding)
        experiences_created += 1

    # Explicitly commit within the route context
    await db.commit()

    return {
        "status": "success",
        "experiences_created": experiences_created
    }
