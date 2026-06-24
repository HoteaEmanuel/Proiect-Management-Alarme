import asyncio
from datetime import timedelta

import pytest
from fastapi.security import HTTPAuthorizationCredentials
from jose import jwt

import auth_utils
from auth_utils import (
    SECRET_KEY,
    ALGORITHM,
    create_jwt_token,
    blacklist_token,
    get_current_user,
    process_token_refresh,
)
from core import UnauthorizedError


def make_credentials(token: str) -> HTTPAuthorizationCredentials:
    return HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)


def test_create_jwt_token_round_trip():
    token = create_jwt_token("johndoe", "42", timedelta(minutes=15))

    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

    assert payload["sub"] == "johndoe"
    assert payload["id"] == "42"
    assert "exp" in payload


def test_blacklist_token_stores_in_redis_with_positive_ttl(mocker):
    mock_redis = mocker.patch.object(auth_utils, "redis_client")
    token = create_jwt_token("johndoe", "42", timedelta(minutes=15))

    blacklist_token(token)

    mock_redis.setex.assert_called_once()
    key, ttl, value = mock_redis.setex.call_args[0]
    assert key == f"blacklist:{token}"
    assert ttl > 0
    assert value == "1"


def test_blacklist_token_ignores_malformed_token(mocker):
    mock_redis = mocker.patch.object(auth_utils, "redis_client")

    blacklist_token("not-a-real-token")

    mock_redis.setex.assert_not_called()


def test_get_current_user_returns_user_for_valid_token(mocker):
    mocker.patch.object(auth_utils, "redis_client").get.return_value = None
    token = create_jwt_token("johndoe", "42", timedelta(minutes=15))

    user = asyncio.run(get_current_user(make_credentials(token)))

    assert user == {"username": "johndoe", "id": "42"}


def test_get_current_user_raises_for_blacklisted_token(mocker):
    mocker.patch.object(auth_utils, "redis_client").get.return_value = "1"
    token = create_jwt_token("johndoe", "42", timedelta(minutes=15))

    with pytest.raises(UnauthorizedError):
        asyncio.run(get_current_user(make_credentials(token)))


def test_get_current_user_raises_for_expired_token(mocker):
    mocker.patch.object(auth_utils, "redis_client").get.return_value = None
    token = create_jwt_token("johndoe", "42", timedelta(minutes=-1))

    with pytest.raises(UnauthorizedError, match="expired"):
        asyncio.run(get_current_user(make_credentials(token)))


def test_get_current_user_raises_for_malformed_token(mocker):
    mocker.patch.object(auth_utils, "redis_client").get.return_value = None

    with pytest.raises(UnauthorizedError):
        asyncio.run(get_current_user(make_credentials("not-a-real-token")))


def test_process_token_refresh_issues_new_access_token():
    refresh_token = create_jwt_token("johndoe", "42", timedelta(days=30))

    new_access_token, user_id, username = process_token_refresh(refresh_token)

    payload = jwt.decode(new_access_token, SECRET_KEY, algorithms=[ALGORITHM])
    assert payload["sub"] == username == "johndoe"
    assert payload["id"] == user_id == "42"


def test_process_token_refresh_raises_for_expired_token():
    refresh_token = create_jwt_token("johndoe", "42", timedelta(days=-1))

    with pytest.raises(UnauthorizedError, match="expired"):
        process_token_refresh(refresh_token)


def test_process_token_refresh_raises_for_invalid_token():
    with pytest.raises(UnauthorizedError):
        process_token_refresh("not-a-real-token")
