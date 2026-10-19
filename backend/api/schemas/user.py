from pydantic import BaseModel, Field, ConfigDict, field_validator
from datetime import UTC, datetime
from typing import Optional, List
from .response import Response


class LoginModel(BaseModel):
    """Identifiants nécessaires à la connexion d’un utilisateur."""

    username: str = Field(
        description="Nom d’utilisateur du compte auquel se connecter.",
        examples=["utilisateur_demo"],
    )
    password: str = Field(
        description="Mot de passe du compte, transmis pour vérifier les identifiants.",
        examples=["ExempleMotDePasse!2026"],
        json_schema_extra={"format": "password"},
    )


class LoginResponseModel(BaseModel):
    """Utilisateur connecté et jeton d’accès délivré par l’API."""

    username: str = Field(
        description="Nom de l’utilisateur authentifié.",
        examples=["utilisateur_demo"],
    )
    token: str = Field(
        description="Jeton JWT à envoyer dans l’en-tête Authorization sous la forme Bearer <token> pour les routes protégées.",
        examples=["<jeton_jwt>"],
    )


class LoginResponse(Response):
    """Réponse standard contenant les informations de connexion."""

    data: LoginResponseModel = Field(
        description="Identité de l’utilisateur connecté et jeton JWT associé.",
    )


class UserModel(BaseModel):
    """Informations publiques d’un utilisateur, sans mot de passe."""

    username: str = Field(
        ...,
        description="Nom d’utilisateur unique identifiant le compte.",
        examples=["utilisateur_demo"],
        json_schema_extra={"include": "true"},
    )
    telephone: Optional[str] = Field(
        default=None,
        description="Numéro de téléphone de l’utilisateur. Facultatif ; aucun format spécifique n’est imposé par ce schéma.",
        examples=["+22670000000"],
    )

    profile_photo_url: Optional[str] = Field(
        default=None,
        description="URL relative de la photo de profil. Lecture authentifiée ; modification via PUT /api/user/me/photo.",
        examples=["/api/user/utilisateur_demo/photo?v=identifiant.webp"],
        json_schema_extra={"readOnly": True},
    )


class CreateUserModel(BaseModel):
    """Informations nécessaires à la création d’un compte utilisateur."""

    username: str = Field(description="Nom d’utilisateur unique à créer.", examples=["utilisateur_demo"])
    telephone: Optional[str] = Field(default=None, description="Numéro de téléphone facultatif.", examples=["+22670000000"])

    password: Optional[str] = Field(
        ...,
        description="Mot de passe à définir pour le compte. Il est haché par le backend avant son enregistrement. Ce champ doit être présent dans la requête.",
        examples=["ExempleMotDePasse!2026"],
        json_schema_extra={"format": "password"},
    )


class UpdateUserModel(BaseModel):
    """Champs à modifier ; les champs omis ou à null sont ignorés."""

    username: Optional[str] = Field(
        default=None,
        description="Nouveau nom d’utilisateur. Omettre ce champ ou envoyer null pour conserver la valeur actuelle.",
        examples=["utilisateur_modifie"],
    )
    password: Optional[str] = Field(
        default=None,
        description="Nouvelle valeur du mot de passe. Omettre ce champ ou envoyer null pour conserver la valeur actuelle.",
        examples=["AutreMotDePasse!2026"],
        json_schema_extra={"format": "password"},
    )
    telephone: Optional[str] = Field(
        default=None,
        description="Nouveau numéro de téléphone. Omettre ce champ ou envoyer null pour conserver la valeur actuelle.",
        examples=["+22670000001"],
    )


class UserResponseModel(Response):
    """Réponse standard contenant un utilisateur."""

    data: UserModel = Field(description="Informations publiques de l’utilisateur.")


class UserResponseListModel(Response):
    """Réponse standard contenant une liste d’utilisateurs."""

    data: List[UserModel] = Field(
        description="Liste des utilisateurs retournés par l’API, sans leurs mots de passe.",
    )


class CurrentUserModel(UserModel):
    """Profil privé du compte connecté et dernière authentification réussie."""

    last_login_at: datetime | None = Field(
        default=None,
        description="Date UTC de la dernière connexion réussie ; null pour un compte jamais connecté.",
        json_schema_extra={"readOnly": True},
        examples=["2026-10-19T16:30:00Z"],
    )

    @field_validator("last_login_at", mode="before")
    @classmethod
    def utc_timestamp(cls, value):
        """Rendre explicite le fuseau UTC des valeurs DATETIME stockées en base."""
        if isinstance(value, datetime) and value.tzinfo is None:
            return value.replace(tzinfo=UTC)
        return value


class OwnProfileUpdate(BaseModel):
    """Champs modifiables depuis l’espace personnel ; l’identifiant reste stable."""

    model_config = ConfigDict(extra="forbid")
    telephone: str | None = Field(
        default=None, max_length=32, description="Numéro de téléphone ; null pour l’effacer.",
        examples=["+22670000000"],
    )
