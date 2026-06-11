import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

class Settings(BaseSettings):
    PROJECT_NAME: str = "SnipeCV Backend"
    API_V1_STR: str = ""
    
    # Security
    SECRET_KEY: str = Field(default="supersecretkeychangeinproduction1234567890!")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Database URL. Standard postgres:// will be updated to postgresql+asyncpg:// if needed.
    DATABASE_URL: str = Field(default="postgresql+asyncpg://postgres:postgres@localhost:5432/snipecv")
    
    # AI Providers
    GEMINI_API_KEY: str | None = None
    GROQ_API_KEY: str | None = None

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
