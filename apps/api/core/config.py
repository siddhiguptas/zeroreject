import os
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent.parent
BASE_DIR = PROJECT_ROOT

class Settings(BaseSettings):
    ENVIRONMENT: str = "development"
    LOG_LEVEL: str = "INFO"
    
    # API Server
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8001
    
    # Target Government Portal Server
    GOV_PORTAL_HOST: str = "0.0.0.0"
    GOV_PORTAL_PORT: int = 8090
    GOV_PORTAL_BASE_URL: str = "http://localhost:8090"
    
    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./zeroreject.db"
    
    # Live External APIs
    INDIA_POST_API_BASE: str = "https://api.postalpincode.in/pincode"
    DATA_GOV_IN_API_KEY: str = ""
    
    # Free Multi-Provider LLM & Vision Stack (Zero-Credit & 100% Free Out-of-the-Box)
    GROQ_API_KEY: str | None = None
    OPENROUTER_API_KEY: str | None = None
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    HF_TOKEN: str | None = None
    GEMINI_API_KEY: str | None = None
    GEMINI_MODEL: str = "gemini-2.5-flash"
    DEFAULT_LLM_PROVIDER: str = "auto" # auto (best available), groq, openrouter, ollama, deterministic
    
    # Local Deterministic OCR (auto-detected across Linux / macOS)
    TESSERACT_CMD: str = "/usr/bin/tesseract" if os.path.exists("/usr/bin/tesseract") else "/opt/homebrew/bin/tesseract"
    
    # Playwright Automation (Headless on cloud servers, visible on desktop when set to false)
    PLAYWRIGHT_HEADLESS: bool = True
    PLAYWRIGHT_SLOW_MO_MS: int = 350
    
    # Storage Dirs
    BASE_DIR: str = str(PROJECT_ROOT)
    STORAGE_DIR: str = str(PROJECT_ROOT / "storage")
    UPLOADS_DIR: str = str(PROJECT_ROOT / "storage" / "uploads")
    COMPILED_DIR: str = str(PROJECT_ROOT / "storage" / "compiled")
    AFFIDAVITS_DIR: str = str(PROJECT_ROOT / "storage" / "affidavits")
    SAMPLE_DOCS_DIR: str = str(PROJECT_ROOT / "assets" / "real_sample_docs")

    model_config = SettingsConfigDict(
        env_file=str(PROJECT_ROOT / ".env"),
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

