from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.api.routes.auth import get_current_user
from app.database.connection import get_db
from app.models.user import User
from app.models.experience import Experience
from app.schemas.experience_schema import ExperienceSummaryResponse

router = APIRouter(prefix="/experiences", tags=["experiences"])

@router.get("", response_model=list[ExperienceSummaryResponse])
async def get_user_experiences(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Retrieve user's experiences and select skills (preloaded in models via lazy="selectin")
    stmt = (
        select(Experience)
        .where(Experience.user_id == current_user.id)
        .order_by(Experience.created_at.desc())
    )
    result = await db.execute(stmt)
    experiences = result.scalars().all()

    # Format output schema
    responses = []
    for exp in experiences:
        skill_names = [s.name for s in exp.skills]
        responses.append(
            ExperienceSummaryResponse(
                title=exp.title,
                experience_type=exp.experience_type,
                skills=skill_names
            )
        )
    return responses
