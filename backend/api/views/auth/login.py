from fastapi import Depends, APIRouter
from api.database import get_db, Session
from api.schemas.user import LoginModel
from api.services.auth import login as loginSVC
from api.schemas.user import LoginResponse

from fastapi.security import (
    OAuth2PasswordRequestForm,
)
from typing import Annotated


auth_router = APIRouter()


@auth_router.post("/login", tags=["AUTH"], response_model=LoginResponse)
async def login(credentials: LoginModel, db: Session = Depends(get_db)):
    """
    Connecte un utilisateur et retourne un token d'accès JWT
    """

    token = loginSVC.login(db, credentials)

    return LoginResponse(data={"username": credentials.username, "token": token})


@auth_router.post("/doc-login", tags=["AUTH"], include_in_schema=False)
async def docs_login(
    credentials: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: Session = Depends(get_db),
):
    """
    Connecte un utilisateur via le formulaire de documentation et retourne un token d'accès JWT
    """

    return loginSVC.loginDoc(db, credentials)
