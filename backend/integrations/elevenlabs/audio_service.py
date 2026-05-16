import os
import httpx
from core import ExternalServiceError

# Dacă lipsește, adaugă asta sus de tot în fișier:
from dotenv import load_dotenv
load_dotenv()

async def generate_audio_from_text(text: str) -> bytes:

    elevenlabs_key = os.getenv("ELEVENLABS_API_KEY")
    print(f"[DEBUG] ElevenLabs Key: {elevenlabs_key}")
    url = "https://api.elevenlabs.io/v1/text-to-speech/pNInz6obpgDQGcFmaJgB"
    
    headers = {
        "xi-api-key": elevenlabs_key,
        "Content-Type": "application/json"
    }
    
    payload = {
        "text": text,
        "model_id": "eleven_multilingual_v2",
        "voice_settings": {
            "stability": 0.5,
            "similarity_boost": 0.75,
        }
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(url, headers=headers, json=payload, timeout=30.0)
            
            if response.status_code != 200:
                raise ExternalServiceError(
                    service_name="ElevenLabs", 
                    details=f"API returned status {response.status_code}: {response.text}"
                )
            
            return response.content

    except httpx.RequestError as e:
        raise ExternalServiceError(
            service_name="ElevenLabs", 
            details=f"Network error: {str(e)}"
        )