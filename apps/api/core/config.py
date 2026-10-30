import os
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent

class Settings(BaseSettings):
    ENVIRONMENT: str = "development"
    LOG_LEVEL: str = "INFO"
    
    # API Server
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000
    
    # Target Government Portal Server
    GOV_PORTAL_HOST: str = "0.0.0.0"
    GOV_PORTAL_PORT: int = 8090
    GOV_PORTAL_BASE_URL: str = "http://localhost:8090"
    
    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./zeroreject.db"
    
    # Live External APIs
    INDIA_POST_API_BASE: str = "https://api.postalpincode.in/pincode"
    DATA_GOV_IN_API_KEY: str = ""
    
    # Multimodal Vision (Gemini 2.5 Flash)
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-2.5-flash"
    
    # Local Deterministic OCR
    TESSERACT_CMD: str = "/opt/homebrew/bin/tesseract"
    
    # Playwright Automation
    PLAYWRIGHT_HEADLESS: bool = True
    PLAYWRIGHT_SLOW_MO_MS: int = 150
    
    # Storage Dirs
    STORAGE_DIR: str = str(BASE_DIR / "storage")
    UPLOADS_DIR: str = str(BASE_DIR / "storage" / "uploads")
    COMPILED_DIR: str = str(BASE_DIR / "storage" / "compiled")
    AFFIDAVITS_DIR: str = str(BASE_DIR / "storage" / "affidavits")
    SAMPLE_DOCS_DIR: str = str(BASE_DIR / "assets" / "real_sample_docs")

    model_config = SettingsConfigDict(
        env_file=str(BASE_DIR / ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()

# Ensure runtime storage directories exist
for directory in [
    settings.STORAGE_DIR,
    settings.UPLOADS_DIR,
    settings.COMPILED_DIR,
    settings.AFFIDAVITS_DIR,
    settings.SAMPLE_DOCS_DIR
]:
    os.makedirs(directory, exist_ok=True)
