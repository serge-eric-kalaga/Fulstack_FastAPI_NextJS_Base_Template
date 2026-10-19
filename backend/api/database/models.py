from pydantic import field_validator
from typing import Optional, List
from urllib.parse import quote
from api.database import BaseTemplate
from sqlalchemy import (
    func,
    Integer,
    Boolean,
    DateTime,
    String,
    JSON,
    ForeignKey,
    Text,
    ARRAY,
    Table,
    Column,
    VARCHAR,
)
from sqlalchemy.orm import (
    Mapped,
    mapped_column,
    MappedAsDataclass,
    DeclarativeBase,
    relationship,
    WriteOnlyMapped,
)
from datetime import datetime, date


class Base(MappedAsDataclass, DeclarativeBase):
    date_creation: Mapped[datetime] = mapped_column(
        server_default=func.now(), init=False
    )
    date_modification: Mapped[datetime] = mapped_column(
        onupdate=func.now(), nullable=True, init=False
    )

    def as_dict(self):
        dict_ = {}
        for c in self.__table__.columns:
            dict_[c.name] = (
                str(getattr(self, c.name))
                if type(getattr(self, c.name)) is date or datetime
                else getattr(self, c.name)
            )
        if hasattr(self, "historique"):
            del dict_["historique"]
        return dict_


class User(Base, BaseTemplate):
    __tablename__ = "user"

    id: Mapped[int] = mapped_column(
        primary_key=True, index=True, autoincrement=True, init=False
    )
    username: Mapped[str] = mapped_column(
        VARCHAR(255), nullable=False, unique=True, init=True
    )
    telephone: Mapped[str] = mapped_column(VARCHAR(255), nullable=True, init=True)
    password: Mapped[str] = mapped_column(VARCHAR(255), nullable=False, init=True)

    profile_photo: Mapped[str | None] = mapped_column(
        VARCHAR(255), nullable=True, init=False, default=None
    )

    last_login_at: Mapped[datetime | None] = mapped_column(
        DateTime(), nullable=True, init=False, default=None
    )

    email: Mapped[str | None] = mapped_column(
        VARCHAR(254), nullable=True, unique=True, index=True, init=False, default=None
    )
    auth_version: Mapped[int] = mapped_column(
        Integer, nullable=False, init=False, default=0, server_default="0"
    )
    password_reset_digest: Mapped[str | None] = mapped_column(
        VARCHAR(64), nullable=True, index=True, init=False, default=None
    )
    password_reset_expires_at: Mapped[datetime | None] = mapped_column(
        DateTime(), nullable=True, init=False, default=None
    )

    @property
    def profile_photo_url(self) -> str | None:
        """Retourner l’URL authentifiée de la photo, versionnée après remplacement."""
        if not self.profile_photo:
            return None
        return f"/api/user/{quote(self.username, safe='')}/photo?v={self.profile_photo}"

    @field_validator("username")
    def validate_username(cls, username):
        if len(username) < 3:
            raise ValueError("Le username doit etre superieur a 3 caracteres !")
        return username

    @field_validator("password")
    def validate_password(cls, password):
        if len(password) < 8:
            raise ValueError("Le password doit etre superieur a 8 caracteres !")
        return password


class RecoveryRateLimit(Base):
    """Compteurs partagés entre processus, sans adresse e-mail ni IP en clair."""

    __tablename__ = "recovery_rate_limit"
    key: Mapped[str] = mapped_column(VARCHAR(64), primary_key=True)
    window_start: Mapped[datetime] = mapped_column(
        DateTime(), nullable=False, index=True
    )
    attempts: Mapped[int] = mapped_column(Integer, nullable=False)
