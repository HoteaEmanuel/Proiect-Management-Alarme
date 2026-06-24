import pytest

from auth_utils import process_user_login
from core import UnauthorizedError
from schemas import LoginRequest

VALID_USERNAME = "darius"
VALID_PASSWORD = "darius123"


def test_login_with_valid_credentials_returns_tokens_and_user(db_session):
    access_token, refresh_token, user = process_user_login(
        login_request=_login_request(VALID_USERNAME, VALID_PASSWORD),
        db=db_session,
    )

    assert access_token
    assert refresh_token
    assert user.username == VALID_USERNAME


def test_login_with_wrong_password_raises_unauthorized(db_session):
    with pytest.raises(UnauthorizedError):
        process_user_login(
            login_request=_login_request(VALID_USERNAME, "wrong-password"),
            db=db_session,
        )


def test_login_with_nonexistent_user_raises_unauthorized(db_session):
    with pytest.raises(UnauthorizedError):
        process_user_login(
            login_request=_login_request("no-such-user", "irrelevant"),
            db=db_session,
        )


def _login_request(username: str, password: str):
    return LoginRequest(username=username, password=password)
