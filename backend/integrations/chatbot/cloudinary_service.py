import os
from io import BytesIO
import cloudinary
import cloudinary.uploader
from dotenv import load_dotenv

load_dotenv()

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True,
)

def upload_file_to_cloudinary(file_content: bytes, filename: str):
    file_stream = BytesIO(file_content)
    file_stream.name = filename  # îi dai explicit numele fișierului

    result = cloudinary.uploader.upload(
        file_stream,
        resource_type="auto",
        folder="chatbot-files",
        use_filename=True,
        unique_filename=True,
        type="upload",  # asigură că e public
        access_mode="public",  # explicit public
    )
    print("CLOUDINARY FULL RESULT:")
    print(result)  
    return {
        "url": result.get("secure_url"),
        "public_id": result.get("public_id"),
        "resource_type": result.get("resource_type"),
        "format": result.get("format"),
        "bytes": result.get("bytes"),
        "original_filename": result.get("original_filename"),
    }