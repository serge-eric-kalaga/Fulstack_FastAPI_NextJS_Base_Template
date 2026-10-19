from api.schemas.user import UpdateUserModel, CreateUserModel
from werkzeug.security import generate_password_hash
from api.database.models import User
from sqlalchemy.orm import Session
from fastapi.exceptions import HTTPException


def create_user(user: CreateUserModel, db: Session) -> User:
    user_exist = User.getOrNone(db=db, username=user.username)
    if user_exist:
        raise HTTPException(status_code=400, detail="Cet utilisateur existe déjà")

    new_user = User(
        username=user.username,
        password=generate_password_hash(user.password),
        telephone=user.telephone,
    )
    new_user.saveWithCommit(db=db)
    return new_user


def update_user(username: str, user: UpdateUserModel, db: Session) -> User:
    user_exist = User.get(username=username, db=db)

    for key, value in user:
        if value is not None:
            setattr(user_exist, key, value)
    user_exist.saveWithCommit(db=db)
    return user_exist
