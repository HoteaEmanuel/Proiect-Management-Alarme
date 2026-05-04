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

    result = cloudinary.uploader.upload(
        file_stream,
        resource_type="auto",
        folder="chatbot-files",
        public_id=filename.rsplit(".", 1)[0],
        use_filename=True,
        unique_filename=True,
    )

    return {
        "url": result.get("secure_url"),
        "public_id": result.get("public_id"),
        "resource_type": result.get("resource_type"),
        "format": result.get("format"),
        "bytes": result.get("bytes"),
        "original_filename": result.get("original_filename"),
    }