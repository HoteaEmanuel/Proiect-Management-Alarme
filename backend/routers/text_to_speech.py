import os
import httpx
from fastapi import APIRouter, Response, Depends

from core import ExternalServiceError
from schemas import TTSRequest
from auth_utils import get_current_user
from integrations.elevenlabs import generate_audio_from_text

router = APIRouter(
    dependencies=[Depends(get_current_user)]
)

@router.post("/speak")
async def speak_text(request: TTSRequest):
    audio_bytes = await generate_audio_from_text(request.text)

    return Response(
        content=audio_bytes, 
        media_type="audio/mpeg"
    )
