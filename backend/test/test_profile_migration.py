"""La migration conserve les utilisateurs existants et supporte une seconde exécution."""
from sqlalchemy import create_engine, inspect, text
from scripts import migrate_profile_photo


def test_profile_photo_migration_is_additive(tmp_path, monkeypatch):
    engine = create_engine(f"sqlite:///{tmp_path / 'legacy.db'}")
    with engine.begin() as connection:
        connection.execute(text("CREATE TABLE user (id INTEGER PRIMARY KEY, username VARCHAR(255))"))
        connection.execute(text("INSERT INTO user (id, username) VALUES (1, 'existing')"))
    monkeypatch.setattr(migrate_profile_photo, "engine", engine)
    migrate_profile_photo.migrate()
    migrate_profile_photo.migrate()
    assert "profile_photo" in {c["name"] for c in inspect(engine).get_columns("user")}
    with engine.connect() as connection:
        assert connection.execute(text("SELECT username, profile_photo FROM user")).one() == ("existing", None)
    engine.dispose()
