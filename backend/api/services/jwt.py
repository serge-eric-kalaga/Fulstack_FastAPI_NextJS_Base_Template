from datetime import UTC, datetime, timedelta
from api.configs.config import Setting
from jose import jwt, JWTError
from werkzeug.exceptions import Unauthorized, Forbidden
from fastapi.security import OAuth2PasswordBearer
from fastapi import Depends
from typing import Annotated
from api.database import get_db, User, Session
from api.configs.logging import logResponse

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/doc-login")


def create_token(data: dict, expire_delta: timedelta | None = None):
    """Signer une copie des données avec une expiration UTC explicite ou celle configurée."""
    to_encode = data.copy()
    if expire_delta:
        expire = datetime.now(UTC) + expire_delta
    else:
        expire = datetime.now(UTC) + timedelta(
            minutes=Setting.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, Setting.JWT_SECRET, algorithm=Setting.ALGORITHM)
    return encoded_jwt


def decode_token(token: str):
    """Vérifier la signature et l’expiration du JWT ; retourner None si le jeton est invalide."""
    try:
        payload = jwt.decode(token, Setting.JWT_SECRET, algorithms=[Setting.ALGORITHM])
        logResponse({"payload": payload})
        return payload
    except JWTError:
        return None


def getPayload(
    token: Annotated[str, Depends(oauth2_scheme)],
    db: Annotated[Session, Depends(get_db)],
):
    """Vérifier le JWT et la version des identifiants pour révoquer les anciennes sessions."""
    payload = decode_token(token)
    if not payload or not isinstance(payload.get("username"), str):
        raise Forbidden("Token Invalide")
    user = User.getOrNone(db=db, username=payload["username"])
    if user is None or payload.get("auth_version", 0) != user.auth_version:
        raise Forbidden("Session expirée")
    if "sub" in payload and payload["sub"] != str(user.id):
        raise Forbidden("Session expirée")
    return payload


def isAdmin(token: Annotated[dict, Depends(getPayload)]):
    """Autoriser uniquement le rôle admin ; lever HTTP 401 pour un rôle insuffisant."""
    if token["role"] == "admin":
        return token
    raise Unauthorized("Privileges insuffisants")
