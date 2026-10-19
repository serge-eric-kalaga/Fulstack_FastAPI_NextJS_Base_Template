from typing import Type
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
    REDIS_DATABASE_URL: str | None = None
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
