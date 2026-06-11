from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.routes.auth import get_current_user
from app.database.connection import get_db
from app.models.user import User
from app.schemas.resume_schema import ResumeRequest, ResumeResponse
from app.services.resume_generator import resume_generator

router = APIRouter(prefix="/resume", tags=["resume"])

@router.post("/generate", response_model=ResumeResponse)
async def generate_resume(
    payload: ResumeRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if not payload.job_description.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Job description cannot be empty."
        )

    try:
        resume = await resume_generator.generate_tailored_resume(
            db=db,
            user_id=current_user.id,
            user_name=current_user.name,
            job_description=payload.job_description
        )
        return resume
    except ValueError as val_err:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(val_err)
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate resume: {str(exc)}"
        )
