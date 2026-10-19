from api.schemas.user import UserModel, UpdateUserModel, CreateUserModel, Response
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

user_router = APIRouter(dependencies=[Depends(getPayload)], tags=["USER"])


@auth_router.post("/register", response_model=Response[UserModel], tags=["AUTH"],
                  dependencies=[Depends(invalidate_cache("users"))])
def create_user(user: CreateUserModel, db=Depends(get_db)):
    """Create new user"""

    new_user = userSVC.create_user(user, db)
    return Response(data=new_user)


@user_router.get("/", response_model=Response[list[UserModel]],
                 dependencies=[Depends(cached_response("users"))])
def get_all_user(db=Depends(get_db)):  # , actualUser:dict=Depends(getPayload)
    """Get all users"""

    users = User.getAll(db=db)
    return Response(data=users)


@user_router.get("/{username}", response_model=Response[UserModel],
                 dependencies=[Depends(cached_response("users"))])
def get_user_Details(username: str, db=Depends(get_db)):
    """Get users details"""

    user = User.get(db=db, username=username)
    return Response(data=user)


@user_router.put("/{username}", response_model=Response[UserModel],
                 dependencies=[Depends(invalidate_cache("users"))])
def update_user(username, user: UpdateUserModel, db=Depends(get_db)):
    """Update User"""

    user_exist = userSVC.update_user(username, user, db)
    return Response(data=user_exist)


@user_router.delete("/{username}", response_model=Response,
                    dependencies=[Depends(invalidate_cache("users"))])
def delete_user(username, request: Request, db=Depends(get_db)):
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
    photo: UploadFile = File(description="Photo fixe JPEG, PNG ou WebP, 5 Mio maximum par défaut. Réencodée en WebP, 1024 × 1024 maximum, sans métadonnées."),
    payload: dict = Depends(getPayload),
    db=Depends(get_db),
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
def get_profile_photo(username: str, request: Request, db=Depends(get_db)):
    """Lire la photo sans la mettre en cache HTTP ni stocker de binaire dans Redis."""
    return BinaryResponse(
        content=read_profile_photo(db, username, request.app.state.config),
        media_type="image/webp",
        headers={"Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff"},
    )
