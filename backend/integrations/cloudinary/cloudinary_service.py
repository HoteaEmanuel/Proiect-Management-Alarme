import os
from io import BytesIO
import cloudinary
import cloudinary.uploader
from dotenv import load_dotenv

from schemas import RawFileAttachment, CloudinaryFileAttachment

load_dotenv()

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True,
)

# cloudinary_utils.py
import cloudinary.uploader
import io
from uuid import uuid4

def upload_file_to_cloudinary(file: RawFileAttachment) -> CloudinaryFileAttachment:
    result = cloudinary.uploader.upload(
        io.BytesIO(file.content),
        resource_type="auto",
        public_id=f"chat_files/{uuid4().hex}_{file.filename}",
        use_filename=True,
        unique_filename=True,
    )

    file_format = result.get("format") or (file.filename.rsplit(".", 1)[-1] if "." in file.filename else "unknown")

    return CloudinaryFileAttachment(
        filename=file.filename,
        url=result["secure_url"],
        public_id=result["public_id"],
        resource_type=result["resource_type"],
        file_format=file_format,
        file_size=result["bytes"],
    )