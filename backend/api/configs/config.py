from typing import Type
from pathlib import Path
from pydantic import Field
from pydantic_settings import BaseSettings, PydanticBaseSettingsSource


class SETTINGS(BaseSettings):
    APP_NAME: str
    ADMINS_EMAIL: str
    SECRET_KEY: str
    JWT_SECRET: str
    ALGORITHM: str
    DATABASE_URL: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 31536000
    GOOGLE_API_KEY: str | None = None
    REDIS_DATABASE_URL: str | None = None  # Ancien nom conservé pour compatibilité.
    REDIS_URL: str | None = None
    REDIS_PREFIX: str = "fullstack:dev:v1"
    CACHE_ENABLED: bool = True
    CACHE_TTL_SECONDS: int = Field(default=60, gt=0)
    PROFILE_PHOTO_DIR: Path = Path("uploads/profile_photos")
    PROFILE_PHOTO_MAX_BYTES: int = Field(default=5 * 1024 * 1024, gt=0)
    PROFILE_PHOTO_MAX_PIXELS: int = Field(default=16_000_000, gt=0)
    EMAIL_HOST: str | None = None
    EMAIL_DOMAIN: str | None = None
    EMAIL_PORT: str | None = None
    EMAIL_USERNAME: str | None = None
    EMAIL_PASSWORD: str | None = None

    @classmethod
    def settings_customise_sources(
        cls,
        settings_cls: Type[BaseSettings],
        init_settings: PydanticBaseSettingsSource,
        env_settings: PydanticBaseSettingsSource,
        dotenv_settings: PydanticBaseSettingsSource,
        file_secret_settings: PydanticBaseSettingsSource,
    ) -> tuple[PydanticBaseSettingsSource, ...]:
        return dotenv_settings, env_settings, file_secret_settings, init_settings


# Settings for production
Setting: SETTINGS | None = SETTINGS()
