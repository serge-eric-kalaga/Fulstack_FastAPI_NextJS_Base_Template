from typing import Annotated
from sqlalchemy.orm import Session
from api.schemas.user import UserModel, UpdateUserModel, CreateUserModel, Response, CurrentUserModel, OwnProfileUpdate
from api.services.jwt import getPayload
from api.database import get_db
from api.database import User
from api.services.auth import user as userSVC
from fastapi import Depends, File, Request, UploadFile
from fastapi.responses import Response as BinaryResponse
from api.services.cache import cached_response, invalidate_cache
from api.services.profile_photo import update_profile_photo, read_profile_photo, remove_profile_photo_file
from fastapi import APIRouter
from .login import auth_router

# Dépendances partagées : FastAPI conserve la résolution et la fermeture de la session.
DatabaseSession = Annotated[Session, Depends(get_db)]
AuthenticatedPayload = Annotated[dict, Depends(getPayload)]

user_router = APIRouter(dependencies=[Depends(getPayload)], tags=["USER"])


@auth_router.post("/register", response_model=Response[UserModel], tags=["AUTH"],
                  dependencies=[Depends(invalidate_cache("users"))])
def create_user(user: CreateUserModel, db: DatabaseSession):
    """Create new user"""

    new_user = userSVC.create_user(user, db)
    return Response(data=new_user)


@user_router.get("/me", response_model=Response[CurrentUserModel], summary="Consulter son profil")
def current_user(payload: AuthenticatedPayload, db: DatabaseSession):
    """Retourner le compte du JWT et son dernier horodatage de connexion."""
    return Response(data=User.get(username=payload["username"], db=db))


@user_router.patch("/me", response_model=Response[CurrentUserModel],
                   dependencies=[Depends(invalidate_cache("users"))], summary="Modifier son profil")
def update_own_profile(profile: OwnProfileUpdate, payload: AuthenticatedPayload, db: DatabaseSession):
    """Modifier uniquement les champs autorisés du compte connecté."""
    user = User.get(username=payload["username"], db=db)
    if "telephone" in profile.model_fields_set:
        user.telephone = profile.telephone.strip() or None if profile.telephone is not None else None
    user.saveWithCommit(db)
    return Response(data=user)


@user_router.get("/", response_model=Response[list[UserModel]],
                 dependencies=[Depends(cached_response("users"))])
def get_all_user(db: DatabaseSession):
    """Get all users"""

    users = User.getAll(db=db)
    return Response(data=users)


@user_router.get("/{username}", response_model=Response[UserModel],
                 dependencies=[Depends(cached_response("users"))])
def get_user_Details(username: str, db: DatabaseSession):
    """Get users details"""

    user = User.get(db=db, username=username)
    return Response(data=user)


@user_router.put("/{username}", response_model=Response[UserModel],
                 dependencies=[Depends(invalidate_cache("users"))])
def update_user(username, user: UpdateUserModel, db: DatabaseSession):
    """Update User"""

    user_exist = userSVC.update_user(username, user, db)
    return Response(data=user_exist)


@user_router.delete("/{username}", response_model=Response,
                    dependencies=[Depends(invalidate_cache("users"))])
def delete_user(username, request: Request, db: DatabaseSession):
    """Delete user"""

    user_exist = User.get(username=username, db=db)
    user_exist.deleteWithCommit(db=db)
    remove_profile_photo_file(user_exist, request.app.state.config)

    return Response(data=f"User {username} deleted !")


@user_router.put(
    "/me/photo",
    response_model=Response[UserModel],
    dependencies=[Depends(invalidate_cache("users"))],
    summary="Ajouter ou remplacer sa photo de profil",
    responses={400: {"description": "Image illisible"}, 413: {"description": "Limite de taille ou de pixels dépassée"},
               415: {"description": "Format non accepté ou incohérent"}, 404: {"description": "Compte introuvable"}},
)
def upload_my_profile_photo(
    request: Request,
    photo: Annotated[UploadFile, File(description="Photo fixe JPEG, PNG ou WebP, 5 Mio maximum par défaut. Réencodée en WebP, 1024 × 1024 maximum, sans métadonnées.")],
    payload: AuthenticatedPayload,
    db: DatabaseSession,
):
    """Modifier uniquement la photo du compte désigné par le JWT, sans choisir un autre utilisateur."""
    user = update_profile_photo(db, payload["username"], photo, request.app.state.config)
    return Response(data=user)


@user_router.get(
    "/{username}/photo",
    summary="Consulter une photo de profil (authentification requise)",
    response_class=BinaryResponse,
    responses={200: {"content": {"image/webp": {"schema": {"type": "string", "format": "binary"}}}},
               404: {"description": "Compte ou photo introuvable"}},
)
def get_profile_photo(username: str, request: Request, db: DatabaseSession):
    """Lire la photo sans la mettre en cache HTTP ni stocker de binaire dans Redis."""
    return BinaryResponse(
        content=read_profile_photo(db, username, request.app.state.config),
        media_type="image/webp",
        headers={"Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff"},
    )
